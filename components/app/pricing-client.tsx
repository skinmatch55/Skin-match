"use client";
import { AnimatePresence } from "framer-motion";
import * as React from "react";
import { CheckoutSheet, type CheckoutSession } from "@/components/funnel/checkout-sheet";
import { Paywall, type Period } from "@/components/funnel/paywall";
import { fetchPlans } from "@/components/funnel/unlock-controller";
import { UnlockMoment } from "@/components/funnel/unlock-moment";
import { api } from "@/lib/client";
import type { PricedPlan } from "@/lib/pricing";

export function PricingClient({ title, line }: { title: string; line: string }) {
  const [plans, setPlans] = React.useState<PricedPlan[] | null>(null);
  const [co, setCo] = React.useState<{ s: CheckoutSession; p: PricedPlan; period: Period } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [moment, setMoment] = React.useState<string | null>(null);
  React.useEffect(() => {
    fetchPlans().then(setPlans);
    api("/api/event", { method: "POST", body: JSON.stringify({ type: "paywall_view" }) });
  }, []);
  return (
    <>
      <Paywall
        plans={plans}
        title={title}
        line={line}
        busy={busy}
        notice={notice}
        onContinue={async (p, period) => {
          setBusy(true);
          setNotice(null);
          const r = await api<CheckoutSession>("/api/checkout", { method: "POST", body: JSON.stringify({ plan: p.id, period }) });
          setBusy(false);
          if (r.status === 409) return setNotice("Payments open in a moment. Your routine check is saved.");
          if (!r.ok) return setNotice("The checkout didn't load. Try again in a moment.");
          if (!r.data.embed) return void (location.href = r.data.fallback_url);
          setCo({ s: r.data, p, period });
        }}
      />
      <CheckoutSheet
        open={Boolean(co)}
        session={co?.s ?? null}
        title={co ? `${co.p.name} · ${co.period === "year" && co.p.year ? co.p.year.perDay : co.p.month.perDay}/day` : ""}
        onClose={() => setCo(null)}
        onPaid={async (ref) => {
          const name = co?.p.name ?? "your plan";
          setCo(null);
          setBusy(true);
          for (let i = 0; i < 4; i++) {
            const c = await api<{ paid: boolean }>("/api/checkout/confirm", { method: "POST", body: JSON.stringify({ ref }) });
            if (c.ok && c.data.paid) {
              setBusy(false);
              return setMoment(name);
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
          setBusy(false);
          setNotice("Your payment is being confirmed. Refresh in a minute.");
        }}
      />
      <AnimatePresence>{moment && <UnlockMoment planName={moment} onDone={() => (location.href = "/routine")} />}</AnimatePresence>
    </>
  );
}
