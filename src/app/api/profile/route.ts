import { NextResponse } from "next/server";
import { DAL, fbLoad, fbSave } from "@/db/helpers";
import { sqlite, useFallback } from "@/db";

export async function GET() {
  return NextResponse.json(DAL.profile());
}

export async function PUT(request: Request) {
  const body = await request.json();
  const map: Record<string, string> = {
    name: "name", age: "age", avatarEmoji: "avatar_emoji", avatarColor: "avatar_color",
    preferredDifficulty: "preferred_difficulty", theme: "theme", soundEnabled: "sound_enabled",
    musicEnabled: "music_enabled", animationsEnabled: "animations_enabled", fontSize: "font_size",
    dailyGoalMinutes: "daily_goal_minutes", totalXp: "total_xp", currentLevel: "current_level",
    currentStreak: "current_streak", longestStreak: "longest_streak", lastActiveDate: "last_active_date",
  };
  if (!useFallback && sqlite) {
    const sets: string[] = [];
    const vals: any[] = [];
    for (const [k, v] of Object.entries(body)) {
      const col = map[k] ?? k;
      if (["id", "created_at", "createdAt"].includes(col)) continue;
      sets.push(`${col}=?`);
      vals.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
    }
    if (sets.length) sqlite.prepare(`UPDATE profile SET ${sets.join(",")} WHERE id='default-child'`).run(...vals);
    return NextResponse.json(DAL.profile());
  }
  const store = fbLoad();
  store["profile"] = [{ ...DAL.profile(), ...body }];
  fbSave(store);
  return NextResponse.json(store["profile"][0]);
}
