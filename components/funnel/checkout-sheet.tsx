"use client";

import { Lock, X } from "lucide-react";
import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    WhopElements?: () => {
      checkout: {
        create: (opts: Record<string, unknown>) => { create: (k: string) => { mount: (sel: string) => void }; destroy?: () => void };
      };
    };
  }
}

const WHOP_SRC = "https://cdn.whop.com/elements/amber/elements.js";
let whopPromise: Promise<void> | null = null;
function loadWhop(): Promise<void> {
  if (window.WhopElements) return Promise.resolve();
  if (whopPromise) return whopPromise;
  whopPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = WHOP_SRC;
    s.async = true;
    s.setAttribute("data-whop-elements", "");
    s.onload = () => resolve();
    s.onerror = () => {
      whopPromise = null;
      reject(new Error("whop script failed"));
    };
    document.head.appendChild(s);
  });
  return whopPromise;
}

export interface CheckoutSession {
  embed: string | null;
  ref: string;
  fallback_url: string;
}

/** Whop's checkout embedded in a sheet over the paywall. Never leaves the page (except the fallback). */
export function CheckoutSheet({
  open,
  session,
  title,
  onClose,
  onPaid,
  returnPath = "/dashboard",
}: {
  open: boolean;
  session: CheckoutSession | null;
  title: string;
  onClose: () => void;
  onPaid: (ref: string) => void;
  returnPath?: string;
}) {
  const [ready, setReady] = React.useState(false);
  const ckRef = React.useRef<{ destroy?: () => void } | null>(null);
  const mountId = "whop-checkout";

  React.useEffect(() => {
    if (!open || !session) return;
    setReady(false);
    if (!session.embed) {
      location.href = session.fallback_url;
      return;
    }
    let done = false;
    const show = () => {
      if (!done) setReady(true);
    };
    const fallback = setTimeout(() => {
      if (!document.querySelector(`#${mountId} iframe`)) location.href = session.fallback_url;
      else show();
    }, 15000);
    const iframeCheck = setInterval(() => {
      if (document.querySelector(`#${mountId} iframe`)) {
        setTimeout(show, 2000);
        clearInterval(iframeCheck);
      }
    }, 250);

    (async () => {
      try {
        await loadWhop();
        if (done || !window.WhopElements) return;
        // wait for the sheet's mount node
        for (let i = 0; i < 40 && !document.getElementById(mountId); i++) await new Promise((r) => setTimeout(r, 25));
        const ck = window.WhopElements().checkout.create({
          checkoutConfiguration: session.embed,
          returnUrl: `${location.origin}${returnPath}?paid=1&ref=${encodeURIComponent(session.ref)}`,
          appearance: { theme: { appearance: "light" } },
          onLoadingChange: (st: unknown) => {
            const loading = st && typeof st === "object" ? (st as { loading?: boolean }).loading : st;
            if (loading === false) show();
          },
          onComplete: (r: { result?: string } | undefined) => {
            if (r && r.result === "payment") onPaid(session.ref);
          },
        });
        ckRef.current = ck;
        ck.create("checkout").mount(`#${mountId}`);
      } catch {
        location.href = session.fallback_url;
      }
    })();

    return () => {
      done = true;
      clearTimeout(fallback);
      clearInterval(iframeCheck);
      try {
        ckRef.current?.destroy?.();
      } catch {}
      ckRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session?.ref]);

  return (
    <Sheet open={open} onClose={onClose} label="Secure checkout" variant="bottom" width={520} z={70}>
      <div className="flex items-center justify-between px-5 pb-2 pt-2 sm:pt-5" data-testid="checkout-sheet">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Secure checkout</p>
          <p className="font-serif text-[22px] font-semibold">{title}</p>
        </div>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush-2" aria-label="Close checkout">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative min-h-[420px] flex-1 overflow-y-auto px-3 pb-3 sm:px-5">
        {!ready && (
          <div className="absolute inset-x-5 top-4 flex items-center gap-2 text-[14px] text-muted" data-testid="checkout-loading">
            <Spinner /> Loading secure checkout…
          </div>
        )}
        <div id={mountId} className={cn("min-h-[400px] transition-opacity", ready ? "opacity-100" : "opacity-0")} />
      </div>
      <p className="flex items-center justify-center gap-1.5 border-t border-line px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] text-[12px] text-muted">
        <Lock className="h-3.5 w-3.5" /> Secure payment by Whop · Cancel in 1 click
      </p>
    </Sheet>
  );
}
