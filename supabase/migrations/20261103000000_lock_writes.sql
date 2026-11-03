-- All writes go through the server's privileged connection (lib/db.ts).
-- Signed-in users keep read (and delete for their own data) through RLS, but can no longer
-- write fields the server trusts: plan_cache, period_start, email, source, quotas (shelf size), results.
revoke insert, update, delete on public.profiles from authenticated;
grant update (skin_type, concerns, answers) on public.profiles to authenticated;

revoke insert, update on public.checks, public.shelf_products, public.diary_entries from authenticated;

revoke all on public.profiles, public.checks, public.shelf_products, public.diary_entries, public.usage_events from anon;
