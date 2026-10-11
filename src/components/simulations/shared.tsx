"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs } from "@/components/ui/primitives";

export function SimulationShell({ title, icon, children, controls, dataPanel, onSave }: {
  title: string; icon: string; children: React.ReactNode; controls?: React.ReactNode; dataPanel?: React.ReactNode; onSave?: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
      <div className="simulation-canvas min-h-[320px] md:min-h-[420px] relative">{children}</div>
      <div className="space-y-3">
        {controls && <Card><CardHeader><CardTitle>🎛️ Controls</CardTitle></CardHeader><CardContent className="space-y-3">{controls}</CardContent></Card>}
        {dataPanel && <Card><CardHeader><CardTitle>📊 Data</CardTitle></CardHeader><CardContent>{dataPanel}</CardContent></Card>}
        {onSave && <Button variant="fun" className="w-full" onClick={onSave}>💾 Save Creation</Button>}
      </div>
    </div>
  );
}

export function LearnTabs({ objectives, vocabulary, funFacts, tryAtHome }: {
  objectives: string[]; vocabulary: Array<{ word: string; definition: string; example?: string }>; funFacts: string[]; tryAtHome: string[];
}) {
  const [tab, setTab] = useState("objectives");
  return (
    <Card className="mt-4">
      <CardContent>
        <Tabs tabs={[{ id: "objectives", label: "🎯 Learn" }, { id: "words", label: "📖 Words" }, { id: "facts", label: "🤯 Fun Facts" }, { id: "home", label: "🏠 Try at Home" }]} active={tab} onChange={setTab} />
        <div className="pt-4">
          {tab === "objectives" && <ul className="space-y-2">{objectives.map((o, i) => <li key={i} className="flex gap-2 text-sm"><span>✅</span>{o}</li>)}</ul>}
          {tab === "words" && <div className="grid sm:grid-cols-2 gap-2">{vocabulary.map((v, i) => (
            <div key={i} className="p-3 bg-violet-50 rounded-xl"><p className="font-bold text-violet-800">{v.word}</p><p className="text-sm text-slate-600">{v.definition}</p>{v.example && <p className="text-xs italic text-slate-500 mt-1">e.g. {v.example}</p>}</div>
          ))}{vocabulary.length === 0 && <p className="text-sm text-slate-500">Vocabulary coming soon!</p>}</div>}
          {vocabulary.length > 0 && <a href="/vocabulary" className="block text-sm font-bold text-violet-700 mt-2">📚 These words were saved to your Word Collection — review them! →</a>}
          {tab === "facts" && <ul className="space-y-2">{funFacts.map((f, i) => <li key={i} className="flex gap-2 text-sm"><span>🤯</span>{f}</li>)}</ul>}
          {tab === "home" && <ul className="space-y-2">{tryAtHome.map((t, i) => <li key={i} className="flex gap-2 text-sm"><span>🏠</span>{t}</li>)}</ul>}
        </div>
      </CardContent>
    </Card>
  );
}

export function Quiz({ questions, onComplete }: { questions: Array<{ q: string; options: string[]; answer: number; explain?: string }>; onComplete: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  if (questions.length === 0) return null;
  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return <Card className="mt-4 text-center"><CardContent><p className="text-4xl">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</p><p className="font-display font-extrabold text-2xl">You scored {correct}/{questions.length}!</p><Button className="mt-3" onClick={() => { setIdx(0); setCorrect(0); setDone(false); setPicked(null); }}>Try Again</Button></CardContent></Card>;
  }
  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>🧠 Knowledge Check ({idx + 1}/{questions.length})</CardTitle></CardHeader>
      <CardContent>
        <p className="font-bold mb-3">{cur.q}</p>
        <div className="grid gap-2">
          {cur.options.map((o, i) => (
            <button key={i} disabled={picked !== null} onClick={() => setPicked(i)}
              className={`text-left px-4 py-2.5 rounded-xl border-2 font-medium text-sm ${picked === null ? "border-slate-200 hover:border-blue-400" : i === cur.answer ? "border-green-500 bg-green-50" : picked === i ? "border-red-400 bg-red-50" : "border-slate-200 opacity-60"}`}>{o}</button>
          ))}
        </div>
        {picked !== null && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm">{picked === cur.answer ? "✅ Correct! " : "❌ Not quite. "}{cur.explain ?? ""}</p>
            <Button size="sm" onClick={() => {
              const c = correct + (picked === cur.answer ? 1 : 0);
              if (idx + 1 >= questions.length) { setCorrect(c); setDone(true); onComplete(Math.round((c / questions.length) * 100)); }
              else { setCorrect(c); setIdx(idx + 1); setPicked(null); }
            }}>{idx + 1 >= questions.length ? "Finish" : "Next →"}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SaveButton({ onSave, label = "💾 Save to My Projects" }: { onSave: () => Promise<void> | void; label?: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  return (
    <Button variant="fun" onClick={async () => { setState("saving"); await onSave(); setState("saved"); setTimeout(() => setState("idle"), 2000); }} disabled={state !== "idle"}>
      {state === "idle" ? label : state === "saving" ? "Saving..." : "✅ Saved!"}
    </Button>
  );
}

export async function saveCreation(title: string, type: string, data: unknown, extra?: { moduleId?: string; subjectId?: string; thumbnail?: string }) {
  await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, type, data, ...extra }) });
}
