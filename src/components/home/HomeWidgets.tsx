"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button, Progress } from "@/components/ui/primitives";
import { CROSS_PROJECTS } from "@/db/seed-data-3";
import { useAppStore } from "@/stores/appStore";
import { getAdaptiveDifficulty, difficultyLabel } from "@/lib/adaptive";

/* ---------- Trackable Mega Projects ---------- */
export function MegaProjects() {
  const [progress, setProgress] = useState<Record<string, { checked: number[]; status: string }>>({});
  const [justDone, setJustDone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/megaprojects").then((r) => r.json()).then((rows: any[]) => {
      const map: Record<string, { checked: number[]; status: string }> = {};
      for (const p of rows ?? []) map[p.id] = { checked: p.checkedSteps ?? [], status: p.status };
      setProgress(map);
    }).catch(() => {});
  }, []);

  const toggle = async (projId: string, stepIdx: number, totalSteps: number) => {
    const cur = progress[projId] ?? { checked: [], status: "in_progress" };
    const checked = cur.checked.includes(stepIdx) ? cur.checked.filter((i) => i !== stepIdx) : [...cur.checked, stepIdx];
    setProgress({ ...progress, [projId]: { ...cur, checked } });
    try {
      const res = await fetch("/api/megaprojects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projId, checkedSteps: checked, totalSteps }),
      }).then((r) => r.json());
      if (res.newlyCompleted) {
        setProgress((p) => ({ ...p, [projId]: { checked, status: "completed" } }));
        setJustDone(projId);
        // surface any unlocked achievements in the global toast queue
        if (res.newAchievements?.length) {
          useAppStore.setState((s: any) => ({
            pendingAchievements: [...s.pendingAchievements, ...res.newAchievements],
            earnedIds: [...s.earnedIds, ...res.newAchievements.map((a: any) => a.id)],
          }));
        }
        // refresh XP in the top bar
        fetch("/api/profile").then((r) => r.json()).then((prof) => {
          if (prof && !prof.error) {
            useAppStore.setState((s: any) => ({
              profile: { ...s.profile, totalXp: prof.totalXp ?? prof.total_xp ?? s.profile.totalXp },
            }));
          }
        }).catch(() => {});
        setTimeout(() => setJustDone(null), 5000);
      }
    } catch {}
  };

  const doneCount = Object.values(progress).filter((p) => p.status === "completed").length;

  return (
    <div>
      <h2 className="font-display font-extrabold text-2xl mb-1">🔗 Mega Projects <Badge>cross-subject!</Badge></h2>
      <p className="text-sm text-slate-500 mb-3">Combine worlds like real scientists & artists do. {doneCount}/{CROSS_PROJECTS.length} complete — each finished project earns +100 XP! 🏆</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CROSS_PROJECTS.map((p) => {
          const prog = progress[p.id] ?? { checked: [], status: "in_progress" };
          const pct = Math.round((prog.checked.length / p.steps.length) * 100);
          const isDone = prog.status === "completed";
          return (
            <Card key={p.id} className={isDone ? "border-2 border-green-400 bg-green-50" : justDone === p.id ? "border-2 border-amber-400 animate-celebrate" : ""}>
              <CardContent>
                <p className="font-extrabold">{isDone ? "✅ " : ""}{p.title}</p>
                <p className="text-sm text-slate-600">{p.description}</p>
                <Progress value={pct} className="mt-2" />
                <ol className="text-sm mt-2 space-y-1">
                  {p.steps.map((s, i) => (
                    <li key={i}>
                      <button onClick={() => toggle(p.id, i, p.steps.length)} className="flex gap-2 items-start text-left w-full hover:bg-slate-50 rounded-lg px-1 py-0.5">
                        <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs shrink-0 ${prog.checked.includes(i) ? "bg-green-500 border-green-500 text-white" : "border-slate-300"}`}>
                          {prog.checked.includes(i) ? "✓" : ""}
                        </span>
                        <span className={prog.checked.includes(i) ? "line-through text-slate-400" : "text-slate-700"}>{s}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Adaptive recommendations ---------- */
// Subjects featured in the daily spotlight rotation — smaller subjects get priority so they don't get buried.
const SPOTLIGHT_SUBJECTS = ["language", "geography", "art", "biology"];

export function RecommendedRow({ modules, subjects }: { modules: any[]; subjects: any[] }) {
  const { profile, moduleProgress } = useAppStore();
  const age = profile.age || 8;
  const doneIds = new Set(
    Object.entries(moduleProgress).filter(([, v]: any) => v.status === "completed").map(([k]) => k)
  );
  const subjDone: Record<string, number> = {};
  const subjTotal: Record<string, number> = {};
  for (const m of modules) {
    const sid = m.subjectId ?? m.subject_id;
    subjTotal[sid] = (subjTotal[sid] ?? 0) + 1;
    if (doneIds.has(m.id)) subjDone[sid] = (subjDone[sid] ?? 0) + 1;
  }

  // Size-based boost: the fewer modules a subject has, the more its labs get boosted in the ranking,
  // so language/geography labs rotate into the recommended row instead of always losing to physics/math.
  const sizeRank: Record<string, number> = {};
  Object.keys(subjTotal)
    .sort((a, b) => (subjTotal[a] ?? 0) - (subjTotal[b] ?? 0))
    .forEach((sid, i) => { sizeRank[sid] = i; });
  const smallBoost = (sid: string) => {
    const max = Math.max(1, Object.keys(sizeRank).length - 1);
    return ((max - (sizeRank[sid] ?? max)) / max) * 1.5; // up to +1.5 for the smallest subject
  };

  // Daily spotlight: deterministically feature one lab from a smaller subject, rotating by day-of-year.
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const availableSpotlight = SPOTLIGHT_SUBJECTS.filter((sid) => (subjTotal[sid] ?? 0) > 0);
  const spotlightSubjectId = availableSpotlight.length
    ? availableSpotlight[dayOfYear % availableSpotlight.length]
    : null;
  const spotlightPool = spotlightSubjectId
    ? modules.filter((m) => {
        const sid = m.subjectId ?? m.subject_id;
        return sid === spotlightSubjectId && !doneIds.has(m.id) && (m.ageMin ?? m.age_min ?? 5) <= age && age <= (m.ageMax ?? m.age_max ?? 14);
      })
    : [];
  const spotlight = spotlightPool.length ? spotlightPool[dayOfYear % spotlightPool.length] : null;
  const spotlightSubjectName = spotlightSubjectId ? subjects.find((s) => s.id === spotlightSubjectId)?.name : null;
  const candidates = modules
    .filter((m) => !doneIds.has(m.id) && m.id !== spotlight?.id && (m.ageMin ?? m.age_min ?? 5) <= age && age <= (m.ageMax ?? m.age_max ?? 14))
    .map((m) => {
      const sid = m.subjectId ?? m.subject_id;
      const best = (moduleProgress[m.id] as any)?.bestScore ?? 0;
      const rec = getAdaptiveDifficulty(age, best, m.difficulty ?? 1, profile.preferredDifficulty || "auto");
      const subjRatio = (subjDone[sid] ?? 0) / Math.max(1, subjTotal[sid] ?? 1);
      return { m, sid, rec, score: Math.abs((m.difficulty ?? 1) - rec) + subjRatio * 2 - smallBoost(sid) };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, spotlight ? 2 : 3);

  if (!candidates.length && !spotlight) return null;
  return (
    <div>
      <h2 className="font-display font-extrabold text-2xl mb-1">🤖 Recommended for you</h2>
      <p className="text-sm text-slate-500 mb-3">Picked by the adaptive engine for age {age} ({difficultyLabel(getAdaptiveDifficulty(age, 0, 2, profile.preferredDifficulty || "auto"))} level).</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spotlight && (
          <Link key={spotlight.id} href={`/learn/${spotlightSubjectId}/${spotlight.id}`}>
            <Card className="hover:scale-[1.02] hover:shadow-lg transition-all h-full border-2 border-amber-300 bg-amber-50">
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{spotlight.icon}</span>
                  <div>
                    <p className="font-display font-extrabold text-lg leading-tight">{spotlight.title}</p>
                    <p className="text-xs text-amber-700 font-bold">⭐ {spotlightSubjectName} spotlight • rotates daily</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{spotlight.description}</p>
              </CardContent>
            </Card>
          </Link>
        )}
        {candidates.map(({ m, sid, rec }) => (
          <Link key={m.id} href={`/learn/${sid}/${m.id}`}>
            <Card className="hover:scale-[1.02] hover:shadow-lg transition-all h-full border-2 border-violet-200">
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{m.icon}</span>
                  <div>
                    <p className="font-display font-extrabold text-lg leading-tight">{m.title}</p>
                    <p className="text-xs text-slate-500">{subjects.find((s) => s.id === sid)?.name} • {difficultyLabel(rec)}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{m.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
