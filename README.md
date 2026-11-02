# Skinmatch

Your skincare routine, checked by AI. See **CLAUDE.md** for the product blueprint, the plans and quotas, the Kwop integration and the verification loop.

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Local testing without the cloud: Postgres 16 on :54322 (`scripts/local-bootstrap.sql` then `supabase/migrations/*`), `npm run local:auth` (dev-only stand-in for Supabase Auth), and `DEV_FAKE_PLAN=pro` in `.env.local` to test paid pages (ignored in production builds).

Tests: `npm run test:e2e` (funnel, phone + desktop), `npm run test:app` (paid features, local only).
