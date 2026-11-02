export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive";

export type Category =
  | "oil_cleanser"
  | "cleanser"
  | "toner"
  | "exfoliant"
  | "serum"
  | "treatment"
  | "eye"
  | "spot"
  | "moisturizer"
  | "oil"
  | "sunscreen"
  | "mask";

export type ActiveKey =
  | "retinol"
  | "retinal"
  | "tretinoin"
  | "adapalene"
  | "aha"
  | "bha"
  | "pha"
  | "vitc"
  | "vitc_deriv"
  | "benzoyl_peroxide"
  | "niacinamide"
  | "azelaic"
  | "copper_peptides"
  | "peptides"
  | "hyaluronic"
  | "ceramides"
  | "spf"
  | "tranexamic"
  | "alpha_arbutin"
  | "sulfur"
  | "centella"
  | "zinc"
  | "squalane"
  | "bakuchiol"
  | "panthenol"
  | "caffeine";

export type WhenUsed = "auto" | "am" | "pm" | "both";

export interface Product {
  /** stable id: catalog id, or a generated id for custom/scanned products */
  id: string;
  brand: string;
  name: string;
  category: Category;
  actives: ActiveKey[];
  when?: WhenUsed;
  catalogId?: string | null;
}

export type Severity = "avoid" | "separate" | "caution";

export interface Conflict {
  a: string; // product id
  b: string; // product id
  aName: string;
  bName: string;
  activeA: ActiveKey;
  activeB: ActiveKey;
  severity: Severity;
  title: string; // "Retinol × BHA"
  insight: string; // why
  fix: string; // what Skinmatch did / what to do
}

export interface GoodPair {
  a: string;
  b: string;
  aName: string;
  bName: string;
  title: string;
  insight: string;
}

export interface RoutineStep {
  productId: string;
  brand: string;
  name: string;
  category: Category;
  role: string; // "Cleanse", "Treat", "Protect"
  tip?: string; // "Wait 1 minute", "Pea-sized amount"
  nights?: "A" | "B"; // PM only: alternate nights
}

export interface RoutineResult {
  version: 1;
  skinType: SkinType;
  products: Product[];
  am: RoutineStep[];
  pm: RoutineStep[];
  /** when PM has alternating nights: labels for A and B */
  nightPlan: { a: string; b: string; aDays: string; bDays: string } | null;
  conflicts: Conflict[];
  goodPairs: GoodPair[];
  scoreBefore: number;
  scoreAfter: number;
  notes: string[]; // missing SPF, etc.
  pairsChecked: number;
}
