import { z } from "zod";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { getUser } from "@/lib/session";

const Body = z.object({ type: z.enum(["paywall_view", "feature_used", "aha"]), detail: z.string().max(60).optional() });

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const user = await getUser();
  track(body.type, user?.email ?? null, body.detail);
  return json({ ok: true });
}
