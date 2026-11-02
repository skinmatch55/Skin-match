"use client";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";
import { UpgradeSheet } from "./upgrade-sheet";

export function RecheckButton({ label, variant = "primary", size = "md" }: { label: string; variant?: "primary" | "outline"; size?: "sm" | "md" }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [upgrade, setUpgrade] = React.useState(false);
  return (
    <div className="flex flex-col items-end">
      <Button
        variant={variant}
        size={size}
        disabled={busy}
        data-testid="recheck"
        onClick={async () => {
          setBusy(true);
          setErr(null);
          const r = await api<{ error?: string }>("/api/routine/check", { method: "POST" });
          setBusy(false);
          if (r.ok) return router.refresh();
          if (r.data.error === "quota") return setUpgrade(true);
          if (r.data.error === "empty_shelf") return setErr("Add a product first.");
          setErr("That didn't work. Try again.");
        }}
      >
        <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> {busy ? "Checking…" : label}
      </Button>
      {err && <p className="mt-1 text-[13px] text-clash">{err}</p>}
      <UpgradeSheet open={upgrade} onClose={() => setUpgrade(false)} reason="You've used this month's routine checks." />
    </div>
  );
}
