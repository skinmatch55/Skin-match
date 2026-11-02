import { z } from "zod";
import { asUser } from "@/lib/db";
import { ACTIVE_KEYS, CATEGORY_KEYS } from "@/lib/engine/actives";
import { catalogById } from "@/lib/engine/catalog";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { QUOTAS } from "@/lib/plans";

const Body = z.union([
  z.object({ catalogId: z.string().max(80) }),
  z.object({
    brand: z.string().max(60).default(""),
    name: z.string().min(2).max(90),
    category: z.enum(CATEGORY_KEYS as [string, ...string[]]),
    actives: z.array(z.enum(ACTIVE_KEYS as [string, ...string[]])).max(12).default([]),
  }),
]);

export async function GET() {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  const rows = await asUser(g.v.user.id, (tx) => tx`select * from public.shelf_products order by created_at`);
  return json({ items: rows });
}

export async function POST(req: Request) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const p =
    "catalogId" in body
      ? catalogById(body.catalogId)
      : { catalogId: null, brand: body.brand.trim(), name: body.name.trim(), category: body.category, actives: [...new Set(body.actives)] };
  if (!p) return fail("not_found", 404);
  const limit = QUOTAS[g.v.tier!].shelf;
  const out = await asUser(g.v.user.id, async (tx) => {
    const [{ n }] = await tx`select count(*)::int as n from public.shelf_products`;
    if (n >= limit) return { error: "shelf_full" as const };
    const dup = p.catalogId
      ? await tx`select id from public.shelf_products where catalog_id = ${p.catalogId}`
      : await tx`select id from public.shelf_products where lower(name) = lower(${p.name}) and lower(brand) = lower(${p.brand})`;
    if (dup.length) return { error: "duplicate" as const };
    const [row] = await tx`insert into public.shelf_products (user_id, catalog_id, brand, name, category, actives)
      values (${g.v.user.id}, ${p.catalogId ?? null}, ${p.brand}, ${p.name}, ${p.category}, ${p.actives as string[]}) returning *`;
    return { row };
  });
  if ("error" in out) return fail(out.error!, out.error === "shelf_full" ? 402 : 409, { limit });
  track("feature_used", g.v.user.email, "add_product");
  return json({ item: out.row });
}
