"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, Check, Droplet, Droplets, Feather, RefreshCw, Scale, Sparkles, Sun } from "lucide-react";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { Ring } from "@/components/brand/clash";
import { ArrowDot, Button } from "@/components/ui/button";
import { api, deviceId, lastCheck, preparePhoto, saveLastCheck } from "@/lib/client";
import { catalogById, EXAMPLE_SHELF } from "@/lib/engine/catalog";
import type { Category, RoutineResult, SkinType } from "@/lib/engine/types";
import type { Teaser } from "@/lib/teaser";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { itemKey, PickedChips, ProductSearch, type PickItem } from "./product-picker";

// the result, sign-up, paywall and checkout code loads only once a result exists
const CheckResult = dynamic(() => import("./check-result").then((m) => m.CheckResult), {
  ssr: false,
  loading: () => <div className="skeleton h-96 w-full" />,
});

type Stage = "input" | "skin" | "work" | "result";

export const SKIN_TYPES: { key: SkinType; label: string; hint: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "oily", label: "Oily", hint: "Shiny by noon", Icon: Droplets },
  { key: "dry", label: "Dry", hint: "Feels tight, flaky", Icon: Sun },
  { key: "combination", label: "Combination", hint: "Oily T-zone, dry cheeks", Icon: Scale },
  { key: "normal", label: "Normal", hint: "Rarely acts up", Icon: Droplet },
  { key: "sensitive", label: "Sensitive", hint: "Stings, gets red", Icon: Feather },
];

export interface TryResult {
  id: string;
  paid: boolean;
  teaser: Teaser;
  full: RoutineResult | null;
  thumb: string | null;
}

const ERRORS: Record<string, string> = {
  limit: "That's your 3 free checks for today on this device. Come back tomorrow, or open your last routine check.",
  no_products_found: "We couldn't spot a product label in that photo. Try a closer shot, with the labels facing you.",
  empty: "Add at least one product we can recognize.",
  photo_unavailable: "Photo reading is taking a break. Type your products instead: it's just as fast.",
  quota: "You've used this month's routine checks on your plan.",
  default: "Something went wrong on our side. Your products are still here.",
};

export function TryFlow({
  aiEnabled,
  signedIn,
  compact = false,
  onDone,
}: {
  aiEnabled: boolean;
  signedIn: boolean;
  compact?: boolean;
  onDone?: (r: TryResult) => void;
}) {
  const [stage, setStage] = React.useState<Stage>("input");
  const [items, setItems] = React.useState<PickItem[]>([]);
  const [photo, setPhoto] = React.useState<Awaited<ReturnType<typeof preparePhoto>> | null>(null);
  const [photoBusy, setPhotoBusy] = React.useState(false);
  const [skin, setSkin] = React.useState<SkinType | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TryResult | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const canGo = items.length > 0 || Boolean(photo);

  const onFile = async (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("That file isn't a photo. Try a JPG or PNG.");
      return;
    }
    setError(null);
    setPhotoBusy(true);
    try {
      setPhoto(await preparePhoto(f));
    } catch {
      setError("We couldn't open that photo. Try another one.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const tryExample = () => {
    setItems(EXAMPLE_SHELF.map((id) => ({ kind: "catalog" as const, product: catalogById(id)! })));
    setPhoto(null);
    setError(null);
    setStage("skin");
  };

  const scrollTop = () => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 84;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  };

  React.useEffect(scrollTop, [stage]);
  React.useEffect(() => {
    if (stage === "skin" || stage === "work") void import("./check-result");
  }, [stage]);

  return (
    <div ref={rootRef} className="relative" data-stage={stage}>
      <AnimatePresence mode="wait" initial={false}>
        {stage === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {aiEnabled && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  onFile(e.dataTransfer.files?.[0]);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  aria-label="Take or upload a photo of your products"
                  onChange={(e) => onFile(e.target.files?.[0])}
                  data-testid="photo-input"
                />
                {photo ? (
                  <div className="flex items-center gap-4 rounded-[22px] border border-line bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.preview} alt="Your shelf" className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">Photo ready</p>
                      <p className="text-[14px] text-muted">We'll read every label in it.</p>
                    </div>
                    <Button variant="outline" size="sm" type="button" onClick={() => fileRef.current?.click()}>
                      <RefreshCw className="h-3.5 w-3.5" /> Retake
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[22px] border-2 border-dashed border-nude bg-gradient-to-b from-white to-blush-2 px-6 transition hover:border-rose/60 active:scale-[0.99]",
                      compact ? "py-6" : "py-8 md:py-10",
                      drag && "border-rose bg-blush",
                    )}
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-cream shadow-[var(--shadow-soft)] transition group-hover:scale-105">
                      {photoBusy ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                    </span>
                    <span className="font-serif text-[22px] font-semibold text-ink">Snap your shelf</span>
                    <span className="text-[14px] text-muted">
                      <span className="md:hidden">Take a photo of your products' labels</span>
                      <span className="hidden md:inline">Drop a photo of your products, or click to choose one</span>
                    </span>
                    <span className="pointer-events-none absolute -right-3 top-3 hidden rotate-12 opacity-70 sm:block">
                      <Bottle category="serum" seed="deco-a" className="h-14" />
                    </span>
                    <span className="pointer-events-none absolute -left-2 bottom-2 hidden -rotate-12 opacity-60 sm:block">
                      <Bottle category="moisturizer" seed="deco-b" className="h-12" />
                    </span>
                  </button>
                )}
              </div>
            )}

            <div>
              {aiEnabled && (
                <div className="mb-3 flex items-center gap-3 text-[13px] text-muted">
                  <span className="h-px flex-1 bg-line" /> or type them <span className="h-px flex-1 bg-line" />
                </div>
              )}
              <ProductSearch
                allowFreeText={aiEnabled}
                exclude={items.map(itemKey)}
                onPick={(i) => {
                  setItems((prev) => (prev.some((p) => itemKey(p) === itemKey(i)) ? prev : [...prev, i]));
                  setError(null);
                }}
              />
              {items.length > 0 && (
                <div className="mt-3">
                  <PickedChips items={items} onRemove={(k) => setItems((p) => p.filter((x) => itemKey(x) !== k))} />
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-2xl bg-clash-soft px-4 py-3 text-[14px] text-clash">
                {error}
                {error === ERRORS.limit && lastCheck() && (
                  <a href={`/result/${lastCheck()}`} className="mt-1 block font-semibold underline">
                    See my last routine check
                  </a>
                )}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                disabled={!canGo}
                onClick={() => setStage("skin")}
                data-testid="check-button"
              >
                Check my routine <ArrowDot nudge={canGo} />
              </Button>
              <Button variant="ghost" size="lg" onClick={tryExample} className="w-full sm:w-auto" data-testid="try-example">
                <Sparkles className="h-4 w-4 text-rose" /> Try an example shelf
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "skin" && (
          <motion.div
            key="skin"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStage("input")}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush-2"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full w-1/2 rounded-full bg-ink" />
              </div>
            </div>
            <h3 className="font-serif text-[26px] font-semibold leading-tight md:text-[30px]">What's your skin like most days?</h3>
            <p className="mt-1 text-[15px] text-muted">
              {items.length + (photo ? 1 : 0) > 1 || photo
                ? "So your routine fits your skin, not someone's on TikTok."
                : "So your routine fits your skin."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {SKIN_TYPES.map(({ key, label, hint, Icon }) => (
                <button
                  key={key}
                  type="button"
                  data-testid={`skin-${key}`}
                  onClick={() => {
                    setSkin(key);
                    setStage("work");
                  }}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-ink/30 hover:shadow-[var(--shadow-soft)] active:scale-[0.98]",
                    skin === key && "border-ink ring-2 ring-ink",
                    key === "sensitive" && "col-span-2 sm:col-span-1",
                  )}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blush text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{label}</span>
                    <span className="block text-[13px] text-muted">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "work" && skin && (
          <motion.div key="work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Work
              items={items}
              photo={photo}
              skin={skin}
              onBack={(msg) => {
                setError(msg);
                setStage("input");
              }}
              onDone={(r) => {
                setResult(r);
                saveLastCheck(r.id, photo?.thumb);
                setStage("result");
                onDone?.(r);
              }}
            />
          </motion.div>
        )}

        {stage === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <CheckResult
              checkId={result.id}
              teaser={result.teaser}
              full={result.full}
              thumb={photo?.preview ?? null}
              signedIn={signedIn}
              onRestart={() => {
                setItems([]);
                setPhoto(null);
                setResult(null);
                setStage("input");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STEPS = ["Reading your labels", "Finding the active ingredients", "Checking every pair", "Ordering your morning", "Ordering your night"];

function Work({
  items,
  photo,
  skin,
  onDone,
  onBack,
}: {
  items: PickItem[];
  photo: Awaited<ReturnType<typeof preparePhoto>> | null;
  skin: SkinType;
  onDone: (r: TryResult) => void;
  onBack: (msg: string) => void;
}) {
  const [pct, setPct] = React.useState(0);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [slow, setSlow] = React.useState(false);
  React.useEffect(() => {
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 9000);
    return () => clearTimeout(t);
  }, [attempt]);
  const resultRef = React.useRef<TryResult | null>(null);
  const reqRef = React.useRef<{ attempt: number; p: Promise<{ ok: boolean; status: number; data: TryResult & { error?: string } }> } | null>(null);
  const n = items.length;
  const pairs = Math.max(1, (n * (n - 1)) / 2);

  React.useEffect(() => {
    let cancelled = false;
    resultRef.current = null;
    setFailed(null);
    const started = Date.now();
    const minMs = photo ? 4200 : 3400;

    // one request per attempt, even if React runs this effect twice (dev Strict Mode)
    if (!reqRef.current || reqRef.current.attempt !== attempt) {
      const body = {
        deviceId: deviceId(),
        skinType: skin,
        items: items.map((i) => (i.kind === "catalog" ? { catalogId: i.product.id } : { text: i.text })),
        ...(photo ? { photo: { data: photo.data, mime: photo.mime }, thumb: photo.thumb } : {}),
      };
      const send = () => api<TryResult & { error?: string }>("/api/try", { method: "POST", body: JSON.stringify(body) });
      const p = send().then((r) => (r.status === 0 || r.status >= 500 ? send() : r));
      reqRef.current = { attempt, p };
    }
    reqRef.current.p.then((r) => {
      if (cancelled) return;
      if (r.ok && r.data.id) {
        resultRef.current = { ...r.data, thumb: photo?.thumb ?? null };
        return;
      }
      const code = r.data?.error || "default";
      if (["limit", "no_products_found", "empty", "photo_unavailable"].includes(code)) {
        onBack(ERRORS[code] ?? ERRORS.default);
        return;
      }
      setFailed(ERRORS[code] ?? ERRORS.default);
    });

    const t = setInterval(() => {
      const el = Date.now() - started;
      const done = Boolean(resultRef.current);
      setPct((p) => {
        // smooth count: eases toward 99 while waiting, finishes once the real work is done
        const target = done && el >= minMs ? 100 : Math.min(99, (el / minMs) * 92 + (done ? 7 : 0));
        const next = p + Math.max(0.4, (target - p) * 0.18);
        return Math.min(target, next);
      });
    }, 50);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const doneRef = React.useRef(onDone);
  React.useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);
  React.useEffect(() => {
    if (pct >= 100 && resultRef.current && !ready) {
      setReady(true);
      const r = resultRef.current;
      setTimeout(() => doneRef.current(r), 1100);
    }
  }, [pct, ready]);

  const stepIndex = Math.min(STEPS.length, Math.floor((pct / 100) * (STEPS.length + 0.4)));

  if (failed)
    return (
      <div className="py-8 text-center">
        <p className="mx-auto max-w-sm text-[15px] text-ink">{failed}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" onClick={() => onBack("")}>
            Back
          </Button>
          <Button onClick={() => setAttempt((a) => a + 1)}>Try again</Button>
        </div>
      </div>
    );

  return (
    <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr] md:gap-8" aria-live="polite">
      <ScanVisual photo={photo?.preview ?? null} items={items} done={ready} />
      <div>
        <div className="flex items-center gap-4">
          <Ring value={pct} size={76} stroke={7}>
            <span className="font-serif text-[20px] font-semibold tabular-nums">{Math.floor(pct)}%</span>
          </Ring>
          <div>
            <AnimatePresence mode="wait">
              {ready ? (
                <motion.p
                  key="ready"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-serif text-[24px] font-semibold leading-tight"
                >
                  Your routine check is ready.
                </motion.p>
              ) : (
                <motion.p key="work" className="font-serif text-[24px] font-semibold leading-tight">
                  Checking your routine…
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-[14px] text-muted">
              {slow && !ready
                ? "Reading small print takes a few more seconds. Almost there…"
                : photo
                  ? "Your photo stays private: read once, never stored."
                  : `${n} products · ${pairs} pairs`}
            </p>
          </div>
        </div>
        <ol className="mt-5 space-y-2.5">
          {STEPS.map((s, i) => {
            const state = i < stepIndex || ready ? "done" : i === stepIndex ? "now" : "todo";
            const label = s === "Checking every pair" && !photo ? `Checking all ${pairs} pairs` : s;
            if (s === "Reading your labels" && !photo) return null;
            return (
              <li key={s} className={cn("flex items-center gap-3 text-[15px] transition-colors", state === "todo" ? "text-muted/60" : "text-ink")}>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    state === "done" && "scale-100 border-lime bg-lime text-ink",
                    state === "now" && "border-ink",
                    state === "todo" && "border-line",
                  )}
                >
                  {state === "done" ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : state === "now" ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
                  ) : null}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function ScanVisual({ photo, items, done }: { photo: string | null; items: PickItem[]; done: boolean }) {
  const shown = items.slice(0, 6);
  return (
    <div className="relative mx-auto aspect-[4/3.4] w-full max-w-[420px] overflow-hidden rounded-[26px] bg-gradient-to-br from-blush via-blush-2 to-nude/60">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-x-0 bottom-[14%] flex items-end justify-center gap-1.5 px-6">
          {shown.map((i, k) => (
            <motion.div
              key={itemKey(i)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: k * 0.08 }}
            >
              <Bottle
                category={(i.kind === "catalog" ? i.product.category : "serum") as Category}
                seed={itemKey(i)}
                className={cn(
                  "h-[clamp(52px,14vw,92px)]",
                  i.kind === "catalog" && i.product.category === "moisturizer" && "h-[clamp(40px,10vw,64px)]",
                )}
              />
            </motion.div>
          ))}
          <span className="absolute -bottom-2 left-6 right-6 h-2 rounded-full bg-ink/10" />
        </div>
      )}
      {/* scan frame corners */}
      <div className="pointer-events-none absolute inset-4">
        {["left-0 top-0 border-l-2 border-t-2 rounded-tl-xl", "right-0 top-0 border-r-2 border-t-2 rounded-tr-xl", "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl"].map((c) => (
          <span key={c} className={cn("absolute h-7 w-7 border-white/95 drop-shadow", c)} />
        ))}
      </div>
      {!done && (
        <div className="pointer-events-none absolute inset-x-4 h-14 animate-sweep">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-lime/35 to-transparent" />
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-lime shadow-[0_0_12px_2px_rgba(200,255,61,0.8)]" />
        </div>
      )}
      {/* points */}
      {!done &&
        [
          [22, 38],
          [48, 30],
          [70, 46],
          [36, 64],
          [62, 70],
        ].map(([x, y], i) => (
          <motion.span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(200,255,61,0.55)]"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.9] }}
            transition={{ delay: 0.4 + i * 0.45, duration: 0.5 }}
          />
        ))}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 grid place-items-center bg-ink/20 backdrop-blur-[1px]"
          >
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 16 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-lime text-ink shadow-lg"
            >
              <Check className="h-8 w-8" strokeWidth={3} />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Scanning</span>
    </div>
  );
}
