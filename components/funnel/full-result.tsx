"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, Download, Lightbulb, Moon, Share2, Sun } from "lucide-react";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { ClashLink, Ring, SeverityBadge } from "@/components/brand/clash";
import { Button } from "@/components/ui/button";
import type { RoutineResult, RoutineStep } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const SKIN_LABEL: Record<string, string> = {
  oily: "oily",
  dry: "dry",
  combination: "combination",
  normal: "normal",
  sensitive: "sensitive",
};

export function useCountUp(to: number, ms = 900) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

export function FullResult({ result, compactHeader = false }: { result: RoutineResult; compactHeader?: boolean }) {
  const [night, setNight] = React.useState<"A" | "B">("A");
  const after = useCountUp(result.scoreAfter);
  const pm = result.pm.filter((s) => !s.nights || s.nights === night);

  return (
    <div className="space-y-6" data-testid="full-result">
      {!compactHeader && (
        <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-white p-5 sm:flex-row sm:items-center">
          <Ring value={after} size={104} stroke={9}>
            <span className="text-center leading-none">
              <span className="block font-serif text-[30px] font-semibold tabular-nums">{after}</span>
              <span className="text-[11px] uppercase tracking-wider text-muted">score</span>
            </span>
          </Ring>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-rose">Your routine check</p>
            <h3 className="mt-1 font-serif text-[24px] font-semibold leading-tight">
              {result.conflicts.length
                ? `${result.conflicts.length} ${result.conflicts.length === 1 ? "conflict" : "conflicts"} fixed in your new order`
                : "No clashes. Here's the right order."}
            </h3>
            <p className="mt-1 text-[14px] text-muted">
              Score <span className="tabular-nums">{result.scoreBefore}</span> before →{" "}
              <span className="font-semibold text-ink tabular-nums">{result.scoreAfter}</span> with this routine, for{" "}
              {SKIN_LABEL[result.skinType]} skin. {result.pairsChecked} pairs checked.
            </p>
          </div>
          <ShareButtons result={result} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <RoutineCard title="Morning" icon={<Sun className="h-5 w-5" />} steps={result.am} tone="am" />
        <RoutineCard
          title="Night"
          icon={<Moon className="h-5 w-5" />}
          steps={pm}
          tone="pm"
          header={
            result.nightPlan ? (
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-ink/5 p-1 text-[13px]" role="tablist">
                {(["A", "B"] as const).map((k) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={night === k}
                    onClick={() => setNight(k)}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-semibold transition",
                      night === k ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                    )}
                  >
                    {k === "A" ? result.nightPlan!.a : result.nightPlan!.b}
                    <span className="block text-[11px] font-normal text-muted">{k === "A" ? result.nightPlan!.aDays : result.nightPlan!.bDays}</span>
                  </button>
                ))}
              </div>
            ) : null
          }
        />
      </div>

      {result.conflicts.length > 0 && (
        <section>
          <h4 className="mb-3 font-serif text-[22px] font-semibold">What shouldn't be mixed</h4>
          <ul className="space-y-3">
            {result.conflicts.map((c, i) => (
              <motion.li
                key={`${c.a}-${c.b}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-[20px] border border-line bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{c.title}</p>
                  <SeverityBadge severity={c.severity} />
                </div>
                <ClashLink a={c.aName} b={c.bName} kind={c.severity === "caution" ? "caution" : "clash"} className="my-3" />
                <p className="text-[14px] text-ink-2">{c.insight}</p>
                <p className="mt-2 flex gap-2 rounded-xl bg-safe-soft px-3 py-2 text-[14px] text-[#2f5a22]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" /> {c.fix}
                </p>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {(result.notes.length > 0 || result.goodPairs.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {result.notes.length > 0 && (
            <section className="rounded-[20px] border border-line bg-white p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Lightbulb className="h-4 w-4 text-amber" /> Good to know
              </h4>
              <ul className="space-y-2 text-[14px] text-ink-2">
                {result.notes.map((n) => (
                  <li key={n} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" /> {n}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {result.goodPairs.length > 0 && (
            <section className="rounded-[20px] border border-line bg-white p-4">
              <h4 className="mb-3 font-semibold">Works great together</h4>
              <ul className="space-y-3">
                {result.goodPairs.slice(0, 3).map((g) => (
                  <li key={g.title}>
                    <ClashLink a={g.aName} b={g.bName} kind="good" />
                    <p className="mt-1.5 text-[13px] text-muted">{g.insight}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
      {compactHeader && (
        <div className="flex justify-end">
          <ShareButtons result={result} />
        </div>
      )}
    </div>
  );
}

function RoutineCard({
  title,
  icon,
  steps,
  tone,
  header,
}: {
  title: string;
  icon: React.ReactNode;
  steps: RoutineStep[];
  tone: "am" | "pm";
  header?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[24px] border p-5",
        tone === "am" ? "border-line bg-gradient-to-b from-[#fff8ef] to-white" : "border-ink/10 bg-gradient-to-b from-[#f3ecf2] to-white",
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("grid h-10 w-10 place-items-center rounded-full", tone === "am" ? "bg-[#ffe9c7] text-[#9a6412]" : "bg-ink text-lime")}>
          {icon}
        </span>
        <div>
          <h4 className="font-serif text-[22px] font-semibold leading-none">{title}</h4>
          <p className="mt-1 text-[13px] text-muted">{steps.length} steps, in this order</p>
        </div>
      </div>
      {header}
      {steps.length === 0 ? (
        <p className="mt-4 text-[14px] text-muted">Nothing needed here yet.</p>
      ) : (
        <ol className="relative mt-4 space-y-1">
          <span className="absolute bottom-6 left-[19px] top-6 w-px bg-line" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.productId + i} className="relative flex items-start gap-3 py-1.5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-[14px] font-semibold tabular-nums">
                {i + 1}
              </span>
              <Bottle category={s.category} seed={s.productId} className="h-11 shrink-0" />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{s.role}</p>
                <p className="text-[15px] leading-snug text-ink">
                  <span className="text-muted">{s.brand} </span>
                  {s.name}
                </p>
                {s.tip && <p className="mt-0.5 text-[13px] text-rose-deep">{s.tip}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function routineText(r: RoutineResult) {
  const lines = ["My skincare routine, checked by Skinmatch", "", "☀ Morning"];
  r.am.forEach((s, i) => lines.push(`${i + 1}. ${s.brand} ${s.name}`));
  lines.push("", "☾ Night");
  r.pm.forEach((s, i) => lines.push(`${i + 1}. ${s.brand} ${s.name}${s.nights && r.nightPlan ? ` (${s.nights === "A" ? r.nightPlan.a : r.nightPlan.b})` : ""}`));
  if (r.conflicts.length) {
    lines.push("", "Never together:");
    r.conflicts.forEach((c) => lines.push(`× ${c.aName} + ${c.bName}`));
  }
  return lines.join("\n");
}

function drawCard(r: RoutineResult): string {
  const W = 1080;
  const rows = r.am.length + r.pm.length;
  const H = Math.max(1350, 520 + rows * 64 + Math.min(4, r.conflicts.length) * 56);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#F6E4DD");
  grad.addColorStop(1, "#FBF7F4");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#2A1D1A";
  g.font = "600 64px Georgia, serif";
  g.fillText("My routine, checked.", 80, 150);
  g.font = "32px system-ui, sans-serif";
  g.fillStyle = "#7A6660";
  g.fillText(`Score ${r.scoreBefore} → ${r.scoreAfter} · ${r.conflicts.length} conflicts fixed`, 80, 205);
  let y = 300;
  const section = (title: string, steps: RoutineStep[]) => {
    g.fillStyle = "#2A1D1A";
    g.font = "600 40px Georgia, serif";
    g.fillText(title, 80, y);
    y += 56;
    g.font = "30px system-ui, sans-serif";
    steps.forEach((s, i) => {
      g.fillStyle = "#C8FF3D";
      g.beginPath();
      g.arc(100, y - 10, 22, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#2A1D1A";
      g.fillText(String(i + 1), i + 1 >= 10 ? 83 : 91, y);
      const text = `${s.brand} ${s.name}`;
      g.fillText(text.length > 52 ? text.slice(0, 51) + "…" : text, 145, y);
      y += 64;
    });
    y += 30;
  };
  section("☀ Morning", r.am);
  section("☾ Night", r.pm);
  if (r.conflicts.length) {
    g.fillStyle = "#D2553F";
    g.font = "600 34px system-ui, sans-serif";
    g.fillText("Never together", 80, y);
    y += 50;
    g.font = "28px system-ui, sans-serif";
    r.conflicts.slice(0, 4).forEach((cf) => {
      const t = `× ${cf.aName} + ${cf.bName}`;
      g.fillText(t.length > 60 ? t.slice(0, 59) + "…" : t, 80, y);
      y += 56;
    });
  }
  g.fillStyle = "#2A1D1A";
  g.font = "600 34px Georgia, serif";
  g.fillText("Skinmatch", 80, H - 70);
  g.fillStyle = "#7A6660";
  g.font = "26px system-ui, sans-serif";
  g.fillText("Your skincare routine, checked by AI", 280, H - 70);
  return c.toDataURL("image/png");
}

export function ShareButtons({ result }: { result: RoutineResult }) {
  const [copied, setCopied] = React.useState(false);
  const share = async () => {
    const text = routineText(result);
    try {
      if (navigator.share) {
        await navigator.share({ title: "My skincare routine", text });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = drawCard(result);
    a.download = "my-skinmatch-routine.png";
    a.click();
  };
  return (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" onClick={share}>
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? "Copied" : "Share"}
      </Button>
      <Button variant="outline" size="sm" onClick={download} aria-label="Download as image">
        <Download className="h-4 w-4" /> Save
      </Button>
    </div>
  );
}
