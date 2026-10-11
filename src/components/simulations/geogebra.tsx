"use client";
import React, { useEffect, useRef, useState } from "react";
import { SimulationShell } from "./shared";
import { Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

declare global { interface Window { GGBApplet?: any; __ggbLoading?: Promise<void> } }

function loadDeployGGB(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.GGBApplet) return Promise.resolve();
  if (!window.__ggbLoading) {
    window.__ggbLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://www.geogebra.org/apps/deployggb.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("deployggb failed"));
      document.head.appendChild(s);
      setTimeout(() => reject(new Error("deployggb timeout")), 20000);
    });
  }
  return window.__ggbLoading;
}

/* ---- GeoGebra applet via official deployggb.js API ----
   defaultConfig: { materialId, missions[] } */
export function GeogebraLab({ moduleId }: { moduleId: string }) {
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [missions, setMissions] = useState<string[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const boxId = useRef(`ggb-${moduleId.replace(/[^a-z0-9]/gi, "")}`);
  const { recordProgress } = useAppStore();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/modules/${moduleId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        let cfg: any = {};
        try { cfg = JSON.parse(d.module?.defaultConfig ?? d.module?.default_config ?? "{}"); } catch {}
        if (cancelled) return;
        setMissions(cfg.missions ?? []);
        const mid = cfg.materialId;
        if (!mid) { setState("failed"); return; }
        setMaterialId(mid);
        recordProgress(moduleId, { timeSpentSeconds: 10 });
        loadDeployGGB()
          .then(() => {
            if (cancelled || !window.GGBApplet) { setState("failed"); return; }
            try {
              const applet = new window.GGBApplet(
                { material_id: mid, width: 800, height: 520, showToolBar: false, showAlgebraInput: false, showMenuBar: false, enableRightClick: false, enableLabelDrags: false, showResetIcon: true },
                true
              );
              applet.inject(boxId.current);
              // confirm something actually rendered
              setTimeout(() => {
                if (cancelled) return;
                const el = document.getElementById(boxId.current);
                const rendered = el && (el.querySelector("iframe,canvas,applet") || (el.childNodes.length > 0 && el.innerHTML.length > 500));
                setState(rendered ? "ready" : "failed");
              }, 6000);
            } catch { setState("failed"); }
          })
          .catch(() => { if (!cancelled) setState("failed"); });
      })
      .catch(() => { if (!cancelled) setState("failed"); });
    return () => { cancelled = true; };
  }, [moduleId]);

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
    <SimulationShell title="GeoGebra Lab" icon="📐"
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
        <p className="text-xs text-slate-500">🌐 Needs internet — applets by the GeoGebra team & teachers.</p>
      </>}
      dataPanel={<div className="text-sm space-y-1">
        <p>🏛️ <b>GeoGebra</b> (free math tools)</p>
        <p className="text-xs text-slate-500">Applet ID {materialId} • <a className="underline" href={materialId ? `https://www.geogebra.org/m/${materialId}` : undefined} target="_blank" rel="noreferrer">Open on GeoGebra ↗</a></p>
      </div>}>
      <div className="bg-white">
        {state === "failed" ? (
          <div className="p-10 text-center">
            <p className="text-4xl">📐</p>
            <p className="font-bold">Couldn't load this GeoGebra applet.</p>
            <p className="text-sm text-slate-500">Check internet, or <a className="underline font-bold" href={materialId ? `https://www.geogebra.org/m/${materialId}` : "https://www.geogebra.org"} target="_blank" rel="noreferrer">open it on GeoGebra ↗</a>.</p>
          </div>
        ) : (
          <>
            {state === "loading" && <p className="p-6 text-center text-slate-500">Loading GeoGebra applet... 🔄</p>}
            <div id={boxId.current} className="w-full overflow-hidden" />
            <div className="flex gap-2 p-2">
              <Button size="sm" variant="outline" onClick={() => window.open(`https://www.geogebra.org/m/${materialId}`, "_blank")}>↗ Open full size</Button>
            </div>
          </>
        )}
      </div>
    </SimulationShell>
  );
}
