"use client";
import React from "react";
import { Card, CardContent, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

const AVATARS = ["🧑‍🚀", "👩‍🔬", "🧑‍🎨", "🤖", "🦊", "🐼", "🦄", "🐙"];
const COLORS = ["#3b82f6", "#a855f7", "#22c55e", "#f97316", "#eab308", "#ec4899", "#14b8a6", "#8b5cf6"];

export default function SettingsPage() {
  const { profile, saveProfile } = useAppStore();
  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">⚙️ Settings</h1>
      <Card><CardContent className="space-y-3">
        <div>
          <p className="font-bold text-sm">Name</p>
          <input value={profile.name} onChange={(e) => saveProfile({ name: e.target.value })} className="border-2 border-slate-200 rounded-xl px-3 py-2 font-bold w-full" />
        </div>
        <div>
          <p className="font-bold text-sm">Age ({profile.age}) — adjusts difficulty & recommendations</p>
          <input type="range" min={5} max={14} value={profile.age} onChange={(e) => saveProfile({ age: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <p className="font-bold text-sm">Avatar</p>
          <div className="flex gap-1.5 flex-wrap">{AVATARS.map((a) => <button key={a} onClick={() => saveProfile({ avatarEmoji: a })} className={`text-3xl p-1.5 rounded-xl ${profile.avatarEmoji === a ? "bg-blue-100 ring-2 ring-blue-500" : "hover:bg-slate-100"}`}>{a}</button>)}</div>
        </div>
        <div>
          <p className="font-bold text-sm">Color</p>
          <div className="flex gap-1.5">{COLORS.map((c) => <button key={c} onClick={() => saveProfile({ avatarColor: c })} className={`w-9 h-9 rounded-full ${profile.avatarColor === c ? "ring-4 ring-offset-2 ring-slate-400" : ""}`} style={{ backgroundColor: c }} />)}</div>
        </div>
        <div>
          <p className="font-bold text-sm">Difficulty</p>
          <div className="flex gap-1.5 flex-wrap">{[["auto", "🤖 Auto (adapts!)"], ["easy", "🌱 Easy"], ["medium", "🔍 Medium"], ["hard", "💪 Hard"]].map(([v, l]) => <Button key={v} size="sm" variant={profile.preferredDifficulty === v ? "default" : "outline"} onClick={() => saveProfile({ preferredDifficulty: v })}>{l}</Button>)}</div>
        </div>
        <div>
          <p className="font-bold text-sm">Daily goal ({profile.dailyGoalMinutes} min)</p>
          <input type="range" min={10} max={120} step={5} value={profile.dailyGoalMinutes} onChange={(e) => saveProfile({ dailyGoalMinutes: Number(e.target.value) })} className="w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant={profile.theme === "light" ? "default" : "outline"} onClick={() => { saveProfile({ theme: "light" }); document.documentElement.classList.remove("dark"); }}>☀️ Light</Button>
          <Button size="sm" variant={profile.theme === "dark" ? "default" : "outline"} onClick={() => { saveProfile({ theme: "dark" }); document.documentElement.classList.add("dark"); }}>🌙 Dark</Button>
        </div>
      </CardContent></Card>
      <Card><CardContent>
        <p className="font-extrabold">📖 How to run</p>
        <pre className="text-xs bg-slate-900 text-green-300 rounded-xl p-3 mt-2 overflow-x-auto">npm install{"\n"}npm run dev{"\n"}# open http://localhost:3000</pre>
        <p className="text-xs text-slate-500 mt-2">Data lives in ./data/curious-minds.db (SQLite). Back it up to keep progress! 💾</p>
      </CardContent></Card>
    </div>
  );
}
