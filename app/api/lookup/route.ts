import { z } from "zod";
import { aiEnabled, lookupProduct } from "@/lib/ai";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { consume } from "@/lib/usage";

const Body = z.object({ text: z.string().min(2).max(120) });

/** A typed product that isn't in the catalog → identified by AI (counts against label scans). Pro and Plus. */
export async function POST(req: Request) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  if (g.v.tier === "basic") return fail("upgrade", 402);
  if (!aiEnabled()) return fail("unavailable", 503);
  let b: z.infer<typeof Body>;
  try {
    b = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const q = await consume(g.v.user.id, g.v.tier!, "lookup");
  if (!q.ok) return fail("quota", 402, { limit: q.limit });
  try {
    const p = await lookupProduct(b.text);
    return p ? json({ product: p }) : fail("not_found", 404);
  } catch (e) {
    console.error("[lookup]", (e as Error).message);
    return fail("ai_failed", 502);
  }
}
