import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageForm } from "@/components/auth/auth-page-form";
import { safeNext } from "@/lib/next-path";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Create your account", description: "Create your free Skinmatch account in 30 seconds." };

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getUser()) redirect(next);
  return (
    <AuthCard title="Check your routine" sub="Create your free account in 30 seconds. Then add your products and your skin type.">
      <AuthPageForm mode="signup" next={next} />
    </AuthCard>
  );
}
