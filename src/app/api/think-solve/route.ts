import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { DAL, fbLoad, fbSave } from "@/db/helpers";
import { v4 as uuid } from "uuid";
import { scenarioFor } from "@/lib/scenarios";

// Think & Solve: records attempts and awards XP once per lab when the child
// marks the scenario solved. Auto-check is lenient (keyword overlap) and the
// child can always self-mark after comparing with the expert answer.

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "it", "on", "for", "with", "that", "this", "be", "are", "as", "by", "at", "was", "were", "you", "your"]);

function keywords(s: string): string[] {
  return Array.from(new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w))));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  const m = DAL.moduleById(moduleId);
  if (!m) return NextResponse.json({ error: "not found" }, { status: 404 });
  const scenario = scenarioFor(m.id, m.subjectId ?? m.subject_id, m.title, m.difficulty ?? 1);
  // Never leak the solution on GET — the client asks to reveal it.
  const progress = getProgress(moduleId);
  return NextResponse.json({
    scenario: { skill: scenario.skill, skillIcon: scenario.skillIcon, skillLabel: scenario.skillLabel, prompt: scenario.prompt, hint: scenario.hint, xp: scenario.xp },
    attempts: progress?.attempts ?? 0,
    solved: !!progress?.solved,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { moduleId, action, answer } = body ?? {};
  if (!moduleId || !action) return NextResponse.json({ error: "moduleId and action required" }, { status: 400 });
  const m = DAL.moduleById(moduleId);
  if (!m) return NextResponse.json({ error: "not found" }, { status: 404 });
  const scenario = scenarioFor(m.id, m.subjectId ?? m.subject_id, m.title, m.difficulty ?? 1);

  if (action === "check") {
    const a = String(answer ?? "");
    if (a.trim().length < 10) {
      return NextResponse.json({ verdict: "too_short", message: "Write a few more thoughts first! ✏️", solution: null });
    }
    const aKw = new Set(keywords(a));
    const sKw = keywords(scenario.solution);
    let hits = 0;
    for (const k of sKw) if (aKw.has(k)) hits++;
    const overlap = sKw.length ? hits / sKw.length : 0;
    const verdict = overlap >= 0.12 ? "strong" : overlap >= 0.04 ? "partial" : "different";
    recordAttempt(moduleId, verdict);
    const messages = {
      strong: "🎯 Excellent reasoning — you hit the key ideas!",
      partial: "👍 Good thinking! You touched some key ideas — compare with the expert answer below.",
      different: "🤔 A different angle! Compare your idea with the expert answer — different-but-reasoned still counts.",
    };
    return NextResponse.json({ verdict, message: messages[verdict as keyof typeof messages], solution: scenario.solution, hintUsedAlready: undefined });
  }

  if (action === "reveal") {
    return NextResponse.json({ solution: scenario.solution });
  }

  if (action === "solved") {
    const p = getProgress(moduleId);
    const already = !!p?.solved;
    if (!already) markSolved(moduleId, scenario.xp);
    return NextResponse.json({ xpGained: already ? 0 : scenario.xp, solved: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}

function getProgress(moduleId: string): { attempts: number; solved: boolean } | null {
  if (!useFallback && sqlite) {
    const row = sqlite.prepare("SELECT attempts, solved FROM think_solve_progress WHERE module_id=?").get(moduleId) as any;
    return row ? { attempts: row.attempts ?? 0, solved: !!row.solved } : null;
  }
  const row = (fbLoad()["think_solve_progress"] ?? []).find((r: any) => r.moduleId === moduleId);
  return row ? { attempts: row.attempts ?? 0, solved: !!row.solved } : null;
}

function recordAttempt(moduleId: string, verdict: string) {
  if (!useFallback && sqlite) {
    const ex = sqlite.prepare("SELECT attempts FROM think_solve_progress WHERE module_id=?").get(moduleId) as any;
    if (ex) sqlite.prepare("UPDATE think_solve_progress SET attempts=?, last_verdict=?, updated_at=? WHERE module_id=?").run((ex.attempts ?? 0) + 1, verdict, new Date().toISOString(), moduleId);
    else sqlite.prepare("INSERT INTO think_solve_progress (id,module_id,attempts,last_verdict,updated_at) VALUES (?,?,?,?,?)").run(uuid(), moduleId, 1, verdict, new Date().toISOString());
    return;
  }
  const store = fbLoad();
  store["think_solve_progress"] = store["think_solve_progress"] ?? [];
  const row = (store["think_solve_progress"] as any[]).find((r) => r.moduleId === moduleId);
  if (row) { row.attempts = (row.attempts ?? 0) + 1; row.lastVerdict = verdict; row.updatedAt = new Date().toISOString(); }
  else store["think_solve_progress"].push({ id: uuid(), moduleId, attempts: 1, lastVerdict: verdict, updatedAt: new Date().toISOString() });
  fbSave(store);
}

function markSolved(moduleId: string, xp: number) {
  if (!useFallback && sqlite) {
    const ex = sqlite.prepare("SELECT attempts FROM think_solve_progress WHERE module_id=?").get(moduleId) as any;
    if (ex) sqlite.prepare("UPDATE think_solve_progress SET solved=1, updated_at=? WHERE module_id=?").run(new Date().toISOString(), moduleId);
    else sqlite.prepare("INSERT INTO think_solve_progress (id,module_id,attempts,solved,updated_at) VALUES (?,?,0,1,?)").run(uuid(), moduleId, new Date().toISOString());
    // Award XP to profile (Think & Solve bonus)
    sqlite.prepare("UPDATE profile SET total_xp = total_xp + ? WHERE id='default-child'").run(xp);
    return;
  }
  const store = fbLoad();
  store["think_solve_progress"] = store["think_solve_progress"] ?? [];
  const row = (store["think_solve_progress"] as any[]).find((r) => r.moduleId === moduleId);
  if (row) row.solved = true;
  else store["think_solve_progress"].push({ id: uuid(), moduleId, attempts: 0, solved: true });
  const p = (store["profile"] ?? [])[0] ?? { id: "default-child", totalXp: 0 };
  p.totalXp = (p.totalXp ?? 0) + xp;
  store["profile"] = [p];
  fbSave(store);
}
