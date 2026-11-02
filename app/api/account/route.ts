import { db } from "@/lib/db";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { cancelPlan } from "@/lib/kwop";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

/** Deletes the account and all its data (checks, shelf, diary, usage). Cancels any plan first. */
export async function DELETE() {
  const g = await apiViewer();
  if (g.error) return g.error;
  const { v } = g;
  try {
    if (v.plan.paid) await cancelPlan(v.user.email).catch(() => null);
    const sql = db();
    await sql.begin(async (tx) => {
      await tx`delete from public.checks where user_id = ${v.user.id}`;
      await tx`delete from public.shelf_products where user_id = ${v.user.id}`;
      await tx`delete from public.diary_entries where user_id = ${v.user.id}`;
      await tx`delete from public.usage_events where user_id = ${v.user.id}`;
      await tx`delete from public.profiles where id = ${v.user.id}`;
    });
    const { error } = await supabaseAdmin().auth.admin.deleteUser(v.user.id);
    if (error) console.error("[delete account] auth", error.message);
    const sb = await supabaseServer();
    await sb.auth.signOut().catch(() => null);
    return json({ ok: true });
  } catch (e) {
    console.error("[delete account]", (e as Error).message);
    return fail("delete_failed", 500);
  }
}
