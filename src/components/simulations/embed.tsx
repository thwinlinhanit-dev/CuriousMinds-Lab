"use client";
import React, { useEffect, useRef, useState } from "react";
import { SimulationShell } from "./shared";
import { Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

const parse = (v: any, fb: any = {}) => {
  try { return typeof v === "string" ? JSON.parse(v) : v ?? fb; } catch { return fb; }
};

/* ---- Generic web-embed lab (Chrome Music Lab, Javalab, Scratch, Sketchfab, …) ----
   defaultConfig: { source, url, aspect ("16/9"), attributionName, attributionUrl, missions[] } */
export function EmbedLab({ moduleId }: { moduleId: string }) {
  const [cfg, setCfg] = useState<any>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const [configFailed, setConfigFailed] = useState(false);
  // iframe lifecycle: loading -> ready | slow (still waiting) | failed
  const [loadState, setLoadState] = useState<"loading" | "ready" | "slow" | "failed">("loading");
  const [iframeKey, setIframeKey] = useState(0);
  const [isFs, setIsFs] = useState(false); // native Fullscreen API active
  const [expanded, setExpanded] = useState(false); // CSS fallback (e.g. iPhone Safari)
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;
  const { recordProgress } = useAppStore();

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const armSlowTimer = () => {
    clearTimer();
    // If the external site hangs (e.g. chiark timing out), show help instead of a blank frame.
    timer.current = setTimeout(() => {
      if (loadStateRef.current === "loading") setLoadState("slow");
    }, 12000);
  };

  useEffect(() => {
    setLoadState("loading");
    setConfigFailed(false);
    setIframeKey(0);
    fetch(`/api/modules/${moduleId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setCfg(parse(d.module?.defaultConfig ?? d.module?.default_config));
        setLoadState("loading");
        armSlowTimer();
      })
      .catch(() => { setConfigFailed(true); clearTimer(); });
    recordProgress(moduleId, { timeSpentSeconds: 10 });
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const retry = () => {
    setLoadState("loading");
    setIframeKey((k) => k + 1);
    armSlowTimer();
  };

  // ---- Fullscreen: native API with CSS-overlay fallback ----
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

  const missions: string[] = cfg?.missions ?? [];
  const toggle = (i: number) => {
    const n = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
    setChecked(n);
    recordProgress(moduleId, { timeSpentSeconds: 30, score: 75 });
    if (missions.length > 0 && n.length === missions.length) {
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 100, status: "completed" });
    }
  };

  const done = missions.length > 0 && checked.length === missions.length;

  return (
    <SimulationShell title={cfg?.sourceLabel ?? "Web Lab"} icon="🌐"
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
        <p>🏛️ <b>{cfg?.attributionName ?? "External interactive"}</b></p>
        <p className="text-xs text-slate-500">{cfg?.license ?? "Free for education"} • <a className="underline" href={cfg?.attributionUrl ?? cfg?.url} target="_blank" rel="noreferrer">Open original ↗</a></p>
      </div>}>
      <div ref={wrapRef} className={fsActive ? "fixed inset-0 z-[100] bg-slate-900 flex flex-col" : "bg-slate-900 relative"}>
        {/* Floating view controls over the lab */}
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
        {configFailed || !cfg?.url ? (
          <div className="p-10 text-center text-white">
            <p className="text-4xl">🌐</p>
            <p className="font-bold">{configFailed ? "Couldn't load this web lab." : "Loading web lab..."}</p>
            <p className="text-sm text-slate-300">Check your internet connection, then reload.</p>
            {configFailed && (
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-bold">
                ↻ Reload page
              </button>
            )}
          </div>
        ) : (
          <div className={fsActive ? "relative flex-1 flex flex-col min-h-0" : "relative"}>
            {(loadState === "loading" || loadState === "slow" || loadState === "failed") && (
              <div className="p-6 text-center text-white" role="status">
                <p className="text-3xl">{loadState === "failed" ? "😢" : "⏳"}</p>
                <p className="font-bold">
                  {loadState === "failed"
                    ? "This web lab didn't respond."
                    : loadState === "slow"
                      ? "Still loading — the puzzle site is slow right now…"
                      : "Loading web lab…"}
                </p>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  {loadState === "failed"
                    ? "The external site took too long to respond. Your progress is safe — try again or open it directly."
                    : "If it stays here, the external site may be slow or blocked. You can wait, retry, or open it in a new tab."}
                </p>
                <div className="flex gap-2 justify-center mt-4 flex-wrap">
                  <button onClick={retry} className="px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-bold">
                    ↻ Retry
                  </button>
                  <a href={cfg.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-bold">
                    Open original ↗
                  </a>
                </div>
              </div>
            )}
            {loadState !== "failed" && (
              <>
                <iframe
                  key={iframeKey}
                  title={`Embedded lab ${moduleId}`}
                  src={cfg.url}
                  className={`w-full border-0 bg-white ${fsActive ? "flex-1 min-h-0" : ""}`}
                  style={fsActive ? { height: "100%", minHeight: 0 } : { aspectRatio: cfg.aspect ?? "16/10", minHeight: "360px" }}
                  allow="fullscreen; microphone; camera; autoplay"
                  allowFullScreen
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  onLoad={() => { clearTimer(); setLoadState("ready"); }}
                  onError={() => { clearTimer(); setLoadState("failed"); }}
                />
                <div className="flex gap-2 justify-center items-center py-2 px-3 bg-slate-800 text-xs text-slate-300 flex-wrap">
                  <span>Slow or blank? The puzzle site may be busy.</span>
                  <button onClick={retry} className="underline font-bold text-white">↻ Retry</button>
                  <span>•</span>
                  <a href={cfg.url} target="_blank" rel="noreferrer" className="underline font-bold text-white">
                    Open original ↗
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </SimulationShell>
  );
}
