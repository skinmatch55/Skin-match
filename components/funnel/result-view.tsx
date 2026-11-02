"use client";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { api, deviceId, thumbFor } from "@/lib/client";
import type { RoutineResult } from "@/lib/engine/types";
import type { Teaser } from "@/lib/teaser";
import { CheckResult } from "./check-result";

type Data = { id: string; paid: boolean; thumb: string | null; teaser: Teaser; full: RoutineResult | null };

export function ResultView({ id, signedIn, autoUnlock }: { id: string; signedIn: boolean; paid: boolean; autoUnlock: boolean }) {
  const [state, setState] = React.useState<{ s: "loading" } | { s: "error"; code: number } | { s: "ok"; d: Data }>({ s: "loading" });
  const load = React.useCallback(async () => {
    setState({ s: "loading" });
    const r = await api<Data>(`/api/checks/${id}?device=${deviceId()}`);
    if (r.ok) setState({ s: "ok", d: r.data });
    else setState({ s: "error", code: r.status });
  }, [id]);
  React.useEffect(() => {
    load();
  }, [load]);

  if (state.s === "loading")
    return (
      <div className="space-y-4" aria-busy>
        <div className="skeleton h-5 w-44" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  if (state.s === "error")
    return (
      <div className="py-12 text-center">
        <h1 className="font-serif text-[28px] font-semibold">
          {state.code === 404 ? "We couldn't find this routine check" : "We couldn't load your routine check"}
        </h1>
        <p className="mt-2 text-muted">
          {state.code === 404 ? "It may belong to another account. Log in, or start a new one." : "Check your connection and try again."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {state.code === 404 ? (
            <>
              {!signedIn && (
                <Link href={`/login?next=/result/${id}`}>
                  <Button variant="outline">Log in</Button>
                </Link>
              )}
              <Link href="/">
                <Button>Check my routine</Button>
              </Link>
            </>
          ) : (
            <Button onClick={load}>Try again</Button>
          )}
        </div>
      </div>
    );
  const d = state.d;
  return (
    <CheckResult
      checkId={d.id}
      teaser={d.teaser}
      full={d.full}
      thumb={thumbFor(d.id) ?? d.thumb}
      signedIn={signedIn}
      autoUnlock={autoUnlock && !d.full}
    />
  );
}
