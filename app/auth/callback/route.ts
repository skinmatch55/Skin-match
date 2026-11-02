import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeNext } from "@/lib/next-path";
import { supabaseServer } from "@/lib/supabase/server";

// Google sign-in and password-reset links land here.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const device = url.searchParams.get("device") || "";
  if (code) {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // attach this device's free checks + attribution (same as /api/claim)
      try {
        const sql = db();
        await sql`insert into public.profiles (id, email) values (${data.user.id}, ${data.user.email ?? ""}) on conflict (id) do nothing`;
        if (/^[a-zA-Z0-9-_]{8,64}$/.test(device))
          await sql`update public.checks set user_id = ${data.user.id} where device_id = ${device} and user_id is null`;
      } catch (e) {
        console.error("[callback claim]", (e as Error).message);
      }
      return NextResponse.redirect(new URL(`${next}${next.includes("?") ? "&" : "?"}claim=1`, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
