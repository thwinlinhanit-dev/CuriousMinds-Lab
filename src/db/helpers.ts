// Tiny data-access helper that works with better-sqlite3 OR the JSON fallback.
import { sqlite, useFallback } from "./index";
import fs from "fs";
import path from "path";

const FALLBACK_PATH = path.join(process.cwd(), "data", "fallback.json");

export function fbLoad(): Record<string, any[]> {
  try {
    return JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf-8"));
  } catch {
    return {};
  }
}
export function fbSave(store: Record<string, any[]>) {
  fs.mkdirSync(path.dirname(FALLBACK_PATH), { recursive: true });
  fs.writeFileSync(FALLBACK_PATH, JSON.stringify(store, null, 2));
}

const snakeToCamel = (row: any) => {
  const out: any = {};
  for (const k of Object.keys(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = row[k];
    out[k] = row[k];
  }
  return out;
};

export const DAL = {
  get useSqlite() {
    return !useFallback && !!sqlite;
  },
  subjects(): any[] {
    if (this.useSqlite) return sqlite.prepare("SELECT * FROM subjects ORDER BY sort_order").all().map(snakeToCamel);
    return fbLoad()["subjects"] ?? [];
  },
  modules(subjectId?: string): any[] {
    if (this.useSqlite) {
      const rows = subjectId
        ? sqlite.prepare("SELECT * FROM modules WHERE subject_id=? ORDER BY sort_order").all(subjectId)
        : sqlite.prepare("SELECT * FROM modules ORDER BY sort_order").all();
      return rows.map(snakeToCamel);
    }
    const all = fbLoad()["modules"] ?? [];
    const list = subjectId ? all.filter((m: any) => m.subjectId === subjectId || m.subject_id === subjectId) : all;
    return list.map((m: any) => snakeToCamel({ ...m, subject_id: m.subjectId ?? m.subject_id, sort_order: m.sortOrder ?? m.sort_order }));
  },
  moduleById(id: string): any | null {
    if (this.useSqlite) {
      const row = sqlite.prepare("SELECT * FROM modules WHERE id=?").get(id);
      return row ? snakeToCamel(row) : null;
    }
    return (fbLoad()["modules"] ?? []).find((m: any) => m.id === id) ?? null;
  },
  activities(moduleId: string): any[] {
    if (this.useSqlite) return sqlite.prepare("SELECT * FROM activities WHERE module_id=? ORDER BY sort_order").all(moduleId).map(snakeToCamel);
    return ((fbLoad()["activities"] ?? []) as any[]).filter((a: any) => (a.moduleId ?? a.module_id) === moduleId);
  },
  activitiesAll(): any[] {
    if (this.useSqlite) return sqlite.prepare("SELECT * FROM activities").all().map(snakeToCamel);
    return fbLoad()["activities"] ?? [];
  },
  profile(): any {
    if (this.useSqlite) {
      let row = sqlite.prepare("SELECT * FROM profile WHERE id='default-child'").get();
      if (!row) {
        sqlite.prepare("INSERT INTO profile (id,name,age) VALUES ('default-child','Explorer',8)").run();
        row = sqlite.prepare("SELECT * FROM profile WHERE id='default-child'").get();
      }
      return snakeToCamel(row);
    }
    const store = fbLoad();
    let p = (store["profile"] ?? [])[0];
    if (!p) {
      p = { id: "default-child", name: "Explorer", age: 8, totalXp: 0, currentLevel: 1, currentStreak: 0, longestStreak: 0 };
      store["profile"] = [p];
      fbSave(store);
    }
    return p;
  },
  progressAll(): any {
    if (this.useSqlite) {
      return {
        moduleProgress: sqlite.prepare("SELECT * FROM module_progress").all().map(snakeToCamel),
        dailyActivity: sqlite.prepare("SELECT * FROM daily_activity ORDER BY date DESC LIMIT 30").all().map(snakeToCamel),
        earned: sqlite.prepare("SELECT * FROM earned_achievements").all().map(snakeToCamel),
      };
    }
    const store = fbLoad();
    return {
      moduleProgress: store["module_progress"] ?? [],
      dailyActivity: (store["daily_activity"] ?? []).slice(-30).reverse(),
      earned: store["earned_achievements"] ?? [],
    };
  },
};
