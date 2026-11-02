import { z } from "zod";
import { asUser } from "@/lib/db";
import { analyze } from "@/lib/engine";
import { catalogById } from "@/lib/engine/catalog";
import type { Product } from "@/lib/engine/types";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { rowToProduct, type ShelfRow } from "@/lib/shelf";

const Ref = z.union([z.object({ shelfId: z.string().uuid() }), z.object({ catalogId: z.string().max(80) })]);
const Body = z.object({ a: Ref, b: Ref });

/** Conflict checker: "Can I use these two together?" */
export async function POST(req: Request) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  let b: z.infer<typeof Body>;
  try {
    b = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const resolve = async (r: z.infer<typeof Ref>): Promise<Product | null> => {
    if ("catalogId" in r) return catalogById(r.catalogId);
    const row = await asUser(g.v.user.id, async (tx) => (await tx`select * from public.shelf_products where id = ${r.shelfId}`)[0]);
    return row ? rowToProduct(row as unknown as ShelfRow) : null;
  };
  const [pa, pb] = await Promise.all([resolve(b.a), resolve(b.b)]);
  if (!pa || !pb) return fail("not_found", 404);
  if (pa.id === pb.id) return fail("same_product");
  const r = analyze([{ ...pa, when: undefined }, { ...pb, when: undefined }], "normal");
  track("feature_used", g.v.user.email, "conflict_checker");
  return json({
    a: pa.name,
    b: pb.name,
    conflict: r.conflicts[0] ?? null,
    good: r.goodPairs[0] ?? null,
  });
}
