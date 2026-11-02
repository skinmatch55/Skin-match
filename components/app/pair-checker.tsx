"use client";
import { Check, Search, X } from "lucide-react";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { ClashLink, SeverityBadge } from "@/components/brand/clash";

import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/client";
import { searchCatalog } from "@/lib/engine/catalog";
import type { Category, Conflict, GoodPair } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

type Pick = { ref: { shelfId: string } | { catalogId: string }; name: string; brand: string; category: Category };

export function PairChecker({ shelf }: { shelf: { id: string; name: string; brand: string; category: string }[] }) {
  const [a, setA] = React.useState<Pick | null>(null);
  const [b, setB] = React.useState<Pick | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [res, setRes] = React.useState<{ conflict: Conflict | null; good: GoodPair | null; a: string; b: string } | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRes(null);
    if (!a || !b) return;
    setBusy(true);
    setErr(null);
    api<{ conflict: Conflict | null; good: GoodPair | null; a: string; b: string; error?: string }>("/api/pair", {
      method: "POST",
      body: JSON.stringify({ a: a.ref, b: b.ref }),
    }).then((r) => {
      setBusy(false);
      if (r.ok) setRes(r.data);
      else setErr(r.data.error === "same_product" ? "Pick two different products." : "That didn't work. Try again.");
    });
  }, [a, b]);

  return (
    <section className="rounded-[24px] border border-line bg-white p-5" data-testid="pair-checker">
      <h2 className="text-[22px] font-semibold">Can I use these together?</h2>
      <p className="mt-1 text-[14px] text-muted">Pick two products, from your shelf or any product you're thinking of buying.</p>
      <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <Picker value={a} onChange={setA} shelf={shelf} label="First product" />
        <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-blush text-[14px] font-bold">+</span>
        <Picker value={b} onChange={setB} shelf={shelf} label="Second product" />
      </div>
      <div className="mt-4 min-h-[60px]">
        {busy && (
          <p className="flex items-center gap-2 text-muted">
            <Spinner /> Checking…
          </p>
        )}
        {err && <p className="text-clash">{err}</p>}
        {res &&
          (res.conflict ? (
            <div className="rounded-[20px] border border-clash/20 bg-clash-soft/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{res.conflict.title}</p>
                <SeverityBadge severity={res.conflict.severity} />
              </div>
              <ClashLink a={res.a} b={res.b} kind={res.conflict.severity === "caution" ? "caution" : "clash"} className="my-3" />
              <p className="text-[14px]">{res.conflict.insight}</p>
              <p className="mt-2 text-[14px] font-medium">{res.conflict.fix}</p>
            </div>
          ) : (
            <div className="rounded-[20px] border border-lime-deep/30 bg-[#f6ffe0] p-4">
              <p className="flex items-center gap-2 font-semibold">
                <Check className="h-5 w-5" /> Safe to use together
              </p>
              <ClashLink a={res.a} b={res.b} kind="good" className="my-3" />
              <p className="text-[14px]">{res.good ? res.good.insight : "No known clash between these two. Layer thinnest to thickest."}</p>
            </div>
          ))}
      </div>
    </section>
  );
}

function Picker({
  value,
  onChange,
  shelf,
  label,
}: {
  value: Pick | null;
  onChange: (p: Pick | null) => void;
  shelf: { id: string; name: string; brand: string; category: string }[];
  label: string;
}) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  if (value)
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-ink bg-white p-2.5">
        <Bottle category={value.category} seed={value.name} className="h-10" />
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] text-muted">{value.brand}</span>
          <span className="block truncate text-[15px]">{value.name}</span>
        </span>
        <button onClick={() => onChange(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-blush-2" aria-label={`Change ${label}`}>
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  const ql = q.toLowerCase();
  const mine = shelf.filter((s) => !q || `${s.brand} ${s.name}`.toLowerCase().includes(ql)).slice(0, 5);
  const cat = q.length >= 2 ? searchCatalog(q, 5) : [];
  return (
    <div className="relative">
      <label className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-white px-3 focus-within:border-ink/40">
        <Search className="h-4 w-4 text-muted" />
        <input
          aria-label={label}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={label}
          className="h-full w-full bg-transparent text-[16px] outline-none"
        />
      </label>
      {open && (mine.length > 0 || cat.length > 0) && (
        <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)]">
          {mine.length > 0 && <li className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Your shelf</li>}
          {mine.map((s) => (
            <Opt key={s.id} name={s.name} brand={s.brand} category={s.category as Category} onClick={() => onChange({ ref: { shelfId: s.id }, name: s.name, brand: s.brand, category: s.category as Category })} />
          ))}
          {cat.length > 0 && <li className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">All products</li>}
          {cat.map((p) => (
            <Opt key={p.id} name={p.name} brand={p.brand} category={p.category} onClick={() => onChange({ ref: { catalogId: p.id }, name: p.name, brand: p.brand, category: p.category })} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Opt({ name, brand, category, onClick }: { name: string; brand: string; category: Category; onClick: () => void }) {
  return (
    <li>
      <button onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={cn("flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-blush-2")}>
        <Bottle category={category} seed={name} className="h-8" />
        <span className="min-w-0">
          <span className="block text-[11px] text-muted">{brand}</span>
          <span className="block truncate text-[14px]">{name}</span>
        </span>
      </button>
    </li>
  );
}

