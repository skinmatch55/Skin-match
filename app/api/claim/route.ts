import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { getUser } from "@/lib/session";

const Body = z.object({ deviceId: z.string().min(8).max(64).regex(/^[a-zA-Z0-9-_]+$/).optional() });

/** After sign-up / log-in: attach this device's free checks to the account, save attribution, track signup once. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return fail("unauthorized", 401);
  let body: z.infer<typeof Body> = {};
  try {
    body = Body.parse(await req.json());
  } catch {}
  const sql = db();
  // the profile row normally comes from the auth trigger; make sure it exists
  await sql`insert into public.profiles (id, email) values (${user.id}, ${user.email}) on conflict (id) do update set email = excluded.email`;
  let claimed = 0;
  if (body.deviceId) {
    const r = await sql`update public.checks set user_id = ${user.id} where device_id = ${body.deviceId} and user_id is null`;
    claimed = r.count;
    await sql`
      update public.profiles p set skin_type = coalesce(p.skin_type, c.skin_type)
      from (select skin_type from public.checks where user_id = ${user.id} order by created_at desc limit 1) c
      where p.id = ${user.id}`;
  }
  const jar = await cookies();
  const plan = jar.get("sm_plan")?.value;
  let src: Record<string, string> = {};
  try {
    src = JSON.parse(jar.get("sm_src")?.value || "{}");
  } catch {}
  const [row] = await sql`
    update public.profiles set
      intended_plan = coalesce(intended_plan, ${plan ?? null}),
      source = case when source - '_signup' = '{}'::jsonb then source || ${sql.json(src)} else source end
    where id = ${user.id}
    returning (created_at > now() - interval '15 minutes') as fresh, coalesce(source->>'_signup', '') as tracked`;
  if (row?.fresh && !row.tracked) {
    await sql`update public.profiles set source = source || '{"_signup":"1"}'::jsonb where id = ${user.id}`;
    track("signup", user.email);
  }
  return json({ ok: true, claimed });
}
