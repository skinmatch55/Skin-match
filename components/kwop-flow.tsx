import Script from "next/script";
/** Kwop visit analytics: public pages only (landing, sign-up, log-in, legal). */
export function KwopFlow() {
  return <Script src="https://kwop.io/flow.js" data-site="s_6c5a5f9bb1" strategy="afterInteractive" />;
}
