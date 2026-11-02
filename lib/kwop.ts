import "server-only";
import { db } from "./db";

// Kwop: payments, plans and the owner's dashboard. Server only. This app never talks to Whop directly.
const API = () => process.env.KWOP_API?.replace(/\/$/, "") || "";

export interface KwopPlan {
  id: number;
  name: string;
  price_cents: number;
  currency: string;
  interval: string;
  per_day: number | string;
  yearly: { price_cents: number; per_day: number | string } | null;
}
export interface KwopApp {
  name: string;
  checkout: "embedded" | "redirect" | null;
  plans: KwopPlan[];
}
export interface PlanState {
  paid: boolean;
  plan: { id: number; name: string } | null;
  status: string | null;
  until: string | null;
}

// Last-resort values (from the owner's Kwop page at build time), only used if Kwop does not answer.
const FALLBACK: KwopApp = {
  name: "Skinmatch",
  checkout: "embedded",
  plans: [
    { id: 1139, name: "Basic", price_cents: 400, currency: "usd", interval: "month", per_day: 0.13, yearly: { price_cents: 3800, per_day: 0.1 } },
    { id: 1140, name: "Pro", price_cents: 700, currency: "usd", interval: "month", per_day: 0.23, yearly: { price_cents: 6700, per_day: 0.18 } },
    { id: 1141, name: "Plus", price_cents: 1400, currency: "usd", interval: "month", per_day: 0.47, yearly: { price_cents: 13400, per_day: 0.37 } },
  ],
};

async function call<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<{ status: number; data: T }> {
  const url = API() + path;
  if (!API()) throw new Error("KWOP_API is not set");
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(init?.timeoutMs ?? 10_000),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data: data as T };
}

let appCache: { at: number; v: KwopApp } | null = null;
export async function getKwop(): Promise<KwopApp> {
  if (appCache && Date.now() - appCache.at < 5 * 60_000) return appCache.v;
  try {
    const { status, data } = await call<KwopApp>("");
    if (status === 200 && data?.plans?.length) {
      appCache = { at: Date.now(), v: data };
      return data;
    }
    console.error("[kwop] GET app", status);
  } catch (e) {
    console.error("[kwop] GET app failed", (e as Error).message);
  }
  return appCache?.v ?? FALLBACK;
}

export async function createCheckout(plan: number, period: "month" | "year", email: string) {
  return call<{ embed: string | null; ref: string; fallback_url: string; error?: string }>("/checkout", {
    method: "POST",
    body: JSON.stringify({ plan, period, email }),
    timeoutMs: 15_000,
  });
}

export async function confirmPayment(ref: string) {
  return call<{ ok: boolean; paid: boolean }>("/confirm", { method: "POST", body: JSON.stringify({ ref }) });
}

export async function cancelPlan(email: string, exceptRef?: string) {
  return call<{ message: string; manage_url?: string }>("/cancel", {
    method: "POST",
    body: JSON.stringify(exceptRef ? { email, except_ref: exceptRef } : { email }),
  });
}

const planCache = new Map<string, { at: number; v: PlanState }>();
const FREE: PlanState = { paid: false, plan: null, status: null, until: null };

/** The user's plan, from Kwop. Cached 60 s per email; falls back to the last known plan. */
export async function getPlan(email: string, opts: { fresh?: boolean; userId?: string } = {}): Promise<PlanState> {
  const key = email.toLowerCase();
  // LOCAL DEV ONLY (never in production builds): simulate a plan when Kwop can't be reached from the dev box.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_FAKE_PLAN) {
    const t = process.env.DEV_FAKE_PLAN;
    const id = t === "plus" ? 1141 : t === "basic" ? 1139 : 1140;
    return { paid: true, plan: { id, name: t[0].toUpperCase() + t.slice(1) }, status: "active", until: new Date(Date.now() + 20 * 86400000).toISOString() };
  }
  const hit = planCache.get(key);
  if (!opts.fresh && hit && Date.now() - hit.at < 60_000) return hit.v;
  try {
    const { status, data } = await call<PlanState>(`/plan?email=${encodeURIComponent(key)}`);
    if (status === 200 && data && typeof data.paid === "boolean") {
      planCache.set(key, { at: Date.now(), v: data });
      if (opts.userId) {
        db()`update public.profiles set plan_cache = ${db().json(data as never)} where id = ${opts.userId}`.catch(() => {});
      }
      return data;
    }
    console.error("[kwop] plan", status);
  } catch (e) {
    console.error("[kwop] plan failed", (e as Error).message);
  }
  if (hit) return hit.v;
  if (opts.userId) {
    try {
      const [row] = await db()`select plan_cache from public.profiles where id = ${opts.userId}`;
      if (row?.plan_cache) return row.plan_cache as PlanState;
    } catch {}
  }
  return FREE;
}

export function forgetPlan(email: string) {
  planCache.delete(email.toLowerCase());
}

export type KwopEvent = "signup" | "onboarding_done" | "aha" | "paywall_view" | "feature_used";
/** Fire-and-forget. Never blocks, never throws. */
export function track(type: KwopEvent, email: string | null | undefined, detail?: string) {
  if (!API()) return;
  call("/event", { method: "POST", body: JSON.stringify({ type, email: email ?? null, ...(detail ? { detail } : {}) }), timeoutMs: 4000 }).catch(
    (e) => console.error("[kwop] event", type, (e as Error).message),
  );
}

export async function connectApp(url: string) {
  return call<{ ok: boolean }>("/connect", { method: "POST", body: JSON.stringify({ url }) });
}
