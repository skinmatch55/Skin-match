import type { Tier } from "./plans";

export interface PricedPlan {
  id: number;
  tier: Tier;
  name: string;
  currency: string;
  month: { cents: number; perDay: string };
  year: { cents: number; perDay: string } | null;
}

export function perDayLabel(v: number | string | undefined, cents: number, days: number) {
  const n = typeof v === "number" ? v : v ? parseFloat(String(v).replace(/[^0-9.]/g, "")) : NaN;
  const val = Number.isFinite(n) && n > 0 ? n : cents / 100 / days;
  return `$${val.toFixed(2)}`;
}
