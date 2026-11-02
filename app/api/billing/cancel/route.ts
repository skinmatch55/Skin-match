import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { cancelPlan, forgetPlan } from "@/lib/kwop";

export async function POST() {
  const g = await apiViewer();
  if (g.error) return g.error;
  try {
    const { status, data } = await cancelPlan(g.v.user.email);
    forgetPlan(g.v.user.email);
    if (status >= 400) return fail("cancel_failed", 502, { message: data?.message });
    return json({ message: data?.message || "Your subscription is canceled. You keep access until the end of this period.", manage_url: data?.manage_url ?? null });
  } catch (e) {
    console.error("[cancel]", (e as Error).message);
    return fail("cancel_failed", 502);
  }
}
