"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui/primitives";
import { LEARNING_PATHS } from "@/lib/paths";
import { useAppStore } from "@/stores/appStore";

/**
 * "Your active journey": the path with the most progress that isn't complete.
 * Hidden entirely if every path is finished (no empty-state noise).
 */
export function PathProgressCard({ modules }: { modules: any[] }) {
  const { moduleProgress } = useAppStore();

  const journeys = LEARNING_PATHS.map((p) => {
    const done = p.moduleIds.filter((id) => moduleProgress[id]?.status === "completed").length;
    return { path: p, done, total: p.moduleIds.length };
  });
  // Most-progressed path that still has stops remaining.
  const active = [...journeys].sort((a, b) => b.done - a.done).find((j) => j.done < j.total);

  if (!active) return null;

  const pct = Math.round((active.done / active.total) * 100);
  const nextIdx = active.path.moduleIds.findIndex((id) => moduleProgress[id]?.status !== "completed");
  const nextId = active.path.moduleIds[nextIdx];
  const nextTitle = modules.find((m) => m.id === nextId)?.title;

  return (
    <Link href={`/paths/${active.path.slug}`} className="block group">
      <Card className="border-2 hover:scale-[1.01] hover:shadow-lg transition-all" style={{ borderColor: active.path.color }}>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-4xl group-hover:scale-110 transition-transform">{active.path.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-extrabold text-lg leading-tight">Your journey: {active.path.title}</p>
              <p className="text-xs text-slate-500">{active.path.ages} • 🏅 +100 XP path badge at the end</p>
            </div>
            {active.done > 0 ? (
              <Badge className="bg-green-100 text-green-800">{active.done}/{active.total} stops</Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-600">Not started</Badge>
            )}
          </div>

          <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(pct, 3)}%`, background: `linear-gradient(90deg, ${active.path.color}, ${active.path.color}aa)` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs gap-3">
            <span className="font-bold shrink-0" style={{ color: active.path.color }}>
              {active.done === 0 ? "Tap to start your journey! 🚀" : `${pct}% complete`}
            </span>
            {nextTitle && (
              <span className="text-slate-500 truncate">
                Next: <b>{nextTitle}</b>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
