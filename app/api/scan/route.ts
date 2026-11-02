import { z } from "zod";
import { aiEnabled, readLabels } from "@/lib/ai";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { consume } from "@/lib/usage";

export const maxDuration = 60;
const Body = z.object({ data: z.string().max(7_000_000), mime: z.enum(["image/jpeg", "image/png", "image/webp"]) });

/** Shelf scanner: a photo of labels → products to confirm. Photo is never stored. Pro and Plus. */
export async function POST(req: Request) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  if (g.v.tier === "basic") return fail("upgrade", 402);
  if (!aiEnabled()) return fail("photo_unavailable", 503);
  let b: z.infer<typeof Body>;
  try {
    b = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const q = await consume(g.v.user.id, g.v.tier!, "scan");
  if (!q.ok) return fail("quota", 402, { limit: q.limit });
  try {
    const products = await readLabels(b.data, b.mime);
    track("feature_used", g.v.user.email, "shelf_scanner");
    return json({ products, used: q.used, limit: q.limit });
  } catch (e) {
    console.error("[scan]", (e as Error).message);
    return fail("ai_failed", 502);
  }
}
