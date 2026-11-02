import { z } from "zod";
import { asUser } from "@/lib/db";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";

const Body = z.object({ skin_type: z.enum(["oily", "dry", "combination", "normal", "sensitive"]) });

export async function PATCH(req: Request) {
  const g = await apiViewer();
  if (g.error) return g.error;
  let b: z.infer<typeof Body>;
  try {
    b = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  await asUser(g.v.user.id, (tx) => tx`update public.profiles set skin_type = ${b.skin_type}, updated_at = now() where id = ${g.v.user.id}`);
  return json({ ok: true });
}
