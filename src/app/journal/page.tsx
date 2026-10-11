"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@/components/ui/primitives";

const MOODS = ["😊", "🤩", "🤔", "😴", "🚀", "🌟"];

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const load = () => fetch("/api/journal").then((r) => r.json()).then(setEntries).catch(() => {});
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!title.trim() || !content.trim()) { alert("Add a title and some writing first! ✍️"); return; }
    await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content, mood }) });
    setTitle(""); setContent("");
    load();
  };
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">📓 Scientist's Journal</h1>
      <Card><CardContent>
        <p className="font-extrabold mb-2">✍️ New entry {MOODS.map((m) => <button key={m} onClick={() => setMood(m)} className={`text-2xl ml-1 ${mood === m ? "scale-125" : "opacity-50"}`}>{m}</button>)}</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title: What did you discover?" className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold mb-2" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Today I learned... My question is... I want to try..." className="w-full border-2 border-slate-200 rounded-xl p-3" />
        <Button variant="fun" onClick={save} className="mt-2">💾 Save entry</Button>
      </CardContent></Card>
      <div className="space-y-3">
        {entries.map((e) => (
          <Card key={e.id}><CardContent>
            <div className="flex items-center gap-2"><span className="text-2xl">{e.mood}</span><p className="font-extrabold flex-1">{e.title}</p><span className="text-xs text-slate-400">{new Date(e.createdAt ?? e.created_at).toLocaleDateString()}</span></div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{e.content}</p>
            <Button size="sm" variant="ghost" className="text-red-500 mt-1" onClick={async () => { if (confirm("Delete entry?")) { await fetch(`/api/journal?id=${e.id}`, { method: "DELETE" }); load(); } }}>Delete</Button>
          </CardContent></Card>
        ))}
        {entries.length === 0 && <p className="text-center text-slate-400">No entries yet — real scientists write everything down! 🔬</p>}
      </div>
    </div>
  );
}
