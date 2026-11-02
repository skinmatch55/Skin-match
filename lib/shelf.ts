import "server-only";
import { asUser } from "./db";
import type { Product } from "./engine/types";

/** First unlock: the products from their latest check become their shelf (only if the shelf is empty). */
export async function seedShelfFromLatestCheck(userId: string) {
  await asUser(userId, async (tx) => {
    const [{ n }] = await tx`select count(*)::int as n from public.shelf_products`;
    if (n > 0) return;
    const [check] = await tx`select products from public.checks order by created_at desc limit 1`;
    if (!check) return;
    const products = (check.products as Product[]).slice(0, 40);
    for (const p of products) {
      await tx`insert into public.shelf_products (user_id, catalog_id, brand, name, category, actives)
        values (${userId}, ${p.catalogId ?? null}, ${p.brand}, ${p.name}, ${p.category}, ${p.actives as string[]})
        on conflict do nothing`;
    }
  });
}

export interface ShelfRow {
  id: string;
  catalog_id: string | null;
  brand: string;
  name: string;
  category: string;
  actives: string[];
  when_used: string;
  notes: string;
  created_at: Date;
}

export function rowToProduct(r: ShelfRow): Product {
  return {
    id: r.id,
    catalogId: r.catalog_id,
    brand: r.brand,
    name: r.name,
    category: r.category as Product["category"],
    actives: r.actives as Product["actives"],
    when: r.when_used as Product["when"],
  };
}

/** Content signature (ignores ids) to know if the shelf changed since a check. */
export function signature(products: Product[], skin: string | null | undefined) {
  const parts = products
    .map((p) => `${p.catalogId || p.name.toLowerCase()}|${p.category}|${[...p.actives].sort().join(",")}|${p.when || "auto"}`)
    .sort();
  return `${skin || ""}#${parts.join(";")}`;
}

export async function loadShelf(userId: string) {
  return asUser(userId, async (tx) => {
    const rows = (await tx`select * from public.shelf_products order by created_at`) as unknown as ShelfRow[];
    return rows;
  });
}

/** Paid users' tries also fill their shelf (no duplicates, within the plan's shelf size). */
export async function addToShelf(userId: string, products: Product[], max: number) {
  return asUser(userId, async (tx) => {
    const rows = (await tx`select catalog_id, lower(name) as name from public.shelf_products`) as unknown as { catalog_id: string | null; name: string }[];
    let count = rows.length;
    let added = 0;
    for (const p of products) {
      if (count >= max) break;
      if (rows.some((r) => (p.catalogId && r.catalog_id === p.catalogId) || r.name === p.name.toLowerCase())) continue;
      await tx`insert into public.shelf_products (user_id, catalog_id, brand, name, category, actives)
        values (${userId}, ${p.catalogId ?? null}, ${p.brand}, ${p.name}, ${p.category}, ${p.actives as string[]})
        on conflict do nothing`;
      count++;
      added++;
    }
    return added;
  });
}
