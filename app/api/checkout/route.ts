import { z } from "zod";
import { fail, json } from "@/lib/http";
import { createCheckout } from "@/lib/kwop";
import { PLAN_IDS } from "@/lib/plans";
import { getUser } from "@/lib/session";

const Body = z.object({ plan: z.number().int(), period: z.enum(["month", "year"]) });

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return fail("unauthorized", 401);
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  if (!Object.values(PLAN_IDS).includes(body.plan)) return fail("unknown_plan");
  try {
    const { status, data } = await createCheckout(body.plan, body.period, user.email);
    if (status === 409) return fail("payments_off", 409);
    if (status >= 400 || !data?.ref) {
      console.error("[checkout]", status, data);
      return fail("checkout_failed", 502);
    }
    return json({ embed: data.embed ?? null, ref: data.ref, fallback_url: data.fallback_url });
  } catch (e) {
    console.error("[checkout]", (e as Error).message);
    return fail("checkout_failed", 502);
  }
}
