import { KwopFlow } from "@/components/kwop-flow";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <KwopFlow />
      <SiteHeader cta={false} />
      <main className="mx-auto max-w-[720px] px-4 py-12 md:py-20">
        <h1 className="text-[40px] font-semibold">{title}</h1>
        <p className="mt-2 text-[14px] text-muted">Last updated {updated}</p>
        <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink-2 [&_h2]:mt-8 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
