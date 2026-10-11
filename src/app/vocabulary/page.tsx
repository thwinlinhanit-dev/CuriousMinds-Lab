"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Badge, Progress } from "@/components/ui/primitives";

const STARS = ["☆☆☆☆☆", "★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"];

export default function VocabularyPage() {
  const [words, setWords] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [queue, setQueue] = useState<any[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const load = () => fetch("/api/vocabulary").then((r) => r.json()).then(setWords).catch(() => {});
  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().split("T")[0];
  const subjects = ["all", ...Array.from(new Set(words.map((w) => w.subject)))];
  const inFilter = filter === "all" ? words : words.filter((w) => w.subject === filter);
  const mastered = inFilter.filter((w) => w.mastery >= 4).length;
  const due = inFilter.filter((w) => !w.nextReviewDate || w.nextReviewDate <= today).sort((a, b) => a.mastery - b.mastery);

  const startReview = () => { setQueue(due.slice(0, 20)); setFlipped(false); setReviewed(0); };
  const current = queue[0];

  const answer = async (knew: boolean) => {
    if (!current) return;
    const res = await fetch("/api/vocabulary", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: current.id, knew }),
    }).then((r) => r.json()).catch(() => null);
    setReviewed(reviewed + 1);
    setFlipped(false);
    setQueue(queue.slice(1));
    setWords(words.map((w) => (w.id === current.id ? { ...w, mastery: res?.mastery ?? w.mastery, timesReviewed: (w.timesReviewed ?? 0) + 1 } : w)));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">📚 Word Collection</h1>
      <p className="text-sm text-slate-500">Every lab you visit adds its words here automatically. Review them to grow mastery — 5 stars = word master! ⭐</p>

      {words.length === 0 && (
        <Card><CardContent><p className="text-center py-8">No words yet! Visit any lab and its vocabulary will appear here. 🔬</p></CardContent></Card>
      )}

      {words.length > 0 && (
        <>
          <div className="grid sm:grid-cols-3 gap-3">
            <Card><CardContent><p className="text-xs font-bold text-slate-500">📖 WORDS COLLECTED</p><p className="text-3xl font-black">{inFilter.length}</p></CardContent></Card>
            <Card><CardContent><p className="text-xs font-bold text-slate-500">⭐ MASTERED</p><p className="text-3xl font-black">{mastered}</p><Progress value={inFilter.length ? (mastered / inFilter.length) * 100 : 0} className="mt-2" /></CardContent></Card>
            <Card className="border-2 border-violet-300 bg-violet-50"><CardContent>
              <p className="text-xs font-bold text-violet-700">🔁 DUE FOR REVIEW</p><p className="text-3xl font-black">{due.length}</p>
              {due.length > 0 && <Button size="sm" variant="fun" className="mt-2" onClick={startReview}>Start review!</Button>}
            </CardContent></Card>
          </div>

          {queue.length > 0 && current && (
            <Card className="border-2 border-amber-300"><CardContent>
              <p className="text-xs font-bold text-slate-500">REVIEWING {reviewed + 1} OF {reviewed + queue.length} • {current.subject}</p>
              <div onClick={() => setFlipped(!flipped)} className="max-w-sm mx-auto h-52 mt-2 rounded-2xl border-4 border-violet-300 bg-gradient-to-br from-violet-50 to-fuchsia-50 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform p-4">
                {!flipped ? (
                  <><p className="font-display font-black text-3xl">{current.word}</p><p className="text-amber-600 text-sm font-bold mt-2">{"★".repeat(current.mastery)}{"☆".repeat(5 - current.mastery)} • Tap to flip! 🔄</p></>
                ) : (
                  <><p className="font-bold text-center">{current.definition}</p>{current.example && <p className="text-sm italic text-slate-500 mt-2">e.g. {current.example}</p>}</>
                )}
              </div>
              {flipped && (
                <div className="flex justify-center gap-2 mt-3">
                  <Button variant="outline" onClick={() => answer(false)}>😅 Still learning</Button>
                  <Button variant="fun" onClick={() => answer(true)}>✅ I knew it!</Button>
                </div>
              )}
            </CardContent></Card>
          )}

          {queue.length === 0 && reviewed > 0 && (
            <Card className="border-2 border-green-300 bg-green-50"><CardContent className="text-center">
              <p className="text-4xl">🎉</p><p className="font-extrabold text-xl">Review complete! {reviewed} words practiced.</p>
              <Button size="sm" className="mt-2" onClick={() => setReviewed(0)}>Done</Button>
            </CardContent></Card>
          )}

          <div className="flex gap-1.5 flex-wrap">
            {subjects.map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm font-bold capitalize ${filter === s ? "bg-slate-900 text-white" : "bg-white border"}`}>{s}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {inFilter.map((w) => (
              <div key={w.id} className="p-3 bg-white rounded-xl border text-sm">
                <p className="font-extrabold">{w.word} <span className="text-amber-500 text-xs">{STARS[w.mastery] ?? STARS[0]}</span></p>
                <p className="text-slate-600">{w.definition}</p>
                <p className="text-[11px] text-slate-400 mt-1 capitalize">{w.subject} • reviewed {w.timesReviewed ?? 0}× {w.nextReviewDate && w.nextReviewDate > today ? `• next: ${w.nextReviewDate.slice(5)}` : "• due now!"}</p>
              </div>
            ))}
          </div>
          <Link href="/explore" className="text-sm font-bold text-blue-600">← Discover more words in the labs</Link>
        </>
      )}
    </div>
  );
}
