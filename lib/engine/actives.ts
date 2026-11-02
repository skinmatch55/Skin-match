import type { ActiveKey, Category } from "./types";

export const ACTIVES: Record<ActiveKey, { label: string; short: string; family: string }> = {
  retinol: { label: "Retinol", short: "Retinol", family: "retinoid" },
  retinal: { label: "Retinal (retinaldehyde)", short: "Retinal", family: "retinoid" },
  tretinoin: { label: "Tretinoin", short: "Tretinoin", family: "retinoid" },
  adapalene: { label: "Adapalene", short: "Adapalene", family: "retinoid" },
  aha: { label: "AHA (glycolic, lactic, mandelic)", short: "AHA", family: "acid" },
  bha: { label: "BHA (salicylic acid)", short: "BHA", family: "acid" },
  pha: { label: "PHA (gluconolactone)", short: "PHA", family: "acid" },
  vitc: { label: "Vitamin C (L-ascorbic acid)", short: "Vitamin C", family: "vitc" },
  vitc_deriv: { label: "Vitamin C derivative", short: "Vitamin C (gentle)", family: "vitc_deriv" },
  benzoyl_peroxide: { label: "Benzoyl peroxide", short: "Benzoyl peroxide", family: "bp" },
  niacinamide: { label: "Niacinamide", short: "Niacinamide", family: "niacinamide" },
  azelaic: { label: "Azelaic acid", short: "Azelaic acid", family: "azelaic" },
  copper_peptides: { label: "Copper peptides", short: "Copper peptides", family: "copper" },
  peptides: { label: "Peptides", short: "Peptides", family: "peptides" },
  hyaluronic: { label: "Hyaluronic acid", short: "Hyaluronic acid", family: "hydrator" },
  ceramides: { label: "Ceramides", short: "Ceramides", family: "barrier" },
  spf: { label: "Sunscreen (SPF)", short: "SPF", family: "spf" },
  tranexamic: { label: "Tranexamic acid", short: "Tranexamic acid", family: "brightener" },
  alpha_arbutin: { label: "Alpha arbutin", short: "Alpha arbutin", family: "brightener" },
  sulfur: { label: "Sulfur", short: "Sulfur", family: "sulfur" },
  centella: { label: "Centella (cica)", short: "Cica", family: "soother" },
  zinc: { label: "Zinc", short: "Zinc", family: "soother" },
  squalane: { label: "Squalane", short: "Squalane", family: "barrier" },
  bakuchiol: { label: "Bakuchiol", short: "Bakuchiol", family: "soother" },
  panthenol: { label: "Panthenol (B5)", short: "Panthenol", family: "soother" },
  caffeine: { label: "Caffeine", short: "Caffeine", family: "soother" },
};

export const ACTIVE_KEYS = Object.keys(ACTIVES) as ActiveKey[];

export const CATEGORIES: Record<Category, { label: string; role: string; order: number }> = {
  oil_cleanser: { label: "Oil cleanser / balm", role: "First cleanse", order: 0 },
  cleanser: { label: "Cleanser", role: "Cleanse", order: 1 },
  toner: { label: "Toner / essence", role: "Prep", order: 2 },
  exfoliant: { label: "Exfoliant", role: "Exfoliate", order: 3 },
  treatment: { label: "Treatment", role: "Treat", order: 4 },
  serum: { label: "Serum", role: "Treat", order: 5 },
  spot: { label: "Spot treatment", role: "Spot treat", order: 6 },
  eye: { label: "Eye cream", role: "Eyes", order: 7 },
  moisturizer: { label: "Moisturizer", role: "Moisturize", order: 8 },
  oil: { label: "Face oil", role: "Seal", order: 9 },
  sunscreen: { label: "Sunscreen", role: "Protect", order: 10 },
  mask: { label: "Mask", role: "Weekly mask", order: 11 },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export const RETINOIDS: ActiveKey[] = ["retinol", "retinal", "tretinoin", "adapalene"];
export const ACIDS: ActiveKey[] = ["aha", "bha", "pha"];

export function isRetinoid(a: ActiveKey) {
  return RETINOIDS.includes(a);
}
export function isAcid(a: ActiveKey) {
  return ACIDS.includes(a);
}
