import { ACTIVES, CATEGORIES, isAcid, isRetinoid } from "./actives";
import { pairRule, SEVERITY_RANK } from "./rules";
import type {
  ActiveKey,
  Conflict,
  GoodPair,
  Product,
  RoutineResult,
  RoutineStep,
  SkinType,
} from "./types";

export * from "./types";

type Slot = "AM" | "PM" | "PMA" | "PMB" | "BOTH";
const SLOT_CHOICES: Slot[] = ["AM", "PM", "PMA", "PMB", "BOTH"];

const WASH_OFF = new Set(["cleanser", "oil_cleanser"]);

function label(p: Product) {
  return p.brand ? `${p.brand} ${p.name}` : p.name;
}
function shortName(p: Product) {
  return p.name.length > 42 ? p.name.slice(0, 40) + "…" : p.name;
}

/** Does this product carry an active that needs a time slot decision? */
function isStrong(p: Product) {
  if (WASH_OFF.has(p.category) || p.category === "sunscreen") return false;
  return p.actives.some(
    (a) =>
      isRetinoid(a) ||
      isAcid(a) ||
      a === "vitc" ||
      a === "benzoyl_peroxide" ||
      a === "copper_peptides",
  );
}

function slotCost(p: Product, s: Slot, skin: SkinType): number {
  if (p.when === "am" && s !== "AM") return 6;
  if (p.when === "pm" && !(s === "PM" || s === "PMA" || s === "PMB")) return 6;
  if (p.when === "both" && s !== "BOTH") return 6;
  let c = 0;
  const has = (k: (a: ActiveKey) => boolean) => p.actives.some(k);
  const inAM = s === "AM" || s === "BOTH";
  const inPM = s !== "AM";
  if (has(isRetinoid) && inAM) return 1000; // retinoids: night only
  if (p.category === "mask" && inAM) return 1000;
  if (has(isAcid)) {
    if (inAM) c += has((a) => a === "aha") ? 4 : 1.5;
    if (s === "BOTH") c += 3;
    if (skin === "sensitive" && s === "PM") c += 1; // nightly acids are a lot for sensitive skin
  }
  if (has((a) => a === "vitc")) {
    if (!inAM) c += 2;
    if (s === "BOTH") c += 1;
  }
  if (has((a) => a === "benzoyl_peroxide") && s === "BOTH") c += 1.2;
  if (has((a) => a === "copper_peptides") && inAM) c += 0.5;
  if (s === "PMA" || s === "PMB") c += 0.6; // alternating nights is a bit more to remember
  if (s === "PMB") c += 0.05; // prefer A for symmetry
  return c;
}

function overlap(s1: Slot, s2: Slot) {
  const am1 = s1 === "AM" || s1 === "BOTH";
  const am2 = s2 === "AM" || s2 === "BOTH";
  if (am1 && am2) return true;
  const n1 = s1 === "AM" ? [] : s1 === "PMA" ? ["A"] : s1 === "PMB" ? ["B"] : ["A", "B"];
  const n2 = s2 === "AM" ? [] : s2 === "PMA" ? ["A"] : s2 === "PMB" ? ["B"] : ["A", "B"];
  return n1.some((n) => n2.includes(n));
}

const CONFLICT_WEIGHT = { avoid: 100, separate: 50, caution: 8 } as const;

interface RawConflict {
  i: number;
  j: number;
  activeA: ActiveKey;
  activeB: ActiveKey;
  severity: "avoid" | "separate" | "caution";
  title: string;
  insight: string;
  fix: string;
}

function worstRule(a: Product, b: Product) {
  type Hit = { rule: NonNullable<ReturnType<typeof pairRule>>; x: ActiveKey; y: ActiveKey };
  let best: Hit | null = null;
  let good: Hit | null = null;
  for (const x of a.actives)
    for (const y of b.actives) {
      const r = pairRule(x, y);
      if (!r) continue;
      if (r.severity === "good") {
        if (!good) good = { rule: r, x, y };
        continue;
      }
      if (!best || SEVERITY_RANK[r.severity] > SEVERITY_RANK[best.rule.severity]) best = { rule: r, x, y };
    }
  return { bad: best, good };
}

function downgrade(sev: "avoid" | "separate" | "caution"): "separate" | "caution" | null {
  if (sev === "avoid") return "caution";
  if (sev === "separate") return "caution";
  return null;
}

export function analyze(input: Product[], skinType: SkinType): RoutineResult {
  // de-duplicate by id, cap at 120
  const seen = new Set<string>();
  const products = input.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 120);
  const n = products.length;

  // 1) pairs
  const raw: RawConflict[] = [];
  const goods: GoodPair[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const a = products[i];
      const b = products[j];
      const { bad, good } = worstRule(a, b);
      if (bad) {
        let sev: RawConflict["severity"] | null = bad.rule.severity as RawConflict["severity"];
        // wash-off products only touch skin for a minute
        if (WASH_OFF.has(a.category) || WASH_OFF.has(b.category)) sev = downgrade(sev);
        // weekly masks vs. nightly actives stay real
        if (sev)
          raw.push({
            i,
            j,
            activeA: bad.x,
            activeB: bad.y,
            severity: sev,
            title: bad.rule.title,
            insight: bad.rule.insight,
            fix: bad.rule.fix,
          });
      } else if (good && goods.length < 6 && !goods.some((g) => g.title === good.rule.title)) {
        goods.push({
          a: a.id,
          b: b.id,
          aName: shortName(a),
          bName: shortName(b),
          title: good.rule.title,
          insight: good.rule.insight,
        });
      }
    }

  // 2) slots: strong products are solved together, the rest follow simple rules
  const strongIdx = products.map((p, i) => (isStrong(p) ? i : -1)).filter((i) => i >= 0);
  const solveIdx = strongIdx.slice(0, 8);
  const slots: Slot[] = products.map(() => "BOTH");
  for (const i of strongIdx.slice(8)) slots[i] = "PM";

  const conflictBetween = new Map<string, RawConflict>();
  for (const c of raw) conflictBetween.set(`${c.i}-${c.j}`, c);

  let bestCost = Infinity;
  let best: Slot[] = [];
  const cur: Slot[] = new Array(solveIdx.length);
  const rec = (k: number, cost: number) => {
    if (cost >= bestCost) return;
    if (k === solveIdx.length) {
      bestCost = cost;
      best = cur.slice();
      return;
    }
    const pi = solveIdx[k];
    for (const s of SLOT_CHOICES) {
      let c = slotCost(products[pi], s, skinType);
      for (let m = 0; m < k; m++) {
        const pj = solveIdx[m];
        const key = pi < pj ? `${pi}-${pj}` : `${pj}-${pi}`;
        const cf = conflictBetween.get(key);
        if (cf && overlap(s, cur[m])) c += CONFLICT_WEIGHT[cf.severity];
      }
      cur[k] = s;
      rec(k + 1, cost + c);
    }
  };
  rec(0, 0);
  solveIdx.forEach((pi, k) => (slots[pi] = best[k]));
  // keep the retinoid on "night A" (the night you use most)
  const retOnB = products.some((p, i) => slots[i] === "PMB" && p.actives.some(isRetinoid));
  const retOnA = products.some((p, i) => slots[i] === "PMA" && p.actives.some(isRetinoid));
  if (retOnB && !retOnA) for (let i = 0; i < n; i++) slots[i] = slots[i] === "PMA" ? "PMB" : slots[i] === "PMB" ? "PMA" : slots[i];

  // Non-strong products
  const hasRetinoid = products.some((p) => p.actives.some(isRetinoid) && !WASH_OFF.has(p.category));
  const cleansers = products.map((p, i) => ({ p, i })).filter((x) => x.p.category === "cleanser");
  const activeCleanser = (p: Product) => p.actives.some((a) => a === "benzoyl_peroxide" || a === "bha");
  if (cleansers.length === 1) {
    const { p, i } = cleansers[0];
    // a benzoyl peroxide wash with a retinoid: morning only
    slots[i] = hasRetinoid && p.actives.includes("benzoyl_peroxide") ? "AM" : "BOTH";
  } else if (cleansers.length > 1) {
    const act = cleansers.find((c) => activeCleanser(c.p));
    const gentle = cleansers.find((c) => !activeCleanser(c.p));
    for (const c of cleansers) slots[c.i] = "PM";
    if (act && gentle) {
      slots[act.i] = "AM";
      slots[gentle.i] = "PM";
    } else {
      slots[cleansers[0].i] = "AM";
      slots[cleansers[1].i] = "PM";
    }
  }
  const moist = products
    .map((p, i) => ({ p, i }))
    .filter((x) => x.p.category === "moisturizer" && !isStrong(x.p));
  const heavy = (p: Product) => /ointment|baume|balm|skin food|aquaphor|vaseline|night|pm /i.test(`${p.name} `);
  const light = (p: Product) => /gel|water|lotion|aqua|am /i.test(`${p.name} `);
  if (moist.length > 1) {
    const am = moist.find((m) => light(m.p) && !heavy(m.p)) ?? moist.find((m) => !heavy(m.p)) ?? moist[0];
    for (const m of moist) slots[m.i] = m === am ? "AM" : "PM";
  } else if (moist.length === 1 && heavy(moist[0].p) && /ointment|aquaphor|vaseline/i.test(moist[0].p.name)) {
    slots[moist[0].i] = "PM";
  }
  let sunscreenSeen = false;
  const extras: string[] = [];
  products.forEach((p, i) => {
    if (isStrong(p) || p.category === "cleanser" || (p.category === "moisturizer" && moist.length > 1)) return;
    if (p.category === "sunscreen") {
      slots[i] = "AM";
      if (sunscreenSeen) extras.push(label(p));
      sunscreenSeen = true;
    } else if (p.category === "oil_cleanser" || p.category === "oil") slots[i] = "PM";
    else if (p.category === "mask") slots[i] = "PMB";
    else if (p.when === "am") slots[i] = "AM";
    else if (p.when === "pm") slots[i] = "PM";
  });

  // 3) build the steps
  const usesB = slots.some((s) => s === "PMB");
  const usesA = slots.some((s) => s === "PMA");
  // If only one side of the alternation exists, the other night is a "rest" night.
  const tip = (p: Product, when: "am" | "pm"): string | undefined => {
    const a = p.actives;
    if (p.category === "oil_cleanser") return "On dry skin, then rinse.";
    if (p.category === "mask") return "Once a week, then rinse.";
    if (a.some(isRetinoid))
      return skinType === "sensitive" || skinType === "dry"
        ? "Pea-sized amount. Start 2–3 nights a week."
        : "Pea-sized amount for the whole face.";
    if (a.some(isAcid) && p.category !== "cleanser") return "On dry skin. Wait 1–2 minutes.";
    if (a.includes("vitc")) return "Wait 1 minute before the next step.";
    if (a.includes("benzoyl_peroxide") && p.category !== "cleanser") return "Thin layer. It can bleach towels and pillowcases.";
    if (p.category === "sunscreen") return "Two finger lengths. Reapply every 2 hours outside.";
    if (p.category === "spot") return "Only on spots.";
    if (p.category === "oil") return "Last step: seals everything in.";
    if (p.category === "moisturizer" && /ointment|aquaphor|vaseline/i.test(p.name)) return "Thin layer, last step.";
    if (p.category === "serum" && a.includes("hyaluronic")) return "On slightly damp skin.";
    if (when === "am" && p.category === "moisturizer") return undefined;
    return undefined;
  };

  // within a step type, apply thinnest-first: vitamin C, acids, then water serums, then emulsions
  const weight = (p: Product) => {
    const base = CATEGORIES[p.category].order * 10;
    if (p.category === "serum" || p.category === "treatment") {
      if (p.actives.includes("vitc")) return base - 8;
      if (p.actives.some(isRetinoid)) return 48; // after water serums, before moisturizer
      if (p.actives.includes("hyaluronic")) return 51;
    }
    if (p.category === "moisturizer" && /ointment|aquaphor|vaseline/i.test(p.name)) return 99;
    return base;
  };

  const toStep = (p: Product, when: "am" | "pm", nights?: "A" | "B"): RoutineStep => ({
    productId: p.id,
    brand: p.brand,
    name: p.name,
    category: p.category,
    role: CATEGORIES[p.category].role,
    tip: tip(p, when),
    nights,
  });

  const am: RoutineStep[] = [];
  const pm: RoutineStep[] = [];
  const order = products.map((p, i) => ({ p, i })).sort((x, y) => weight(x.p) - weight(y.p));
  for (const { p, i } of order) {
    const s = slots[i];
    if (s === "AM" || s === "BOTH") am.push(toStep(p, "am"));
    if (s === "PM" || s === "BOTH") pm.push(toStep(p, "pm"));
    if (s === "PMA") pm.push(toStep(p, "pm", "A"));
    if (s === "PMB") pm.push(toStep(p, "pm", "B"));
  }
  // sunscreen last in the morning (sort guarantees it, mask never in AM)

  let nightPlan: RoutineResult["nightPlan"] = null;
  if (usesA || usesB) {
    const nameFor = (side: Slot) => {
      const ps = products.filter((_, i) => slots[i] === side);
      if (!ps.length) return "Recovery nights";
      if (ps.some((p) => p.actives.some(isRetinoid))) return "Retinoid nights";
      if (ps.some((p) => p.category === "mask")) return ps.length === 1 ? "Mask night" : "Exfoliation nights";
      if (ps.some((p) => p.actives.some(isAcid))) return "Exfoliation nights";
      if (ps.some((p) => p.actives.includes("benzoyl_peroxide"))) return "Acne nights";
      if (ps.some((p) => p.actives.includes("copper_peptides"))) return "Peptide nights";
      return "Treatment nights";
    };
    const gentle = skinType === "sensitive" || skinType === "dry";
    nightPlan = {
      a: nameFor("PMA"),
      b: nameFor("PMB"),
      aDays: gentle ? "Mon · Thu · Sun" : "Mon · Wed · Fri · Sun",
      bDays: gentle ? "Tue · Sat" : "Tue · Thu · Sat",
    };
  }

  // 4) conflicts with their real fix (from where we placed them)
  const slotWords = (s: Slot) =>
    s === "AM" ? "in the morning" : s === "PMA" ? `on ${nightPlan?.a.toLowerCase() ?? "night A"}` : s === "PMB" ? `on ${nightPlan?.b.toLowerCase() ?? "night B"}` : s === "PM" ? "at night" : "morning and night";
  const conflicts: Conflict[] = raw
    .map((c) => {
      const a = products[c.i];
      const b = products[c.j];
      const sa = slots[c.i];
      const sb = slots[c.j];
      let fix = c.fix;
      const washOff = WASH_OFF.has(a.category) || WASH_OFF.has(b.category);
      if (washOff && overlap(sa, sb)) {
        const w = WASH_OFF.has(a.category) ? a : b;
        const o = w === a ? b : a;
        fix = `${shortName(w)} is a wash-off, so contact is short: rinse well and let skin dry before ${shortName(o)}.`;
      } else if (!overlap(sa, sb)) {
        fix = `${shortName(a)} ${slotWords(sa)}, ${shortName(b)} ${slotWords(sb)}. Never on the same skin.`;
      } else if (c.severity !== "caution") {
        fix = `${c.fix} ${c.title === "Two retinoids" ? "" : "Your routine keeps both, so watch for redness."}`.trim();
      }
      return {
        a: a.id,
        b: b.id,
        aName: shortName(a),
        bName: shortName(b),
        activeA: c.activeA,
        activeB: c.activeB,
        severity: c.severity,
        title: c.title,
        insight: c.insight,
        fix,
      } satisfies Conflict;
    })
    .sort((x, y) => SEVERITY_RANK[y.severity] - SEVERITY_RANK[x.severity]);

  // 5) notes + score
  const notes: string[] = [];
  const leaveOnActives = products.some(
    (p) => !WASH_OFF.has(p.category) && p.actives.some((a) => isRetinoid(a) || isAcid(a) || a === "vitc"),
  );
  const hasSpf = products.some((p) => p.actives.includes("spf"));
  const hasCleanser = products.some((p) => p.category === "cleanser");
  const hasMoist = products.some((p) => p.category === "moisturizer");
  const leaveOnAcids = products.filter((p) => !WASH_OFF.has(p.category) && p.category !== "mask" && p.actives.some(isAcid)).length;

  if (!hasSpf)
    notes.push(
      leaveOnActives
        ? "No sunscreen on your shelf. Your actives make skin more sun-sensitive: add an SPF 30+ as your last morning step."
        : "No sunscreen on your shelf. Add an SPF 30+ as your last morning step: it's the #1 anti-aging product.",
    );
  if (!hasCleanser) notes.push("No cleanser yet. A gentle one helps every other product work.");
  if (!hasMoist)
    notes.push(
      skinType === "oily"
        ? "No moisturizer yet. Even oily skin needs a light gel moisturizer, especially with actives."
        : "No moisturizer yet. Add one to protect your skin barrier.",
    );
  if (leaveOnAcids >= 3) notes.push(`${leaveOnAcids} exfoliants on your shelf. One or two is plenty: keep your favorite.`);
  if (extras.length) notes.push(`You have more than one sunscreen. One is enough each morning; keep ${extras[0]} for reapplying.`);
  if (skinType === "sensitive" && products.some((p) => p.actives.some(isRetinoid)) && leaveOnAcids > 0)
    notes.push("Sensitive skin: start your retinoid and acid nights slowly, and skip a night if you feel stinging.");
  if (skinType === "oily" && products.some((p) => p.category === "oil"))
    notes.push("Oily skin: use your face oil only on dry patches, or swap it for a gel moisturizer.");

  const pen = { avoid: 16, separate: 12, caution: 5 } as const;
  let before = 100;
  for (const c of conflicts) before -= pen[c.severity];
  if (!hasSpf) before -= leaveOnActives ? 18 : 12;
  if (!hasCleanser) before -= 6;
  if (!hasMoist) before -= 8;
  if (leaveOnAcids >= 3) before -= 8;
  if (skinType === "oily" && products.some((p) => p.category === "oil")) before -= 3;
  if (skinType === "sensitive" && products.filter((p) => isStrong(p)).length >= 3) before -= 6;

  let after = 100;
  for (const c of conflicts) {
    const ia = products.findIndex((p) => p.id === c.a);
    const ib = products.findIndex((p) => p.id === c.b);
    if (overlap(slots[ia], slots[ib])) after -= pen[c.severity];
  }
  if (!hasSpf) after -= leaveOnActives ? 14 : 10;
  if (!hasCleanser) after -= 5;
  if (!hasMoist) after -= 6;
  if (leaveOnAcids >= 3) after -= 4;

  const clamp = (x: number) => Math.max(18, Math.min(100, Math.round(x)));
  const scoreBefore = clamp(before);
  const scoreAfter = Math.max(scoreBefore, clamp(after));

  return {
    version: 1,
    skinType,
    products,
    am,
    pm,
    nightPlan,
    conflicts,
    goodPairs: goods,
    scoreBefore,
    scoreAfter,
    notes,
    pairsChecked: (n * (n - 1)) / 2,
  };
}

export function activeLabel(a: ActiveKey) {
  return ACTIVES[a]?.short ?? a;
}
