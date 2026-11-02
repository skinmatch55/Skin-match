"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, Lock, PencilLine, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { useConfig } from "@/components/config";
import { ProductSearch, type PickItem } from "@/components/funnel/product-picker";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { api, preparePhoto } from "@/lib/client";
import { ACTIVES, ACTIVE_KEYS, CATEGORIES, CATEGORY_KEYS } from "@/lib/engine/actives";
import type { ActiveKey, Category, Product } from "@/lib/engine/types";
import type { Tier } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { UpgradeSheet } from "./upgrade-sheet";

interface Row {
  id: string;
  catalog_id: string | null;
  brand: string;
  name: string;
  category: Category;
  actives: ActiveKey[];
  when_used: "auto" | "am" | "pm" | "both";
}

const WHEN: { k: Row["when_used"]; l: string }[] = [
  { k: "auto", l: "Auto" },
  { k: "am", l: "Morning" },
  { k: "pm", l: "Night" },
  { k: "both", l: "Both" },
];

export function ShelfManager({
  initial,
  tier,
  shelfLimit,
  scansLeft: initialScans,
  scanLimit,
}: {
  initial: Row[];
  tier: Tier;
  shelfLimit: number;
  scansLeft: number;
  scanLimit: number;
}) {
  const router = useRouter();
  const cfg = useConfig();
  const [items, setItems] = React.useState<Row[]>(initial);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [upgrade, setUpgrade] = React.useState<string | null>(null);
  const [edit, setEdit] = React.useState<Row | "new" | null>(null);
  const [scan, setScan] = React.useState<{ busy: boolean; found: Product[] | null; picked: Set<number> } | null>(null);
  const [scansLeft, setScansLeft] = React.useState(initialScans);
  const [lookupBusy, setLookupBusy] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const canScan = tier !== "basic";

  const add = async (body: object) => {
    setMsg(null);
    const r = await api<{ item?: Row; error?: string }>("/api/shelf", { method: "POST", body: JSON.stringify(body) });
    if (r.ok && r.data.item) {
      setItems((p) => [...p, r.data.item!]);
      router.refresh();
      return true;
    }
    if (r.data.error === "shelf_full") setUpgrade(`Your shelf is full (${shelfLimit} products).`);
    else if (r.data.error === "duplicate") setMsg("That one's already on your shelf.");
    else setMsg("We couldn't add it. Try again.");
    return false;
  };

  const onPick = async (i: PickItem) => {
    if (i.kind === "catalog") return void add({ catalogId: i.product.id });
    if (!canScan || !cfg.ai) {
      setEdit("new");
      return;
    }
    setLookupBusy(true);
    const r = await api<{ product?: Product; error?: string }>("/api/lookup", { method: "POST", body: JSON.stringify({ text: i.text }) });
    setLookupBusy(false);
    if (r.ok && r.data.product) {
      const p = r.data.product;
      setScansLeft((s) => Math.max(0, s - 1));
      await add(p.catalogId ? { catalogId: p.catalogId } : { brand: p.brand, name: p.name, category: p.category, actives: p.actives });
    } else if (r.data.error === "quota") setUpgrade("You've used this month's label scans.");
    else {
      setMsg(`We couldn't identify “${i.text}”. Add it by hand: it takes 20 seconds.`);
    }
  };

  const onPhoto = async (f?: File | null) => {
    if (!f) return;
    setScan({ busy: true, found: null, picked: new Set() });
    try {
      const ph = await preparePhoto(f);
      const r = await api<{ products?: Product[]; error?: string }>("/api/scan", { method: "POST", body: JSON.stringify({ data: ph.data, mime: ph.mime }) });
      if (r.ok && r.data.products) {
        setScansLeft((s) => Math.max(0, s - 1));
        setScan({ busy: false, found: r.data.products, picked: new Set(r.data.products.map((_, i) => i)) });
      } else {
        setScan(null);
        if (r.data.error === "quota") setUpgrade("You've used this month's label scans.");
        else setMsg("We couldn't read that photo. Try again with the label facing the camera.");
      }
    } catch {
      setScan(null);
      setMsg("We couldn't open that photo. Try another one.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems((p) => p.filter((x) => x.id !== id));
    const r = await api(`/api/shelf/${id}`, { method: "DELETE" });
    if (!r.ok) {
      setItems(prev);
      setMsg("We couldn't remove it. Try again.");
    } else router.refresh();
  };

  return (
    <div>
      <div className="rounded-[24px] border border-line bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <ProductSearch allowFreeText onPick={onPick} exclude={items.map((i) => i.catalog_id || "")} placeholder="Add a product by name" />
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <Button
              variant={canScan ? "primary" : "outline"}
              className="flex-1 md:flex-none"
              onClick={() => (canScan ? (cfg.ai ? fileRef.current?.click() : setMsg("Label scanning is warming up. Add by name for now.")) : setUpgrade("Add products with a photo of the label."))}
              data-testid="scan-label"
            >
              {canScan ? <Camera className="h-4 w-4" /> : <Lock className="h-4 w-4" />} Scan a label
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setEdit("new")}>
              <PencilLine className="h-4 w-4" /> By hand
            </Button>
          </div>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {canScan ? `${scansLeft} of ${scanLimit} label scans left this month. Photos are read once, never stored.` : "Scan a label with Pro: 30 scans a month."}
          {lookupBusy && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Spinner className="h-3 w-3" /> Looking it up…
            </span>
          )}
        </p>
        {msg && <p className="mt-2 rounded-xl bg-amber-soft px-3 py-2 text-[14px] text-amber">{msg}</p>}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-dashed border-nude bg-white/60 p-10 text-center">
          <Bottle category="serum" seed="empty" className="mx-auto h-20" />
          <p className="mt-4 text-[16px]">Your shelf is empty. Add the products you use, and Skinmatch puts them in order.</p>
          <Button className="mt-4" onClick={() => document.querySelector<HTMLInputElement>("input[role=combobox]")?.focus()}>
            <Plus className="h-4 w-4" /> Add my first product
          </Button>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {items.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col rounded-[22px] border border-line bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <Bottle category={p.category} seed={p.catalog_id || p.id} className="h-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{p.brand || CATEGORIES[p.category].label}</p>
                    <p className="text-[15px] font-medium leading-snug">{p.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{CATEGORIES[p.category].label}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.actives.length ? (
                    p.actives.map((a) => (
                      <span key={a} className="rounded-full bg-blush px-2 py-0.5 text-[12px]">
                        {ACTIVES[a]?.short ?? a}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] text-muted">No strong actives</span>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <select
                    aria-label="When you use it"
                    value={p.when_used}
                    onChange={async (e) => {
                      const when_used = e.target.value as Row["when_used"];
                      setItems((x) => x.map((r) => (r.id === p.id ? { ...r, when_used } : r)));
                      await api(`/api/shelf/${p.id}`, { method: "PATCH", body: JSON.stringify({ when_used }) });
                      router.refresh();
                    }}
                    className="h-9 rounded-full border border-line bg-cream px-3 text-[13px]"
                  >
                    {WHEN.map((w) => (
                      <option key={w.k} value={w.k}>
                        {w.k === "auto" ? "When: Skinmatch decides" : `When: ${w.l}`}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button onClick={() => setEdit(p)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-blush-2" aria-label={`Edit ${p.name}`}>
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p.id)} className="grid h-9 w-9 place-items-center rounded-full text-clash hover:bg-clash-soft" aria-label={`Remove ${p.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ProductEditor
        row={edit}
        onClose={() => setEdit(null)}
        onSave={async (data) => {
          if (edit === "new") {
            const ok = await add(data);
            if (ok) setEdit(null);
          } else if (edit) {
            const r = await api<{ item?: Row }>(`/api/shelf/${edit.id}`, { method: "PATCH", body: JSON.stringify(data) });
            if (r.ok && r.data.item) {
              setItems((x) => x.map((i) => (i.id === edit.id ? r.data.item! : i)));
              setEdit(null);
              router.refresh();
            }
          }
        }}
      />

      <Sheet open={Boolean(scan)} onClose={() => !scan?.busy && setScan(null)} label="Products found" variant="bottom">
        <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2 sm:pt-5">
          {scan?.busy ? (
            <div className="py-10 text-center">
              <Spinner className="mx-auto h-6 w-6" />
              <p className="mt-3 font-serif text-[22px] font-semibold">Reading your labels…</p>
            </div>
          ) : scan?.found?.length ? (
            <>
              <p className="font-serif text-[24px] font-semibold">We found {scan.found.length}</p>
              <ul className="mt-3 space-y-2">
                {scan.found.map((p, i) => {
                  const on = scan.picked.has(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => {
                          const s = new Set(scan.picked);
                          if (on) s.delete(i);
                          else s.add(i);
                          setScan({ ...scan, picked: s });
                        }}
                        className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left", on ? "border-ink" : "border-line")}
                      >
                        <Bottle category={p.category} seed={p.id} className="h-10" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] text-muted">{p.brand}</span>
                          <span className="block text-[15px]">{p.name}</span>
                        </span>
                        <span className={cn("grid h-6 w-6 place-items-center rounded-full border", on ? "border-ink bg-ink text-lime" : "border-line")}>
                          {on && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Button
                size="lg"
                className="mt-4 w-full"
                onClick={async () => {
                  const list = scan.found!.filter((_, i) => scan.picked.has(i));
                  for (const p of list) await add(p.catalogId ? { catalogId: p.catalogId } : { brand: p.brand, name: p.name, category: p.category, actives: p.actives });
                  setScan(null);
                }}
              >
                Add {scan.picked.size} to my shelf
              </Button>
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="font-serif text-[22px] font-semibold">No labels found</p>
              <p className="mt-1 text-muted">Try a closer photo, with the labels facing the camera.</p>
              <Button className="mt-4" onClick={() => setScan(null)}>
                OK
              </Button>
            </div>
          )}
        </div>
      </Sheet>

      <UpgradeSheet open={Boolean(upgrade)} onClose={() => setUpgrade(null)} reason={upgrade ?? undefined} />
    </div>
  );
}

function ProductEditor({
  row,
  onClose,
  onSave,
}: {
  row: Row | "new" | null;
  onClose: () => void;
  onSave: (d: { brand: string; name: string; category: Category; actives: ActiveKey[] }) => Promise<void>;
}) {
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<Category>("serum");
  const [actives, setActives] = React.useState<ActiveKey[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (row && row !== "new") {
      setBrand(row.brand);
      setName(row.name);
      setCategory(row.category);
      setActives(row.actives);
    } else if (row === "new") {
      setBrand("");
      setName("");
      setCategory("serum");
      setActives([]);
    }
    setErr(null);
  }, [row]);
  const input = "h-11 w-full rounded-xl border border-line bg-white px-3 text-[16px] outline-none focus:border-ink/40 focus:ring-4 focus:ring-blush";
  return (
    <Sheet open={Boolean(row)} onClose={onClose} label="Product" variant="bottom" width={520}>
      <form
        className="overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2 sm:pt-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (name.trim().length < 2) return setErr("Add the product's name.");
          setBusy(true);
          await onSave({ brand: brand.trim(), name: name.trim(), category, actives });
          setBusy(false);
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-serif text-[24px] font-semibold">{row === "new" ? "Add a product" : "Edit product"}</p>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush-2" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-[14px] font-medium">
            Brand
            <input className={cn(input, "mt-1")} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. CeraVe" />
          </label>
          <label className="text-[14px] font-medium">
            Name
            <input className={cn(input, "mt-1")} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night cream" />
          </label>
        </div>
        <label className="mt-3 block text-[14px] font-medium">
          Type
          <select className={cn(input, "mt-1")} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORY_KEYS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIES[c].label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-4 text-[14px] font-medium">Active ingredients on the label</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ACTIVE_KEYS.map((a) => {
            const on = actives.includes(a);
            return (
              <button
                type="button"
                key={a}
                onClick={() => setActives((x) => (on ? x.filter((k) => k !== a) : [...x, a]))}
                className={cn("rounded-full border px-3 py-1.5 text-[13px] transition", on ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-ink/30")}
                aria-pressed={on}
              >
                {ACTIVES[a].short}
              </button>
            );
          })}
        </div>
        {err && <p className="mt-3 text-[13px] text-clash">{err}</p>}
        <Button size="lg" className="mt-5 w-full" disabled={busy}>
          {busy && <Spinner />} Save
        </Button>
      </form>
    </Sheet>
  );
}
