import { json } from "@/lib/http";
import { getKwop } from "@/lib/kwop";
import { tierFromPlan } from "@/lib/plans";
import { perDayLabel, type PricedPlan } from "@/lib/pricing";

export async function GET() {
  const app = await getKwop();
  const plans: PricedPlan[] = app.plans
    .map((p) => {
      const tier = tierFromPlan(p);
      if (!tier) return null;
      return {
        id: p.id,
        tier,
        name: p.name,
        currency: (p.currency || "usd").toUpperCase(),
        month: { cents: p.price_cents, perDay: perDayLabel(p.per_day, p.price_cents, 30) },
        year: p.yearly ? { cents: p.yearly.price_cents, perDay: perDayLabel(p.yearly.per_day, p.yearly.price_cents, 365) } : null,
      } satisfies PricedPlan;
    })
    .filter(Boolean) as PricedPlan[];
  return json({ plans, checkout: app.checkout });
}
