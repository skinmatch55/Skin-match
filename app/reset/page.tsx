import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPage() {
  return (
    <AuthCard title="Choose a new password">
      <ResetForm />
    </AuthCard>
  );
}
