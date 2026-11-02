import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Reset your password", description: "Get a link to reset your Skinmatch password." };

export default function ForgotPage() {
  return (
    <AuthCard title="Reset your password" sub="We'll email you a link to choose a new one.">
      <ForgotForm />
    </AuthCard>
  );
}
