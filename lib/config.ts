import "server-only";
import { aiEnabled } from "./ai";
import { supabaseConfigured } from "./supabase/server";

export function publicConfig() {
  return {
    google: process.env.GOOGLE_AUTH_ENABLED === "1",
    ai: aiEnabled(),
    auth: supabaseConfigured(),
  };
}
