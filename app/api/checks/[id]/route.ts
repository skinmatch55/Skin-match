import { db } from "@/lib/db";
import type { RoutineResult } from "@/lib/engine/types";
import { fail, json } from "@/lib/http";
import { getViewer } from "@/lib/session";
import { toTeaser } from "@/lib/teaser";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return fail("not_found", 404);
  const device = new URL(req.url).searchParams.get("device") || "";
  const viewer = await getViewer();
  const [row] = await db()`select id, user_id, device_id, result, photo_thumb, created_at from public.checks where id = ${id}`;
  if (!row) return fail("not_found", 404);
  const mine = viewer ? row.user_id === viewer.user.id : false;
  const anonMine = !row.user_id && device && row.device_id === device;
  if (!mine && !anonMine) return fail("not_found", 404);
  const result = row.result as RoutineResult;
  const paid = Boolean(mine && viewer?.plan.paid);
  return json({ id: row.id, paid, thumb: row.photo_thumb, createdAt: row.created_at, teaser: toTeaser(result), full: paid ? result : null });
}
