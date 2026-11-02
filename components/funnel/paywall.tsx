"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CreditCard, Lock, X } from "lucide-react";
import * as React from "react";
import { ArrowDot, Button } from "@/components/ui/button";
import { PLAN_COPY, type Tier } from "@/lib/plans";
import type { PricedPlan } from "@/lib/pricing";
import { cn, money2 } from "@/lib/utils";

export type Period = "month" | "year";

const FAQ = [
  {
    q: "Will it work for my skin?",
    a: "Skinmatch builds the routine from your products and your skin type, and checks every pair with rules dermatologists agree on. If something you own isn't in our list, the label scanner or a quick manual entry adds it.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, in 2 taps from Account → Billing. You keep access until the end of the period you paid for. No calls, no emails.",
  },
  {
    q: "What happens right after I pay?",
    a: "Your full routine unlocks right here, on this screen: morning and night in order, every conflict with its fix, and your shelf saved in the app.",
  },
];

export function Paywall({
  plans,
  title,
  line,
  onClose,
  onContinue,
  busy,
  notice,
}: {
  plans: PricedPlan[] | null;
  title: string;
  line: string;
  onClose?: () => void;
  onContinue: (plan: PricedPlan, period: Period) => void;
  busy?: boolean;
  notice?: string | null;
}) {
  const [period, setPeriod] = React.useState<Period>("month");
  const [tier, setTier] = React.useState<Tier>("pro");
  const [openQ, setOpenQ] = React.useState<number | null>(null);
  const mainBtn = React.useRef<HTMLButtonElement>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  const [btnVisible, setBtnVisible] = React.useState(true);
  const hasYearly = Boolean(plans?.some((p) => p.year));
  const selected = plans?.find((p) => p.tier === tier) ?? plans?.[0];

  React.useEffect(() => {
    const el = mainBtn.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBtnVisible(e.isIntersecting), { root: scroller.current, threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [plans]);

  const price = (p: PricedPlan) => (period === "year" && p.year ? p.year : p.month);
  const go = () => selected && onContinue(selected, period === "year" && selected.year ? "year" : "month");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col" data-testid="paywall">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-28 pt-4 sm:px-7">
        {onClose && (
          <button
            onClick={onClose}
            className="sticky top-0 z-10 -ml-1 grid h-10 w-10 place-items-center rounded-full bg-cream/80 backdrop-blur hover:bg-blush-2"
            aria-label="Close"
            data-testid="paywall-close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="mt-2 text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-lime text-ink"
          >
            <Check className="h-6 w-6" strokeWidth={3} />
          </motion.span>
          <h2 className="font-serif text-[30px] font-semibold leading-[1.1] sm:text-[32px]">{title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">{line}</p>
        </div>

        {notice && (
          <p role="status" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-center text-[14px] text-amber">
            {notice}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between">
          <p className="font-semibold">Choose your plan.</p>
          {hasYearly && (
            <div className="flex rounded-full bg-ink/5 p-1 text-[13px] font-semibold" role="radiogroup" aria-label="Billing period">
              {(["month", "year"] as const).map((p) => (
                <button
                  key={p}
                  role="radio"
                  aria-checked={period === p}
                  onClick={() => setPeriod(p)}
                  className={cn("rounded-full px-3 py-1.5 transition", period === p ? "bg-white shadow-sm" : "text-muted")}
                >
                  {p === "month" ? "Monthly" : (
                    <>
                      Yearly <span className="text-lime-deep">−20%</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2.5" role="radiogroup" aria-label="Plans">
          {!plans
            ? [0, 1, 2].map((i) => <div key={i} className="skeleton h-[84px]" />)
            : plans.map((p) => {
                const on = p.tier === tier;
                const pr = price(p);
                return (
                  <button
                    key={p.id}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setTier(p.tier)}
                    data-testid={`plan-${p.tier}`}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-[20px] border bg-white p-4 text-left transition active:scale-[0.99]",
                      on ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]" : "border-line hover:border-ink/30",
                    )}
                  >
                    {p.tier === "pro" && (
                      <span className="absolute -top-2.5 left-4 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">
                        Most popular
                      </span>
                    )}
                    <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2", on ? "border-ink bg-ink" : "border-line")}>
                      {on && <span className="h-2 w-2 rounded-full bg-lime" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block text-[13px] text-muted">
                        {money2(pr.cents)} / {period === "year" && p.year ? "year" : "month"}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-rose-deep">{PLAN_COPY[p.tier].tag}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-serif text-[26px] font-semibold leading-none tabular-nums">{pr.perDay}</span>
                      <span className="text-[12px] text-muted">/ day</span>
                    </span>
                  </button>
                );
              })}
        </div>

        <Button ref={mainBtn} size="lg" className="mt-5 w-full" onClick={go} disabled={!selected || busy} data-testid="paywall-continue">
          {selected ? `Continue with ${selected.name}` : "Continue"} <ArrowDot nudge />
        </Button>
        {selected && (
          <p className="mt-2 text-center text-[13px] text-muted">
            {money2(price(selected).cents)} due today, then every {period === "year" && selected.year ? "year" : "month"} · Cancel anytime
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-muted">
          <Lock className="h-3.5 w-3.5" /> Secure payment, processed by Whop
          <span className="rounded-full border border-line bg-white px-2 py-0.5 font-semibold text-ink">Whop</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 font-semibold text-ink">
            <CreditCard className="h-3 w-3" /> Card
          </span>
        </div>

        {selected && (
          <div className="mt-7 rounded-[20px] bg-white p-5">
            <p className="font-semibold">What you unlock with {selected.name}</p>
            <ul className="mt-3 space-y-2.5">
              {PLAN_COPY[selected.tier].unlock.map((u) => (
                <li key={u} className="flex gap-2.5 text-[14px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {u}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 divide-y divide-line rounded-[20px] border border-line bg-white">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-medium"
                onClick={() => setOpenQ(openQ === i ? null : i)}
                aria-expanded={openQ === i}
              >
                {f.q}
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition", openQ === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {openQ === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden px-4 text-[14px] text-muted"
                  >
                    <span className="block pb-4">{f.a}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[12px] text-muted">
          Renews automatically until canceled. Prices in USD. Cancel anytime from Account → Billing.
        </p>
      </div>

      <AnimatePresence>
        {!btnVisible && selected && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 border-t border-line bg-cream/90 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur"
          >
            <Button size="lg" className="w-full" onClick={go} disabled={busy}>
              Continue with {selected.name} · {price(selected).perDay}/day
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
