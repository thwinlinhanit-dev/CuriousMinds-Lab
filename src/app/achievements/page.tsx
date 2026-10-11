"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Badge } from "@/components/ui/primitives";

const RARITY_COLOR: Record<string, string> = {
  common: "bg-slate-100 text-slate-700", uncommon: "bg-green-100 text-green-800",
  rare: "bg-blue-100 text-blue-800", epic: "bg-purple-100 text-purple-800", legendary: "bg-amber-100 text-amber-800",
};

export default function AchievementsPage() {
  const [all, setAll] = useState<any[]>([]);
  const [earned, setEarned] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/achievements").then((r) => r.json()).then((d) => { setAll(d.all ?? []); setEarned(d.earned ?? []); }).catch(() => {});
  }, []);
  const earnedIds = new Set(earned.map((e: any) => e.achievementId ?? e.achievement_id));
  const cats = ["exploration", "mastery", "creativity", "persistence", "cross-discipline"];
  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">🏆 Achievements</h1>
      <p className="text-slate-500">{earned.length}/{all.length} unlocked!</p>
      {cats.map((c) => (
        <div key={c}>
          <h2 className="font-extrabold capitalize mt-4 mb-2">{
            { exploration: "🔍 Exploration", mastery: "🎓 Mastery", creativity: "🎨 Creativity", persistence: "🔥 Persistence", "cross-discipline": "🔗 Cross-Discipline" }[c]}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {all.filter((a) => a.category === c).map((a) => {
              const got = earnedIds.has(a.id);
              if (a.is_secret && !got) return <Card key={a.id} className="opacity-60"><CardContent><p className="text-3xl">❓</p><p className="font-bold">Secret achievement...</p><p className="text-xs text-slate-500">Keep exploring to discover it!</p></CardContent></Card>;
              return (
                <Card key={a.id} className={got ? "border-2 border-amber-300 bg-amber-50" : "opacity-70"}><CardContent>
                  <p className="text-3xl">{got ? a.icon : "🔒"}</p>
                  <p className="font-extrabold">{a.name}</p>
                  <p className="text-sm text-slate-600">{a.description}</p>
                  <div className="flex gap-1.5 mt-1"><Badge className={RARITY_COLOR[a.rarity] ?? ""}>{a.rarity}</Badge><Badge>+{a.xpBonus ?? a.xp_bonus} XP</Badge></div>
                </CardContent></Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
