import { SUBJECTS, PHYSICS, CHEMISTRY } from "./seed-data-1";
import { BIOLOGY, EARTHSPACE, MATH } from "./seed-data-2";
import { MUSIC, ART, CS, LANGUAGE, ACHIEVEMENTS } from "./seed-data-3";
import { PHYSICS2, CHEMISTRY2, BIOLOGY2, EARTHSPACE2 } from "./seed-data-4";
import { MATH2, MUSIC2, ART2, CS2, LANGUAGE2, ACHIEVEMENTS2 } from "./seed-data-5";
import { PHET_PHYSICS, PHET_CHEMISTRY } from "./seed-data-phet1";
import { PHET_BIO, PHET_EARTH, PHET_MATH } from "./seed-data-phet2";
import { CML_MUSIC, WEB_EARTH, SKETCH_BIO, SCRATCH_CS, ACH_EMBED } from "./seed-data-embed1";
import { JAVA_PHYSICS, JAVA_CHEM, JAVA_EARTH, JAVA_BIO, JAVA_MATH, JAVA_CS, JAVA_ART } from "./seed-data-embed2";
import { GEO_SUBJECT, WAVE2_MATH, WAVE2_EARTH, WAVE2_CHEM, WAVE2_PHYS, WAVE2_CS, WAVE2_ART, GEO_LABS, ACH_WAVE2 } from "./seed-data-embed3";
import { WAVE3_CS, WAVE3_MUSIC, WAVE3_ART, WAVE3_GEO, ACH_WAVE3 } from "./seed-data-embed4";
import { FENDT_PHYS, FENDT_ASTRO, FENDT_MATH, TOY_MATH, BLOCKLY_CS, MYPHYS, ACH_WAVE4 } from "./seed-data-embed5";
import { CHIARK_MATH, WGG_GEO, WAVE5_SINGLES, ACH_WAVE5 } from "./seed-data-embed6";
import { WAVE6_MATH, WAVE6_PHYSICS, WAVE6_CHEMISTRY, WAVE6_BIOLOGY, WAVE6_EARTHSPACE, WAVE6_GEOGRAPHY, WAVE6_MUSIC, WAVE6_ART, WAVE6_CS, WAVE6_LANGUAGE, WAVE6_ACHIEVEMENTS } from "./seed-data-embed7";
import { WAVE7_LANGUAGE, WAVE7_GEOGRAPHY, WAVE7_ACHIEVEMENTS } from "./seed-data-embed8";
import { WAVE8_ART, WAVE8_MUSIC, WAVE8_ACHIEVEMENTS } from "./seed-data-embed9";
import { MILESTONE_PHYSICS, MILESTONE_MATH, MILESTONE_CHEMISTRY, MILESTONE_BIOLOGY, MILESTONE_EARTHSPACE, MILESTONE_MUSIC, MILESTONE_GEOGRAPHY, MILESTONE_CS, MILESTONE_LANGUAGE, MILESTONE_ART, MILESTONE_ACHIEVEMENTS } from "./seed-data-embed10";
import { CIECH_EARTHSPACE, CIECH_PHYSICS, CIECH_MATH, CIECH_CS, ACH_CIECH } from "./seed-data-ciechanow";
import { pathAchievements } from "@/lib/paths";

const ALL_SUBJECTS: any[] = [...SUBJECTS, GEO_SUBJECT];

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS profile (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Explorer', age INTEGER DEFAULT 8, avatar_emoji TEXT DEFAULT '🧑‍🚀', avatar_color TEXT DEFAULT '#3b82f6', preferred_difficulty TEXT DEFAULT 'auto', theme TEXT DEFAULT 'light', sound_enabled INTEGER DEFAULT 1, music_enabled INTEGER DEFAULT 1, animations_enabled INTEGER DEFAULT 1, font_size TEXT DEFAULT 'normal', daily_goal_minutes INTEGER DEFAULT 30, created_at TEXT, total_xp INTEGER DEFAULT 0, current_level INTEGER DEFAULT 1, current_streak INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, last_active_date TEXT);
CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL, description TEXT NOT NULL, sort_order INTEGER NOT NULL, total_modules INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, subject_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, long_description TEXT, icon TEXT NOT NULL, difficulty INTEGER DEFAULT 1, age_min INTEGER DEFAULT 5, age_max INTEGER DEFAULT 14, estimated_minutes INTEGER DEFAULT 15, sort_order INTEGER NOT NULL, simulation_type TEXT NOT NULL, default_config TEXT NOT NULL, learning_objectives TEXT NOT NULL, vocabulary_words TEXT, fun_facts TEXT, try_at_home TEXT, prerequisites TEXT, tags TEXT, is_unlocked INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, module_id TEXT NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL, instructions TEXT NOT NULL, config TEXT NOT NULL, hints TEXT, sort_order INTEGER NOT NULL, xp_reward INTEGER DEFAULT 10, difficulty INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS module_progress (id TEXT PRIMARY KEY, module_id TEXT NOT NULL, status TEXT DEFAULT 'not_started', best_score REAL DEFAULT 0, total_time_seconds INTEGER DEFAULT 0, times_opened INTEGER DEFAULT 0, last_opened_at TEXT, completed_at TEXT, current_difficulty INTEGER DEFAULT 1, notes TEXT);
CREATE TABLE IF NOT EXISTS activity_progress (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, module_id TEXT NOT NULL, status TEXT DEFAULT 'not_started', score REAL, attempts INTEGER DEFAULT 0, best_score REAL DEFAULT 0, total_time_seconds INTEGER DEFAULT 0, completed_at TEXT, response_data TEXT);
CREATE TABLE IF NOT EXISTS daily_activity (id TEXT PRIMARY KEY, date TEXT NOT NULL, total_minutes INTEGER DEFAULT 0, activities_completed INTEGER DEFAULT 0, xp_earned INTEGER DEFAULT 0, subjects_visited TEXT, modules_visited TEXT, streak_maintained INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS achievements (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, icon TEXT NOT NULL, category TEXT NOT NULL, criteria TEXT NOT NULL, xp_bonus INTEGER DEFAULT 50, rarity TEXT DEFAULT 'common', is_secret INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS earned_achievements (id TEXT PRIMARY KEY, achievement_id TEXT NOT NULL, earned_at TEXT NOT NULL, seen INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS saved_projects (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, module_id TEXT, subject_id TEXT, type TEXT NOT NULL, data TEXT NOT NULL, thumbnail TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, is_favorite INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS journal_entries (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, module_id TEXT, tags TEXT, mood TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS daily_challenges (id TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, subject_id TEXT, module_id TEXT, challenge_config TEXT NOT NULL, xp_reward INTEGER DEFAULT 25, completed INTEGER DEFAULT 0, completed_at TEXT);
CREATE TABLE IF NOT EXISTS vocabulary (id TEXT PRIMARY KEY, word TEXT NOT NULL, definition TEXT NOT NULL, example TEXT, subject TEXT NOT NULL, module_id TEXT, pronunciation TEXT, image_url TEXT, mastery INTEGER DEFAULT 0, next_review_date TEXT, times_reviewed INTEGER DEFAULT 0, added_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS project_progress (id TEXT PRIMARY KEY, checked_steps TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'in_progress', completed_at TEXT, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS think_solve_progress (id TEXT PRIMARY KEY, module_id TEXT NOT NULL, attempts INTEGER DEFAULT 0, solved INTEGER DEFAULT 0, last_verdict TEXT, updated_at TEXT);
`;

const ACTIVITY_TYPES = [
  { suffix: "explore", title: "Free Explore", type: "explore", instructions: "Play freely with the simulation. Try every control and observe what happens!", xp: 10 },
  { suffix: "guided", title: "Guided Mission", type: "guided", instructions: "Follow the mission steps shown in the simulation to complete the challenge.", xp: 15 },
  { suffix: "challenge", title: "Challenge Mode", type: "challenge", instructions: "Push yourself! Complete the hard challenge for bonus XP.", xp: 20 },
  { suffix: "quiz", title: "Knowledge Check", type: "quiz", instructions: "Answer the quiz questions to show what you learned.", xp: 15 },
];

const ALL_MODULES: any[] = [
  ...PHYSICS, ...CHEMISTRY, ...BIOLOGY, ...EARTHSPACE, ...MATH, ...MUSIC, ...ART, ...CS, ...LANGUAGE,
  ...PHYSICS2, ...CHEMISTRY2, ...BIOLOGY2, ...EARTHSPACE2, ...MATH2, ...MUSIC2, ...ART2, ...CS2, ...LANGUAGE2,
  ...PHET_PHYSICS, ...PHET_CHEMISTRY, ...PHET_BIO, ...PHET_EARTH, ...PHET_MATH,
  ...CML_MUSIC, ...WEB_EARTH, ...SKETCH_BIO, ...SCRATCH_CS,
  ...JAVA_PHYSICS, ...JAVA_CHEM, ...JAVA_EARTH, ...JAVA_BIO, ...JAVA_MATH, ...JAVA_CS, ...JAVA_ART,
  ...WAVE2_MATH, ...WAVE2_EARTH, ...WAVE2_CHEM, ...WAVE2_PHYS, ...WAVE2_CS, ...WAVE2_ART, ...GEO_LABS,
  ...WAVE3_CS, ...WAVE3_MUSIC, ...WAVE3_ART, ...WAVE3_GEO,
  ...FENDT_PHYS, ...FENDT_ASTRO, ...FENDT_MATH, ...TOY_MATH, ...BLOCKLY_CS, ...MYPHYS,
  ...CHIARK_MATH, ...WGG_GEO, ...WAVE5_SINGLES,
  ...WAVE6_MATH, ...WAVE6_PHYSICS, ...WAVE6_CHEMISTRY, ...WAVE6_BIOLOGY, ...WAVE6_EARTHSPACE, ...WAVE6_GEOGRAPHY, ...WAVE6_MUSIC, ...WAVE6_ART, ...WAVE6_CS, ...WAVE6_LANGUAGE,
  ...WAVE7_LANGUAGE, ...WAVE7_GEOGRAPHY,
  ...WAVE8_ART, ...WAVE8_MUSIC,
  ...MILESTONE_PHYSICS, ...MILESTONE_MATH, ...MILESTONE_CHEMISTRY, ...MILESTONE_BIOLOGY, ...MILESTONE_EARTHSPACE, ...MILESTONE_MUSIC, ...MILESTONE_GEOGRAPHY, ...MILESTONE_CS, ...MILESTONE_LANGUAGE, ...MILESTONE_ART,
  ...CIECH_EARTHSPACE, ...CIECH_PHYSICS, ...CIECH_MATH, ...CIECH_CS,
];
const ALL_ACHIEVEMENTS: any[] = [...ACHIEVEMENTS, ...ACHIEVEMENTS2, ...ACH_EMBED, ...ACH_WAVE2, ...ACH_WAVE3, ...ACH_WAVE4, ...ACH_WAVE5, ...WAVE6_ACHIEVEMENTS, ...WAVE7_ACHIEVEMENTS, ...WAVE8_ACHIEVEMENTS, ...MILESTONE_ACHIEVEMENTS, ...ACH_CIECH, ...pathAchievements()];

function activitiesFor(m: any) {
  return ACTIVITY_TYPES.map((a, i) => ({ id: `${m.id}-${a.suffix}`, moduleId: m.id, title: a.title, type: a.type, instructions: a.instructions, config: "{}", hints: "[]", sortOrder: i + 1, xpReward: a.xp, difficulty: m.difficulty }));
}

export async function seedDatabase() {
  const { sqlite, useFallback } = await import("./index");

  if (useFallback || !sqlite) {
    const fs = await import("fs");
    const path = await import("path");
    const fp = path.join(process.cwd(), "data", "fallback.json");
    let store: Record<string, any[]> = {};
    try { store = JSON.parse(fs.readFileSync(fp, "utf-8")); } catch {}
    // Additive: merge anything missing, never wipe progress
    const has = (t: string, id: string) => (store[t] ?? []).some((r: any) => r.id === id);
    store["subjects"] = [...(store["subjects"] ?? []), ...ALL_SUBJECTS.filter((s) => !has("subjects", s.id))];
    for (const m of ALL_MODULES) {
      if (!has("modules", m.id)) store["modules"] = [...(store["modules"] ?? []), m];
      for (const a of activitiesFor(m)) {
        if (!has("activities", a.id)) store["activities"] = [...(store["activities"] ?? []), a];
      }
    }
    store["achievements"] = [...(store["achievements"] ?? []), ...ALL_ACHIEVEMENTS.filter((a) => !has("achievements", a.id))];
    for (const t of ["profile", "module_progress", "activity_progress", "daily_activity", "earned_achievements", "saved_projects", "journal_entries", "daily_challenges", "vocabulary"]) {
      store[t] = store[t] ?? [];
    }
    if (store["profile"].length === 0) {
      store["profile"] = [{ id: "default-child", name: "Explorer", age: 8, totalXp: 0, currentLevel: 1, currentStreak: 0, longestStreak: 0 }];
    }
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(store, null, 2));
    return { seeded: true, modules: (store["modules"] ?? []).length };
  }

  sqlite.exec(CREATE_TABLES);

  const insSubject = sqlite.prepare("INSERT OR IGNORE INTO subjects (id,name,icon,color,description,sort_order,total_modules) VALUES (?,?,?,?,?,?,?)");
  const insModule = sqlite.prepare("INSERT OR IGNORE INTO modules (id,subject_id,title,description,long_description,icon,difficulty,age_min,age_max,estimated_minutes,sort_order,simulation_type,default_config,learning_objectives,vocabulary_words,fun_facts,try_at_home,tags,is_unlocked) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)");
  const insActivity = sqlite.prepare("INSERT OR IGNORE INTO activities (id,module_id,title,type,instructions,config,hints,sort_order,xp_reward,difficulty) VALUES (?,?,?,?,?,?,?,?,?,?)");
  const insAch = sqlite.prepare("INSERT OR IGNORE INTO achievements (id,name,description,icon,category,criteria,xp_bonus,rarity,is_secret) VALUES (?,?,?,?,?,?,?,?,?)");

  const tx = sqlite.transaction(() => {
    for (const s of ALL_SUBJECTS) insSubject.run(s.id, s.name, s.icon, s.color, s.description, s.sortOrder, s.totalModules);
    for (const m of ALL_MODULES) {
      insModule.run(m.id, m.subjectId, m.title, m.description, m.longDescription ?? "", m.icon, m.difficulty, m.ageMin, m.ageMax, m.estimatedMinutes, m.sortOrder, m.simulationType, m.defaultConfig, m.learningObjectives, m.vocabularyWords ?? "[]", m.funFacts ?? "[]", m.tryAtHome ?? "[]", m.tags ?? "[]");
      for (const a of activitiesFor(m)) {
        insActivity.run(a.id, a.moduleId, a.title, a.type, a.instructions, a.config, a.hints, a.sortOrder, a.xpReward, a.difficulty);
      }
    }
    for (const a of ALL_ACHIEVEMENTS) insAch.run(a.id, a.name, a.description, a.icon, a.category, a.criteria, a.xpBonus, a.rarity, a.isSecret ? 1 : 0);
    // Refresh per-subject totals from actual module rows
    sqlite.prepare("UPDATE subjects SET total_modules = (SELECT COUNT(*) FROM modules WHERE modules.subject_id = subjects.id)").run();
    sqlite.prepare("INSERT OR IGNORE INTO profile (id,name,age) VALUES ('default-child','Explorer',8)").run();
  });
  tx();
  const modules = (sqlite.prepare("SELECT COUNT(*) as c FROM modules").get() as any).c;
  return { seeded: true, modules };
}
