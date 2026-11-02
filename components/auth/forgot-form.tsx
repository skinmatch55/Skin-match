"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabaseBrowser } from "@/lib/supabase/client";

const input =
  "h-12 w-full rounded-2xl border border-line bg-white px-4 text-[16px] outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-blush";

export function ForgotForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "busy" | "sent">("idle");
  const [err, setErr] = React.useState<string | null>(null);
  if (state === "sent")
    return (
      <div>
        <p className="text-[15px]">
          If <b>{email}</b> has an account, a reset link is on its way. Check your inbox (and spam).
        </p>
        <Link href="/login" className="mt-6 inline-block font-semibold underline">
          Back to log in
        </Link>
      </div>
    );
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Enter a valid email, like you@gmail.com.");
        setErr(null);
        setState("busy");
        const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${location.origin}/auth/callback?next=/reset`,
        });
        if (error && /rate/i.test(error.message)) {
          setErr("Too many tries. Wait a minute and try again.");
          setState("idle");
          return;
        }
        setState("sent");
      }}
    >
      <label htmlFor="fp-email" className="block text-[14px] font-medium">
        Email
      </label>
      <input id="fp-email" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" />
      {err && <p className="text-[13px] text-clash">{err}</p>}
      <Button size="lg" className="w-full" disabled={state === "busy"}>
        {state === "busy" && <Spinner />} Send me a link
      </Button>
      <p className="pt-2 text-center text-[14px]">
        <Link href="/login" className="text-muted underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}

export function ResetForm() {
  const router = useRouter();
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pw.length < 8) return setErr("Use at least 8 characters.");
        setBusy(true);
        const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
        setBusy(false);
        if (error) return setErr("This link has expired. Ask for a new one from “Forgot password”.");
        router.replace("/routine");
      }}
    >
      <label htmlFor="np" className="block text-[14px] font-medium">
        New password
      </label>
      <input id="np" type="password" autoComplete="new-password" className={input} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="8 characters or more" />
      {err && <p className="text-[13px] text-clash">{err}</p>}
      <Button size="lg" className="w-full" disabled={busy}>
        {busy && <Spinner />} Save my new password
      </Button>
    </form>
  );
}
