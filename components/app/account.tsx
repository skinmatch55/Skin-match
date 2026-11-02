"use client";
import { ExternalLink, Globe, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SKIN_TYPES } from "@/components/funnel/try-flow";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api, forgetLocal } from "@/lib/client";
import type { Quota, Tier } from "@/lib/plans";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { UpgradeSheet } from "./upgrade-sheet";

interface PlanInfo {
  name: string;
  tier: Tier;
  status: string | null;
  until: string | null;
  quota: Quota;
  usage: { check: number; scan: number; resets: string } | null;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-line bg-white p-5">
      <h2 className="mb-3 text-[20px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max ? Math.min(100, (used / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[14px]">
        <span>{label}</span>
        <span className="tabular-nums text-muted">
          {used} / {max}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
        <div className={cn("h-full rounded-full", pct >= 90 ? "bg-clash" : "bg-ink")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AccountView({ email, skinType, plan }: { email: string; skinType: string | null; plan: PlanInfo | null }) {
  const [skin, setSkin] = React.useState(skinType);
  const [upgrade, setUpgrade] = React.useState(false);
  const [cancelStep, setCancelStep] = React.useState<0 | 1 | 2>(0);
  const [cancelMsg, setCancelMsg] = React.useState<{ message: string; manage_url: string | null } | null>(null);
  const [del, setDel] = React.useState<0 | 1 | 2>(0);
  const [busy, setBusy] = React.useState(false);

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    location.href = "/";
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Profile">
        <p className="text-[14px] text-muted">Email</p>
        <p className="font-medium">{email}</p>
        <p className="mt-4 text-[14px] text-muted">Skin type</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SKIN_TYPES.map((s) => (
            <button
              key={s.key}
              onClick={async () => {
                setSkin(s.key);
                await api("/api/profile", { method: "PATCH", body: JSON.stringify({ skin_type: s.key }) });
              }}
              aria-pressed={skin === s.key}
              className={cn("rounded-full border px-3 py-1.5 text-[14px]", skin === s.key ? "border-ink bg-ink text-cream" : "border-line hover:border-ink/30")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted">Changing it? Re-check your routine to update the order.</p>
        <p className="mt-4 flex items-center gap-2 text-[14px] text-muted">
          <Globe className="h-4 w-4" /> Language: <span className="font-medium text-ink">English (US)</span>
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={logout}>
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </Card>

      <Card title="Plan and billing">
        {plan ? (
          <div data-testid="billing">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-[26px] font-semibold">{plan.name}</p>
                <p className="text-[14px] text-muted">
                  {plan.until
                    ? `${plan.status === "canceled" || plan.status === "cancelled" ? "Ends" : "Renews"} on ${new Date(plan.until).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    : "Active"}
                </p>
              </div>
              {plan.tier !== "plus" && (
                <Button size="sm" onClick={() => setUpgrade(true)}>
                  Change plan
                </Button>
              )}
            </div>
            {plan.usage && (
              <div className="mt-4 space-y-3">
                <Meter label="Routine checks this month" used={plan.usage.check} max={plan.quota.checks} />
                {plan.quota.scans > 0 && <Meter label="Label scans this month" used={plan.usage.scan} max={plan.quota.scans} />}
                <p className="text-[12px] text-muted">
                  Resets on {new Date(plan.usage.resets).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
                </p>
              </div>
            )}
            <div className="mt-5 border-t border-line pt-4">
              {cancelMsg ? (
                <div className="rounded-xl bg-blush-2 p-3 text-[14px]">
                  <p>{cancelMsg.message}</p>
                  {cancelMsg.manage_url && (
                    <a href={cancelMsg.manage_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-semibold underline">
                      Manage my subscription <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ) : cancelStep === 0 ? (
                <button onClick={() => setCancelStep(1)} className="text-[14px] text-muted underline hover:text-ink" data-testid="cancel-sub">
                  Cancel my subscription
                </button>
              ) : (
                <div className="rounded-xl border border-line p-3">
                  <p className="text-[14px]">Cancel {plan.name}? You keep everything until the end of this period.</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={cancelStep === 2}
                      onClick={async () => {
                        setCancelStep(2);
                        const r = await api<{ message?: string; manage_url?: string | null }>("/api/billing/cancel", { method: "POST" });
                        setCancelMsg({
                          message: r.data.message || (r.ok ? "Your subscription is canceled." : "We couldn't cancel right now. Try again in a minute."),
                          manage_url: r.data.manage_url ?? null,
                        });
                        if (!r.ok) setCancelStep(0);
                      }}
                    >
                      {cancelStep === 2 && <Spinner />} Yes, cancel
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCancelStep(0)}>
                      Keep my plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[15px]">No plan yet. Your routine check is waiting for you.</p>
            <Link href="/pricing">
              <Button className="mt-4">See my full routine</Button>
            </Link>
          </div>
        )}
      </Card>

      <Card title="Your data">
        <p className="text-[14px] text-ink-2">
          We keep your email, your skin type, your products, your checks and your diary. Photos are never stored. Read our{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
        {del === 0 ? (
          <Button variant="outline" size="sm" className="mt-4 text-clash" onClick={() => setDel(1)}>
            <Trash2 className="h-4 w-4" /> Delete my account
          </Button>
        ) : (
          <div className="mt-4 rounded-xl border border-clash/30 bg-clash-soft/50 p-3">
            <p className="text-[14px]">This deletes your account, your shelf, your checks and your diary for good{plan ? ", and cancels your plan" : ""}.</p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const r = await api("/api/account", { method: "DELETE" });
                  if (r.ok) {
                    forgetLocal();
                    location.href = "/";
                  } else {
                    setBusy(false);
                    setDel(0);
                  }
                }}
              >
                {busy && <Spinner />} Delete everything
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDel(0)}>
                Keep my account
              </Button>
            </div>
          </div>
        )}
      </Card>

      <UpgradeSheet open={upgrade} onClose={() => setUpgrade(false)} />
    </div>
  );
}
