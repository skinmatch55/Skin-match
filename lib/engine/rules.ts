import type { ActiveKey } from "./types";
import { ACIDS, RETINOIDS } from "./actives";

export interface PairRule {
  severity: "avoid" | "separate" | "caution" | "good";
  title: string;
  insight: string;
  fix: string;
}

type Matcher = (x: ActiveKey) => boolean;
const is = (...keys: ActiveKey[]): Matcher => (x) => keys.includes(x);
const retinoid = is(...RETINOIDS);
const retinoidNotAdapalene = is("retinol", "retinal", "tretinoin");
const acid = is(...ACIDS);
const strongAcid = is("aha", "bha");
const vitc = is("vitc");
const bp = is("benzoyl_peroxide");
const copper = is("copper_peptides");
const hydrator = is("hyaluronic", "ceramides", "squalane", "panthenol", "centella");

interface Def extends PairRule {
  x: Matcher;
  y: Matcher;
}

// Order matters: the first matching rule wins. Based on mainstream dermatologist guidance.
const DEFS: Def[] = [
  {
    x: retinoid,
    y: retinoid,
    severity: "avoid",
    title: "Two retinoids",
    insight: "Two retinoids double the irritation, not the results.",
    fix: "Keep one retinoid. Use the other only if your dermatologist told you to.",
  },
  {
    x: retinoidNotAdapalene,
    y: bp,
    severity: "avoid",
    title: "Retinoid × Benzoyl peroxide",
    insight: "Benzoyl peroxide breaks down retinol and tretinoin, so they cancel each other out.",
    fix: "Benzoyl peroxide in the morning, the retinoid at night.",
  },
  {
    x: retinoid,
    y: strongAcid,
    severity: "separate",
    title: "Retinoid × Exfoliating acid",
    insight: "Both speed up skin turnover. Together they can leave skin red, raw and flaky.",
    fix: "Use them on different nights.",
  },
  {
    x: retinoid,
    y: is("pha"),
    severity: "caution",
    title: "Retinoid × PHA",
    insight: "PHAs are gentle, but with a retinoid they can still sting on sensitive days.",
    fix: "Use them on different nights if you feel tingling.",
  },
  {
    x: retinoid,
    y: vitc,
    severity: "separate",
    title: "Retinoid × Vitamin C",
    insight: "Vitamin C works best at low pH in the morning; the retinoid works at night. Together they irritate more.",
    fix: "Vitamin C in the morning, the retinoid at night.",
  },
  {
    x: vitc,
    y: bp,
    severity: "avoid",
    title: "Vitamin C × Benzoyl peroxide",
    insight: "Benzoyl peroxide oxidizes vitamin C, so the vitamin C stops working.",
    fix: "Use them at different times of day.",
  },
  {
    x: vitc,
    y: strongAcid,
    severity: "caution",
    title: "Vitamin C × Exfoliating acid",
    insight: "Two low-pH products stacked can sting and irritate.",
    fix: "Vitamin C in the morning, acids at night.",
  },
  {
    x: copper,
    y: is("vitc", "aha", "bha"),
    severity: "separate",
    title: "Copper peptides × Acids",
    insight: "Acids (vitamin C included) can break down copper peptides, so you lose what you paid for.",
    fix: "Use copper peptides at a different time than acids and vitamin C.",
  },
  {
    x: copper,
    y: retinoid,
    severity: "caution",
    title: "Copper peptides × Retinoid",
    insight: "Fine for most people, but both are potent: sensitive skin may react.",
    fix: "If you feel irritation, put them on different nights.",
  },
  {
    x: acid,
    y: acid,
    severity: "caution",
    title: "Two exfoliants",
    insight: "Stacking exfoliants is the fastest way to over-exfoliate: tight, shiny, stinging skin.",
    fix: "One exfoliant per night, not both.",
  },
  {
    x: bp,
    y: strongAcid,
    severity: "caution",
    title: "Benzoyl peroxide × Exfoliating acid",
    insight: "Both are drying. Together they can leave skin tight and peeling.",
    fix: "Use them at different times of day.",
  },
  {
    x: bp,
    y: bp,
    severity: "caution",
    title: "Two benzoyl peroxides",
    insight: "Double benzoyl peroxide dries skin without clearing acne faster.",
    fix: "Keep one benzoyl peroxide product.",
  },
  // Good pairs
  {
    x: retinoid,
    y: is("niacinamide"),
    severity: "good",
    title: "Retinoid + Niacinamide",
    insight: "Niacinamide calms the redness retinoids can cause.",
    fix: "",
  },
  {
    x: is("vitc", "vitc_deriv"),
    y: is("spf"),
    severity: "good",
    title: "Vitamin C + Sunscreen",
    insight: "Vitamin C boosts your sunscreen's protection against sun damage.",
    fix: "",
  },
  {
    x: is("vitc"),
    y: is("niacinamide"),
    severity: "good",
    title: "Vitamin C + Niacinamide",
    insight: "Myth busted: modern formulas work fine together.",
    fix: "",
  },
  {
    x: is("adapalene"),
    y: bp,
    severity: "good",
    title: "Adapalene + Benzoyl peroxide",
    insight: "Adapalene stays stable with benzoyl peroxide: a proven acne duo.",
    fix: "",
  },
  {
    x: is(...RETINOIDS, "aha", "bha", "benzoyl_peroxide"),
    y: hydrator,
    severity: "good",
    title: "Active + Barrier care",
    insight: "Hydrators and ceramides cushion strong actives.",
    fix: "",
  },
  {
    x: is("azelaic"),
    y: is("niacinamide"),
    severity: "good",
    title: "Azelaic acid + Niacinamide",
    insight: "A gentle duo for redness and dark spots.",
    fix: "",
  },
];

export function pairRule(a: ActiveKey, b: ActiveKey): PairRule | null {
  for (const d of DEFS) {
    if ((d.x(a) && d.y(b)) || (d.x(b) && d.y(a))) {
      const { severity, title, insight, fix } = d;
      return { severity, title, insight, fix };
    }
  }
  return null;
}

export const SEVERITY_RANK = { avoid: 3, separate: 2, caution: 1, good: 0 } as const;
