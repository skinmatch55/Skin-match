import type { ActiveKey, Category, Product } from "./types";

// Popular US skincare products and their key, publicly listed actives.
// Only the actives that matter for layering are listed (not full INCI lists).
type Row = [id: string, brand: string, name: string, category: Category, actives: ActiveKey[]];

const ROWS: Row[] = [
  // Cleansers
  ["cerave-hydrating-cleanser", "CeraVe", "Hydrating Facial Cleanser", "cleanser", ["ceramides", "hyaluronic"]],
  ["cerave-foaming-cleanser", "CeraVe", "Foaming Facial Cleanser", "cleanser", ["ceramides", "niacinamide"]],
  ["cerave-sa-cleanser", "CeraVe", "Renewing SA Cleanser", "cleanser", ["bha", "ceramides"]],
  ["cerave-acne-bp-cleanser", "CeraVe", "Acne Foaming Cream Cleanser (4% BPO)", "cleanser", ["benzoyl_peroxide", "niacinamide", "hyaluronic"]],
  ["cetaphil-gentle-cleanser", "Cetaphil", "Gentle Skin Cleanser", "cleanser", []],
  ["lrp-toleriane-cleanser", "La Roche-Posay", "Toleriane Hydrating Gentle Cleanser", "cleanser", ["ceramides", "niacinamide"]],
  ["lrp-effaclar-gel-cleanser", "La Roche-Posay", "Effaclar Medicated Gel Cleanser", "cleanser", ["bha"]],
  ["panoxyl-10-wash", "PanOxyl", "Acne Foaming Wash 10% Benzoyl Peroxide", "cleanser", ["benzoyl_peroxide"]],
  ["panoxyl-4-wash", "PanOxyl", "Acne Creamy Wash 4% Benzoyl Peroxide", "cleanser", ["benzoyl_peroxide"]],
  ["neutrogena-oil-free-acne-wash", "Neutrogena", "Oil-Free Acne Wash", "cleanser", ["bha"]],
  ["vanicream-cleanser", "Vanicream", "Gentle Facial Cleanser", "cleanser", []],
  ["yttp-superfood-cleanser", "Youth To The People", "Superfood Antioxidant Cleanser", "cleanser", []],
  ["krave-matcha-cleanser", "KraveBeauty", "Matcha Hemp Hydrating Cleanser", "cleanser", []],
  ["cosrx-good-morning-cleanser", "COSRX", "Low pH Good Morning Gel Cleanser", "cleanser", ["bha"]],
  ["glossier-milky-jelly", "Glossier", "Milky Jelly Cleanser", "cleanser", []],
  ["fab-pure-skin-cleanser", "First Aid Beauty", "Pure Skin Face Cleanser", "cleanser", []],
  ["de-beste-jelly", "Drunk Elephant", "Beste No. 9 Jelly Cleanser", "cleanser", []],
  ["inkey-salicylic-cleanser", "The INKEY List", "Salicylic Acid Cleanser", "cleanser", ["bha"]],
  ["to-squalane-cleanser", "The Ordinary", "Squalane Cleanser", "oil_cleanser", ["squalane"]],
  ["banila-clean-it-zero", "Banila Co", "Clean It Zero Cleansing Balm Original", "oil_cleanser", []],
  ["dhc-cleansing-oil", "DHC", "Deep Cleansing Oil", "oil_cleanser", []],
  ["bioderma-sensibio-h2o", "Bioderma", "Sensibio H2O Micellar Water", "oil_cleanser", []],
  ["garnier-micellar", "Garnier", "Micellar Cleansing Water", "oil_cleanser", []],

  // Toners, essences, exfoliants
  ["pc-2-bha", "Paula's Choice", "Skin Perfecting 2% BHA Liquid Exfoliant", "exfoliant", ["bha"]],
  ["pc-8-aha", "Paula's Choice", "Skin Perfecting 8% AHA Gel Exfoliant", "exfoliant", ["aha"]],
  ["to-glycolic-7", "The Ordinary", "Glycolic Acid 7% Exfoliating Toner", "exfoliant", ["aha"]],
  ["pixi-glow-tonic", "Pixi", "Glow Tonic", "exfoliant", ["aha"]],
  ["cosrx-aha-bha-toner", "COSRX", "AHA/BHA Clarifying Treatment Toner", "exfoliant", ["aha", "bha"]],
  ["cosrx-bha-liquid", "COSRX", "BHA Blackhead Power Liquid", "exfoliant", ["bha"]],
  ["to-lactic-10", "The Ordinary", "Lactic Acid 10% + HA", "exfoliant", ["aha", "hyaluronic"]],
  ["to-mandelic-10", "The Ordinary", "Mandelic Acid 10% + HA", "exfoliant", ["aha", "hyaluronic"]],
  ["de-framboos", "Drunk Elephant", "T.L.C. Framboos Glycolic Night Serum", "exfoliant", ["aha", "bha"]],
  ["sunday-riley-good-genes", "Sunday Riley", "Good Genes Lactic Acid Treatment", "exfoliant", ["aha"]],
  ["glow-recipe-pha-bha-toner", "Glow Recipe", "Watermelon Glow PHA + BHA Pore-Tight Toner", "exfoliant", ["pha", "bha"]],
  ["thayers-witch-hazel", "Thayers", "Alcohol-Free Witch Hazel Toner", "toner", []],
  ["klairs-supple-toner", "Dear, Klairs", "Supple Preparation Unscented Toner", "toner", ["hyaluronic"]],
  ["hada-labo-premium-lotion", "Hada Labo", "Gokujyun Premium Hydrating Lotion", "toner", ["hyaluronic"]],
  ["cosrx-snail-essence", "COSRX", "Advanced Snail 96 Mucin Power Essence", "toner", ["hyaluronic"]],
  ["good-molecules-niacinamide-toner", "Good Molecules", "Niacinamide Brightening Toner", "toner", ["niacinamide"]],

  // Serums and treatments
  ["to-niacinamide-zinc", "The Ordinary", "Niacinamide 10% + Zinc 1%", "serum", ["niacinamide", "zinc"]],
  ["to-ha-b5", "The Ordinary", "Hyaluronic Acid 2% + B5", "serum", ["hyaluronic", "panthenol"]],
  ["to-retinol-02", "The Ordinary", "Retinol 0.2% in Squalane", "treatment", ["retinol", "squalane"]],
  ["to-retinol-05", "The Ordinary", "Retinol 0.5% in Squalane", "treatment", ["retinol", "squalane"]],
  ["to-retinol-1", "The Ordinary", "Retinol 1% in Squalane", "treatment", ["retinol", "squalane"]],
  ["to-granactive-2", "The Ordinary", "Granactive Retinoid 2% Emulsion", "treatment", ["retinol"]],
  ["to-copper-buffet", "The Ordinary", "Buffet + Copper Peptides 1%", "serum", ["copper_peptides", "peptides", "hyaluronic"]],
  ["to-buffet", "The Ordinary", "Multi-Peptide + HA Serum", "serum", ["peptides", "hyaluronic"]],
  ["to-azelaic-10", "The Ordinary", "Azelaic Acid Suspension 10%", "treatment", ["azelaic"]],
  ["to-alpha-arbutin", "The Ordinary", "Alpha Arbutin 2% + HA", "serum", ["alpha_arbutin", "hyaluronic"]],
  ["to-vitc-23", "The Ordinary", "Vitamin C Suspension 23% + HA Spheres 2%", "serum", ["vitc"]],
  ["to-ascorbyl-glucoside", "The Ordinary", "Ascorbyl Glucoside Solution 12%", "serum", ["vitc_deriv"]],
  ["to-caffeine-eye", "The Ordinary", "Caffeine Solution 5% + EGCG", "eye", ["caffeine"]],
  ["skinceuticals-ce-ferulic", "SkinCeuticals", "C E Ferulic", "serum", ["vitc"]],
  ["timeless-vitc-20", "Timeless", "20% Vitamin C + E Ferulic Acid Serum", "serum", ["vitc"]],
  ["mad-hippie-vitc", "Mad Hippie", "Vitamin C Serum", "serum", ["vitc_deriv", "hyaluronic"]],
  ["de-c-firma", "Drunk Elephant", "C-Firma Fresh Day Serum", "serum", ["vitc"]],
  ["ole-truth-serum", "Ole Henriksen", "Truth Serum", "serum", ["vitc_deriv"]],
  ["pc-c15", "Paula's Choice", "C15 Super Booster", "serum", ["vitc", "peptides"]],
  ["pc-niacinamide-booster", "Paula's Choice", "10% Niacinamide Booster", "serum", ["niacinamide"]],
  ["pc-1-retinol", "Paula's Choice", "1% Retinol Treatment", "treatment", ["retinol", "peptides"]],
  ["pc-03-retinol-bakuchiol", "Paula's Choice", "CLINICAL 0.3% Retinol + 2% Bakuchiol", "treatment", ["retinol", "bakuchiol"]],
  ["pc-azelaic-booster", "Paula's Choice", "10% Azelaic Acid Booster", "treatment", ["azelaic", "bha"]],
  ["differin-gel", "Differin", "Adapalene Gel 0.1%", "treatment", ["adapalene"]],
  ["lrp-adapalene", "La Roche-Posay", "Effaclar Adapalene Gel 0.1%", "treatment", ["adapalene"]],
  ["tretinoin-rx", "Prescription", "Tretinoin cream (Retin-A)", "treatment", ["tretinoin"]],
  ["epiduo-forte", "Prescription", "Epiduo Forte (adapalene + benzoyl peroxide)", "treatment", ["adapalene", "benzoyl_peroxide"]],
  ["cerave-resurfacing-retinol", "CeraVe", "Resurfacing Retinol Serum", "treatment", ["retinol", "niacinamide", "ceramides"]],
  ["cerave-skin-renewing-retinol", "CeraVe", "Skin Renewing Retinol Serum", "treatment", ["retinol", "ceramides"]],
  ["neutrogena-rapid-wrinkle-retinol", "Neutrogena", "Rapid Wrinkle Repair Retinol Serum", "treatment", ["retinol", "hyaluronic"]],
  ["shani-darden-retinol-reform", "Shani Darden", "Retinol Reform", "treatment", ["retinol", "aha"]],
  ["medik8-crystal-retinal-6", "Medik8", "Crystal Retinal 6", "treatment", ["retinal"]],
  ["geek-gorgeous-a-game-5", "Geek & Gorgeous", "A-Game 5 Retinal Serum", "treatment", ["retinal"]],
  ["inkey-retinol", "The INKEY List", "Retinol Serum", "treatment", ["retinol", "squalane"]],
  ["inkey-ha", "The INKEY List", "Hyaluronic Acid Serum", "serum", ["hyaluronic"]],
  ["naturium-niacinamide-12", "Naturium", "Niacinamide Serum 12% Plus Zinc 2%", "serum", ["niacinamide", "zinc"]],
  ["naturium-tranexamic-5", "Naturium", "Tranexamic Topical Acid 5%", "serum", ["tranexamic"]],
  ["good-molecules-discoloration", "Good Molecules", "Discoloration Correcting Serum", "serum", ["tranexamic", "niacinamide"]],
  ["topicals-faded", "Topicals", "Faded Brightening & Clearing Serum", "serum", ["tranexamic", "niacinamide", "azelaic"]],
  ["cosrx-vitc-23", "COSRX", "The Vitamin C 23 Serum", "serum", ["vitc"]],
  ["boj-glow-serum", "Beauty of Joseon", "Glow Serum: Propolis + Niacinamide", "serum", ["niacinamide"]],
  ["boj-glow-deep-serum", "Beauty of Joseon", "Glow Deep Serum: Rice + Alpha-Arbutin", "serum", ["alpha_arbutin", "niacinamide"]],
  ["boj-revive-eye-retinal", "Beauty of Joseon", "Revive Eye Serum: Ginseng + Retinal", "eye", ["retinal"]],
  ["glow-recipe-dew-drops", "Glow Recipe", "Watermelon Glow Niacinamide Dew Drops", "serum", ["niacinamide", "hyaluronic"]],
  ["lrp-hyalu-b5", "La Roche-Posay", "Hyalu B5 Serum", "serum", ["hyaluronic", "panthenol"]],
  ["lrp-vitamin-c10", "La Roche-Posay", "Pure Vitamin C10 Serum", "serum", ["vitc", "bha"]],
  ["vichy-mineral-89", "Vichy", "Minéral 89 Hyaluronic Acid Booster", "serum", ["hyaluronic"]],
  ["de-b-hydra", "Drunk Elephant", "B-Hydra Intensive Hydration Serum", "serum", ["panthenol"]],
  ["sunday-riley-luna", "Sunday Riley", "Luna Sleeping Night Oil", "oil", ["retinol"]],

  // Spot treatments
  ["hero-mighty-patch", "Hero Cosmetics", "Mighty Patch Original", "spot", []],
  ["persa-gel-10", "Clean & Clear", "Persa-Gel 10 (10% Benzoyl Peroxide)", "spot", ["benzoyl_peroxide"]],
  ["mario-badescu-drying-lotion", "Mario Badescu", "Drying Lotion", "spot", ["bha", "sulfur"]],
  ["lrp-effaclar-duo", "La Roche-Posay", "Effaclar Duo Acne Spot Treatment", "spot", ["benzoyl_peroxide"]],

  // Eye
  ["cerave-eye-repair", "CeraVe", "Eye Repair Cream", "eye", ["ceramides", "hyaluronic", "niacinamide"]],
  ["inkey-caffeine-eye", "The INKEY List", "Caffeine Eye Cream", "eye", ["caffeine"]],
  ["kiehls-avocado-eye", "Kiehl's", "Creamy Eye Treatment with Avocado", "eye", []],

  // Moisturizers
  ["cerave-moisturizing-cream", "CeraVe", "Moisturizing Cream", "moisturizer", ["ceramides", "hyaluronic"]],
  ["cerave-pm-lotion", "CeraVe", "PM Facial Moisturizing Lotion", "moisturizer", ["ceramides", "niacinamide", "hyaluronic"]],
  ["cerave-daily-lotion", "CeraVe", "Daily Moisturizing Lotion", "moisturizer", ["ceramides", "hyaluronic"]],
  ["cetaphil-moisturizing-cream", "Cetaphil", "Moisturizing Cream", "moisturizer", []],
  ["vanicream-moisturizing-cream", "Vanicream", "Moisturizing Cream", "moisturizer", []],
  ["lrp-double-repair", "La Roche-Posay", "Toleriane Double Repair Face Moisturizer", "moisturizer", ["ceramides", "niacinamide"]],
  ["lrp-cicaplast-b5", "La Roche-Posay", "Cicaplast Baume B5", "moisturizer", ["panthenol", "centella"]],
  ["neutrogena-hydro-boost", "Neutrogena", "Hydro Boost Water Gel", "moisturizer", ["hyaluronic"]],
  ["belif-aqua-bomb", "belif", "The True Cream Aqua Bomb", "moisturizer", []],
  ["kiehls-ultra-facial", "Kiehl's", "Ultra Facial Cream", "moisturizer", ["squalane"]],
  ["clinique-moisture-surge", "Clinique", "Moisture Surge 100H Auto-Replenishing Hydrator", "moisturizer", []],
  ["clinique-ddml", "Clinique", "Dramatically Different Moisturizing Lotion+", "moisturizer", []],
  ["fab-ultra-repair", "First Aid Beauty", "Ultra Repair Cream", "moisturizer", []],
  ["tatcha-dewy-skin", "Tatcha", "The Dewy Skin Cream", "moisturizer", []],
  ["de-protini", "Drunk Elephant", "Protini Polypeptide Cream", "moisturizer", ["peptides"]],
  ["embryolisse-lait-creme", "Embryolisse", "Lait-Crème Concentré", "moisturizer", []],
  ["aveeno-calm-restore", "Aveeno", "Calm + Restore Oat Gel Moisturizer", "moisturizer", []],
  ["olay-micro-sculpting", "Olay", "Regenerist Micro-Sculpting Cream", "moisturizer", ["niacinamide", "peptides", "hyaluronic"]],
  ["olay-retinol-24", "Olay", "Regenerist Retinol 24 Night Moisturizer", "moisturizer", ["retinol", "niacinamide"]],
  ["roc-retinol-correxion-night", "RoC", "Retinol Correxion Deep Wrinkle Night Cream", "moisturizer", ["retinol"]],
  ["weleda-skin-food", "Weleda", "Skin Food Original Ultra-Rich Cream", "moisturizer", []],
  ["aquaphor-ointment", "Aquaphor", "Healing Ointment", "moisturizer", ["panthenol"]],
  ["laneige-water-sleeping-mask", "Laneige", "Water Sleeping Mask", "mask", []],

  // Oils
  ["to-squalane-oil", "The Ordinary", "100% Plant-Derived Squalane", "oil", ["squalane"]],
  ["de-marula-oil", "Drunk Elephant", "Virgin Marula Luxury Facial Oil", "oil", []],
  ["to-rosehip-oil", "The Ordinary", "100% Organic Cold-Pressed Rose Hip Seed Oil", "oil", []],

  // Sunscreens
  ["lrp-anthelios-melt-in-60", "La Roche-Posay", "Anthelios Melt-in Milk Sunscreen SPF 60", "sunscreen", ["spf"]],
  ["lrp-anthelios-uv-correct-70", "La Roche-Posay", "Anthelios UV Correct SPF 70", "sunscreen", ["spf", "niacinamide"]],
  ["supergoop-unseen-40", "Supergoop!", "Unseen Sunscreen SPF 40", "sunscreen", ["spf"]],
  ["eltamd-uv-clear-46", "EltaMD", "UV Clear Face Sunscreen SPF 46", "sunscreen", ["spf", "niacinamide"]],
  ["neutrogena-ultra-sheer-55", "Neutrogena", "Ultra Sheer Dry-Touch Sunscreen SPF 55", "sunscreen", ["spf"]],
  ["boj-relief-sun", "Beauty of Joseon", "Relief Sun: Rice + Probiotics SPF 50+", "sunscreen", ["spf"]],
  ["black-girl-sunscreen-30", "Black Girl Sunscreen", "SPF 30", "sunscreen", ["spf"]],
  ["biore-uv-aqua-rich", "Bioré", "UV Aqua Rich Watery Essence SPF 50", "sunscreen", ["spf"]],
  ["cerave-am-lotion-spf30", "CeraVe", "AM Facial Moisturizing Lotion SPF 30", "sunscreen", ["spf", "ceramides", "niacinamide"]],
  ["cerave-mineral-spf30", "CeraVe", "Hydrating Mineral Sunscreen SPF 30", "sunscreen", ["spf", "ceramides", "niacinamide"]],

  // Masks
  ["de-babyfacial", "Drunk Elephant", "T.L.C. Sukari Babyfacial", "mask", ["aha", "bha"]],
  ["to-aha-30-bha-2", "The Ordinary", "AHA 30% + BHA 2% Peeling Solution", "mask", ["aha", "bha"]],
  ["aztec-clay", "Aztec Secret", "Indian Healing Clay", "mask", []],
];

export const CATALOG: Product[] = ROWS.map(([id, brand, name, category, actives]) => ({
  id,
  catalogId: id,
  brand,
  name,
  category,
  actives,
}));

const byId = new Map(CATALOG.map((p) => [p.id, p]));
export function catalogById(id: string) {
  return byId.get(id) ?? null;
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%.+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple ranked search over brand + name. */
export function searchCatalog(q: string, limit = 8): Product[] {
  const query = norm(q);
  if (!query) return [];
  const terms = query.split(" ");
  const scored: { p: Product; s: number }[] = [];
  for (const p of CATALOG) {
    const hay = norm(`${p.brand} ${p.name}`);
    let s = 0;
    let all = true;
    for (const t of terms) {
      const i = hay.indexOf(t);
      if (i === -1) {
        all = false;
        break;
      }
      s += i === 0 || hay[i - 1] === " " ? 3 : 1;
    }
    if (!all) continue;
    if (hay.startsWith(query)) s += 5;
    scored.push({ p, s });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.p);
}

/** Best catalog match for a brand + name read from a label (or null). */
export function matchCatalog(brand: string, name: string): Product | null {
  const full = norm(`${brand} ${name}`);
  const words = full.split(" ").filter((w) => w.length > 1);
  if (!words.length) return null;
  let best: { p: Product; s: number } | null = null;
  for (const p of CATALOG) {
    const hay = norm(`${p.brand} ${p.name}`);
    const hayWords = new Set(hay.split(" "));
    let hit = 0;
    for (const w of words) if (hayWords.has(w)) hit++;
    const brandOk = norm(p.brand) && full.includes(norm(p.brand));
    const s = hit / Math.max(words.length, hayWords.size);
    if (brandOk && s > 0.55 && (!best || s > best.s)) best = { p, s };
  }
  return best?.p ?? null;
}

/** The one-tap example shelf: real products, really clashing. */
export const EXAMPLE_SHELF = [
  "cerave-hydrating-cleanser",
  "pc-2-bha",
  "timeless-vitc-20",
  "to-retinol-05",
  "cerave-pm-lotion",
  "lrp-anthelios-melt-in-60",
];
