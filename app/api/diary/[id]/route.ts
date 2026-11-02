import { asUser } from "@/lib/db";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return fail("not_found", 404);
  const n = await asUser(g.v.user.id, async (tx) => (await tx`delete from public.diary_entries where id = ${id}`).count);
  return n ? json({ ok: true }) : fail("not_found", 404);
}
