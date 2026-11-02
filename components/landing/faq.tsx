"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-[24px] border border-line bg-white">
      {items.map((f, i) => (
        <div key={f.q}>
          <button
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[16px] font-semibold md:px-7"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {f.q}
            <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush transition", open === i && "rotate-45 bg-ink text-cream")}>
              <Plus className="h-4 w-4" />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-2 md:px-7">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
