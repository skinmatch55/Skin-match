import type { Metadata } from "next";
import { ClaimOnLoad } from "@/components/claim-on-load";
import { ResultView } from "@/components/funnel/result-view";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Your routine check", robots: { index: false } };

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const viewer = await getViewer();
  return (
    <>
      <ClaimOnLoad />
      <SiteHeader cta={false} />
      <main className="gloss min-h-[80dvh] px-4 pb-32 pt-6 md:pt-12">
        <div className="mx-auto max-w-[820px] rounded-[30px] border border-white/80 bg-white/80 p-4 shadow-[var(--shadow-lift)] backdrop-blur md:p-7">
          <ResultView id={id} signedIn={Boolean(viewer)} paid={Boolean(viewer?.plan.paid)} autoUnlock={sp.unlock === "1"} />
        </div>
      </main>
    </>
  );
}
