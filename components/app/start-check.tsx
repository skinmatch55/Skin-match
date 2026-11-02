"use client";
import { useRouter } from "next/navigation";
import { useConfig } from "@/components/config";
import { TryFlow } from "@/components/funnel/try-flow";

export function StartCheck() {
  const cfg = useConfig();
  const router = useRouter();
  return (
    <TryFlow
      aiEnabled={cfg.ai}
      signedIn
      compact
      onDone={(r) => {
        if (r.paid) router.refresh();
      }}
    />
  );
}
