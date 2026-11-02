import type { Metadata } from "next";
import { AccountView } from "@/components/app/account";
import { PageHead } from "@/components/app/page-head";
import { db } from "@/lib/db";
import { requireViewer } from "@/lib/guard";
import { PLAN_COPY, QUOTAS } from "@/lib/plans";
import { usageCounts } from "@/lib/usage";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const v = await requireViewer("/account");
  const [prof] = await db()`select skin_type from public.profiles where id = ${v.user.id}`;
  const usage = v.tier ? await usageCounts(v.user.id) : null;
  return (
    <>
      <PageHead title="Account" />
      <AccountView
        email={v.user.email}
        skinType={prof?.skin_type ?? null}
        plan={
          v.tier
            ? {
                name: PLAN_COPY[v.tier].name,
                tier: v.tier,
                status: v.plan.status,
                until: v.plan.until,
                quota: QUOTAS[v.tier],
                usage: usage ? { check: usage.check, scan: usage.scan + usage.lookup, resets: usage.resets.toISOString() } : null,
              }
            : null
        }
      />
    </>
  );
}
