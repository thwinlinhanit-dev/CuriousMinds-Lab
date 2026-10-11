"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Button, Progress } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const { profile } = useAppStore();
  useEffect(() => {
    fetch("/api/progress").then((r) => r.json()).then(setData).catch(() => {});
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
    fetch("/api/modules").then((r) => r.json()).then(setModules).catch(() => {});
  }, []);
  if (!data) return <p className="p-8">Loading dashboard... 📊</p>;
  const mp = data.moduleProgress ?? [];
  const daily = data.dailyActivity ?? [];
  const totalMins = mp.reduce((s: number, p: any) => s + (p.totalTimeSeconds ?? p.total_time_seconds ?? 0), 0) / 60;
  const completed = mp.filter((p: any) => p.status === "completed").length;
  const bySubject: Record<string, number> = {};
  for (const p of mp) {
    const mod = modules.find((m) => m.id === (p.moduleId ?? p.module_id));
    const sid = mod?.subjectId ?? mod?.subject_id ?? "?";
    bySubject[sid] = (bySubject[sid] ?? 0) + 1;
  }
  const weekMins = daily.slice(0, 7).reduce((s: number, d: any) => s + (d.totalMinutes ?? d.total_minutes ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">👨‍👩‍👧 Parent Dashboard</h1>
      <p className="text-sm text-slate-500">Private & local — all data stays on this computer. 💾</p>
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          ["⏱️ Total learning", `${Math.round(totalMins)} min`],
          ["📅 Last 7 days", `${weekMins} min`],
          ["✅ Completed", `${completed} labs`],
          ["🔥 Streak", `${profile.currentStreak} days (best ${profile.longestStreak})`],
        ].map(([k, v]) => <Card key={k}><CardContent><p className="text-xs font-bold text-slate-500">{k}</p><p className="text-2xl font-black">{v}</p></CardContent></Card>)}
      </div>
      <Card><CardContent>
        <p className="font-extrabold mb-2">📊 Activity by subject</p>
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center gap-2 mb-1.5 text-sm">
            <span className="w-36 truncate">{s.icon} {s.name}</span>
            <Progress value={Math.min(100, ((bySubject[s.id] ?? 0) / Math.max(1, s.totalModules)) * 100)} className="flex-1" />
            <b className="w-16 text-right">{bySubject[s.id] ?? 0}/{s.totalModules}</b>
          </div>
        ))}
      </CardContent></Card>
      <Card><CardContent>
        <p className="font-extrabold mb-2">📅 Last 14 days</p>
        <div className="flex items-end gap-1 h-28">
          {daily.slice(0, 14).reverse().map((d: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.totalMinutes ?? d.total_minutes} min`}>
              <div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.min(100, ((d.totalMinutes ?? d.total_minutes ?? 0) / 30) * 100)}px`, minHeight: "3px" }} />
              <span className="text-[9px] text-slate-400">{(d.date ?? "").slice(5)}</span>
            </div>
          ))}
          {daily.length === 0 && <p className="text-sm text-slate-400">No activity yet — start a lab! 🚀</p>}
        </div>
      </CardContent></Card>
      <Card><CardContent>
        <p className="font-extrabold mb-2">💡 Conversation starters</p>
        <ul className="text-sm space-y-1 list-disc ml-5 text-slate-600">
          <li>Ask: "What surprised you most today?" (curiosity!)</li>
          <li>Try one "Try at Home" experiment together this week.</li>
          <li>Celebrate streaks, not just scores — persistence wins. 🔥</li>
          <li>Let them teach YOU a lab — teaching = mastery. 🎓</li>
        </ul>
      </CardContent></Card>
    </div>
  );
}
