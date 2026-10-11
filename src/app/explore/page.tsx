"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

const DIFFICULTY_LABELS: Record<string, string> = {
  "1": "🌱 Sprout (1)", "2": "🌿 Growing (2)", "3": "🌳 Confident (3)", "4": "⛰️ Challenger (4)", "5": "🚀 Expert (5)",
};
const SORTS = [
  { id: "recommended", label: "🎯 Best for my age" },
  { id: "az", label: "🔤 A–Z" },
  { id: "shortest", label: "⏱️ Quickest first" },
  { id: "hardest", label: "💪 Hardest first" },
  { id: "easiest", label: "🌱 Easiest first" },
];

export default function ExplorePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState<number | "any">("any");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [maxMins, setMaxMins] = useState<number>(60);
  const [hideDone, setHideDone] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [showMore, setShowMore] = useState(false);
  const { moduleProgress, profile } = useAppStore();

  useEffect(() => {
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects).catch(() => {});
    fetch("/api/modules").then((r) => r.json()).then(setModules).catch(() => {});
  }, []);

  const age = profile.age || 8;
  const childAge = profile.age ?? null;

  const list = modules.filter((m: any) => {
    const sid = m.subjectId ?? m.subject_id;
    if (filter !== "all" && sid !== filter) return false;
    if (q && !(`${m.title} ${m.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (ageFilter !== "any" && ((m.ageMin ?? 5) > ageFilter || ageFilter > (m.ageMax ?? 14))) return false;
    if (diffFilter !== "all" && String(m.difficulty ?? 1) !== diffFilter) return false;
    if ((m.estimatedMinutes ?? m.estimated_minutes ?? 15) > maxMins) return false;
    if (hideDone && moduleProgress[m.id]?.status === "completed") return false;
    return true;
  });

  // Age-fit distance: 0 = perfect fit for the child's age
  const ageFit = (m: any) => {
    const lo = m.ageMin ?? 5, hi = m.ageMax ?? 14;
    if (!childAge) return 0;
    if (age >= lo && age <= hi) return 0;
    return age < lo ? lo - age : age - hi;
  };

  if (sort === "recommended") {
    list.sort((a: any, b: any) => {
      const d = ageFit(a) - ageFit(b);
      if (d !== 0) return d;
      return (a.difficulty ?? 1) - (b.difficulty ?? 1);
    });
  } else if (sort === "az") {
    list.sort((a: any, b: any) => (a.title ?? "").localeCompare(b.title ?? ""));
  } else if (sort === "shortest") {
    list.sort((a: any, b: any) => (a.estimatedMinutes ?? 15) - (b.estimatedMinutes ?? 15));
  } else if (sort === "hardest") {
    list.sort((a: any, b: any) => (b.difficulty ?? 1) - (a.difficulty ?? 1));
  } else if (sort === "easiest") {
    list.sort((a: any, b: any) => (a.difficulty ?? 1) - (b.difficulty ?? 1));
  }

  const filtersActive = filter !== "all" || ageFilter !== "any" || diffFilter !== "all" || maxMins < 60 || hideDone || q;
  const resetAll = () => { setFilter("all"); setAgeFilter("any"); setDiffFilter("all"); setMaxMins(60); setHideDone(false); setQ(""); };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">
      <h1 className="font-display font-black text-3xl">✨ Explore all labs</h1>
      <div className="flex gap-2 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search labs... (try 'music' or 'gravity')" className="flex-1 min-w-[200px] border-2 border-slate-200 rounded-xl px-4 py-2 font-medium" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button onClick={() => setShowMore(!showMore)} className="border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white">
          🎛️ Filters {filtersActive && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-1" />}
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-sm font-bold ${filter === "all" ? "bg-slate-900 text-white" : "bg-white border"}`}>All</button>
        {subjects.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)} className={`px-3 py-1.5 rounded-full text-sm font-bold ${filter === s.id ? "bg-slate-900 text-white" : "bg-white border"}`}>{s.icon} {s.name}</button>
        ))}
      </div>

      {showMore && (
        <Card><CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">🎂 Age</label>
            <select value={String(ageFilter)} onChange={(e) => setAgeFilter(e.target.value === "any" ? "any" : Number(e.target.value))} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium bg-white">
              <option value="any">Any age</option>
              {Array.from({ length: 10 }, (_, i) => i + 5).map((a) => <option key={a} value={a}>Age {a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">💪 Difficulty</label>
            <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium bg-white">
              <option value="all">All levels</option>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">⏱️ Max time: {maxMins === 60 ? "any" : `${maxMins} min`}</label>
            <input type="range" min={5} max={60} step={5} value={maxMins} onChange={(e) => setMaxMins(Number(e.target.value))} className="w-full mt-2 accent-blue-600" />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              🙈 Hide completed
            </label>
            {filtersActive && <button onClick={resetAll} className="text-sm font-bold text-blue-600 underline text-left">↺ Reset all filters</button>}
          </div>
        </CardContent></Card>
      )}

      <p className="text-sm text-slate-500">
        {list.length} lab{list.length === 1 ? "" : "s"}{q && ` for "${q}"`}
        {ageFilter !== "any" && ` for age ${ageFilter}`}
        {diffFilter !== "all" && ` at level ${diffFilter}`}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((m: any) => {
          const sid = m.subjectId ?? m.subject_id;
          const st = (moduleProgress[m.id] as any)?.status;
          const withParent = childAge != null && ((m.ageMin ?? 5) > age || age > (m.ageMax ?? 14));
          return (
            <Link key={m.id} href={`/learn/${sid}/${m.id}`}>
              <Card className="hover:scale-[1.02] hover:shadow-lg transition-all h-full">
                <CardContent>
                  <div className="flex items-start gap-2">
                    <span className="text-3xl">{m.icon}</span>
                    <div className="min-w-0">
                      <p className="font-extrabold leading-tight">{m.title}</p>
                      <p className="text-xs text-slate-500">{subjects.find((s) => s.id === sid)?.name} • {m.estimatedMinutes ?? m.estimated_minutes ?? 15} min • Lvl {m.difficulty}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{m.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {st === "completed" && <Badge className="bg-green-100 text-green-800">✅ Completed</Badge>}
                    {st === "in_progress" && <Badge className="bg-blue-100 text-blue-800">▶️ Started</Badge>}
                    {withParent && <Badge className="bg-amber-100 text-amber-800">👨‍👩‍👧 With parent</Badge>}
                    {sort === "recommended" && ageFit(m) === 0 && !withParent && <Badge className="bg-violet-100 text-violet-800">🎯 Age fit</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-bold text-lg">No labs match those filters</p>
          <button onClick={resetAll} className="mt-2 font-bold text-blue-600 underline">Reset all filters</button>
        </div>
      )}
    </div>
  );
}
