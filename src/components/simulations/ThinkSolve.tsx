"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Button, Badge } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

interface ScenarioResp {
  scenario: { skill: string; skillIcon: string; skillLabel: string; prompt: string; hint: string; xp: number };
  attempts: number;
  solved: boolean;
}

/**
 * Think & Solve: a real-world problem scenario for this lab.
 * The child reasons in their own words — the check is lenient (keyword
 * overlap) and different-but-reasoned answers are always valid. Marking
 * solved after comparing with the expert answer awards XP once per lab.
 */
export function ThinkSolve({ moduleId }: { moduleId: string }) {
  const { profile, setProfile } = useAppStore();
  const [data, setData] = useState<ScenarioResp | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ message: string; solution: string | null } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [xpPop, setXpPop] = useState(0);

  useEffect(() => {
    setData(null); setResult(null); setAnswer(""); setShowHint(false); setXpPop(0);
    fetch(`/api/think-solve?moduleId=${encodeURIComponent(moduleId)}`)
      .then((r) => r.json())
      .then((d) => { if (d.scenario) setData(d); })
      .catch(() => {});
  }, [moduleId]);

  if (!data) return null;
  const s = data.scenario;

  const check = async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/think-solve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, action: "check", answer }),
      }).then((r) => r.json());
      setResult({ message: r.message, solution: r.solution ?? null });
    } finally { setBusy(false); }
  };

  const reveal = async () => {
    const r = await fetch("/api/think-solve", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, action: "reveal" }),
    }).then((r) => r.json());
    setResult({ message: "💡 Here's how an expert would think about it:", solution: r.solution });
  };

  const markSolved = async () => {
    const r = await fetch("/api/think-solve", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, action: "solved" }),
    }).then((r) => r.json());
    if (r.xpGained > 0) {
      setProfile({ totalXp: profile.totalXp + r.xpGained });
      setXpPop(r.xpGained);
      setTimeout(() => setXpPop(0), 4000);
    }
    setData({ ...data, solved: true });
  };

  return (
    <Card className="mt-4 border-2 border-emerald-200 bg-emerald-50/40">
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="font-display font-extrabold text-lg">{s.skillIcon} Think &amp; Solve: {s.skillLabel}</p>
          <div className="flex items-center gap-2">
            {data.attempts > 0 && <Badge className="bg-white text-slate-600">✏️ {data.attempts} {data.attempts === 1 ? "try" : "tries"}</Badge>}
            {data.solved ? (
              <Badge className="bg-green-100 text-green-800">✅ Solved!</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800">⭐ {s.xp} XP</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1">A real-world problem to think through. There&apos;s no single right answer — reasoning is the win! 🧠</p>

        <div className="mt-3 p-4 bg-white rounded-xl border border-emerald-100">
          <p className="font-medium leading-relaxed">{s.prompt}</p>
        </div>

        {data.solved && !result && (
          <p className="mt-3 text-sm font-bold text-green-700">You cracked this one already — revisit anytime to think again! 🎉</p>
        )}

        {!data.solved && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your thinking here — full sentences, your own ideas..."
              rows={3}
              className="mt-3 w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-emerald-400 outline-none"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              <Button variant="fun" size="sm" disabled={busy || answer.trim().length < 10} onClick={check}>
                {busy ? "Thinking..." : "🎯 Check my thinking"}
              </Button>
              {!showHint && (
                <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}>💡 Need a hint?</Button>
              )}
              {!result?.solution && (
                <Button variant="ghost" size="sm" onClick={reveal}>📖 Show expert answer</Button>
              )}
              {result?.solution && !data.solved && (
                <Button variant="fun" size="sm" onClick={markSolved}>✅ I thought it through! (+{s.xp} XP)</Button>
              )}
            </div>
          </>
        )}

        {showHint && !result?.solution && (
          <p className="mt-3 p-3 bg-amber-50 rounded-xl text-sm border border-amber-100">💡 <b>Hint:</b> {s.hint}</p>
        )}

        {result?.solution && (
          <div className="mt-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-sm font-bold text-violet-800">{result.message}</p>
            <p className="text-sm text-slate-700 mt-2"><b>Expert thinking:</b> {result.solution}</p>
          </div>
        )}

        {xpPop > 0 && (
          <p className="mt-2 text-sm font-black text-amber-600 animate-bounce">+{xpPop} XP earned! ⭐</p>
        )}

        {/* Big celebration toast so the reward is impossible to miss */}
        {xpPop > 0 && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-2xl p-5 shadow-2xl max-w-sm animate-celebrate">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">🧠 Think &amp; Solve</p>
              <p className="text-3xl my-1">🎉</p>
              <p className="font-display font-extrabold text-xl">+{xpPop} XP earned!</p>
              <p className="text-sm opacity-90 mt-1">Great reasoning — that&apos;s how scientists think!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
