import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { DAL, fbLoad, fbSave } from "@/db/helpers";
import { v4 as uuid } from "uuid";

function calcXP(status?: string, score?: number, timeSpent?: number): number {
  let xp = 0;
  if (timeSpent && timeSpent > 30) xp += 5;
  if (timeSpent && timeSpent > 120) xp += 5;
  if (status === "completed") xp += 15;
  if (score && score > 80) xp += 10;
  if (score && score === 100) xp += 5;
  return xp;
}

function allAchievements(): any[] {
  if (!useFallback && sqlite) return sqlite.prepare("SELECT * FROM achievements").all();
  return fbLoad()["achievements"] ?? [];
}

function checkAndAward(getCount: (type: string, criteria: any) => number): Array<{ id: string; name: string; icon: string }> {
  const newly: Array<{ id: string; name: string; icon: string }> = [];
  const achs = allAchievements();
  const earned: Set<string> = new Set(
    (!useFallback && sqlite
      ? (sqlite.prepare("SELECT achievement_id as id FROM earned_achievements").all() as any[])
      : (fbLoad()["earned_achievements"] ?? [])
    ).map((e: any) => e.achievementId ?? e.achievement_id ?? e.id)
  );
  for (const ach of achs) {
    const id = ach.id;
    if (earned.has(id)) continue;
    let criteria: any = {};
    try { criteria = JSON.parse(ach.criteria); } catch {}
    let met = false;
    if (criteria.type === "time_of_day") {
      const h = new Date().getHours();
      if (criteria.after) met = h >= parseInt(criteria.after.split(":")[0]);
      else if (criteria.before) met = h < parseInt(criteria.before.split(":")[0]);
    } else {
      met = getCount(criteria.type, criteria) >= (criteria.count ?? 1);
    }
    if (met) {
      const now = new Date().toISOString();
      if (!useFallback && sqlite) {
        sqlite.prepare("INSERT INTO earned_achievements (id,achievement_id,earned_at,seen) VALUES (?,?,?,0)").run(uuid(), id, now);
        sqlite.prepare("UPDATE profile SET total_xp = total_xp + ? WHERE id='default-child'").run(ach.xp_bonus ?? ach.xpBonus ?? 0);
      } else {
        const store = fbLoad();
        store["earned_achievements"] = [...(store["earned_achievements"] ?? []), { id: uuid(), achievementId: id, earnedAt: now, seen: false }];
        const p = (store["profile"] ?? [])[0] ?? { id: "default-child", totalXp: 0 };
        p.totalXp = (p.totalXp ?? p.total_xp ?? 0) + (ach.xpBonus ?? ach.xp_bonus ?? 0);
        store["profile"] = [p];
        fbSave(store);
      }
      newly.push({ id, name: ach.name, icon: ach.icon });
    }
  }
  return newly;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { moduleId, timeSpentSeconds = 0, score, status, difficulty } = body;
  const today = new Date().toISOString().split("T")[0];
  const xpGained = calcXP(status, score, timeSpentSeconds);

  if (!useFallback && sqlite) {
    const ex = sqlite.prepare("SELECT * FROM module_progress WHERE module_id=?").get(moduleId) as any;
    if (ex) {
      sqlite.prepare("UPDATE module_progress SET status=?, total_time_seconds=?, times_opened=?, last_opened_at=?, best_score=?, completed_at=?, current_difficulty=? WHERE module_id=?").run(
        status || ex.status, (ex.total_time_seconds || 0) + timeSpentSeconds, (ex.times_opened || 0) + 1,
        new Date().toISOString(), score && score > (ex.best_score || 0) ? score : ex.best_score,
        status === "completed" ? new Date().toISOString() : ex.completed_at, difficulty ?? ex.current_difficulty ?? 1, moduleId
      );
    } else {
      sqlite.prepare("INSERT INTO module_progress (id,module_id,status,total_time_seconds,times_opened,last_opened_at,best_score) VALUES (?,?,?,?,?,?,?)").run(
        uuid(), moduleId, status || "in_progress", timeSpentSeconds, 1, new Date().toISOString(), score || 0
      );
    }
    const daily = sqlite.prepare("SELECT * FROM daily_activity WHERE date=?").get(today) as any;
    const mins = Math.round(timeSpentSeconds / 60);
    if (daily) {
      let visited: string[] = [];
      try { visited = JSON.parse(daily.modules_visited || "[]"); } catch {}
      if (!visited.includes(moduleId)) visited.push(moduleId);
      sqlite.prepare("UPDATE daily_activity SET total_minutes=?, activities_completed=?, modules_visited=?, xp_earned=? WHERE date=?").run(
        (daily.total_minutes || 0) + mins,
        status === "completed" ? (daily.activities_completed || 0) + 1 : daily.activities_completed,
        JSON.stringify(visited), (daily.xp_earned || 0) + xpGained, today
      );
    } else {
      sqlite.prepare("INSERT INTO daily_activity (id,date,total_minutes,activities_completed,xp_earned,modules_visited) VALUES (?,?,?,?,?,?)").run(
        uuid(), today, mins, status === "completed" ? 1 : 0, xpGained, JSON.stringify([moduleId])
      );
    }
    if (xpGained > 0) sqlite.prepare("UPDATE profile SET total_xp = total_xp + ?, last_active_date=? WHERE id='default-child'").run(xpGained, today);
    // streak
    const prof = sqlite.prepare("SELECT * FROM profile WHERE id='default-child'").get() as any;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (prof.last_active_date === yesterday) {
      const ns = (prof.current_streak || 0) + 1;
      sqlite.prepare("UPDATE profile SET current_streak=?, longest_streak=?, last_active_date=? WHERE id='default-child'").run(ns, Math.max(ns, prof.longest_streak || 0), today);
    } else if (prof.last_active_date !== today) {
      sqlite.prepare("UPDATE profile SET current_streak=1, last_active_date=? WHERE id='default-child'").run(today);
    }

    const getCount = (type: string, criteria: any): number => {
      if (type === "modules_opened") return (sqlite.prepare("SELECT COUNT(*) as c FROM module_progress").get() as any).c;
      if (type === "modules_completed") return (sqlite.prepare("SELECT COUNT(*) as c FROM module_progress WHERE status='completed'").get() as any).c;
      if (type === "streak") return (sqlite.prepare("SELECT current_streak as s FROM profile WHERE id='default-child'").get() as any).s ?? 0;
      if (type === "subjects_visited") {
        const rows = sqlite.prepare("SELECT DISTINCT m.subject_id as s FROM module_progress p JOIN modules m ON m.id=p.module_id").all() as any[];
        return rows.length;
      }
      if (type === "subject_modules_completed") return (sqlite.prepare("SELECT COUNT(*) as c FROM module_progress p JOIN modules m ON m.id=p.module_id WHERE m.subject_id=? AND p.status='completed'").get(criteria.subject) as any).c;
      if (type === "specific_modules_completed") {
        const mods = criteria.modules as string[];
        const placeholders = mods.map(() => "?").join(",");
        return (sqlite.prepare(`SELECT COUNT(*) as c FROM module_progress WHERE module_id IN (${placeholders}) AND status='completed'`).get(...mods) as any).c === mods.length ? mods.length : 0;
      }
      if (type === "daily_minutes") return (sqlite.prepare("SELECT total_minutes as m FROM daily_activity WHERE date=?").get(today) as any)?.m ?? 0;
      if (type === "projects_saved") return (sqlite.prepare("SELECT COUNT(*) as c FROM saved_projects").get() as any).c;
      if (type === "journal_entries") return (sqlite.prepare("SELECT COUNT(*) as c FROM journal_entries").get() as any).c;
      if (type === "megaprojects_completed") {
        try {
          return (sqlite.prepare("SELECT COUNT(*) as c FROM project_progress WHERE status='completed'").get() as any).c;
        } catch { return 0; }
      }
      if (type === "phet_opened") return (sqlite.prepare("SELECT COUNT(*) as c FROM module_progress p JOIN modules m ON m.id=p.module_id WHERE m.simulation_type='phet-embed'").get() as any).c;
      if (type === "phet_completed") return (sqlite.prepare("SELECT COUNT(*) as c FROM module_progress p JOIN modules m ON m.id=p.module_id WHERE m.simulation_type='phet-embed' AND p.status='completed'").get() as any).c;
      if (type === "embed_source_completed") return (sqlite.prepare("SELECT COUNT(*) as c FROM module_progress p JOIN modules m ON m.id=p.module_id WHERE m.simulation_type='embed-lab' AND json_extract(m.default_config,'$.source')=? AND p.status='completed'").get(criteria.source) as any).c;
      return 0;
    };
    const newAchievements = checkAndAward(getCount);
    const totalXp = (sqlite.prepare("SELECT total_xp as t FROM profile WHERE id='default-child'").get() as any).t ?? 0;
    return NextResponse.json({ xpGained, newAchievements, totalXp });
  }

  // Fallback (JSON) path
  const store = fbLoad();
  store["module_progress"] = store["module_progress"] ?? [];
  let ex = (store["module_progress"] as any[]).find((p: any) => (p.moduleId ?? p.module_id) === moduleId);
  if (ex) {
    ex.totalTimeSeconds = (ex.totalTimeSeconds ?? 0) + timeSpentSeconds;
    ex.timesOpened = (ex.timesOpened ?? 0) + 1;
    if (status) ex.status = status;
    if (score && score > (ex.bestScore ?? 0)) ex.bestScore = score;
  } else {
    store["module_progress"].push({ id: uuid(), moduleId, status: status || "in_progress", totalTimeSeconds: timeSpentSeconds, timesOpened: 1, bestScore: score || 0 });
  }
  const p = (store["profile"] ?? [])[0] ?? { id: "default-child", totalXp: 0, currentStreak: 0, longestStreak: 0 };
  p.totalXp = (p.totalXp ?? 0) + xpGained;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (p.lastActiveDate === yesterday) {
    p.currentStreak = (p.currentStreak || 0) + 1;
    p.longestStreak = Math.max(p.currentStreak, p.longestStreak || 0);
  } else if (p.lastActiveDate !== today) {
    p.currentStreak = 1;
  }
  p.lastActiveDate = today;
  store["profile"] = [p];
  fbSave(store);
  const getCount = (type: string, criteria: any): number => {
    if (type === "modules_opened") return store["module_progress"].length;
    if (type === "modules_completed") return store["module_progress"].filter((x: any) => x.status === "completed").length;
    if (type === "streak") return p.currentStreak || 0;
    if (type === "megaprojects_completed") return (store["project_progress"] ?? []).filter((x: any) => x.status === "completed").length;
    if (type === "phet_opened" || type === "phet_completed") {
      const phetIds = new Set((store["modules"] ?? []).filter((m: any) => (m.simulationType ?? m.simulation_type) === "phet-embed").map((m: any) => m.id));
      const rows = (store["module_progress"] ?? []).filter((x: any) => phetIds.has(x.moduleId ?? x.module_id));
      return type === "phet_opened" ? rows.length : rows.filter((x: any) => x.status === "completed").length;
    }
    if (type === "embed_source_completed") {
      const ids = new Set(
        (store["modules"] ?? [])
          .filter((m: any) => {
            if ((m.simulationType ?? m.simulation_type) !== "embed-lab") return false;
            try { return (typeof m.defaultConfig === "string" ? JSON.parse(m.defaultConfig) : m.defaultConfig ?? {}).source === criteria.source; } catch { return false; }
          })
          .map((m: any) => m.id)
      );
      return (store["module_progress"] ?? []).filter((x: any) => ids.has(x.moduleId ?? x.module_id) && x.status === "completed").length;
    }
    return 0;
  };
  const newAchievements = checkAndAward(getCount);
  return NextResponse.json({ xpGained, newAchievements, totalXp: p.totalXp });
}

export async function GET() {
  const data = DAL.progressAll();
  return NextResponse.json({ profile: DAL.profile(), ...data });
}
