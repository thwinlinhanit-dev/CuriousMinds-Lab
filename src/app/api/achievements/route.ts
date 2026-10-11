import { NextResponse } from "next/server";
import { sqlite, useFallback } from "@/db";
import { fbLoad, fbSave } from "@/db/helpers";

export async function GET() {
  if (!useFallback && sqlite) {
    const all = sqlite.prepare("SELECT * FROM achievements").all();
    const earned = sqlite.prepare("SELECT * FROM earned_achievements").all();
    return NextResponse.json({ all, earned });
  }
  const store = fbLoad();
  return NextResponse.json({ all: store["achievements"] ?? [], earned: store["earned_achievements"] ?? [] });
}

export async function POST(request: Request) {
  const { achievementId } = await request.json();
  const now = new Date().toISOString();
  if (!useFallback && sqlite) {
    sqlite.prepare("UPDATE earned_achievements SET seen=1 WHERE achievement_id=?").run(achievementId);
  } else {
    const store = fbLoad();
    store["earned_achievements"] = (store["earned_achievements"] ?? []).map((e: any) =>
      (e.achievementId ?? e.achievement_id) === achievementId ? { ...e, seen: true } : e
    );
    fbSave(store);
  }
  return NextResponse.json({ success: true });
}
