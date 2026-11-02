"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import * as React from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { LogoMark } from "@/components/brand/logo";
import { ArrowDot } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { api, deviceId } from "@/lib/client";
import type { RoutineResult } from "@/lib/engine/types";
import type { PricedPlan } from "@/lib/pricing";
import type { Teaser } from "@/lib/teaser";
import { CheckoutSheet, type CheckoutSession } from "./checkout-sheet";
import { Paywall, type Period } from "./paywall";
import { UnlockMoment } from "./unlock-moment";

export interface UnlockHandle {
  open: () => void;
}

const SKIN: Record<string, string> = { oily: "oily", dry: "dry", combination: "combination", normal: "normal", sensitive: "sensitive" };

export function personalLine(t: Teaser) {
  const skin = SKIN[t.skinType] ?? "";
  if (t.conflictsCount === 0) return `No clashes, and your ${skin}-skin routine is ordered and waiting.`;
  return `We found ${t.conflictsCount === 1 ? "1 product pair" : `${t.conflictsCount} product pairs`} working against each other. Your ${skin}-skin routine is fixed and waiting.`;
}

let plansCache: PricedPlan[] | null = null;
export async function fetchPlans(): Promise<PricedPlan[]> {
  if (plansCache) return plansCache;
  const r = await api<{ plans: PricedPlan[] }>("/api/plans");
  if (r.ok && r.data.plans?.length) plansCache = r.data.plans;
  return plansCache ?? [];
}

export const UnlockController = React.forwardRef<
  UnlockHandle,
  {
    checkId: string;
    teaser: Teaser;
    signedIn: boolean;
    autoOpen?: boolean;
    onUnlocked: (r: RoutineResult) => void;
  }
>(function UnlockController({ checkId, teaser, signedIn: initialSignedIn, autoOpen, onUnlocked }, ref) {
  const [signedIn, setSignedIn] = React.useState(initialSignedIn);
  const [step, setStep] = React.useState<"none" | "auth" | "paywall">("none");
  const [plans, setPlans] = React.useState<PricedPlan[] | null>(null);
  const [checkout, setCheckout] = React.useState<{ session: CheckoutSession; plan: PricedPlan; period: Period } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [moment, setMoment] = React.useState<{ plan: string; result: RoutineResult } | null>(null);
  const [closedOnce, setClosedOnce] = React.useState(false);

  const openPaywall = React.useCallback(() => {
    setStep("paywall");
    api("/api/event", { method: "POST", body: JSON.stringify({ type: "paywall_view" }) });
    fetchPlans().then((p) => setPlans(p));
  }, []);

  const open = React.useCallback(() => {
    if (!signedIn) setStep("auth");
    else openPaywall();
  }, [signedIn, openPaywall]);

  React.useImperativeHandle(ref, () => ({ open }), [open]);

  React.useEffect(() => {
    fetchPlans().then((p) => setPlans(p));
    if (autoOpen) {
      const t = setTimeout(open, 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async (plan: PricedPlan, period: Period) => {
    setBusy(true);
    setNotice(null);
    const r = await api<CheckoutSession & { error?: string }>("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ plan: plan.id, period }),
    });
    setBusy(false);
    if (r.status === 409 || r.data?.error === "payments_off") {
      setNotice("Payments open in a moment. Your routine check is saved.");
      return;
    }
    if (r.status === 401) {
      setSignedIn(false);
      setStep("auth");
      return;
    }
    if (!r.ok || !r.data.ref) {
      setNotice("The checkout didn't load. Try again in a moment. Your routine check is saved.");
      return;
    }
    if (!r.data.embed) {
      location.href = r.data.fallback_url;
      return;
    }
    setCheckout({ session: r.data, plan, period });
  };

  const unlock = async (refId: string) => {
    const planName = checkout?.plan.name ?? "your plan";
    setCheckout(null);
    setBusy(true);
    for (let i = 0; i < 4; i++) {
      const c = await api<{ paid: boolean }>("/api/checkout/confirm", { method: "POST", body: JSON.stringify({ ref: refId }) });
      if (c.ok && c.data.paid) {
        const res = await api<{ full: RoutineResult | null }>(`/api/checks/${checkId}?device=${deviceId()}`);
        setBusy(false);
        setStep("none");
        if (res.data.full) setMoment({ plan: planName, result: res.data.full });
        else location.href = "/routine";
        return;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    setBusy(false);
    setNotice("Your payment is being confirmed. This can take a minute: refresh this page and your routine will be unlocked.");
  };

  const cheapest = plans?.find((p) => p.tier === "pro") ?? plans?.[0];

  return (
    <>
      <Sheet open={step === "auth"} onClose={() => setStep("none")} label="Save your routine check" variant="bottom" width={440}>
        <div className="overflow-y-auto px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-2 sm:pt-6" data-testid="auth-sheet">
          <div className="flex items-start justify-between">
            <LogoMark className="h-10 w-10" />
            <button onClick={() => setStep("none")} className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush-2" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="mt-4 font-serif text-[28px] font-semibold leading-tight">Save your routine check</h2>
          <p className="mb-5 mt-1 text-[15px] text-muted">Free account, 30 seconds. Your result waits right here.</p>
          <AuthForm
            mode="signup"
            switchInPlace
            next={`/result/${checkId}?unlock=1`}
            onSuccess={() => {
              setSignedIn(true);
              openPaywall();
            }}
          />
        </div>
      </Sheet>

      <Sheet open={step === "paywall"} onClose={() => (setStep("none"), setClosedOnce(true))} label="Choose your plan" variant="full" width={480}>
        <Paywall
          plans={plans}
          title="Your routine check is ready."
          line={personalLine(teaser)}
          onClose={() => (setStep("none"), setClosedOnce(true))}
          onContinue={start}
          busy={busy}
          notice={notice}
        />
      </Sheet>

      <CheckoutSheet
        open={Boolean(checkout)}
        session={checkout?.session ?? null}
        title={checkout ? `${checkout.plan.name} · ${checkout.period === "year" && checkout.plan.year ? checkout.plan.year.perDay : checkout.plan.month.perDay}/day` : ""}
        onClose={() => setCheckout(null)}
        onPaid={unlock}
      />

      <AnimatePresence>
        {moment && (
          <UnlockMoment
            planName={moment.plan}
            onDone={() => {
              const r = moment.result;
              setMoment(null);
              onUnlocked(r);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {step === "none" && !moment && closedOnce && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(14px,env(safe-area-inset-bottom))]"
          >
            <button
              onClick={open}
              data-testid="sticky-unlock"
              className="mx-auto flex h-14 w-full max-w-md items-center justify-between rounded-full bg-ink pl-6 pr-3 text-cream shadow-[var(--shadow-lift)] active:scale-[0.98]"
            >
              <span className="font-semibold">
                See my full routine{cheapest ? <span className="font-normal text-cream/70"> · {cheapest.month.perDay}/day</span> : null}
              </span>
              <ArrowDot nudge />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
