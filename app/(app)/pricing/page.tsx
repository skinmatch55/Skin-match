import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PricingClient } from "@/components/app/pricing-client";
import { asUser } from "@/lib/db";
import { requireViewer } from "@/lib/guard";

export const metadata: Metadata = { title: "Plans", robots: { index: false } };

/** The same paywall, as a page (checkout pages send people back here when they cancel). Never linked from the landing page. */
export default async function PricingPage() {
  const v = await requireViewer("/pricing");
  if (v.plan.paid) redirect("/account");
  const latest = await asUser(v.user.id, async (tx) => (await tx`select result from public.checks order by created_at desc limit 1`)[0]);
  const n = latest?.result?.conflicts?.length ?? null;
  const line =
    n === null
      ? "Your morning and night routine, in the right order, with every conflict checked."
      : n === 0
        ? "No clashes on your shelf, and your routine is ordered and waiting."
        : `We found ${n === 1 ? "1 product pair" : `${n} product pairs`} working against each other. Your routine is fixed and waiting.`;
  return (
    <div className="mx-auto flex max-w-[480px] flex-col overflow-hidden rounded-[28px] border border-line bg-cream">
      <PricingClient title={latest ? "Your routine check is ready." : "Choose your plan"} line={line} />
    </div>
  );
}
