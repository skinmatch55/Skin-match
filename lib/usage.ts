import "server-only";
import { db } from "./db";
import { QUOTAS, type Tier } from "./plans";

export type UsageKind = "check" | "scan" | "lookup";
const DAY = 86_400_000;

/** Start of the current 30-day billing window, anchored on the first payment. */
export async function periodStart(userId: string): Promise<Date> {
  const [row] = await db()`select period_start, created_at from public.profiles where id = ${userId}`;
  const anchor = new Date(row?.period_start ?? row?.created_at ?? Date.now());
  const n = Math.max(0, Math.floor((Date.now() - anchor.getTime()) / (30 * DAY)));
  return new Date(anchor.getTime() + n * 30 * DAY);
}

export async function usageCounts(userId: string) {
  const since = await periodStart(userId);
  const rows = await db()`
    select kind, count(*)::int as n from public.usage_events
    where user_id = ${userId} and created_at >= ${since} group by kind`;
  const out = { check: 0, scan: 0, lookup: 0, since, resets: new Date(since.getTime() + 30 * DAY) };
  for (const r of rows) out[r.kind as UsageKind] = r.n;
  return out;
}

export function limitFor(tier: Tier, kind: UsageKind) {
  const q = QUOTAS[tier];
  if (kind === "check") return q.checks;
  return q.scans; // scans and AI lookups share the label-scan quota
}

/** Counts one use if there's room. Returns false when the quota is used up. */
export async function consume(userId: string, tier: Tier, kind: UsageKind): Promise<{ ok: boolean; used: number; limit: number }> {
  const limit = limitFor(tier, kind);
  const c = await usageCounts(userId);
  const used = kind === "check" ? c.check : c.scan + c.lookup;
  if (used >= limit) return { ok: false, used, limit };
  await db()`insert into public.usage_events (user_id, kind) values (${userId}, ${kind})`;
  return { ok: true, used: used + 1, limit };
}
