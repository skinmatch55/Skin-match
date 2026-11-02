"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Moon, Sun, X } from "lucide-react";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { cn } from "@/lib/utils";

// A 24-second loop of the real interface, built in code: shelf → scan → conflicts → routine.
const SCENES = [
  { caption: "Snap your shelf", ms: 4500 },
  { caption: "Every label, read", ms: 5000 },
  { caption: "Two products cancel out", ms: 6500 },
  { caption: "Your night, fixed", ms: 8000 },
];

const SHELF = [
  { id: "d1", cat: "cleanser" as const, name: "Hydrating Cleanser" },
  { id: "d2", cat: "exfoliant" as const, name: "2% BHA Liquid" },
  { id: "d3", cat: "serum" as const, name: "Vitamin C 20%" },
  { id: "d4", cat: "treatment" as const, name: "Retinol 0.5%" },
  { id: "d5", cat: "moisturizer" as const, name: "PM Lotion" },
  { id: "d6", cat: "sunscreen" as const, name: "SPF 60" },
];

export function MotionDemo({ hasVideo }: { hasVideo: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scene, setScene] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!visible || hasVideo) return;
    const t = setTimeout(() => setScene((s) => (s + 1) % SCENES.length), SCENES[scene].ms);
    return () => clearTimeout(t);
  }, [scene, visible, hasVideo]);

  if (hasVideo)
    return (
      <div ref={ref} className="mx-auto max-w-[360px] overflow-hidden rounded-[44px] border-[10px] border-ink bg-ink shadow-[var(--shadow-lift)]">
        <video src="/demo.mp4" autoPlay muted loop playsInline className="w-full" />
      </div>
    );

  return (
    <div ref={ref} className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
      <div className="hidden md:block" />
      <div className="relative mx-auto">
        <PhoneFrame>
          <div className="relative h-full overflow-hidden bg-cream">
            <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-semibold text-ink">
              <span>9:41</span>
              <span className="h-2 w-5 rounded-sm border border-ink/50" />
            </div>
            <AnimatePresence mode="wait">
              {scene === 0 && <SceneShelf key="s0" />}
              {scene === 1 && <SceneScan key="s1" />}
              {scene === 2 && <SceneClash key="s2" />}
              {scene === 3 && <SceneRoutine key="s3" />}
            </AnimatePresence>
          </div>
        </PhoneFrame>
      </div>
      <div className="text-center md:text-left">
        <AnimatePresence mode="wait">
          <motion.p
            key={scene}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-serif text-[34px] font-semibold leading-tight md:text-[44px]"
          >
            {SCENES[scene].caption}
          </motion.p>
        </AnimatePresence>
        <div className="mt-4 flex justify-center gap-1.5 md:justify-start" aria-hidden>
          {SCENES.map((s, i) => (
            <span key={s.caption} className={cn("h-1.5 rounded-full transition-all duration-500", i === scene ? "w-8 bg-ink" : "w-1.5 bg-ink/20")} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative h-[560px] w-[280px] rounded-[48px] bg-ink p-[10px] shadow-[var(--shadow-lift)]", className)}>
      <div className="absolute left-1/2 top-[18px] z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-ink" />
      <div className="h-full w-full overflow-hidden rounded-[38px]">{children}</div>
    </div>
  );
}

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.4 } };

function SceneShelf() {
  return (
    <motion.div {...fade} className="px-5 pt-10">
      <p className="font-serif text-[22px] font-semibold leading-tight">Snap your shelf</p>
      <p className="mt-1 text-[12px] text-muted">We read every label.</p>
      <div className="relative mt-6 grid h-[300px] place-items-end overflow-hidden rounded-[26px] bg-gradient-to-br from-blush to-nude/70 pb-10">
        <div className="flex items-end gap-1">
          {SHELF.map((s, i) => (
            <motion.div key={s.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.12 }}>
              <Bottle category={s.cat} seed={s.id} className={s.cat === "moisturizer" ? "h-11" : "h-16"} />
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute inset-5 rounded-2xl border-2 border-white/90"
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.1, 1], opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.4 }}
          className="absolute bottom-3 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border-4 border-white bg-ink"
        />
      </div>
    </motion.div>
  );
}

function SceneScan() {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(99, p + 2.4)), 90);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div {...fade} className="px-5 pt-10">
      <p className="font-serif text-[22px] font-semibold leading-tight">Checking your routine…</p>
      <p className="mt-1 text-[12px] tabular-nums text-muted">{Math.floor(pct)}% · 15 pairs</p>
      <div className="relative mt-5 grid h-[170px] place-items-end overflow-hidden rounded-[22px] bg-gradient-to-br from-blush to-nude/70 pb-6">
        <div className="flex items-end gap-0.5">
          {SHELF.map((s) => (
            <Bottle key={s.id} category={s.cat} seed={s.id} className={s.cat === "moisturizer" ? "h-9" : "h-12"} />
          ))}
        </div>
        <div className="absolute inset-x-3 h-10 animate-sweep">
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-lime shadow-[0_0_10px_2px_rgba(200,255,61,0.8)]" />
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-[13px]">
        {["Reading your labels", "Finding the actives", "Checking every pair", "Ordering your night"].map((t, i) => {
          const done = pct > 20 + i * 22;
          return (
            <li key={t} className={cn("flex items-center gap-2", !done && "text-muted/60")}>
              <span className={cn("grid h-5 w-5 place-items-center rounded-full border", done ? "border-lime bg-lime" : "border-line")}>
                {done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              {t}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function SceneClash() {
  return (
    <motion.div {...fade} className="px-5 pt-10">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-rose">Your routine check is ready</p>
      <p className="mt-1 font-serif text-[24px] font-semibold leading-tight">
        <span className="marker">2 conflicts</span> on your shelf
      </p>
      {[
        { a: "Retinol 0.5%", b: "2% BHA", t: "Retinoid × Exfoliating acid", d: "Together they leave skin red, raw and flaky." },
        { a: "Vitamin C 20%", b: "Retinol 0.5%", t: "Retinoid × Vitamin C", d: "Vitamin C works in the morning; retinol at night." },
      ].map((c, i) => (
        <motion.div
          key={c.t}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.9 }}
          className="mt-4 rounded-2xl border border-clash/20 bg-white p-3 shadow-sm"
        >
          <p className="text-[13px] font-semibold">{c.t}</p>
          <div className="my-2 flex items-center">
            <span className="rounded-full border border-line px-2 py-1 text-[11px]">{c.a}</span>
            <span className="relative mx-1 flex-1 border-t-2 border-dashed border-clash/50">
              <span className="absolute left-1/2 top-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-clash text-white">
                <X className="h-3 w-3" strokeWidth={3} />
              </span>
            </span>
            <span className="rounded-full border border-line px-2 py-1 text-[11px]">{c.b}</span>
          </div>
          <p className="text-[12px] text-muted">{c.d}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function SceneRoutine() {
  const am = ["Hydrating Cleanser", "Vitamin C 20%", "PM Lotion", "SPF 60"];
  const pm = ["Hydrating Cleanser", "Retinol 0.5%", "PM Lotion"];
  return (
    <motion.div {...fade} className="px-5 pt-9">
      <div className="rounded-2xl bg-gradient-to-b from-[#fff8ef] to-white p-3">
        <p className="flex items-center gap-2 font-serif text-[17px] font-semibold">
          <Sun className="h-4 w-4 text-[#9a6412]" /> Morning
        </p>
        <ol className="mt-2 space-y-1.5">
          {am.map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.25 }} className="flex items-center gap-2 text-[12px]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold shadow-sm">{i + 1}</span>
              {s}
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="mt-3 rounded-2xl bg-gradient-to-b from-[#f3ecf2] to-white p-3">
        <p className="flex items-center gap-2 font-serif text-[17px] font-semibold">
          <Moon className="h-4 w-4" /> Night
        </p>
        <div className="mt-2 flex gap-1 rounded-full bg-ink/5 p-0.5 text-[10px] font-semibold">
          <span className="flex-1 rounded-full bg-white py-1 text-center shadow-sm">Retinoid nights</span>
          <span className="flex-1 py-1 text-center text-muted">Exfoliation nights</span>
        </div>
        <ol className="mt-2 space-y-1.5">
          {pm.map((s, i) => (
            <motion.li key={s + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 + i * 0.25 }} className="flex items-center gap-2 text-[12px]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold shadow-sm">{i + 1}</span>
              {s}
            </motion.li>
          ))}
        </ol>
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3 }}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-lime py-2 text-[12px] font-semibold"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Score 71 → 100
      </motion.p>
    </motion.div>
  );
}
