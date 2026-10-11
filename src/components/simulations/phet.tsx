"use client";
import React, { useEffect, useRef, useState } from "react";
import { SimulationShell } from "./shared";
import { Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

const parse = (v: any, fb: any = []) => {
  try { return typeof v === "string" ? JSON.parse(v) : v ?? fb; } catch { return fb; }
};

/* ---- PhET EMBED: official iframe embedding (CC-BY 4.0, attribution below) ----
   URL pattern: https://phet.colorado.edu/sims/html/{slug}/latest/{slug}_en.html
   allowLinks=false keeps kids inside the app. Requires internet (native labs work offline). */
export function PhetEmbed({ moduleId }: { moduleId: string }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [missions, setMissions] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);
  const [isFs, setIsFs] = useState(false); // native Fullscreen API active
  const [expanded, setExpanded] = useState(false); // CSS fallback (e.g. iPhone Safari)
  const wrapRef = useRef<HTMLDivElement>(null);
  const { recordProgress } = useAppStore();

  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const cfg = parse(d.module?.defaultConfig ?? d.module?.default_config);
        setSlug(cfg.slug ?? null);
        setMissions(cfg.missions ?? []);
      })
      .catch(() => setFailed(true));
    recordProgress(moduleId, { timeSpentSeconds: 10 });
  }, [moduleId]);

  const toggle = (i: number) => {
    const n = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
    setChecked(n);
    recordProgress(moduleId, { timeSpentSeconds: 30, score: 75 });
    if (missions.length > 0 && n.length === missions.length) {
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 100, status: "completed" });
    }
  };

  const toggleFullscreen = async () => {
    if (expanded) { setExpanded(false); return; }
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    } catch {}
    const el = wrapRef.current;
    try {
      if (el?.requestFullscreen) { await el.requestFullscreen(); return; }
    } catch {}
    // Native fullscreen unavailable/denied (e.g. iPhone Safari) → overlay fallback
    setExpanded(true);
  };
  const fsActive = isFs || expanded;

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  useEffect(() => {
    if (!expanded) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const src = slug ? `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_en.html?allowLinks=false` : null;
  const done = missions.length > 0 && checked.length === missions.length;

  return (
    <SimulationShell title="PhET Interactive Lab" icon="🌐"
      controls={<>
        <p className="text-sm font-bold">🎯 Missions ({checked.length}/{missions.length}):</p>
        {missions.map((mis, i) => (
          <button key={i} onClick={() => toggle(i)} className="flex gap-2 items-start text-left w-full hover:bg-slate-50 rounded-lg px-1 py-1 text-sm">
            <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs shrink-0 ${checked.includes(i) ? "bg-green-500 border-green-500 text-white" : "border-slate-300"}`}>
              {checked.includes(i) ? "✓" : ""}
            </span>
            <span className={checked.includes(i) ? "line-through text-slate-400" : ""}>{mis}</span>
          </button>
        ))}
        {done && <p className="font-bold text-green-600 text-sm">🎉 Lab complete! +XP earned!</p>}
        <Button size="sm" variant="outline" onClick={toggleFullscreen} className="w-full">{fsActive ? "🗗 Exit fullscreen" : "⛶ Fullscreen"}</Button>
        <p className="text-xs text-slate-500">🌐 Needs internet — native CuriousMinds labs work offline.</p>
      </>}
      dataPanel={<div className="text-sm space-y-1">
        <p>🏛️ Simulation by <b>PhET Interactive Simulations</b>, University of Colorado Boulder</p>
        <p className="text-xs text-slate-500">Licensed CC-BY 4.0 • Free for education • <a className="underline" href={src ?? undefined} target="_blank" rel="noreferrer">Open on phet.colorado.edu ↗</a></p>
      </div>}>
      <div ref={wrapRef} className={fsActive ? "fixed inset-0 z-[100] bg-slate-900 flex flex-col" : "bg-slate-900 relative"}>
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {!fsActive ? (
            <button onClick={toggleFullscreen} title="View fullscreen" className="px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-sm font-bold hover:bg-slate-900">
              ⛶ Fullscreen
            </button>
          ) : (
            <button onClick={toggleFullscreen} title="Exit fullscreen (Esc)" className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-200">
              ✕ Exit (Esc)
            </button>
          )}
        </div>
        {failed || !src ? (
          <div className="p-10 text-center text-white">
            <p className="text-4xl">🌐</p>
            <p className="font-bold">{failed ? "Couldn't load the PhET sim." : "Loading PhET sim..."}</p>
            <p className="text-sm text-slate-300">Check your internet connection, then reload.</p>
          </div>
        ) : (
          <iframe title={`PhET sim ${slug}`} src={src} className={`w-full border-0 ${fsActive ? "flex-1 min-h-0" : ""}`} style={fsActive ? { height: "100%", minHeight: 0 } : { aspectRatio: "834/504", minHeight: "320px" }} allow="fullscreen" allowFullScreen loading="lazy" />
        )}
      </div>
    </SimulationShell>
  );
}
