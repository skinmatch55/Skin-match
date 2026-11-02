import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { ACTIVE_KEYS, CATEGORY_KEYS } from "./engine/actives";
import { matchCatalog } from "./engine/catalog";
import type { ActiveKey, Category, Product } from "./engine/types";

// The only place that talks to an AI model. Gemini only READS labels and identifies products;
// conflicts and order are always computed by the deterministic engine in lib/engine.

export function aiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

const MODELS = () => [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-2.5-flash"].filter(Boolean) as string[];

const schema = {
  type: Type.OBJECT,
  properties: {
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING },
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: CATEGORY_KEYS },
          actives: { type: Type.ARRAY, items: { type: Type.STRING, enum: ACTIVE_KEYS } },
          confidence: { type: Type.NUMBER },
        },
        required: ["brand", "name", "category", "actives", "confidence"],
      },
    },
  },
  required: ["products"],
};

const GUIDE = `You identify skincare products for a US routine checker.
Categories: ${CATEGORY_KEYS.join(", ")} ("exfoliant" = leave-on acid toner/serum; "treatment" = retinoids, azelaic acid, adapalene; "oil_cleanser" = cleansing oil/balm/micellar water).
Active keys (only list what the product really contains as a meaningful active): ${ACTIVE_KEYS.join(", ")}.
"vitc" = L-ascorbic acid only; other vitamin C forms are "vitc_deriv". "spf" for any sunscreen. Retinyl esters and HPR = "retinol".
Use the exact brand and product name as printed. Never invent products. Confidence 0..1.`;

async function generate(parts: unknown[]): Promise<{ products: RawAi[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  let lastErr: unknown;
  for (const model of MODELS()) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: parts as never }],
        config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.1 },
      });
      const text = res.text ?? "";
      return JSON.parse(text);
    } catch (e) {
      lastErr = e;
      const msg = String((e as Error)?.message || e);
      if (!/not found|404|unsupported|is not supported/i.test(msg)) break;
    }
  }
  throw lastErr;
}

interface RawAi {
  brand: string;
  name: string;
  category: string;
  actives: string[];
  confidence: number;
}

function toProduct(r: RawAi, i: number): Product | null {
  if (!r?.name || (r.confidence ?? 0) < 0.35) return null;
  const cat = matchCatalog(r.brand || "", r.name);
  if (cat) return { ...cat };
  const category = (CATEGORY_KEYS as string[]).includes(r.category) ? (r.category as Category) : "serum";
  const actives = (r.actives || []).filter((a): a is ActiveKey => (ACTIVE_KEYS as string[]).includes(a));
  return {
    id: `ai-${Date.now().toString(36)}-${i}`,
    brand: (r.brand || "").slice(0, 60),
    name: r.name.slice(0, 90),
    category,
    actives: [...new Set(actives)],
    catalogId: null,
  };
}

/** Photo of one or more labels → products. */
export async function readLabels(imageBase64: string, mimeType: string): Promise<Product[]> {
  const out = await generate([
    { text: `${GUIDE}\nList every distinct skincare product visible in this photo (labels, bottles, tubes). If none, return an empty list.` },
    { inlineData: { data: imageBase64, mimeType } },
  ]);
  return (out.products || [])
    .slice(0, 20)
    .map(toProduct)
    .filter((p): p is Product => Boolean(p));
}

/** A product typed by name that is not in our catalog → best identification. */
export async function lookupProduct(text: string): Promise<Product | null> {
  const out = await generate([
    { text: `${GUIDE}\nIdentify this product a user typed: "${text.slice(0, 120)}". Return exactly one product if it is a real skincare product, otherwise an empty list.` },
  ]);
  const p = (out.products || []).map(toProduct).find(Boolean);
  return p ?? null;
}
