"use client";
import { Check, X } from "lucide-react";
import * as React from "react";
import { CheckoutSheet, type CheckoutSession } from "@/components/funnel/checkout-sheet";
import { fetchPlans } from "@/components/funnel/unlock-controller";
import { UnlockMoment } from "@/components/funnel/unlock-moment";
import { ArrowDot, Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { api } from "@/lib/client";
import { nextTier, PLAN_COPY, type Tier } from "@/lib/plans";
import type { PricedPlan } from "@/lib/pricing";

/** The next plan only: what it adds in 3 lines, its price a day, one button → the same in-page checkout. */
export function UpgradeSheet({ open, onClose, reason, target }: { open: boolean; onClose: () => void; reason?: string; target?: Tier }) {
  const [plan, setPlan] = React.useState<PricedPlan | null>(null);
  const [current, setCurrent] = React.useState<Tier | null | undefined>(undefined);
  const [session, setSession] = React.useState<CheckoutSession | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [moment, setMoment] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    api("/api/event", { method: "POST", body: JSON.stringify({ type: "paywall_view" }) });
    (async () => {
      const [b, plans] = await Promise.all([api<{ tier: Tier | null }>("/api/billing"), fetchPlans()]);
      const cur = b.data.tier ?? null;
      setCurrent(cur);
      const t = target ?? nextTier(cur);
      setPlan(plans.find((p) => p.tier === t) ?? null);
    })();
  }, [open, target]);

  const go = async () => {
    if (!plan) return;
    setBusy(true);
    setMsg(null);
    const r = await api<CheckoutSession & { error?: string }>("/api/checkout", { method: "POST", body: JSON.stringify({ plan: plan.id, period: "month" }) });
    setBusy(false);
    if (r.status === 409) return setMsg("Payments open in a moment. Everything you have is saved.");
    if (!r.ok) return setMsg("The checkout didn't load. Try again in a moment.");
    if (!r.data.embed) return void (location.href = r.data.fallback_url);
    setSession(r.data);
  };

  const paid = async (ref: string) => {
    setSession(null);
    setBusy(true);
    for (let i = 0; i < 4; i++) {
      const c = await api<{ paid: boolean }>("/api/checkout/confirm", { method: "POST", body: JSON.stringify({ ref, upgrade: Boolean(current) }) });
      if (c.ok && c.data.paid) {
        setBusy(false);
        setMoment(true);
        return;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    setBusy(false);
    setMsg("Your payment is being confirmed. Refresh in a minute.");
  };

  const copy = plan ? PLAN_COPY[plan.tier] : null;
  return (
    <>
      <Sheet open={open && !moment} onClose={onClose} label="Upgrade your plan" variant="bottom" width={440}>
        <div className="px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-2 sm:pt-6" data-testid="upgrade-sheet">
          <div className="flex justify-end">
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush-2" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {current === undefined ? (
            <div className="space-y-3">
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-24" />
            </div>
          ) : !plan || !copy ? (
            <div>
              <h2 className="font-serif text-[26px] font-semibold">You're on our biggest plan</h2>
              <p className="mt-2 text-[15px] text-muted">{reason ?? ""} Your limits reset at the start of your next monthly period.</p>
            </div>
          ) : (
            <>
              {reason && <p className="text-[14px] font-medium text-rose-deep">{reason}</p>}
              <h2 className="mt-1 font-serif text-[28px] font-semibold leading-tight">Get more with {copy.name}</h2>
              <ul className="mt-4 space-y-2.5">
                {(copy.adds.length ? copy.adds : copy.unlock.slice(0, 3)).map((a) => (
                  <li key={a} className="flex gap-2.5 text-[15px]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-serif text-[36px] font-semibold">{plan.month.perDay}</span>
                <span className="text-muted">/ day · ${(plan.month.cents / 100).toFixed(2)} a month</span>
              </div>
              {msg && <p className="mt-3 rounded-xl bg-amber-soft px-3 py-2 text-[14px] text-amber">{msg}</p>}
              <Button size="lg" className="mt-4 w-full" onClick={go} disabled={busy} data-testid="upgrade-continue">
                Continue with {copy.name} <ArrowDot />
              </Button>
              <p className="mt-2 text-center text-[12px] text-muted">
                {current ? "Your current plan stops at the end of its period. Never two plans billed." : "Cancel anytime."}
              </p>
            </>
          )}
        </div>
      </Sheet>
      <CheckoutSheet
        open={Boolean(session)}
        session={session}
        title={plan ? `${plan.name} · ${plan.month.perDay}/day` : ""}
        onClose={() => setSession(null)}
        onPaid={paid}
      />
      {moment && plan && (
        <UnlockMoment
          planName={plan.name}
          onDone={() => {
            setMoment(false);
            location.reload();
          }}
        />
      )}
    </>
  );
}
