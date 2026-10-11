import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { fbLoad, fbSave } from "@/db/helpers";

// Spaced-repetition intervals in days per mastery level 0..5
const INTERVALS = [1, 1, 3, 7, 14, 30];

const mapRow = (r: any) => ({
  id: r.id, word: r.word, definition: r.definition, example: r.example,
  subject: r.subject, moduleId: r.module_id ?? r.moduleId,
  mastery: r.mastery ?? 0, nextReviewDate: r.next_review_date ?? r.nextReviewDate,
  timesReviewed: r.times_reviewed ?? r.timesReviewed ?? 0,
  addedAt: r.created_at ?? r.addedAt ?? r.added_at,
});

export async function GET() {
  if (!useFallback && sqlite) {
    const rows = sqlite.prepare("SELECT * FROM vocabulary ORDER BY mastery ASC, word ASC").all() as any[];
    return NextResponse.json(rows.map(mapRow));
  }
  const store = fbLoad();
  return NextResponse.json(((store["vocabulary"] ?? []) as any[]).map(mapRow));
}

// Collect words discovered in a lab (idempotent)
export async function POST(request: Request) {
  const body = await request.json();
  const words: Array<{ word: string; definition: string; example?: string; subject: string; moduleId?: string }> = body.words ?? [];
  const now = new Date().toISOString();
  let added = 0;
  if (!useFallback && sqlite) {
    const ins = sqlite.prepare(
      "INSERT OR IGNORE INTO vocabulary (id,word,definition,example,subject,module_id,mastery,next_review_date,times_reviewed,added_at) VALUES (?,?,?,?,?,?,0,?,0,?)"
    );
    const today = now.split("T")[0];
    for (const w of words) {
      if (!w.word || !w.definition) continue;
      const id = `${w.moduleId ?? "general"}::${w.word.toLowerCase()}`;
      const r = ins.run(id, w.word, w.definition, w.example ?? null, w.subject, w.moduleId ?? null, today, now);
      added += Number(r.changes > 0);
    }
  } else {
    const store = fbLoad();
    store["vocabulary"] = store["vocabulary"] ?? [];
    const today = now.split("T")[0];
    for (const w of words) {
      if (!w.word || !w.definition) continue;
      const id = `${w.moduleId ?? "general"}::${w.word.toLowerCase()}`;
      if (!(store["vocabulary"] as any[]).some((v: any) => v.id === id)) {
        (store["vocabulary"] as any[]).push({ id, ...w, mastery: 0, nextReviewDate: today, timesReviewed: 0, addedAt: now });
        added++;
      }
    }
    fbSave(store);
  }
  return NextResponse.json({ success: true, added });
}

// Review a word: { id, knew } → mastery up/down + next review date
export async function PUT(request: Request) {
  const { id, knew } = await request.json();
  const get = () => {
    if (!useFallback && sqlite) return sqlite.prepare("SELECT * FROM vocabulary WHERE id=?").get(id) as any;
    return (fbLoad()["vocabulary"] ?? []).find((v: any) => v.id === id);
  };
  const row = get();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const cur = row.mastery ?? 0;
  const next = knew ? Math.min(5, cur + 1) : 0;
  const d = new Date();
  d.setDate(d.getDate() + INTERVALS[next]);
  const nextDate = d.toISOString().split("T")[0];
  const times = (row.times_reviewed ?? row.timesReviewed ?? 0) + 1;
  if (!useFallback && sqlite) {
    sqlite.prepare("UPDATE vocabulary SET mastery=?, next_review_date=?, times_reviewed=? WHERE id=?").run(next, nextDate, times, id);
  } else {
    const store = fbLoad();
    store["vocabulary"] = (store["vocabulary"] ?? []).map((v: any) =>
      v.id === id ? { ...v, mastery: next, nextReviewDate: nextDate, timesReviewed: times } : v
    );
    fbSave(store);
  }
  return NextResponse.json({ success: true, mastery: next, nextReviewDate: nextDate });
}
