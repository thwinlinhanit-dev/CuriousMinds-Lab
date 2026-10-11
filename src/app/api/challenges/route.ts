import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { fbLoad, fbSave } from "@/db/helpers";
import { challengeForDate } from "@/lib/challenges";
import { v4 as uuid } from "uuid";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const def = challengeForDate(today);
  if (!useFallback && sqlite) {
    let row = sqlite.prepare("SELECT * FROM daily_challenges WHERE date=?").get(today) as any;
    if (!row) {
      const id = uuid();
      sqlite.prepare("INSERT INTO daily_challenges (id,date,title,description,subject_id,module_id,challenge_config,xp_reward,completed) VALUES (?,?,?,?,?,?,?,?,0)").run(
        id, today, def.title, def.description, def.subjectId, def.moduleId, JSON.stringify(def), def.xpReward
      );
      row = sqlite.prepare("SELECT * FROM daily_challenges WHERE date=?").get(today) as any;
    }
    return NextResponse.json({ date: today, title: row.title, description: row.description, subjectId: row.subject_id, moduleId: row.module_id, xpReward: row.xp_reward, completed: !!row.completed });
  }
  const store = fbLoad();
  let row = (store["daily_challenges"] ?? []).find((c: any) => c.date === today);
  if (!row) {
    row = { id: uuid(), date: today, ...def, completed: false };
    store["daily_challenges"] = [...(store["daily_challenges"] ?? []), row];
    fbSave(store);
  }
  return NextResponse.json(row);
}

export async function POST() {
  const today = new Date().toISOString().split("T")[0];
  if (!useFallback && sqlite) {
    sqlite.prepare("UPDATE daily_challenges SET completed=1, completed_at=? WHERE date=?").run(new Date().toISOString(), today);
    sqlite.prepare("UPDATE profile SET total_xp = total_xp + 25 WHERE id='default-child'").run();
  } else {
    const store = fbLoad();
    store["daily_challenges"] = (store["daily_challenges"] ?? []).map((c: any) => (c.date === today ? { ...c, completed: true } : c));
    const p = (store["profile"] ?? [])[0];
    if (p) p.totalXp = (p.totalXp ?? 0) + 25;
    fbSave(store);
  }
  return NextResponse.json({ success: true });
}
