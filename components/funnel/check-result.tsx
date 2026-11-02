"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Moon, RotateCcw, ShieldCheck, Sun } from "lucide-react";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { ClashLink, SeverityBadge } from "@/components/brand/clash";
import { ArrowDot, Button } from "@/components/ui/button";
import type { Category, RoutineResult } from "@/lib/engine/types";
import type { Teaser } from "@/lib/teaser";
import { FullResult } from "./full-result";
import { UnlockController, type UnlockHandle } from "./unlock-controller";

export function CheckResult({
  checkId,
  teaser,
  full: initialFull,
  thumb,
  signedIn,
  autoUnlock = false,
  onRestart,
}: {
  checkId: string;
  teaser: Teaser;
  full: RoutineResult | null;
  thumb: string | null;
  signedIn: boolean;
  autoUnlock?: boolean;
  onRestart?: () => void;
}) {
  const [full, setFull] = React.useState(initialFull);
  const ctl = React.useRef<UnlockHandle>(null);

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {full ? (
          <motion.div
            key="full"
            initial={{ opacity: 0, filter: "blur(14px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <FullResult result={full} />
          </motion.div>
        ) : (
          <motion.div key="locked" exit={{ opacity: 0, filter: "blur(10px)" }} transition={{ duration: 0.4 }}>
            <LockedResult teaser={teaser} thumb={thumb} onUnlock={() => ctl.current?.open()} />
          </motion.div>
        )}
      </AnimatePresence>
      {onRestart && (
        <div className="mt-4 flex justify-center">
          <button onClick={onRestart} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] text-muted hover:bg-blush-2 hover:text-ink">
            <RotateCcw className="h-3.5 w-3.5" /> Check other products
          </button>
        </div>
      )}
      {!full && (
        <UnlockController
          ref={ctl}
          checkId={checkId}
          teaser={teaser}
          signedIn={signedIn}
          autoOpen={autoUnlock}
          onUnlocked={(r) => setFull(r)}
        />
      )}
    </div>
  );
}

export function LockedResult({ teaser, thumb, onUnlock }: { teaser: Teaser; thumb: string | null; onUnlock: () => void }) {
  const n = teaser.conflictsCount;
  const c = teaser.firstConflict;
  return (
    <div data-testid="locked-result">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-rose">Your routine check is ready</p>
      <div className="mt-2 flex items-start gap-4">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="Your shelf" className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-white shadow" />
        )}
        <h3 className="font-serif text-[30px] font-semibold leading-[1.08] md:text-[36px]">
          {n > 0 ? (
            <>
              <span className="marker">
                {n} {n === 1 ? "conflict" : "conflicts"}
              </span>{" "}
              found on your shelf
            </>
          ) : (
            <>No clashes found. Now, the right order.</>
          )}
        </h3>
      </div>

      {/* clear: what we read */}
      <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {teaser.products.map((p) => (
          <span key={p.id} className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-1.5 pr-3 text-[13px]">
            <Bottle category={p.category as Category} seed={p.id} className="h-6" />
            <span className="max-w-[180px] truncate">
              <span className="text-muted">{p.brand} </span>
              {p.name}
            </span>
          </span>
        ))}
      </div>

      {/* clear: one real insight */}
      {c ? (
        <div className="mt-4 rounded-[20px] border border-clash/20 bg-white p-4 shadow-[var(--shadow-soft)]" data-testid="first-conflict">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{c.title}</p>
            <SeverityBadge severity={c.severity} />
          </div>
          <ClashLink a={c.aName} b={c.bName} kind={c.severity === "caution" ? "caution" : "clash"} className="my-3" />
          <p className="text-[14px] text-ink-2">{c.insight}</p>
        </div>
      ) : teaser.firstGood ? (
        <div className="mt-4 rounded-[20px] border border-line bg-white p-4">
          <p className="font-semibold">{teaser.firstGood.title}</p>
          <p className="mt-1 text-[14px] text-ink-2">{teaser.firstGood.insight}</p>
        </div>
      ) : null}

      {/* blurred: the rest, never sent to the browser */}
      <div className="relative mt-4 overflow-hidden rounded-[24px] border border-line bg-white">
        <button
          type="button"
          onClick={onUnlock}
          className="block w-full text-left"
          aria-label="Unlock your full routine"
        >
          <div aria-hidden className="pointer-events-none select-none p-5 blur-[7px]">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-full border-[7px] border-lime font-serif text-[28px] font-semibold">··</div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-ink/70" />
                <div className="h-3 w-1/2 rounded bg-ink/30" />
              </div>
            </div>
            {n > 1 && (
              <div className="mt-5 space-y-2">
                {Array.from({ length: Math.min(3, n - 1) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-7 w-28 rounded-full bg-blush" />
                    <div className="h-0.5 flex-1 border-t-2 border-dashed border-clash/50" />
                    <div className="h-7 w-28 rounded-full bg-blush" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { t: "Morning", k: teaser.amCount, I: Sun },
                { t: "Night", k: teaser.pmCount, I: Moon },
              ].map(({ t, k, I }) => (
                <div key={t} className="rounded-2xl bg-blush-2 p-4">
                  <div className="flex items-center gap-2 font-serif text-[20px] font-semibold">
                    <I className="h-5 w-5" /> {t}
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {Array.from({ length: Math.max(2, k) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-white" />
                        <div className="h-3 rounded bg-ink/40" style={{ width: `${50 + ((i * 37) % 40)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white/95" />
        </button>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-5 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-lime shadow-lg">
            <Lock className="h-5 w-5" />
          </span>
          <p className="max-w-xs text-[14px] text-ink-2">
            Your <b>morning ({teaser.amCount} steps)</b> and <b>night ({teaser.pmCount} steps)</b>
            {n > 0 ? `, and how to fix ${n === 1 ? "it" : `all ${n}`}` : ""}, are ready.
          </p>
          <Button size="lg" onClick={onUnlock} data-testid="unlock-button" className="w-full max-w-xs">
            See my full routine <ArrowDot nudge />
          </Button>
        </div>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted">
        <ShieldCheck className="h-4 w-4" /> Saved for you. Photos are never stored.
      </p>
    </div>
  );
}
