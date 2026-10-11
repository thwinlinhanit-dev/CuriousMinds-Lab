"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, Badge, Progress } from "@/components/ui/primitives";
import { LEARNING_PATHS } from "@/lib/paths";
import { useAppStore } from "@/stores/appStore";

export default function PathDetailPage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const path = LEARNING_PATHS.find((p) => p.slug === slug);
  const [modules, setModules] = useState<any[]>([]);
  const { moduleProgress } = useAppStore();

  useEffect(() => {
    fetch("/api/modules").then((r) => r.json()).then(setModules).catch(() => {});
  }, []);

  if (!path) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-2xl font-black">Path not found 🤔</p>
        <Link href="/paths" className="underline font-bold text-blue-600">← All learning paths</Link>
      </div>
    );
  }

  const done = path.moduleIds.filter((id) => moduleProgress[id]?.status === "completed").length;
  const pct = Math.round((done / path.moduleIds.length) * 100);
  const nextIdx = path.moduleIds.findIndex((id) => moduleProgress[id]?.status !== "completed");

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <Link href="/paths" className="text-sm font-bold text-slate-500">← All paths</Link>
      <div className="p-6 rounded-3xl text-white" style={{ background: `linear-gradient(135deg, ${path.color}, ${path.color}99)` }}>
        <span className="text-5xl">{path.emoji}</span>
        <h1 className="font-display font-black text-3xl mt-2">{path.title}</h1>
        <p className="opacity-90 max-w-2xl mt-1">{path.description}</p>
        <p className="text-sm opacity-75 mt-2">{path.ages} • {path.moduleIds.length} labs • 🏅 +100 XP path badge</p>
        <div className="mt-4 max-w-md">
          <div className="h-3 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs mt-1 font-bold">{done}/{path.moduleIds.length} stops completed ({pct}%)</p>
        </div>
      </div>

      <div className="relative space-y-3">
        {path.moduleIds.map((id, i) => {
          const m = modules.find((x) => x.id === id);
          const st = moduleProgress[id]?.status;
          const isNext = i === nextIdx;
          const sid = m?.subjectId ?? m?.subject_id ?? "physics";
          return (
            <Link key={id} href={`/learn/${sid}/${id}`} className="block">
              <Card className={`transition-all hover:scale-[1.01] ${isNext ? "border-2 border-amber-400 shadow-lg" : ""} ${st === "completed" ? "opacity-80" : ""}`}>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 ${st === "completed" ? "bg-green-500 text-white" : isNext ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {st === "completed" ? "✓" : i + 1}
                    </div>
                    <span className="text-3xl">{m?.icon ?? "🧪"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold leading-tight">{m?.title ?? id}</p>
                      <p className="text-xs text-slate-500">{m?.description ?? "Loading..."}</p>
                    </div>
                    <div className="shrink-0">
                      {st === "completed" ? (
                        <Badge className="bg-green-100 text-green-800">✅ Done</Badge>
                      ) : isNext ? (
                        <Badge className="bg-amber-100 text-amber-800">▶️ Up next</Badge>
                      ) : (
                        <Badge>🔒 {i + 1}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {pct === 100 && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="text-center">
            <p className="text-4xl">🏅</p>
            <p className="font-display font-black text-xl mt-1">Path complete! The {path.title} Champion badge is yours.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
