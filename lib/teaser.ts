import type { RoutineResult } from "./engine/types";

export interface Teaser {
  skinType: RoutineResult["skinType"];
  products: { id: string; brand: string; name: string; category: string; actives: string[] }[];
  conflictsCount: number;
  severeCount: number;
  firstConflict: { title: string; aName: string; bName: string; insight: string; severity: string } | null;
  firstGood: { title: string; insight: string } | null;
  amCount: number;
  pmCount: number;
  pairsChecked: number;
  notesCount: number;
  alternating: boolean;
}

/** What a visitor without a plan may see. The rest of the result never leaves the server. */
export function toTeaser(r: RoutineResult): Teaser {
  const c = r.conflicts[0];
  return {
    skinType: r.skinType,
    products: r.products.map((p) => ({ id: p.id, brand: p.brand, name: p.name, category: p.category, actives: p.actives })),
    conflictsCount: r.conflicts.length,
    severeCount: r.conflicts.filter((x) => x.severity !== "caution").length,
    firstConflict: c ? { title: c.title, aName: c.aName, bName: c.bName, insight: c.insight, severity: c.severity } : null,
    firstGood: r.goodPairs[0] ? { title: r.goodPairs[0].title, insight: r.goodPairs[0].insight } : null,
    amCount: r.am.length,
    pmCount: r.pm.length,
    pairsChecked: r.pairsChecked,
    notesCount: r.notes.length,
    alternating: Boolean(r.nightPlan),
  };
}
