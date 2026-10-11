"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Progress } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";
import { MegaProjects, RecommendedRow } from "@/components/home/HomeWidgets";
import { PathProgressCard } from "@/components/home/PathProgressCard";

export default function HomePage() {
  const { profile, moduleProgress } = useAppStore();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
    fetch("/api/modules").then((r) => r.json()).then(setModules).catch(() => {});
    fetch("/api/challenges").then((r) => r.json()).then(setChallenge).catch(() => {});
  }, []);

  const doneCount = Object.values(moduleProgress).filter((p: any) => p.status === "completed").length;
  const startedCount = Object.keys(moduleProgress).length;
  const goal = profile.dailyGoalMinutes || 30;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 md:p-10 text-white shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest opacity-80">Explore → Discover → Create → Connect</p>
        <h1 className="font-display font-black text-3xl md:text-5xl mt-1">Ready to explore, {profile.name}? 🔬</h1>
        <p className="mt-2 opacity-90 max-w-xl">{modules.length || 94} hands-on labs across science, math, music, art, code & writing. Pick a world below and start experimenting!</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Link href="/explore"><Button variant="secondary">✨ Explore all labs</Button></Link>
          <Link href="/achievements"><Button variant="ghost" className="text-white hover:bg-white/20">🏆 {doneCount} completed</Button></Link>
        </div>
      </div>

      {/* Stats + daily challenge */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent>
          <p className="text-sm font-bold text-slate-500">🔥 DAY STREAK</p>
          <p className="text-4xl font-black">{profile.currentStreak} <span className="text-lg">days</span></p>
          <Progress value={Math.min(100, (profile.currentStreak / 7) * 100)} className="mt-2" />
          <p className="text-xs text-slate-500 mt-1">Daily goal: {goal} min</p>
        </CardContent></Card>
        <Card><CardContent>
          <p className="text-sm font-bold text-slate-500">🧪 LABS TRIED</p>
          <p className="text-4xl font-black">{startedCount}<span className="text-lg text-slate-400">/{modules.length || 94}</span></p>
          <Progress value={(startedCount / (modules.length || 94)) * 100} className="mt-2" />
          <p className="text-xs text-slate-500 mt-1">{doneCount} fully completed ✅</p>
        </CardContent></Card>
        <Card className="border-2 border-amber-300 bg-amber-50"><CardContent>
          <p className="text-sm font-bold text-amber-700">⚡ DAILY CHALLENGE {challenge?.completed ? "✅" : ""}</p>
          {challenge ? <>
            <p className="font-extrabold">{challenge.title} (+{challenge.xpReward} XP)</p>
            <p className="text-sm text-slate-600">{challenge.description}</p>
            {!challenge.completed && <Link href={`/learn/${challenge.subjectId}/${challenge.moduleId}`}><Button size="sm" className="mt-2">Start challenge →</Button></Link>}
          </> : <p className="text-sm">Loading...</p>}
        </CardContent></Card>
      </div>

      {/* Active journey progress */}
      <PathProgressCard modules={modules} />

      {/* Recommended */}
      <RecommendedRow modules={modules} subjects={subjects} />

      {/* Subjects */}
      <div>
        <h2 className="font-display font-extrabold text-2xl mb-3">🌍 Choose your world</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const mods = modules.filter((m: any) => (m.subjectId ?? m.subject_id) === s.id);
            const done = mods.filter((m: any) => (moduleProgress[m.id] as any)?.status === "completed").length;
            return (
              <Link key={s.id} href={`/learn/${s.id}`}>
                <Card className="hover:scale-[1.02] hover:shadow-lg transition-all h-full">
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{s.icon}</span>
                      <div><p className="font-display font-extrabold text-lg">{s.name}</p>
                      <p className="text-xs text-slate-500">{done}/{mods.length || s.totalModules} done</p></div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{s.description}</p>
                    <Progress value={mods.length ? (done / mods.length) * 100 : 0} className="mt-2" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Cross-disciplinary */}
      <MegaProjects />
    </div>
  );
}
