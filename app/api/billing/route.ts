import { apiViewer } from "@/lib/guard";
import { json } from "@/lib/http";
import { QUOTAS } from "@/lib/plans";
import { usageCounts } from "@/lib/usage";

export async function GET() {
  const g = await apiViewer();
  if (g.error) return g.error;
  const { v } = g;
  const usage = v.tier ? await usageCounts(v.user.id) : null;
  return json({
    paid: v.plan.paid,
    tier: v.tier,
    plan: v.plan.plan,
    status: v.plan.status,
    until: v.plan.until,
    quota: v.tier ? QUOTAS[v.tier] : null,
    usage,
  });
}
