# Skinmatch: project memory

> Your skincare routine, checked by AI.
> Add your products and your skin type, then get your morning and night routine in the right order and the products that should never be mixed.

Market: United States. Language: English only. Currency: USD. Built by Claude Code for the owner (not a developer) and sold through **Kwop**.
Never ask the owner product, design or pricing questions: decide like the best SaaS in the space and write the choice here.

## RESULT
**RESULT = "your routine check"**
- Main button everywhere: **"Check my routine"** (in-app: "Check my routine" / "Re-check my routine").
- Creating screen: "Checking your routine… 64%".
- Ready: **"Your routine check is ready."**
- Paywall title: "Your routine check is ready." + personal line ("We found 2 products canceling each other out on your shelf.")
- Unlock button: **"See my full routine"**.
- Sign-up sheet title: **"Save your routine check"**.

---

## Step 0: what already converts (research, Nov 2026)
Sources: the skinsort.com support pages and App Store listings, derma-site comparison posts and App Store listings for SkinStack AI / My Skincare Routines (direct fetches of skinsort.com were blocked by the build sandbox, so the notes come from search results).

| App | Landing / first screen | Sign-up | Steps to first result | Paywall | Plans |
|---|---|---|---|---|---|
| **SkinSort** (web + iOS) | "Find skincare that works". Search bar for products, then routine creator, ingredient checker, dupes, product pages | Email/Google/Apple, needed to save a routine | Search products → add to routine → "Routine insights" (goal match + conflicts) | Conflict detection and routine analysis are in **Premium**; the free tier has limited scans | Free + Premium (monthly/yearly; unlimited scans, routine analysis, conflict detection) |
| **SkinStack AI** (iOS) | "Flags risky pairings across your whole routine (retinol + vitamin C…)" | Apple/Google | Scan label → routine → conflict flags | After the first scan | Free 1 scan/day; Premium $5.99/mo or $39.99/yr |
| **My Skincare Routines** (iOS) | Routine organizer, OCR on ingredient list, clash checker | Apple | Scan → routine | Up front | $4.99/mo |

**Model picked: SkinSort** for structure (products → routine → insights/conflicts), with SkinStack's hook (the conflict is the "aha"). On top of it we apply the Kwop method: try-first hero, value before price, paywall over their own result, no prices on the landing page. Never copy their brand, text, images or code.

---

## Blueprint (step 0b)

### Funnel type: TRY FIRST
Why: the result (conflicts + order) can be computed in seconds from a photo or 3 product names without an account. Seeing "2 conflicts found" on *your own* shelf is the TikTok moment («I was using 2 products that cancel each other out»).

### Hero (first 10 seconds)
- Title (≤8 words): **"Two of your products might cancel out."** Subtitle: "Snap your shelf. Skinmatch checks every pair and puts your **morning** and **night** in the right order."
- The product right under it (a card called "the shelf tray"):
  1. A big drop zone "Snap your shelf" (opens the camera on phones via `capture="environment"`, file picker on computers). Hidden behind "Type them" if Gemini is not configured.
  2. "or type them" → a product search (local catalog of real US products + free text).
  3. **"Try an example"**: one tap, loads a real 5-product shelf (CeraVe cleanser, The Ordinary Retinol 0.5%, Paula's Choice 2% BHA, Timeless Vitamin C 20%, La Roche-Posay Anthelios), which really contains conflicts.
  4. Skin type: 5 one-tap chips (Oily, Dry, Combination, Normal, Sensitive) asked right after the products are in (one tap, it moves on by itself).
- Facts line: "Free to try · No account · Ready in 10 seconds · Photos never stored"

### Funnel screens (in place in the hero card, no page change)
1. **Input**: photo / type / example. Button "Check my routine →".
2. **Skin type**: "What's your skin like most days?" 5 cards. Tap = next.
3. **The work** (≥3 s, real): scan frame over their photo (or over their shelf of bottles) with corner brackets, a sweeping line, points on the labels, a progress ring 0→99 %. Steps that tick:
   - "Reading your labels" (Gemini vision when a photo; catalog lookup when typed)
   - "Finding the active ingredients"
   - "Checking every pair" ("10 pairs")
   - "Ordering your morning"
   - "Ordering your night"
   Hold at 99 % until the server answers; failure → retry once → "We couldn't read that one. Try again" with a button.
   Then "Your routine check is ready." with a short success check.
4. **The teaser (RESULT locked)**:
   - CLEAR: their photo (or shelf), the products found as chips, **"2 conflicts found"** headline, the first conflict's pair names ("Retinol 0.5% × BHA 2%") with its one-line insight.
   - BLURRED (soft gradient + lock): the routine score (big "72"), the fix for each conflict, the other conflicts, the full **Morning** and **Night** routines in order with wait times.
   - Button: **"See my full routine"**, plus "Saved on this device. Delete anytime."
5. **"See my full routine"** → no account: the sign-up sheet "Save your routine check" (Google first, email+password) → the check is attached to the account → **paywall** sheet over the blurred result.
   With an account but no plan → paywall. With a plan → it unblurs.

### Paywall
- Title: "Your routine check is ready."
- Personal line: "{n} conflicts on your shelf, and your {skin type} skin routine is ordered and waiting." (0 conflicts: "No clashes, and your {skin type} routine is ordered and waiting.")
- "Choose your plan." + Monthly / Yearly −20 % switch.
- Rows: Basic, **Pro (pre-selected, Most popular)**, Plus. Per-day price big.
- Button "Continue with Pro", "$7.00 due today, then every month · Cancel anytime".
- "Secure payment, processed by Whop" · chips Whop · Card.
- "What you unlock with Pro" (see quotas).
- 3 FAQ: "Will it work for my skin?", "Can I cancel?", "What happens right after I pay?"
- Small print: renews automatically until canceled, prices in USD.

### Plans: tags, quotas (counted on the server per billing period of 30 days from the period start)
| | Basic $4 | **Pro $7** | Plus $14 |
|---|---|---|---|
| Tag | "For a simple 3-step routine" | "For a full shelf, done right" | "For skincare lovers and the family shelf" |
| Routine checks / month | 15 | 60 | 300 |
| Products on your shelf | 12 | 40 | 120 |
| Label scans (photo) / month | — (type only) | 30 | 150 |
| Conflict checker | ✓ | ✓ + how to fix each one | ✓ + how to fix each one |
| Skin diary | — | ✓ weekly check-ins + week-over-week trends | ✓ + 12-month trends |
| Saved history | last 5 checks | all checks | all checks |
| Support | email | email | priority (24h) |
Plus = 5× Pro uses (checks, scans), still capped (no unlimited AI cost).
Lower plans visibly miss: Basic shows the shelf scanner and the diary as real blurred previews with "Unlock with Pro". A finished quota shows the upgrade sheet with the next plan.

Free (no plan): the anonymous try (3 / day per device and per IP, server-side) and the locked teaser. Logged-in without plan: the teaser + paywall.

### Magic moment on the landing page
The hero itself (the live product). Under it: a 24-second HTML/CSS motion demo in a phone frame: shelf photo → scan → "2 conflicts found" → morning/night routine.

### Visual direction ("soft editorial")
- Background cream `#FBF7F4`, surface `#FFFFFF`, blush `#F6E4DD`, nude `#EAD2C4`, rose `#B9796A` (secondary), ink `#2A1D1A` (text, main buttons), muted `#7A6660`, line `#EADFD8`.
- Brand accent **lime `#C8FF3D`**: kept as the accent (it fights a full blush page): highlight marker under key words, success ticks, progress ring, "safe" chips, the dot in the main button. Lime text only on ink.
- Conflict coral `#D2553F` (soft bg `#FBE6E1`); caution amber `#C98A2B`; safe green `#4F8A3C`.
- Dark mode: not shipped (beauty editorial is light-first; one carefully tuned theme beats two average ones).
- Fonts: **Playfair Display** (headings, tight -0.02em, italic for emphasis) + **DM Sans** (UI/body).
- 3 signature elements: (1) **CSS bottles**: each product as a little bottle/tube/jar silhouette with a label color by category; (2) **the clash link**: two product pills joined by a dashed line with a coral ✕ node (and a lime ✓ node for good pairs); (3) **the sun/moon routine timeline**: numbered steps on a vertical line with wait times ("wait 1 min").
- Glossy blush gradient blobs, round photo masks (scan frame with rounded corners), radius 16–20 px, 1 px soft borders, soft shadows.

---

## Engine (the real computation)
`lib/engine/`:
- `catalog.ts`: ~120 real, popular US products (brand, name, category, key actives). Only well-known, public formulas.
- `actives.ts`: active-ingredient families (retinoid, AHA, BHA, PHA, vitamin C (L-ascorbic), vitamin C derivative, benzoyl peroxide, niacinamide, azelaic acid, copper peptides, peptides, hyaluronic acid, ceramides, SPF, tranexamic acid, kojic acid, sulfur, adapalene, hydroquinone…).
- `rules.ts`: pair rules (severity `avoid` / `separate` / `caution` / `good`), each with a short insight + fix. Based on mainstream dermatology guidance (AAD-style): retinoid × AHA/BHA, retinoid × benzoyl peroxide, vitamin C (LAA) × AHA/BHA, vitamin C × benzoyl peroxide, copper peptides × vitamin C / acids, multiple exfoliants, two retinoids, BP × tretinoin; good pairs: retinoid × niacinamide, vitamin C × SPF, HA/ceramides with everything.
- `routine.ts`: AM/PM split + order (cleanser → toner → treatment (thinnest first) → serum → eye → moisturizer → oil → SPF (AM only)), retinoids PM only, BHA/AHA alternated, vitamin C AM, SPF AM last, wait times; skin-type tweaks (sensitive: frequency down; oily: gel layers; dry: occlusive last).
- `score.ts`: routine score 0–100 (conflicts, missing SPF, missing cleanser/moisturizer, over-exfoliation, skin-type fit).
Gemini (`lib/ai.ts`) only reads labels (photo → products + actives) and looks up unknown typed products. The conflicts and order are always computed by the deterministic engine, never invented by the AI.

## Data (Supabase, RLS on every table)
- `profiles` (id=auth uid, email, skin_type, concerns, answers jsonb, intended_plan, source jsonb, plan_cache jsonb, period_start)
- `checks` (id, user_id null for anonymous, device_id, skin_type, products jsonb, result jsonb, photo_thumb text null, created_at). Anonymous checks are written by the server (service role) and claimed at sign-up with the device id.
- `shelf_products` (user's products)
- `diary_entries` (weekly check-ins: skin feel ratings + note)
- `usage_events` (user_id, kind: check|scan|lookup, created_at): quotas counted per billing period on the server.
- `anon_tries` (device_id, ip_hash, created_at): 3/day per device and per IP.
Photos are never stored on the server: they're sent once to Gemini to read the labels and dropped. Only a tiny thumbnail stays in the visitor's browser (and on their own check row if they sign up, deletable).

## Kwop (payments, plans, owner dashboard), server only
- `KWOP_API` secret (in `.env.local` and Vercel, never in the browser).
- `lib/kwop.ts`: `getKwop()`, `createCheckout()`, `confirm()`, `getPlan(email, {fresh})` (60 s cache per email, falls back to `profiles.plan_cache`), `cancel()`, `track()` (fire-and-forget).
- Plans: Basic 1139, Pro 1140, Plus 1141. Prices always read from GET KWOP_API (fallback constants only if Kwop is down).
- Checkout: embedded Whop elements in a sheet (`components/funnel/checkout-sheet.tsx`); 409 payments_off → "Payments open in a moment. Your routine check is saved."
- Events: signup, onboarding_done, aha, paywall_view, feature_used.
- Visit tracking `https://kwop.io/flow.js` (data-site s_6c5a5f9bb1) on public pages only (/, /signup, /login, /terms, /privacy).
- After deploy: POST KWOP_API/connect {url}.

## Tech
Next.js 16 (App Router, TS; `proxy.ts` instead of middleware; async cookies/params) + Tailwind v4 + shadcn-style components in `components/ui` + framer-motion + lucide-react. Supabase Postgres + Auth (`@supabase/ssr`). Gemini via `@google/genai` (model `gemini-2.5-flash`, override with GEMINI_MODEL). Vercel hosting.

## Local dev without Supabase cloud
`scripts/localstack/` runs a real local stack (Postgres 16 + Supabase Auth (GoTrue) + PostgREST behind a tiny gateway on :54321) so the full funnel can be tested for real offline. `npm run localstack`.

## Verification loop (after every feature)
1. `npm run dev` → `node scripts/shot.mjs <path>` screenshots at 390×844 and 1440×900 into `.shots/`; look at every image.
2. Console must be clean, server logs clean.
3. Fix, re-check (3 passes), commit.
4. `tests/e2e.spec.ts`: landing → try example → work → locked → sign-up (new email) → paywall → checkout sheet opens (never pay) → close → account. Run on phone and desktop projects before every deploy.

## Decisions log
- No dark mode (see visual direction).
- Account → language: English only for now (shown, single option), as the market is the US.
- Basic has no photo scanner: products are typed (catalog + manual actives).
- The free try is the full engine; what's locked is the order, the fixes, the score and the rest of the conflicts.
