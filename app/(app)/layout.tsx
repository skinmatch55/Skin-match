import { AppShell } from "@/components/app/shell";
import { ClaimOnLoad } from "@/components/claim-on-load";
import { requireViewer } from "@/lib/guard";
import { PLAN_COPY } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const v = await requireViewer();
  return (
    <AppShell email={v.user.email} planName={v.tier ? PLAN_COPY[v.tier].name : null}>
      <ClaimOnLoad />
      {children}
    </AppShell>
  );
}
