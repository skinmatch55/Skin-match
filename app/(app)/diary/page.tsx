import type { Metadata } from "next";
import { PageHead } from "@/components/app/page-head";
import { Diary, DiaryLocked } from "@/components/app/diary";
import { asUser } from "@/lib/db";
import { requirePaidPage } from "@/lib/guard";

export const metadata: Metadata = { title: "Skin diary" };

export default async function DiaryPage() {
  const v = await requirePaidPage("/diary");
  if (v.tier === "basic")
    return (
      <>
        <PageHead title="Skin diary" sub="Track what changes week after week." />
        <DiaryLocked />
      </>
    );
  const weeks = v.tier === "plus" ? 52 : 12;
  const rows = await asUser(
    v.user.id,
    (tx) => tx`select id, to_char(entry_date, 'YYYY-MM-DD') as entry_date, breakouts, dryness, redness, oiliness, glow, note
      from public.diary_entries where entry_date > current_date - ${weeks * 7}::int order by entry_date desc`,
  );
  return (
    <>
      <PageHead title="Skin diary" sub={`A 20-second check-in each week. Trends over the last ${weeks === 52 ? "12 months" : "12 weeks"}.`} />
      <Diary initial={JSON.parse(JSON.stringify(rows))} />
    </>
  );
}
