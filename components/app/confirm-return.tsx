"use client";
import { AnimatePresence } from "framer-motion";
import * as React from "react";
import { UnlockMoment } from "@/components/funnel/unlock-moment";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/client";
import { PLAN_COPY, type Tier } from "@/lib/plans";

export function ConfirmReturn({ refId }: { refId: string }) {
  const [state, setState] = React.useState<"busy" | "moment" | "pending">("busy");
  const [plan, setPlan] = React.useState("your plan");
  React.useEffect(() => {
    (async () => {
      for (let i = 0; i < 5; i++) {
        const r = await api<{ paid: boolean; tier?: Tier }>("/api/checkout/confirm", { method: "POST", body: JSON.stringify({ ref: refId }) });
        if (r.ok && r.data.paid) {
          if (r.data.tier) setPlan(PLAN_COPY[r.data.tier].name);
          setState("moment");
          return;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
      setState("pending");
    })();
  }, [refId]);
  return (
    <div className="grid min-h-[50dvh] place-items-center text-center">
      {state === "busy" && (
        <p className="flex items-center gap-2 text-[16px]">
          <Spinner /> Confirming your payment…
        </p>
      )}
      {state === "pending" && (
        <div>
          <p className="font-serif text-[26px] font-semibold">Your payment is on its way</p>
          <p className="mt-1 text-muted">It can take a minute to confirm. Your routine check is saved.</p>
          <Button className="mt-4" onClick={() => location.reload()}>
            Check again
          </Button>
        </div>
      )}
      <AnimatePresence>{state === "moment" && <UnlockMoment planName={plan} onDone={() => (location.href = "/routine")} />}</AnimatePresence>
    </div>
  );
}
