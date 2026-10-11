import { NextResponse } from "next/server";
import { DAL } from "@/db/helpers";
import { sqlite, useFallback } from "@/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const mod = DAL.moduleById(params.id);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  let progress: any = { status: "not_started", bestScore: 0, totalTimeSeconds: 0, timesOpened: 0 };
  if (!useFallback && sqlite) {
    const row = sqlite.prepare("SELECT * FROM module_progress WHERE module_id=?").get(params.id) as any;
    if (row) progress = { status: row.status, bestScore: row.best_score ?? 0, totalTimeSeconds: row.total_time_seconds ?? 0, timesOpened: row.times_opened ?? 0 };
  }
  return NextResponse.json({ module: mod, progress, activities: DAL.activities(params.id) });
}
