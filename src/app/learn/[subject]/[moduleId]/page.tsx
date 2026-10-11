"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui/primitives";
import { SimulationRenderer } from "@/components/simulations/registry";
import { LearnTabs } from "@/components/simulations/shared";
import { ThinkSolve } from "@/components/simulations/ThinkSolve";
import { useAppStore } from "@/stores/appStore";
import { getAdaptiveDifficulty, difficultyLabel } from "@/lib/adaptive";

const parse = (v: any, fb: any = []) => {
  try { return typeof v === "string" ? JSON.parse(v) : v ?? fb; } catch { return fb; }
};

export default function ModulePage({ params }: { params: { subject: string; moduleId: string } }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const { recordProgress, profile } = useAppStore();
  const startRef = React.useRef(Date.now());
  const collectedRef = React.useRef("");

  // Collect this lab's words into the vocabulary collection (once per module)
  const collectWords = (mod: any) => {
    if (collectedRef.current === mod.id) return;
    collectedRef.current = mod.id;
    const words = parse(mod.vocabularyWords ?? mod.vocabulary_words);
    if (!words.length) return;
    fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        words: words.map((w: any) => ({
          word: w.word, definition: w.definition, example: w.example,
          subject: params.subject, moduleId: mod.id,
        })),
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    fetch(`/api/modules/${params.moduleId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject("not found")))
      .then((d) => { setData(d); collectWords(d.module); })
      .catch(() => setError("Module not found 😢"));
    startRef.current = Date.now();
    recordProgress(params.moduleId, { timeSpentSeconds: 5 });
    const iv = setInterval(() => recordProgress(params.moduleId, { timeSpentSeconds: 60 }), 60000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.moduleId]);

  if (error) return <div className="p-8 text-center"><p>{error}</p><Link href="/" className="underline font-bold">← Home</Link></div>;
  if (!data) return <p className="p-8">Loading lab... 🔄</p>;
  const m = data.module;
  const recommended = getAdaptiveDifficulty(
    profile.age || 8,
    data.progress?.bestScore ?? data.progress?.best_score ?? 0,
    m.difficulty ?? 1,
    profile.preferredDifficulty || "auto"
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">
      <Link href={`/learn/${params.subject}`} className="text-sm font-bold text-slate-500">← Back</Link>
      <div>
        <h1 className="font-display font-black text-3xl">{m.icon} {m.title}</h1>
        <p className="text-slate-600 max-w-3xl">{m.longDescription ?? m.long_description ?? m.description}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <Badge>⏱️ {m.estimatedMinutes ?? m.estimated_minutes} min</Badge>
          <Badge>🎂 Ages {m.ageMin ?? m.age_min}–{m.ageMax ?? m.age_max}</Badge>
          <Badge>💪 Level {m.difficulty}/5</Badge>
          {(m.simulationType ?? m.simulation_type) === "phet-embed" && <Badge className="bg-sky-100 text-sky-800">🌐 PhET Interactive</Badge>}
          {(m.simulationType ?? m.simulation_type) === "embed-lab" && <Badge className="bg-teal-100 text-teal-800">🌐 {parse(m.defaultConfig ?? m.default_config).sourceLabel ?? "Web Lab"}</Badge>}
          <Badge className="bg-violet-100 text-violet-800">🤖 Recommended for you: {difficultyLabel(recommended)}</Badge>
        </div>
      </div>
      <SimulationRenderer type={m.simulationType ?? m.simulation_type} moduleId={m.id} />
      <ThinkSolve moduleId={m.id} />
      <LearnTabs
        objectives={parse(m.learningObjectives ?? m.learning_objectives)}
        vocabulary={parse(m.vocabularyWords ?? m.vocabulary_words)}
        funFacts={parse(m.funFacts ?? m.fun_facts)}
        tryAtHome={parse(m.tryAtHome ?? m.try_at_home)}
      />
      {data.activities?.length > 0 && (
        <Card><CardContent>
          <p className="font-extrabold mb-2">🎯 Missions in this lab:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.activities.map((a: any) => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-xl text-sm">
                <p className="font-bold">{a.type === "explore" ? "🔍" : a.type === "guided" ? "🗺️" : a.type === "challenge" ? "🏆" : "🧠"} {a.title} <span className="text-amber-600">+{a.xpReward ?? a.xp_reward} XP</span></p>
                <p className="text-slate-600">{a.instructions}</p>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
