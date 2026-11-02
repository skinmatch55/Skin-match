import { existsSync } from "fs";
import { Camera, ListOrdered, ShieldCheck, Sparkles, X } from "lucide-react";
import { redirect } from "next/navigation";
import path from "path";
import { Bottle } from "@/components/brand/bottle";
import { ClashLink } from "@/components/brand/clash";
import { KwopFlow } from "@/components/kwop-flow";
import { MotionDemo, PhoneFrame } from "@/components/landing/demo";
import { Faq } from "@/components/landing/faq";
import { HeroTry } from "@/components/landing/hero-try";
import { Reveal } from "@/components/landing/reveal";
import { ScrollToTry } from "@/components/landing/scroll-to-try";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ACTIVE_KEYS } from "@/lib/engine/actives";
import { CATALOG } from "@/lib/engine/catalog";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "Which products really shouldn't be mixed?",
    a: "The big ones: retinol with exfoliating acids (AHA/BHA), retinol or vitamin C with benzoyl peroxide, vitamin C with acids, and copper peptides with acids. Skinmatch checks every pair on your shelf and tells you when to use each one instead.",
  },
  {
    q: "Do I have to throw anything away?",
    a: "Almost never. Most clashes are about timing, not the products. Skinmatch moves them to the morning, the night, or alternate nights so you keep everything you paid for.",
  },
  {
    q: "What if my product isn't in your list?",
    a: "Snap the label and Skinmatch reads it, or type the name and it looks it up. You can also add any product by hand and pick its active ingredients.",
  },
  {
    q: "Is my photo stored?",
    a: "No. Your photo is read once to find the products, then dropped. Only a tiny preview stays on your own device. You can delete your account and all your data anytime.",
  },
  {
    q: "Is this medical advice?",
    a: "No. Skinmatch follows the layering rules dermatologists agree on, for everyday skincare. If you use prescriptions like tretinoin, your dermatologist's plan comes first.",
  },
  {
    q: "How much does it cost?",
    a: "You try it free first, no card. The plans show up once your first routine check is ready.",
  },
];

export default async function Home() {
  const user = await getUser();
  if (user) redirect("/routine");
  const hasVideo = existsSync(path.join(process.cwd(), "public", "demo.mp4"));

  return (
    <>
      <KwopFlow />
      <SiteHeader />
      <main className="overflow-x-clip">
        {/* HERO: the product itself */}
        <section className="gloss relative">
          <div className="pointer-events-none absolute left-[4%] top-24 hidden animate-float lg:block" aria-hidden>
            <Bottle category="treatment" seed="hero-1" className="h-28 -rotate-12" flag="clash" />
          </div>
          <div className="pointer-events-none absolute right-[5%] top-40 hidden animate-float [animation-delay:-3s] lg:block" aria-hidden>
            <Bottle category="exfoliant" seed="hero-2" className="h-32 rotate-12" flag="clash" />
          </div>
          <div className="pointer-events-none absolute bottom-24 right-[9%] hidden animate-float [animation-delay:-5s] lg:block" aria-hidden>
            <Bottle category="sunscreen" seed="hero-3" className="h-24 rotate-6" flag="ok" />
          </div>
          <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-16">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-[13px] font-medium text-ink-2 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-lime ring-2 ring-lime/40" /> Your skincare routine, checked by AI
              </p>
              <h1 className="mt-5 text-[40px] font-semibold leading-[1.02] md:text-[64px]">
                Two of your products might <em className="marker not-italic md:italic">cancel out.</em>
              </h1>
              <p className="mx-auto mt-4 max-w-[560px] text-[17px] leading-relaxed text-ink-2 md:text-[19px]">
                Snap your shelf. Skinmatch checks every pair and puts your <b>morning</b> and <b>night</b> in the right order.
              </p>
            </div>
            <div id="try" className="mx-auto mt-8 max-w-[760px] scroll-mt-24 md:mt-10">
              <div className="rounded-[30px] border border-white/80 bg-white/80 p-4 shadow-[var(--shadow-lift)] backdrop-blur-md md:p-7">
                <HeroTry />
              </div>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span>Free to try</span>·<span>No account</span>·<span>Ready in 10 seconds</span>·
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Photos never stored
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* MOTION DEMO */}
        <section className="mx-auto max-w-[1120px] px-4 py-16 md:px-6 md:py-28">
          <Reveal className="mb-10 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-rose">See it in 20 seconds</p>
          </Reveal>
          <MotionDemo hasVideo={hasVideo} />
        </section>

        {/* PROBLEM */}
        <section className="bg-white/60 py-16 md:py-28">
          <div className="mx-auto max-w-[1120px] px-4 md:px-6">
            <Reveal className="max-w-[640px]">
              <h2 className="text-[34px] font-semibold leading-[1.08] md:text-[48px]">Your shelf doesn't always get along.</h2>
              <p className="mt-4 text-[17px] text-ink-2">Most of us build a routine one viral product at a time. Nobody tells you which ones fight.</p>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  t: "They cancel each other out",
                  d: "Benzoyl peroxide breaks down vitamin C and retinol. You pay for both, and get neither.",
                  v: <ClashLink a="Vitamin C" b="Benzoyl peroxide" />,
                },
                {
                  t: "TikTok routines aren't your skin",
                  d: "A 10-step routine made for oily skin can wreck dry or sensitive skin in a week.",
                  v: (
                    <div className="flex gap-1.5">
                      {["Oily", "Dry", "Combination", "Sensitive"].map((s, i) => (
                        <span key={s} className={i === 3 ? "rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-cream" : "rounded-full border border-line bg-white px-3 py-1.5 text-[12px]"}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ),
                },
                {
                  t: "The order matters",
                  d: "Thinnest to thickest, actives on clean skin, sunscreen last. Get it wrong and half of it never reaches your skin.",
                  v: (
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((n) => (
                        <span key={n} className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-[13px] font-semibold">
                          {n}
                        </span>
                      ))}
                      <span className="ml-1 text-[13px] text-muted">… which first?</span>
                    </div>
                  ),
                },
              ].map((c, i) => (
                <Reveal key={c.t} delay={i * 0.08}>
                  <div className="h-full rounded-[24px] border border-line bg-cream p-6">
                    <div className="flex h-12 items-center">{c.v}</div>
                    <h3 className="mt-5 text-[22px] font-semibold">{c.t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{c.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-[1120px] px-4 py-16 md:px-6 md:py-28">
          <Reveal className="text-center">
            <h2 className="text-[34px] font-semibold leading-[1.08] md:text-[48px]">Three taps to a routine that works.</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", I: Camera, t: "Snap or type your products", d: "One photo of your shelf, or search 130+ popular US products by name." },
              { n: "2", I: Sparkles, t: "Tell it your skin type", d: "Oily, dry, combination, normal or sensitive. One tap." },
              { n: "3", I: ListOrdered, t: "Get your routine check", d: "Morning and night in the right order, and the pairs to never mix." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative">
                  <span className="font-serif text-[88px] font-semibold leading-none text-nude">{s.n}</span>
                  <div className="relative -mt-6 rounded-[24px] border border-line bg-white p-6 shadow-[var(--shadow-soft)]">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-lime">
                      <s.I className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-[21px] font-semibold">{s.t}</h3>
                    <p className="mt-1.5 text-[15px] text-ink-2">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PRODUCT IN ACTION */}
        <section className="bg-ink py-16 text-cream md:py-28">
          <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 md:grid-cols-2 md:px-6">
            <Reveal>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-lime">Inside the app</p>
              <h2 className="mt-3 text-[34px] font-semibold leading-[1.08] md:text-[48px]">Your shelf, your nights, your skin diary.</h2>
              <ul className="mt-6 space-y-4 text-[16px] text-cream/85">
                {[
                  "Retinoid nights and exfoliation nights, planned for you",
                  "Add a product with a photo of its label",
                  "A weekly skin check-in to see what really changes",
                  "Share or save your routine as an image",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-ink">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="m2.5 6.5 2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="flex justify-center">
              <div className="relative">
                <PhoneFrame className="h-[520px] w-[260px] border border-white/10">
                  <div className="h-full bg-cream px-4 pt-10 text-ink">
                    <p className="font-serif text-[20px] font-semibold">Tonight</p>
                    <div className="mt-2 flex gap-1 rounded-full bg-ink/5 p-0.5 text-[10px] font-semibold">
                      <span className="flex-1 rounded-full bg-white py-1 text-center shadow-sm">Retinoid night</span>
                      <span className="flex-1 py-1 text-center text-muted">Exfoliation</span>
                    </div>
                    {[
                      { c: "cleanser" as const, n: "Hydrating Cleanser", r: "Cleanse" },
                      { c: "treatment" as const, n: "Retinol 0.5%", r: "Treat", tip: "Pea-sized amount" },
                      { c: "moisturizer" as const, n: "PM Lotion", r: "Moisturize" },
                    ].map((s, i) => (
                      <div key={s.n} className="mt-3 flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-sm">
                        <span className="grid h-6 w-6 place-items-center rounded-full border border-line text-[11px] font-bold">{i + 1}</span>
                        <Bottle category={s.c} seed={s.n} className="h-9" />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">{s.r}</p>
                          <p className="text-[12px]">{s.n}</p>
                          {s.tip && <p className="text-[10px] text-rose-deep">{s.tip}</p>}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 rounded-2xl bg-clash-soft p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-clash">
                        <X className="h-3.5 w-3.5" /> Not tonight: 2% BHA
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-2">Moved to Tuesday, Thursday and Saturday.</p>
                    </div>
                  </div>
                </PhoneFrame>
                <div className="absolute -left-16 top-24 hidden w-48 rotate-[-4deg] rounded-2xl bg-white p-3 text-ink shadow-[var(--shadow-lift)] sm:block">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Skin diary · week 3</p>
                  <div className="mt-2 flex h-14 items-end gap-1.5">
                    {[60, 52, 40, 30].map((h, i) => (
                      <span key={i} className="flex-1 rounded-t-md bg-nude" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-2">Breakouts, week over week</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* WHAT CHANGES */}
        <section className="mx-auto max-w-[1120px] px-4 py-16 md:px-6 md:py-28">
          <Reveal className="max-w-[640px]">
            <h2 className="text-[34px] font-semibold leading-[1.08] md:text-[48px]">What changes tonight.</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { n: `${CATALOG.length}`, l: "popular US products recognized by name" },
              { n: `${ACTIVE_KEYS.length}`, l: "active ingredients tracked on every label" },
              { n: "Every", l: "pair on your shelf checked, not just the famous ones" },
              { n: "10 s", l: "from your shelf to your routine" },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 0.06}>
                <div className="h-full rounded-[24px] border border-line bg-white p-5 md:p-6">
                  <p className="font-serif text-[40px] font-semibold leading-none md:text-[52px]">{s.n}</p>
                  <p className="mt-3 text-[14px] text-ink-2 md:text-[15px]">{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[820px] px-4 pb-16 md:px-6 md:pb-28">
          <Reveal className="mb-8 text-center">
            <h2 className="text-[34px] font-semibold md:text-[44px]">Questions</h2>
          </Reveal>
          <Faq items={FAQ} />
        </section>

        {/* FINAL */}
        <section className="px-4 pb-16 md:px-6 md:pb-24">
          <div className="gloss relative mx-auto max-w-[1120px] overflow-hidden rounded-[36px] border border-line bg-blush px-6 py-14 text-center md:py-20">
            <h2 className="mx-auto max-w-[680px] text-[36px] font-semibold leading-[1.05] md:text-[56px]">
              Tonight, put them on in the <em className="marker">right order.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[17px] text-ink-2">Ten seconds to find out what's clashing on your shelf.</p>
            <ScrollToTry size="lg" className="mt-8">
              Check my routine
            </ScrollToTry>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5" /> Free to try · No card
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
