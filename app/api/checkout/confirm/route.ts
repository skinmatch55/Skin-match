import { z } from "zod";
import { db } from "@/lib/db";
import { fail, json } from "@/lib/http";
import { cancelPlan, confirmPayment, forgetPlan, getPlan, track } from "@/lib/kwop";
import { tierFromPlan } from "@/lib/plans";
import { getUser } from "@/lib/session";
import { seedShelfFromLatestCheck } from "@/lib/shelf";

const Body = z.object({ ref: z.string().min(4).max(200), upgrade: z.boolean().optional() });

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return fail("unauthorized", 401);
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  try {
    const { data } = await confirmPayment(body.ref);
    forgetPlan(user.email);
    const plan = await getPlan(user.email, { fresh: true, userId: user.id });
    const paid = Boolean(plan.paid || data?.paid);
    if (!paid) return json({ paid: false });
    const [prev] = await db()`select (plan_cache->>'paid')::boolean as was, period_start from public.profiles where id = ${user.id}`;
    if (!prev?.period_start || body.upgrade) {
      await db()`update public.profiles set period_start = now() where id = ${user.id}`;
    }
    if (body.upgrade) {
      // the old plan stops at the end of its period: never two plans billed
      cancelPlan(user.email, body.ref).catch((e) => console.error("[upgrade cancel]", e.message));
    }
    await seedShelfFromLatestCheck(user.id);
    track("aha", user.email);
    return json({ paid: true, plan: plan.plan, tier: tierFromPlan(plan.plan) ?? "basic" });
  } catch (e) {
    console.error("[confirm]", (e as Error).message);
    return fail("confirm_failed", 502);
  }
}
