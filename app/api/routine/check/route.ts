import { db } from "@/lib/db";
import { analyze } from "@/lib/engine";
import type { SkinType } from "@/lib/engine/types";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { loadShelf, rowToProduct } from "@/lib/shelf";
import { consume } from "@/lib/usage";

/** Re-check the routine from the current shelf. Counts 1 routine check. */
export async function POST() {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  const { v } = g;
  const shelf = await loadShelf(v.user.id);
  if (!shelf.length) return fail("empty_shelf", 422);
  const q = await consume(v.user.id, v.tier!, "check");
  if (!q.ok) return fail("quota", 402, { kind: "check", limit: q.limit });
  const [prof] = await db()`select skin_type from public.profiles where id = ${v.user.id}`;
  const skin = (prof?.skin_type || "normal") as SkinType;
  const products = shelf.map(rowToProduct);
  const result = analyze(products, skin);
  const sql = db();
  const [row] = await sql`insert into public.checks (user_id, skin_type, products, result, source)
    values (${v.user.id}, ${skin}, ${sql.json(products as never)}, ${sql.json(result as never)}, 'shelf') returning id`;
  track("feature_used", v.user.email, "routine_builder");
  return json({ id: row.id, used: q.used, limit: q.limit });
}
