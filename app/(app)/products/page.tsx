import type { Metadata } from "next";
import { PageHead } from "@/components/app/page-head";
import { ShelfManager } from "@/components/app/shelf-manager";
import { requirePaidPage } from "@/lib/guard";
import { QUOTAS } from "@/lib/plans";
import { loadShelf } from "@/lib/shelf";
import { usageCounts } from "@/lib/usage";

export const metadata: Metadata = { title: "Your products" };

export default async function ProductsPage() {
  const v = await requirePaidPage("/products");
  const [shelf, usage] = await Promise.all([loadShelf(v.user.id), usageCounts(v.user.id)]);
  const q = QUOTAS[v.tier!];
  return (
    <>
      <PageHead title="Your products" sub={`${shelf.length} of ${q.shelf} on your shelf`} />
      <ShelfManager
        initial={JSON.parse(JSON.stringify(shelf))}
        tier={v.tier!}
        shelfLimit={q.shelf}
        scansLeft={Math.max(0, q.scans - usage.scan - usage.lookup)}
        scanLimit={q.scans}
      />
    </>
  );
}
