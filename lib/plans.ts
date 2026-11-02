// Plan tiers and quotas. Prices always come from Kwop (GET KWOP_API); these are the product limits.
export type Tier = "basic" | "pro" | "plus";

export const PLAN_IDS: Record<Tier, number> = { basic: 1139, pro: 1140, plus: 1141 };

export interface Quota {
  checks: number; // routine checks per month
  shelf: number; // products on the shelf
  scans: number; // label photo scans per month (0 = no scanner)
  diary: boolean;
  history: number; // saved checks kept visible
}

export const QUOTAS: Record<Tier, Quota> = {
  basic: { checks: 15, shelf: 12, scans: 0, diary: false, history: 5 },
  pro: { checks: 60, shelf: 40, scans: 30, diary: true, history: 10_000 },
  plus: { checks: 300, shelf: 120, scans: 150, diary: true, history: 10_000 },
};

export const TIER_ORDER: Tier[] = ["basic", "pro", "plus"];

export const PLAN_COPY: Record<Tier, { name: string; tag: string; unlock: string[]; adds: string[] }> = {
  basic: {
    name: "Basic",
    tag: "For a simple 3-step routine",
    unlock: [
      "Your full morning and night routine, in order",
      "Every conflict on your shelf, with the fix",
      "15 routine checks a month",
      "Up to 12 products on your shelf",
      "Your last 5 checks saved",
    ],
    adds: [],
  },
  pro: {
    name: "Pro",
    tag: "For a full shelf, done right",
    unlock: [
      "Your full morning and night routine, in order",
      "Every conflict on your shelf, with the fix",
      "Add products with a photo of the label: 30 scans a month",
      "Skin diary: weekly check-ins and week-over-week trends",
      "60 routine checks a month, up to 40 products",
      "Your whole history saved",
    ],
    adds: [
      "Add products with a photo: 30 label scans a month",
      "Skin diary with week-over-week trends",
      "60 checks a month and up to 40 products",
    ],
  },
  plus: {
    name: "Plus",
    tag: "For skincare lovers and the family shelf",
    unlock: [
      "Everything in Pro",
      "5× more: 300 routine checks and 150 label scans a month",
      "Up to 120 products on your shelf",
      "Skin diary trends over 12 months",
      "Priority support (answer within 24 hours)",
    ],
    adds: [
      "5× more: 300 checks and 150 label scans a month",
      "Up to 120 products: room for the whole family shelf",
      "Priority support within 24 hours",
    ],
  },
};

export function tierFromPlan(plan: { id?: number | string; name?: string } | null | undefined): Tier | null {
  if (!plan) return null;
  const id = Number(plan.id);
  if (id === PLAN_IDS.basic) return "basic";
  if (id === PLAN_IDS.pro) return "pro";
  if (id === PLAN_IDS.plus) return "plus";
  const n = (plan.name || "").toLowerCase();
  if (n.includes("plus")) return "plus";
  if (n.includes("pro")) return "pro";
  if (n.includes("basic")) return "basic";
  return null;
}

export function nextTier(t: Tier | null): Tier | null {
  if (!t) return "pro";
  const i = TIER_ORDER.indexOf(t);
  return TIER_ORDER[i + 1] ?? null;
}
