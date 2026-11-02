import "server-only";
import { cache } from "react";
import { getPlan, type PlanState } from "./kwop";
import { tierFromPlan, type Tier } from "./plans";
import { supabaseConfigured, supabaseServer } from "./supabase/server";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export const getUser = cache(async (): Promise<SessionUser | null> => {
  if (!supabaseConfigured()) return null;
  try {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getUser();
    const u = data.user;
    if (!u?.email) return null;
    const meta = (u.user_metadata || {}) as Record<string, string>;
    return { id: u.id, email: u.email, name: meta.full_name || meta.name || null, avatar: meta.avatar_url || null };
  } catch {
    return null;
  }
});

export interface Viewer {
  user: SessionUser;
  plan: PlanState;
  tier: Tier | null;
}

export const getViewer = cache(async (opts?: { fresh?: boolean }): Promise<Viewer | null> => {
  const user = await getUser();
  if (!user) return null;
  const plan = await getPlan(user.email, { userId: user.id, fresh: opts?.fresh });
  return { user, plan, tier: plan.paid ? tierFromPlan(plan.plan) ?? "basic" : null };
});
