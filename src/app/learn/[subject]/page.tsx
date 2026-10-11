"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Progress } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const [subject, setSubject] = useState<any>(null);
  const [mods, setMods] = useState<any[]>([]);
  const { moduleProgress } = useAppStore();

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then((all) => setSubject(all.find((s: any) => s.id === params.subject))).catch(() => {});
    fetch(`/api/modules?subjectId=${params.subject}`).then((r) => r.json()).then(setMods).catch(() => {});
  }, [params.subject]);

  if (!subject) return <p className="p-8">Loading... 🔄</p>;
  const done = mods.filter((m) => (moduleProgress[m.id] as any)?.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16">
      <Link href="/" className="text-sm font-bold text-slate-500">← Home</Link>
      <div className="rounded-3xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${subject.color}, ${subject.color}99)` }}>
        <p className="text-5xl">{subject.icon}</p>
        <h1 className="font-display font-black text-3xl mt-1">{subject.name}</h1>
        <p className="opacity-90">{subject.description}</p>
        <p className="text-sm font-bold mt-2">{done}/{mods.length} completed</p>
        <Progress value={mods.length ? (done / mods.length) * 100 : 0} className="mt-1 bg-white/30" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {mods.map((m) => {
          const st = (moduleProgress[m.id] as any)?.status;
          return (
            <Link key={m.id} href={`/learn/${params.subject}/${m.id}`}>
              <Card className="hover:scale-[1.02] hover:shadow-lg transition-all h-full">
                <CardContent>
                  <div className="flex gap-3">
                    <span className="text-4xl">{m.icon}</span>
                    <div>
                      <p className="font-extrabold text-lg leading-tight">{m.title}</p>
                      <p className="text-xs text-slate-500">Ages {m.ageMin ?? m.age_min}–{m.ageMax ?? m.age_max} • {m.estimatedMinutes ?? m.estimated_minutes} min • Difficulty {m.difficulty}/5</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{m.description}</p>
                  <div className="mt-2">{st === "completed" ? <Badge className="bg-green-100 text-green-800">✅ Completed</Badge> : st ? <Badge className="bg-blue-100 text-blue-800">▶️ In progress</Badge> : <Badge>🌟 New!</Badge>}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
