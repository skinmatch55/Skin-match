import "server-only";
import { redirect } from "next/navigation";
import { fail } from "./http";
import { getViewer, type Viewer } from "./session";

export async function requireViewer(next = "/routine"): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect(`/login?next=${encodeURIComponent(next)}`);
  return v;
}

/** API guard: signed in, and (optionally) on a paid plan. Always checked on the server with Kwop. */
export async function apiViewer(opts: { paid?: boolean } = {}): Promise<{ v: Viewer; error?: never } | { v?: never; error: Response }> {
  const v = await getViewer();
  if (!v) return { error: fail("unauthorized", 401) };
  if (opts.paid && !(v.plan.paid && v.tier)) return { error: fail("payment_required", 402) };
  return { v };
}

/** Paid pages: without a plan, back to their routine check (which leads to the paywall). */
export async function requirePaidPage(next: string): Promise<Viewer> {
  const v = await requireViewer(next);
  if (!v.plan.paid || !v.tier) redirect("/routine");
  return v;
}
