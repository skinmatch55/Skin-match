"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck2, Check, ListOrdered, ShieldAlert, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { LogoMark } from "@/components/brand/logo";

/** Full-screen, 3 short scenes (~5 s), skippable. */
export function UnlockMoment({ planName, onDone }: { planName: string; onDone: () => void }) {
  const [scene, setScene] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    const t1 = setTimeout(() => setScene(1), 1600);
    const t2 = setTimeout(() => setScene(2), 3500);
    const t3 = setTimeout(onDone, 5000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);
  if (!mounted) return null;
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center bg-ink px-6 text-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="unlock-moment"
    >
      <button onClick={onDone} className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full text-cream/80 hover:bg-white/10" aria-label="Skip">
        <X className="h-5 w-5" />
      </button>
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(50% 40% at 50% 40%, rgba(200,255,61,0.18), transparent 70%)" }} />
      <AnimatePresence mode="wait">
        {scene === 0 && (
          <motion.div key="s0" className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -12 }}>
            <motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
              <LogoMark className="mx-auto h-16 w-16" />
            </motion.div>
            <p className="mt-6 font-serif text-[38px] font-semibold leading-tight">You're on {planName}</p>
          </motion.div>
        )}
        {scene === 1 && (
          <motion.div key="s1" className="w-full max-w-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p className="mb-5 text-center font-serif text-[28px] font-semibold">Now unlocked</p>
            {[
              { I: ListOrdered, t: "Your morning and night, in order" },
              { I: ShieldAlert, t: "Every conflict, with its fix" },
              { I: CalendarCheck2, t: "Your shelf, saved in the app" },
            ].map(({ I, t }, i) => (
              <motion.div
                key={t}
                className="mb-3 flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-lime text-ink">
                  <I className="h-5 w-5" />
                </span>
                <span className="text-[16px]">{t}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
        {scene === 2 && (
          <motion.div key="s2" className="text-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime text-ink">
              <Check className="h-10 w-10" strokeWidth={3} />
            </span>
            <p className="mt-6 font-serif text-[40px] font-semibold">Let's go</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}
