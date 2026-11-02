import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHead } from "@/components/app/page-head";
import { RecheckButton } from "@/components/app/recheck";
import { StartCheck } from "@/components/app/start-check";
import { FullResult } from "@/components/funnel/full-result";
import { Button } from "@/components/ui/button";
import { asUser } from "@/lib/db";
import type { Product, RoutineResult } from "@/lib/engine/types";
import { requireViewer } from "@/lib/guard";
import { loadShelf, rowToProduct, signature } from "@/lib/shelf";
import { usageCounts } from "@/lib/usage";
import { QUOTAS } from "@/lib/plans";

export const metadata: Metadata = { title: "Your routine" };

export default async function RoutinePage() {
  const v = await requireViewer("/routine");
  const latest = await asUser(v.user.id, async (tx) => {
    const [c] = await tx`select id, skin_type, products, result, created_at from public.checks order by created_at desc limit 1`;
    return c;
  });

  if (!v.plan.paid) {
    // they stopped at the paywall: back to their locked result
    if (latest) redirect(`/result/${latest.id}`);
    return (
      <>
        <PageHead title="Check your routine" sub="Add your products and your skin type. Ten seconds." />
        <div className="rounded-[28px] border border-line bg-white p-4 md:p-7">
          <StartCheck />
        </div>
      </>
    );
  }

  const shelf = await loadShelf(v.user.id);
  if (!latest) {
    return (
      <>
        <PageHead title="Your routine" sub="Snap or type your products to build it." />
        <div className="rounded-[28px] border border-line bg-white p-4 md:p-7">
          <StartCheck />
        </div>
      </>
    );
  }
  const result = latest.result as RoutineResult;
  const usage = await usageCounts(v.user.id);
  const stale =
    shelf.length > 0 && signature(shelf.map(rowToProduct), latest.skin_type) !== signature(latest.products as Product[], latest.skin_type);

  return (
    <>
      <PageHead
        title="Your routine"
        sub={`Checked ${new Date(latest.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${usage.check} of ${QUOTAS[v.tier!].checks} checks used this month`}
        action={<RecheckButton label="Re-check my routine" variant={stale ? "primary" : "outline"} />}
      />
      {stale && (
        <div className="mb-5 flex flex-col gap-3 rounded-[20px] border border-lime-deep/30 bg-[#f6ffe0] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px]">
            <b>Your shelf changed.</b> Re-check to get your new order and any new conflicts.
          </p>
          <RecheckButton label="Re-check now" size="sm" />
        </div>
      )}
      {shelf.length === 0 && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[20px] border border-line bg-white p-4">
          <p className="text-[15px]">Your shelf is empty. Add products to keep your routine up to date.</p>
          <Link href="/products">
            <Button size="sm">Add products</Button>
          </Link>
        </div>
      )}
      <FullResult result={result} />
    </>
  );
}
