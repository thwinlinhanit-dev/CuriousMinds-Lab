"use client";
import React, { useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

const FLAGS = [
  { code: "us", name: "USA" }, { code: "mx", name: "Mexico" }, { code: "ca", name: "Canada" },
  { code: "br", name: "Brazil" }, { code: "gb", name: "United Kingdom" }, { code: "fr", name: "France" },
  { code: "de", name: "Germany" }, { code: "it", name: "Italy" }, { code: "es", name: "Spain" },
  { code: "jp", name: "Japan" }, { code: "cn", name: "China" }, { code: "in", name: "India" },
  { code: "au", name: "Australia" }, { code: "eg", name: "Egypt" }, { code: "za", name: "South Africa" },
  { code: "ng", name: "Nigeria" }, { code: "ke", name: "Kenya" }, { code: "ar", name: "Argentina" },
  { code: "kr", name: "South Korea" }, { code: "th", name: "Thailand" }, { code: "tr", name: "Turkey" },
  { code: "gr", name: "Greece" }, { code: "se", name: "Sweden" }, { code: "nz", name: "New Zealand" },
];
const pick4 = (answer: number) => {
  const others = FLAGS.map((_, i) => i).filter((i) => i !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
  return [...others, answer].sort(() => Math.random() - 0.5);
};

export function FlagQuiz({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * FLAGS.length));
  const [opts, setOpts] = useState<number[]>(() => pick4(idx));
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const { recordProgress } = useAppStore();
  const cur = FLAGS[idx];
  const guess = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === idx) {
      const s = streak + 1;
      setStreak(s); setBest(Math.max(best, s));
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 90 });
      if (s >= 8) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(() => {
        const n = Math.floor(Math.random() * FLAGS.length);
        setIdx(n); setOpts(pick4(n)); setPicked(null);
      }, 900);
    } else { setStreak(0); setTimeout(() => setPicked(null), 1200); }
  };
  return (
    <SimulationShell title="Flag Detective" icon="🏳️"
      controls={<>
        <p className="text-sm font-bold">🔥 Streak: {streak}/8 (best {best})</p>
        <p className="text-xs text-slate-500">Flags by region: Americas, Europe, Asia, Africa, Oceania — learn them zone by zone!</p>
        <Button size="sm" variant="outline" onClick={() => { const n = Math.floor(Math.random() * FLAGS.length); setIdx(n); setOpts(pick4(n)); setPicked(null); }} className="w-full">🔀 Skip flag</Button>
      </>}
      dataPanel={<div className="text-sm"><p>🌍 {FLAGS.length} flags in the deck</p><p>💡 Spot tricks: maple leaf = Canada, red dot = Japan!</p></div>}>
      <div className="p-4 text-center">
        <p className="font-bold">Which country is this?</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://flagcdn.com/w320/${cur.code}.png`} alt="Mystery flag" className="mx-auto my-3 rounded-xl border-4 border-slate-200 shadow" width={320} height={213} />
        <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto">
          {opts.map((o) => (
            <button key={o} onClick={() => guess(o)} disabled={picked !== null}
              className={`px-3 py-2.5 rounded-xl border-2 font-bold text-sm ${picked === null ? "border-slate-200 hover:border-blue-400" : o === idx ? "border-green-500 bg-green-50" : picked === o ? "border-red-400 bg-red-50" : "border-slate-200 opacity-60"}`}>
              {FLAGS[o].name}
            </button>
          ))}
        </div>
        <Quiz questions={[
          { q: "The maple leaf flag belongs to...", options: ["Canada", "Japan", "Brazil"], answer: 0, explain: "Red maple leaf!" },
          { q: "Japan's flag shows...", options: ["A star", "A red sun disc", "Stripes"], answer: 1, explain: "Land of the Rising Sun!" },
          { q: "Flags help us...", options: ["Navigate", "Recognize countries fast", "Nothing"], answer: 1, explain: "Symbols beat words!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

const CAPITALS: Array<[string, string]> = [
  ["France", "Paris"], ["Japan", "Tokyo"], ["Egypt", "Cairo"], ["Australia", "Canberra"],
  ["Canada", "Ottawa"], ["Brazil", "Brasília"], ["India", "New Delhi"], ["China", "Beijing"],
  ["Italy", "Rome"], ["Spain", "Madrid"], ["United Kingdom", "London"], ["Germany", "Berlin"],
  ["Kenya", "Nairobi"], ["Argentina", "Buenos Aires"], ["South Korea", "Seoul"], ["Thailand", "Bangkok"],
  ["Mexico", "Mexico City"], ["Turkey", "Ankara"], ["Greece", "Athens"], ["New Zealand", "Wellington"],
];
export function CapitalMatch({ moduleId }: { moduleId: string }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [order] = useState(() => [...CAPITALS].sort(() => Math.random() - 0.5).slice(0, 10));
  const { recordProgress } = useAppStore();
  const done = round >= order.length;
  const [country, capital] = done ? ["", ""] : order[round];
  const opts = !done ? [capital, ...CAPITALS.filter((c) => c[1] !== capital).sort(() => Math.random() - 0.5).slice(0, 3).map((c) => c[1])].sort(() => Math.random() - 0.5) : [];
  const guess = (o: string) => {
    if (picked || done) return;
    setPicked(o);
    const ok = o === capital;
    const s = score + (ok ? 1 : 0);
    if (ok) setScore(s);
    recordProgress(moduleId, { timeSpentSeconds: 15, score: ok ? 90 : 50 });
    setTimeout(() => {
      setPicked(null);
      const r = round + 1;
      setRound(r);
      if (r >= order.length) {
        recordProgress(moduleId, { timeSpentSeconds: 30, score: Math.round((s / order.length) * 100), status: s >= 7 ? "completed" : undefined });
      }
    }, 900);
  };
  return (
    <SimulationShell title="Capital Match" icon="🏛️"
      controls={<>
        <p className="text-sm font-bold">Round {Math.min(round + 1, 10)}/10 • Score {score}</p>
        <p className="text-xs text-slate-500">Capitals aren't always the biggest city! (Canberra ≠ Sydney!)</p>
      </>}
      dataPanel={<div className="text-sm"><p>🏛️ {done ? `Final: ${score}/10 ${score >= 7 ? "🎉 Diplomat!" : "— try again!"}` : `What is the capital of ${country}?`}</p></div>}>
      <div className="p-4 text-center">
        {!done ? <>
          <p className="font-display font-black text-3xl">{country}</p>
          <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto mt-3">
            {opts.map((o) => (
              <button key={o} onClick={() => guess(o)} disabled={picked !== null}
                className={`px-3 py-2.5 rounded-xl border-2 font-bold ${picked === null ? "border-slate-200 hover:border-blue-400" : o === capital ? "border-green-500 bg-green-50" : picked === o ? "border-red-400 bg-red-50" : "border-slate-200 opacity-60"}`}>{o}</button>
            ))}
          </div>
        </> : <div>
          <p className="text-5xl">{score >= 7 ? "🎉" : "💪"}</p>
          <p className="font-display font-black text-2xl">{score}/10!</p>
          <Button className="mt-2" onClick={() => window.location.reload()}>Play again</Button>
        </div>}
        <Quiz questions={[
          { q: "Australia's capital is...", options: ["Sydney", "Canberra", "Melbourne"], answer: 1, explain: "Planned capital city!" },
          { q: "A capital is...", options: ["Biggest city", "Seat of government", "Oldest city"], answer: 1, explain: "Where leaders work!" },
          { q: "Brazil's capital?", options: ["Rio", "São Paulo", "Brasília"], answer: 2, explain: "Built for government in 1960!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
