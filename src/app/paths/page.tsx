"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Progress } from "@/components/ui/primitives";
import { LEARNING_PATHS } from "@/lib/paths";
import { useAppStore } from "@/stores/appStore";

export default function PathsPage() {
  const [modules, setModules] = useState<any[]>([]);
  const { moduleProgress } = useAppStore();

  useEffect(() => {
    fetch("/api/modules").then((r) => r.json()).then(setModules).catch(() => {});
  }, []);

  const pathProgress = (moduleIds: string[]) => {
    const done = moduleIds.filter((id) => moduleProgress[id]?.status === "completed").length;
    return { done, total: moduleIds.length, pct: Math.round((done / Math.max(1, moduleIds.length)) * 100) };
  };

  const anyProgress = Object.keys(moduleProgress).length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">
      <div>
        <h1 className="font-display font-black text-3xl">🗺️ Learning Paths</h1>
        <p className="text-slate-600 max-w-3xl">Curated journeys that connect labs into big ideas. Finish every stop to earn the path badge! 🏅</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEARNING_PATHS.map((p) => {
          const prog = pathProgress(p.moduleIds);
          const titles = p.moduleIds.map((id) => modules.find((m) => m.id === id)?.title ?? id);
          return (
            <Link key={p.slug} href={`/paths/${p.slug}`}>
              <Card className="hover:scale-[1.02] hover:shadow-lg transition-all h-full">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{p.emoji}</span>
                    {prog.pct === 100 && <Badge className="bg-green-100 text-green-800">🏅 Complete!</Badge>}
                    {prog.done > 0 && prog.pct < 100 && <Badge className="bg-blue-100 text-blue-800">{prog.done}/{prog.total}</Badge>}
                  </div>
                  <p className="font-display font-extrabold text-lg mt-2 leading-tight" style={{ color: p.color }}>{p.title}</p>
                  <p className="text-xs text-slate-400">{p.ages} • {p.moduleIds.length} labs</p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-3">{p.description}</p>
                  <div className="mt-3">
                    <Progress value={prog.pct} />
                    <p className="text-[11px] text-slate-400 mt-1">{prog.pct === 100 ? "All stops visited — champion!" : anyProgress && prog.done > 0 ? `${prog.total - prog.done} labs to go` : "Not started — begin at stop 1!"}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">{titles.slice(0, 3).join(" → ")}…</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
