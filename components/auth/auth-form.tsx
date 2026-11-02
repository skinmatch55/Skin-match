"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useConfig } from "@/components/config";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api, deviceId } from "@/lib/client";
import { supabaseBrowser } from "@/lib/supabase/client";

export function GoogleG({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

type Mode = "signup" | "login";

/** Google first, then email + password. No email confirmation, no extra field. */
export function AuthForm({
  mode: initialMode,
  next,
  onSuccess,
  switchInPlace = false,
}: {
  mode: Mode;
  /** where to land after Google sign-in (path) */
  next: string;
  /** email/password success (session is set) */
  onSuccess: () => void | Promise<void>;
  /** switch between sign-up and log-in without leaving (sheet) */
  switchInPlace?: boolean;
}) {
  const cfg = useConfig();
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState<"google" | "email" | null>(null);
  const [errors, setErrors] = React.useState<{ email?: React.ReactNode; password?: string; form?: string }>({});

  const google = async () => {
    setBusy("google");
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}&device=${deviceId()}` },
    });
    if (error) {
      setBusy(null);
      setErrors({ form: "Google sign-in didn't open. Try again, or use your email." });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email, like you@gmail.com.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy("email");
    const sb = supabaseBrowser();
    try {
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email: email.trim(), password });
        if (error) {
          if (/already|registered|exists/i.test(error.message)) {
            setErrors({
              email: (
                <>
                  This email already has an account.{" "}
                  <button type="button" className="font-semibold underline" onClick={() => switchTo("login")}>
                    Log in?
                  </button>
                </>
              ),
            });
          } else if (/password/i.test(error.message)) setErrors({ password: error.message });
          else setErrors({ form: friendly(error.message) });
          return;
        }
        // Supabase returns a fake user with no identities when the email is taken
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setErrors({
            email: (
              <>
                This email already has an account.{" "}
                <button type="button" className="font-semibold underline" onClick={() => switchTo("login")}>
                  Log in?
                </button>
              </>
            ),
          });
          return;
        }
        if (!data.session) {
          // should not happen (email confirmation is off), but never leave them stuck
          const r = await sb.auth.signInWithPassword({ email: email.trim(), password });
          if (r.error) {
            setErrors({ form: friendly(r.error.message) });
            return;
          }
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          setErrors(
            /invalid/i.test(error.message)
              ? { password: "Wrong email or password. Try again, or reset your password." }
              : { form: friendly(error.message) },
          );
          return;
        }
      }
      await api("/api/claim", { method: "POST", body: JSON.stringify({ deviceId: deviceId() }) });
      await onSuccess();
    } finally {
      setBusy(null);
    }
  };

  const switchTo = (m: Mode) => {
    if (switchInPlace) {
      setMode(m);
      setErrors({});
    } else location.href = `/${m}${location.search}`;
  };

  return (
    <div className="w-full">
      {cfg.google && (
        <>
          <Button type="button" variant="google" size="lg" className="w-full" onClick={google} disabled={busy !== null}>
            {busy === "google" ? <Spinner /> : <GoogleG />} Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-[13px] text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}
      <form onSubmit={submit} noValidate className="space-y-3">
        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-[14px] font-medium">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-[16px] outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-blush aria-[invalid=true]:border-clash"
            aria-invalid={Boolean(errors.email)}
            placeholder="you@gmail.com"
          />
          {errors.email && <p className="mt-1.5 text-[13px] text-clash">{errors.email}</p>}
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="auth-password" className="block text-[14px] font-medium">
              Password
            </label>
            {mode === "login" && (
              <Link href="/forgot" className="text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="auth-password"
              type={show ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-line bg-white px-4 pr-12 text-[16px] outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-blush aria-[invalid=true]:border-clash"
              aria-invalid={Boolean(errors.password)}
              placeholder={mode === "signup" ? "8 characters or more" : "Your password"}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-blush-2"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-[13px] text-clash">{errors.password}</p>}
        </div>
        {errors.form && (
          <p role="alert" className="rounded-xl bg-clash-soft px-3 py-2 text-[13px] text-clash">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy !== null} data-testid="auth-submit">
          {busy === "email" && <Spinner />}
          {mode === "signup" ? "Create my free account" : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-[14px] text-muted">
        {mode === "signup" ? "Already have an account? " : "New to Skinmatch? "}
        <button type="button" onClick={() => switchTo(mode === "signup" ? "login" : "signup")} className="font-semibold text-ink underline-offset-2 hover:underline">
          {mode === "signup" ? "Log in" : "Create an account"}
        </button>
      </p>
      <p className="mt-3 text-center text-[12px] text-muted">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
        .
      </p>
    </div>
  );
}

function friendly(msg: string) {
  if (/rate|too many/i.test(msg)) return "Too many tries. Wait a minute and try again.";
  if (/network|fetch/i.test(msg)) return "We couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Try again in a moment.";
}
