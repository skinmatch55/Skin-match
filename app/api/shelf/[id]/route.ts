import { z } from "zod";
import { asUser } from "@/lib/db";
import { ACTIVE_KEYS, CATEGORY_KEYS } from "@/lib/engine/actives";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";

const Patch = z.object({
  brand: z.string().max(60).optional(),
  name: z.string().min(2).max(90).optional(),
  category: z.enum(CATEGORY_KEYS as [string, ...string[]]).optional(),
  actives: z.array(z.enum(ACTIVE_KEYS as [string, ...string[]])).max(12).optional(),
  when_used: z.enum(["auto", "am", "pm", "both"]).optional(),
  notes: z.string().max(300).optional(),
});
const uuid = /^[0-9a-f-]{36}$/;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  const { id } = await ctx.params;
  if (!uuid.test(id)) return fail("not_found", 404);
  let b: z.infer<typeof Patch>;
  try {
    b = Patch.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const row = await asUser(g.v.user.id, async (tx) => {
    const [r] = await tx`update public.shelf_products set
      brand = coalesce(${b.brand ?? null}, brand), name = coalesce(${b.name ?? null}, name),
      category = coalesce(${b.category ?? null}, category),
      actives = coalesce(${b.actives ? (b.actives as string[]) : null}::text[], actives),
      when_used = coalesce(${b.when_used ?? null}, when_used), notes = coalesce(${b.notes ?? null}, notes)
      where id = ${id} returning *`;
    return r;
  });
  if (!row) return fail("not_found", 404);
  return json({ item: row });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  const { id } = await ctx.params;
  if (!uuid.test(id)) return fail("not_found", 404);
  const n = await asUser(g.v.user.id, async (tx) => (await tx`delete from public.shelf_products where id = ${id}`).count);
  if (!n) return fail("not_found", 404);
  return json({ ok: true });
}
