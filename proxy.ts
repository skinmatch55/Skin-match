import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // keep ?plan= and utm_ params (cookie, later saved on the profile)
  const sp = request.nextUrl.searchParams;
  const plan = sp.get("plan");
  const utm: Record<string, string> = {};
  for (const k of UTM) {
    const v = sp.get(k);
    if (v) utm[k] = v.slice(0, 120);
  }
  const setAttribution = (res: NextResponse) => {
    if (plan) res.cookies.set("sm_plan", plan.slice(0, 40), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
    if (Object.keys(utm).length)
      res.cookies.set("sm_src", JSON.stringify(utm), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // refreshes the session cookie when needed
    try {
      await supabase.auth.getUser();
    } catch {
      // auth unreachable: pages handle the signed-out state
    }
  }
  setAttribution(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|js)$).*)"],
};
