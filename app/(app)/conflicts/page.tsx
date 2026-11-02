import type { Metadata } from "next";
import { PageHead } from "@/components/app/page-head";
import { PairChecker } from "@/components/app/pair-checker";
import { ClashLink, SeverityBadge } from "@/components/brand/clash";
import { asUser } from "@/lib/db";
import type { RoutineResult } from "@/lib/engine/types";
import { requirePaidPage } from "@/lib/guard";
import { loadShelf } from "@/lib/shelf";
import { Check, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Conflicts" };

export default async function ConflictsPage() {
  const v = await requirePaidPage("/conflicts");
  const [shelf, latest] = await Promise.all([
    loadShelf(v.user.id),
    asUser(v.user.id, async (tx) => (await tx`select result, created_at from public.checks order by created_at desc limit 1`)[0]),
  ]);
  const result = latest?.result as RoutineResult | undefined;
  return (
    <>
      <PageHead title="Conflicts" sub="What shouldn't touch your skin at the same time." />
      <PairChecker shelf={shelf.map((s) => ({ id: s.id, name: s.name, brand: s.brand, category: s.category }))} />
      <h2 className="mb-3 mt-10 text-[24px] font-semibold">On your shelf</h2>
      {!result ? (
        <p className="rounded-[20px] border border-line bg-white p-5 text-muted">Check your routine first to see your shelf's conflicts.</p>
      ) : result.conflicts.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-5">
          <ShieldCheck className="h-6 w-6 text-safe" />
          <p>No clashes in your last routine check. Nice shelf.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {result.conflicts.map((c) => (
            <li key={`${c.a}-${c.b}`} className="rounded-[20px] border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{c.title}</p>
                <SeverityBadge severity={c.severity} />
              </div>
              <ClashLink a={c.aName} b={c.bName} kind={c.severity === "caution" ? "caution" : "clash"} className="my-3" />
              <p className="text-[14px] text-ink-2">{c.insight}</p>
              <p className="mt-2 flex gap-2 rounded-xl bg-safe-soft px-3 py-2 text-[14px] text-[#2f5a22]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" /> {c.fix}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
