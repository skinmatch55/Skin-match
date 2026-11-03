import { z } from "zod";
import { aiEnabled, lookupProduct, readLabels } from "@/lib/ai";
import { db } from "@/lib/db";
import { analyze } from "@/lib/engine";
import { catalogById, matchCatalog, searchCatalog } from "@/lib/engine/catalog";
import type { Product } from "@/lib/engine/types";
import { fail, ipHash, json } from "@/lib/http";
import { track } from "@/lib/kwop";
import { getViewer } from "@/lib/session";
import { toTeaser } from "@/lib/teaser";
import { QUOTAS } from "@/lib/plans";
import { addToShelf } from "@/lib/shelf";
import { consume } from "@/lib/usage";

export const maxDuration = 60;

const Body = z.object({
  deviceId: z.string().min(8).max(64).regex(/^[a-zA-Z0-9-_]+$/),
  skinType: z.enum(["oily", "dry", "combination", "normal", "sensitive"]),
  items: z
    .array(z.union([z.object({ catalogId: z.string().max(80) }), z.object({ text: z.string().min(2).max(120) })]))
    .max(30)
    .default([]),
  photo: z
    .object({ data: z.string().max(7_000_000), mime: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]) })
    .optional(),
  thumb: z.string().max(80_000).startsWith("data:image/").optional(),
});

const ANON_PER_DAY = 3;

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  if (!body.items.length && !body.photo) return fail("empty");
  if (body.photo && !aiEnabled()) return fail("photo_unavailable", 503);

  const viewer = await getViewer();
  const paid = Boolean(viewer?.plan.paid && viewer.tier);
  const sql = db();

  // Free tries are limited on the server: 3 a day per device and per IP.
  const ip = await ipHash();
  if (!paid) {
    const [row] = await sql`
      select count(*) filter (where device_id = ${body.deviceId})::int as d,
             count(*) filter (where ip_hash = ${ip})::int as i
      from public.anon_tries where created_at > now() - interval '1 day'`;
    if (row.d >= ANON_PER_DAY || row.i >= ANON_PER_DAY * 2) return fail("limit", 429);
  } else {
    const q = await consume(viewer!.user.id, viewer!.tier!, "check");
    if (!q.ok) return fail("quota", 402, { kind: "check", limit: q.limit });
    if (body.photo) {
      if (viewer!.tier === "basic") return fail("upgrade", 402, { kind: "scan" });
      const s = await consume(viewer!.user.id, viewer!.tier!, "scan");
      if (!s.ok) return fail("quota", 402, { kind: "scan", limit: s.limit });
    }
  }

  // Collect products
  const products: Product[] = [];
  const unknown: string[] = [];
  for (const it of body.items) {
    if ("catalogId" in it) {
      const p = catalogById(it.catalogId);
      if (p) products.push(p);
    } else {
      // typed names: our catalog first (instant), the AI only for products we don't know
      const text = it.text.trim();
      const hit = matchCatalog("", text) ?? matchCatalog(text.split(" ")[0], text) ?? searchCatalog(text, 1)[0] ?? null;
      if (hit && !products.some((x) => x.id === hit.id)) products.push(hit);
      else if (!hit) unknown.push(text);
    }
  }
  try {
    // photo and typed look-ups run side by side
    const [fromPhoto, typed] = await Promise.all([
      body.photo ? readLabels(body.photo.data, body.photo.mime) : Promise.resolve([] as Product[]),
      unknown.length && aiEnabled()
        ? Promise.all(unknown.slice(0, 6).map((t) => lookupProduct(t).catch(() => null)))
        : Promise.resolve([] as (Product | null)[]),
    ]);
    for (const p of [...fromPhoto, ...typed]) if (p && !products.some((x) => x.id === p.id)) products.push(p);
  } catch (e) {
    console.error("[try] ai", (e as Error).message);
    return fail("ai_failed", 502);
  }
  if (!products.length) return fail(body.photo ? "no_products_found" : "empty", 422);

  const result = analyze(products, body.skinType);
  const [check] = await sql`
    insert into public.checks (user_id, device_id, skin_type, products, result, photo_thumb, source)
    values (${viewer?.user.id ?? null}, ${body.deviceId}, ${body.skinType}, ${sql.json(products as never)},
            ${sql.json(result as never)}, ${body.thumb ?? null}, ${body.photo ? "photo" : "typed"})
    returning id`;
  if (!paid) await sql`insert into public.anon_tries (device_id, ip_hash) values (${body.deviceId}, ${ip})`;
  if (paid) await addToShelf(viewer!.user.id, products, QUOTAS[viewer!.tier!].shelf);
  if (viewer) {
    await sql`update public.profiles set skin_type = ${body.skinType} where id = ${viewer.user.id}`;
    track("onboarding_done", viewer.user.email);
  }

  return json({ id: check.id, paid, teaser: toTeaser(result), full: paid ? result : null });
}
