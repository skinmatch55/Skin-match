"use client";
import { Lock, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowDot, Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { UpgradeSheet } from "./upgrade-sheet";

type Metric = "breakouts" | "dryness" | "redness" | "oiliness" | "glow";
interface Entry {
  id: string;
  entry_date: string;
  breakouts: number;
  dryness: number;
  redness: number;
  oiliness: number;
  glow: number;
  note: string;
}
const METRICS: { k: Metric; l: string; good: "low" | "high"; scale: [string, string] }[] = [
  { k: "breakouts", l: "Breakouts", good: "low", scale: ["None", "A lot"] },
  { k: "dryness", l: "Dryness", good: "low", scale: ["None", "Very dry"] },
  { k: "redness", l: "Redness", good: "low", scale: ["None", "Very red"] },
  { k: "oiliness", l: "Oiliness", good: "low", scale: ["Matte", "Very shiny"] },
  { k: "glow", l: "Glow", good: "high", scale: ["Dull", "Glowing"] },
];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Diary({ initial }: { initial: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = React.useState(initial);
  const existing = entries.find((e) => e.entry_date === today());
  const [vals, setVals] = React.useState<Record<Metric, number>>(
    existing ?? { breakouts: 3, dryness: 3, redness: 3, oiliness: 3, glow: 3 },
  );
  const [note, setNote] = React.useState(existing?.note ?? "");
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setErr(null);
    const r = await api<{ entry?: Entry }>("/api/diary", { method: "POST", body: JSON.stringify({ entry_date: today(), ...vals, note }) });
    setBusy(false);
    if (r.ok && r.data.entry) {
      const e = r.data.entry;
      setEntries((x) => [e, ...x.filter((y) => y.entry_date !== e.entry_date)].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } else setErr("We couldn't save it. Try again.");
  };

  const chrono = [...entries].reverse();
  const last = entries[0];
  const prev = entries[1];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-[24px] border border-line bg-white p-5" data-testid="diary-form">
        <h2 className="text-[22px] font-semibold">{existing ? "Today's check-in" : "How's your skin this week?"}</h2>
        <div className="mt-4 space-y-5">
          {METRICS.map((m) => (
            <div key={m.k}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{m.l}</p>
                <p className="text-[12px] text-muted">
                  {m.scale[0]} → {m.scale[1]}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={m.l}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    role="radio"
                    aria-checked={vals[m.k] === n}
                    onClick={() => setVals((v) => ({ ...v, [m.k]: n }))}
                    className={cn(
                      "h-10 rounded-xl border text-[14px] font-semibold transition active:scale-95",
                      vals[m.k] === n ? "border-ink bg-ink text-lime" : "border-line bg-cream hover:border-ink/30",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <label className="block">
            <span className="font-medium">Notes</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="New product? Period week? Stress?"
              className="mt-2 w-full rounded-xl border border-line bg-cream p-3 text-[16px] outline-none focus:border-ink/40"
            />
          </label>
          {err && <p className="text-[13px] text-clash">{err}</p>}
          <Button size="lg" className="w-full" onClick={save} disabled={busy} data-testid="diary-save">
            {busy && <Spinner />} {saved ? "Saved" : existing ? "Update today's check-in" : "Save my check-in"}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-[24px] border border-line bg-white p-5">
          <h2 className="text-[22px] font-semibold">Trends</h2>
          {entries.length < 2 ? (
            <p className="mt-2 text-[14px] text-muted">
              {entries.length === 0 ? "Your first check-in starts your trend." : "One more check-in next week and your trend appears here."}
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              {METRICS.map((m) => {
                const delta = last[m.k] - prev[m.k];
                const better = delta === 0 ? null : m.good === "low" ? delta < 0 : delta > 0;
                return (
                  <div key={m.k}>
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="font-medium">{m.l}</span>
                      {better === null ? (
                        <span className="text-muted">Same as last time</span>
                      ) : (
                        <span className={cn("flex items-center gap-1 font-medium", better ? "text-safe" : "text-clash")}>
                          {delta < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                          {better ? "Better" : "Worse"} than last time
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex h-10 items-end gap-1">
                      {chrono.map((e) => (
                        <span
                          key={e.id}
                          title={`${e.entry_date}: ${e[m.k]}`}
                          className={cn("flex-1 rounded-t-md", m.good === "high" ? "bg-lime-deep/70" : "bg-nude")}
                          style={{ height: `${e[m.k] * 20}%`, maxWidth: 28 }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {entries.length > 0 && (
          <div className="rounded-[24px] border border-line bg-white p-5">
            <h3 className="font-semibold">History</h3>
            <ul className="mt-2 divide-y divide-line">
              {entries.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                  <span className="w-24 shrink-0 font-medium">
                    {new Date(e.entry_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-muted">{e.note || `Breakouts ${e.breakouts} · Glow ${e.glow}`}</span>
                  <button
                    aria-label="Delete entry"
                    className="grid h-8 w-8 place-items-center rounded-full text-clash hover:bg-clash-soft"
                    onClick={async () => {
                      const r = await api(`/api/diary/${e.id}`, { method: "DELETE" });
                      if (r.ok) setEntries((x) => x.filter((y) => y.id !== e.id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

/** Basic plan: a real preview of the diary, blurred, with "Unlock with Pro". */
export function DiaryLocked() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-line bg-white">
      <div aria-hidden className="pointer-events-none select-none p-6 blur-[6px]">
        {METRICS.map((m, i) => (
          <div key={m.k} className="mb-5">
            <p className="font-medium">{m.l}</p>
            <div className="mt-2 flex h-10 items-end gap-1">
              {[3, 4, 3, 3, 2, 2, 2, 1].map((h, j) => (
                <span key={j} className="flex-1 rounded-t-md bg-nude" style={{ height: `${((h + i) % 5 + 1) * 20}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-lime">
          <Lock className="h-5 w-5" />
        </span>
        <p className="mt-3 max-w-sm font-serif text-[24px] font-semibold">See what really changes, week after week</p>
        <p className="mt-1 max-w-sm text-[14px] text-muted">A 20-second weekly check-in on breakouts, dryness, redness, oil and glow, with trends.</p>
        <Button className="mt-4" onClick={() => setOpen(true)} data-testid="unlock-diary">
          Unlock with Pro <ArrowDot />
        </Button>
      </div>
      <UpgradeSheet open={open} onClose={() => setOpen(false)} target="pro" reason="The skin diary comes with Pro." />
    </div>
  );
}
