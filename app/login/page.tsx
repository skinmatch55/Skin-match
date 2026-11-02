import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageForm } from "@/components/auth/auth-page-form";
import { safeNext } from "@/lib/next-path";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Log in", description: "Log in to Skinmatch and see your routine." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getUser()) redirect(next);
  return (
    <AuthCard title="Welcome back" sub="Your routine is waiting.">
      <AuthPageForm mode="login" next={next} />
    </AuthCard>
  );
}
