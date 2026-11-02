"use client";

import { Plus, Search, X } from "lucide-react";
import * as React from "react";
import { Bottle } from "@/components/brand/bottle";
import { searchCatalog } from "@/lib/engine/catalog";
import type { Product } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export type PickItem = { kind: "catalog"; product: Product } | { kind: "text"; text: string; id: string };

export function itemKey(i: PickItem) {
  return i.kind === "catalog" ? i.product.id : i.id;
}

export function ProductSearch({
  onPick,
  allowFreeText,
  placeholder = "Type a product, like “CeraVe cleanser”",
  autoFocus,
  exclude = [],
}: {
  onPick: (i: PickItem) => void;
  allowFreeText: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  exclude?: string[];
}) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const results = React.useMemo(() => searchCatalog(q, 7).filter((p) => !exclude.includes(p.id)), [q, exclude]);
  const showFree = allowFreeText && q.trim().length >= 3;
  const total = results.length + (showFree ? 1 : 0);
  const listId = React.useId();

  const pick = (idx: number) => {
    if (idx < results.length) onPick({ kind: "catalog", product: results[idx] });
    else if (showFree) onPick({ kind: "text", text: q.trim(), id: `t-${Date.now()}` });
    setQ("");
    setHi(0);
  };

  return (
    <div className="relative">
      <label className="flex h-13 items-center gap-2 rounded-2xl border border-line bg-white px-4 shadow-[0_1px_0_rgb(42_29_26/0.03)] transition focus-within:border-ink/40 focus-within:ring-4 focus-within:ring-blush">
        <Search className="h-4.5 w-4.5 shrink-0 text-muted" aria-hidden />
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setHi(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((h) => Math.min(total - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter" && total > 0) {
              e.preventDefault();
              pick(hi);
            }
          }}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-muted/80"
          role="combobox"
          aria-expanded={open && total > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search a product"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="rounded-full p-1 text-muted hover:bg-blush-2" aria-label="Clear">
            <X className="h-4 w-4" />
          </button>
        )}
      </label>
      {open && total > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-80 overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-lift)]"
        >
          {results.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === hi}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(i)}
                onMouseEnter={() => setHi(i)}
                className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left", i === hi && "bg-blush-2")}
              >
                <Bottle category={p.category} seed={p.id} className="h-9" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium uppercase tracking-wide text-muted">{p.brand}</span>
                  <span className="block truncate text-[15px] text-ink">{p.name}</span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-muted" />
              </button>
            </li>
          ))}
          {showFree && (
            <li role="option" aria-selected={hi === results.length}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(results.length)}
                onMouseEnter={() => setHi(results.length)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px]",
                  hi === results.length && "bg-blush-2",
                )}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blush text-ink">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  Add “<span className="font-semibold">{q.trim()}</span>”
                  <span className="block text-[12px] text-muted">Skinmatch will look it up</span>
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export function PickedChips({ items, onRemove }: { items: PickItem[]; onRemove: (key: string) => void }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((i) => (
        <li
          key={itemKey(i)}
          className="flex max-w-full items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-1.5 pr-1 text-[14px] shadow-[0_1px_0_rgb(42_29_26/0.03)]"
        >
          {i.kind === "catalog" ? (
            <Bottle category={i.product.category} seed={i.product.id} className="h-6" />
          ) : (
            <span className="grid h-6 w-6 place-items-center rounded-full bg-blush text-[11px] font-bold">?</span>
          )}
          <span className="truncate">
            {i.kind === "catalog" ? (
              <>
                <span className="text-muted">{i.product.brand} </span>
                {i.product.name}
              </>
            ) : (
              i.text
            )}
          </span>
          <button
            type="button"
            onClick={() => onRemove(itemKey(i))}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted hover:bg-blush-2 hover:text-ink"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
