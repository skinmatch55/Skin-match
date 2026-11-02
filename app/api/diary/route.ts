import { z } from "zod";
import { asUser } from "@/lib/db";
import { apiViewer } from "@/lib/guard";
import { fail, json } from "@/lib/http";
import { track } from "@/lib/kwop";

const s = z.number().int().min(1).max(5);
const Body = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  breakouts: s,
  dryness: s,
  redness: s,
  oiliness: s,
  glow: s,
  note: z.string().max(500).default(""),
});

/** Skin diary check-in (one per day; saving the same day updates it). Pro and Plus. */
export async function POST(req: Request) {
  const g = await apiViewer({ paid: true });
  if (g.error) return g.error;
  if (g.v.tier === "basic") return fail("upgrade", 402);
  let b: z.infer<typeof Body>;
  try {
    b = Body.parse(await req.json());
  } catch {
    return fail("bad_request");
  }
  const d = new Date(b.entry_date + "T12:00:00Z");
  if (isNaN(d.getTime()) || d.getTime() > Date.now() + 2 * 86400000) return fail("bad_date");
  const row = await asUser(g.v.user.id, async (tx) => {
    const [r] = await tx`insert into public.diary_entries (user_id, entry_date, breakouts, dryness, redness, oiliness, glow, note)
      values (${g.v.user.id}, ${b.entry_date}, ${b.breakouts}, ${b.dryness}, ${b.redness}, ${b.oiliness}, ${b.glow}, ${b.note})
      on conflict (user_id, entry_date) do update set breakouts = excluded.breakouts, dryness = excluded.dryness,
        redness = excluded.redness, oiliness = excluded.oiliness, glow = excluded.glow, note = excluded.note
      returning *`;
    return r;
  });
  track("feature_used", g.v.user.email, "skin_diary");
  return json({ entry: row });
}
