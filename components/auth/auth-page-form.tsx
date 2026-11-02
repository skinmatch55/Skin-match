"use client";
import { useRouter } from "next/navigation";
import { AuthForm } from "./auth-form";

export function AuthPageForm({ mode, next }: { mode: "signup" | "login"; next: string }) {
  const router = useRouter();
  return (
    <AuthForm
      mode={mode}
      next={next}
      onSuccess={() => {
        router.replace(next);
        router.refresh();
      }}
    />
  );
}
