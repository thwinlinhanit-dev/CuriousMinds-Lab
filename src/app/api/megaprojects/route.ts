import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { fbLoad, fbSave } from "@/db/helpers";
import { v4 as uuid } from "uuid";

const XP_REWARD = 100;

const mapRow = (r: any) => ({
  id: r.id,
  checkedSteps: typeof r.checked_steps === "string" ? JSON.parse(r.checked_steps) : r.checkedSteps ?? [],
  status: r.status ?? "in_progress",
  completedAt: r.completed_at ?? r.completedAt,
  updatedAt: r.updated_at ?? r.updatedAt,
});

function completedCount(rows: Array<{ status: string }>): number {
  return rows.filter((r) => r.status === "completed").length;
}

// GET all mega-project progress
export async function GET() {
  if (!useFallback && sqlite) {
    try {
      const rows = sqlite.prepare("SELECT * FROM project_progress").all() as any[];
      return NextResponse.json(rows.map(mapRow));
    } catch {
      return NextResponse.json([]);
    }
  }
  return NextResponse.json(((fbLoad()["project_progress"] ?? []) as any[]).map(mapRow));
}

// Award project achievements inline (the generic engine also knows this
// criteria type, and skips already-earned ones, so this is race-safe).
function awardProjectAchievements(count: number): Array<{ id: string; name: string; icon: string }> {
  const out: Array<{ id: string; name: string; icon: string }> = [];
  const targets = [
    { id: "ach-project-starter", need: 1 },
    { id: "ach-project-master", need: 5 },
  ];
  for (const t of targets) {
    if (count < t.need) continue;
    if (!useFallback && sqlite) {
      const ach = sqlite.prepare("SELECT * FROM achievements WHERE id=?").get(t.id) as any;
      const has = sqlite.prepare("SELECT 1 as x FROM earned_achievements WHERE achievement_id=?").get(t.id) as any;
      if (ach && !has) {
        sqlite.prepare("INSERT INTO earned_achievements (id,achievement_id,earned_at,seen) VALUES (?,?,?,0)").run(uuid(), t.id, new Date().toISOString());
        sqlite.prepare("UPDATE profile SET total_xp = total_xp + ? WHERE id='default-child'").run(ach.xp_bonus ?? 0);
        out.push({ id: ach.id, name: ach.name, icon: ach.icon });
      }
    } else {
      const store = fbLoad();
      const ach = (store["achievements"] ?? []).find((a: any) => a.id === t.id);
      const has = (store["earned_achievements"] ?? []).some((e: any) => (e.achievementId ?? e.achievement_id) === t.id);
      if (ach && !has) {
        store["earned_achievements"] = [...(store["earned_achievements"] ?? []), { id: uuid(), achievementId: t.id, earnedAt: new Date().toISOString(), seen: false }];
        const p = (store["profile"] ?? [])[0] ?? { id: "default-child", totalXp: 0 };
        p.totalXp = (p.totalXp ?? 0) + (ach.xpBonus ?? ach.xp_bonus ?? 0);
        store["profile"] = [p];
        fbSave(store);
        out.push({ id: ach.id, name: ach.name, icon: ach.icon });
      }
    }
  }
  return out;
}

// POST { id, checkedSteps, totalSteps } — save checklist; awards XP on first completion
export async function POST(request: Request) {
  const { id, checkedSteps = [], totalSteps = 1 } = await request.json();
  const now = new Date().toISOString();
  const done = checkedSteps.length >= totalSteps;
  let newlyCompleted = false;

  if (!useFallback && sqlite) {
    const ex = sqlite.prepare("SELECT * FROM project_progress WHERE id=?").get(id) as any;
    if (ex) {
      if (ex.status !== "completed" && done) {
        newlyCompleted = true;
        sqlite.prepare("UPDATE project_progress SET checked_steps=?, status='completed', completed_at=?, updated_at=? WHERE id=?").run(
          JSON.stringify(checkedSteps), now, now, id
        );
      } else {
        sqlite.prepare("UPDATE project_progress SET checked_steps=?, updated_at=? WHERE id=?").run(JSON.stringify(checkedSteps), now, id);
      }
    } else {
      sqlite.prepare("INSERT INTO project_progress (id,checked_steps,status,completed_at,updated_at) VALUES (?,?,?,?,?)").run(
        id, JSON.stringify(checkedSteps), done ? "completed" : "in_progress", done ? now : null, now
      );
      newlyCompleted = done;
    }
    if (newlyCompleted) {
      sqlite.prepare("UPDATE profile SET total_xp = total_xp + ? WHERE id='default-child'").run(XP_REWARD);
    }
  } else {
    const store = fbLoad();
    store["project_progress"] = store["project_progress"] ?? [];
    const ex = (store["project_progress"] as any[]).find((p: any) => p.id === id);
    if (ex) {
      if (ex.status !== "completed" && done) {
        newlyCompleted = true;
        Object.assign(ex, { checkedSteps, status: "completed", completedAt: now, updatedAt: now });
      } else Object.assign(ex, { checkedSteps, updatedAt: now });
    } else {
      (store["project_progress"] as any[]).push({ id, checkedSteps, status: done ? "completed" : "in_progress", completedAt: done ? now : null, updatedAt: now });
      newlyCompleted = done;
    }
    if (newlyCompleted) {
      const p = (store["profile"] ?? [])[0] ?? { id: "default-child", totalXp: 0 };
      p.totalXp = (p.totalXp ?? 0) + XP_REWARD;
      store["profile"] = [p];
    }
    fbSave(store);
  }

  let newAchievements: Array<{ id: string; name: string; icon: string }> = [];
  if (newlyCompleted) {
    const all = await fetchAllProgress();
    newAchievements = awardProjectAchievements(completedCount(all));
  }

  return NextResponse.json({ success: true, newlyCompleted, xpAwarded: newlyCompleted ? XP_REWARD : 0, newAchievements });
}

async function fetchAllProgress(): Promise<Array<{ status: string }>> {
  if (!useFallback && sqlite) {
    try {
      return (sqlite.prepare("SELECT status FROM project_progress").all() as any[]).map((r) => ({ status: r.status }));
    } catch {
      return [];
    }
  }
  return ((fbLoad()["project_progress"] ?? []) as any[]).map((r: any) => ({ status: r.status ?? "in_progress" }));
}
