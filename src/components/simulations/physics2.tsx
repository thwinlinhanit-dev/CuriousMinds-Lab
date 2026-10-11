"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- OPTICS BENCH (real 2-bounce ray tracing) ---- */
type Seg = { x1: number; y1: number; x2: number; y2: number };
function rayHit(ox: number, oy: number, dx: number, dy: number, s: Seg): { t: number; nx: number; ny: number } | null {
  const ex = s.x2 - s.x1, ey = s.y2 - s.y1;
  const denom = dx * ey - dy * ex;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((s.x1 - ox) * ey - (s.y1 - oy) * ex) / denom;
  const u = ((s.x1 - ox) * dy - (s.y1 - oy) * dx) / denom;
  if (t > 1 && u >= 0 && u <= 1) {
    const len = Math.hypot(ex, ey);
    return { t, nx: -ey / len, ny: ex / len };
  }
  return null;
}
const TARGETS = [{ x: 740, y: 90 }, { x: 740, y: 330 }, { x: 560, y: 360 }];
export function OpticsBench({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [laser, setLaser] = useState(-8);
  const [m1, setM1] = useState(45);
  const [m2, setM2] = useState(-30);
  const [prism, setPrism] = useState(true);
  const [hits, setHits] = useState<boolean[]>([false, false, false]);
  const [rainbow, setRainbow] = useState(false);
  const { recordProgress } = useAppStore();
  const seg = (cx: number, cy: number, ang: number, len: number): Seg => {
    const a = (ang * Math.PI) / 180;
    return { x1: cx - Math.cos(a) * len / 2, y1: cy - Math.sin(a) * len / 2, x2: cx + Math.cos(a) * len / 2, y2: cy + Math.sin(a) * len / 2 };
  };
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 460;
    const W = c.width, H = c.height;
    const S = W / 800; // design in 800x230 space... use fixed mapping
    const X = (x: number) => x * S, Y = (y: number) => (y / 230) * H;
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
    const mirrors = [seg(400, 115, m1, 110), seg(600, 165, m2, 110)];
    // trace
    let ox = 40, oy = 115;
    let a = (laser * Math.PI) / 180;
    let dx = Math.cos(a), dy = Math.sin(a);
    const path: Array<[number, number]> = [[ox, oy]];
    let madeRainbow = false;
    for (let b = 0; b < 3; b++) {
      let best: { t: number; nx: number; ny: number } | null = null;
      for (const m of mirrors) {
        const h = rayHit(ox, oy, dx, dy, m);
        if (h && (!best || h.t < best.t)) best = h;
      }
      // walls
      let wallT = Infinity;
      if (dx > 0) wallT = Math.min(wallT, (790 - ox) / dx);
      if (dx < 0) wallT = Math.min(wallT, (10 - ox) / dx);
      if (dy > 0) wallT = Math.min(wallT, (220 - oy) / dy);
      if (dy < 0) wallT = Math.min(wallT, (10 - oy) / dy);
      if (best && best.t < wallT) {
        ox += dx * best.t; oy += dy * best.t;
        path.push([ox, oy]);
        // prism zone near (650,60)
        if (Math.hypot(ox - 650, oy - 60) < 60) madeRainbow = true;
        const d = dx * best.nx + dy * best.ny;
        dx -= 2 * d * best.nx; dy -= 2 * d * best.ny;
        ox += dx * 2; oy += dy * 2;
      } else {
        ox += dx * wallT; oy += dy * wallT;
        path.push([ox, oy]);
        if (Math.hypot(ox - 650, oy - 60) < 80) madeRainbow = true;
        break;
      }
    }
    // draw path
    ctx.strokeStyle = "#fde047"; ctx.lineWidth = 5; ctx.shadowColor = "#fde047"; ctx.shadowBlur = 12;
    ctx.beginPath();
    path.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y))));
    ctx.stroke(); ctx.shadowBlur = 0;
    // laser
    ctx.font = `${34 * S}px sans-serif`; ctx.fillText("🔦", X(8), Y(128));
    // mirrors
    ctx.strokeStyle = "#7dd3fc"; ctx.lineWidth = 8; ctx.lineCap = "round";
    for (const m of [seg(400, 115, m1, 110), seg(600, 165, m2, 110)]) {
      ctx.beginPath(); ctx.moveTo(X(m.x1), Y(m.y1)); ctx.lineTo(X(m.x2), Y(m.y2)); ctx.stroke();
    }
    // prism
    if (prism) {
      ctx.fillStyle = "#e0f2fe88";
      ctx.beginPath(); ctx.moveTo(X(650), Y(25)); ctx.lineTo(X(690), Y(95)); ctx.lineTo(X(610), Y(95)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = `bold ${20 * S}px sans-serif`; ctx.fillText("PRISM", X(615), Y(112));
      if (madeRainbow) {
        const cols = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
        cols.forEach((col, i) => {
          ctx.strokeStyle = col; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(X(665), Y(80)); ctx.lineTo(X(760), Y(120 + i * 10)); ctx.stroke();
        });
      }
    }
    // targets
    TARGETS.forEach((t, i) => {
      const hit = path.some(([x, y]) => Math.hypot(x - t.x, y - t.y) < 30);
      ctx.beginPath(); ctx.arc(X(t.x), Y(t.y), 22 * S, 0, Math.PI * 2);
      ctx.fillStyle = hit ? "#22c55e" : "#334155"; ctx.fill();
      ctx.font = `${26 * S}px sans-serif`; ctx.fillText(hit ? "✅" : "🎯", X(t.x) - 13 * S, Y(t.y) + 9 * S);
      if (hit && !hits[i]) {
        setHits((h) => { const n = [...h]; n[i] = true; return n; });
        recordProgress(moduleId, { timeSpentSeconds: 30, score: 85 });
      }
    });
    if (madeRainbow && !rainbow) {
      setRainbow(true);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 90 });
    }
    if (hits.filter(Boolean).length >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
  }, [laser, m1, m2, prism]);
  const n = hits.filter(Boolean).length;
  return (
    <SimulationShell title="Light & Optics Bench" icon="🔦"
      controls={<>
        <Slider label="🔦 Laser angle" value={laser} min={-60} max={60} onChange={setLaser} format={(v) => `${v}°`} />
        <Slider label="🪞 Mirror 1 tilt" value={m1} min={-80} max={80} onChange={setM1} format={(v) => `${v}°`} />
        <Slider label="🪞 Mirror 2 tilt" value={m2} min={-80} max={80} onChange={setM2} format={(v) => `${v}°`} />
        <Button size="sm" variant={prism ? "default" : "outline"} onClick={() => setPrism(!prism)} className="w-full">🔺 Prism {prism ? "IN" : "OUT"}</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🎯 Targets hit: <b>{n}/3</b></p><p>🌈 Rainbow: <b>{rainbow ? "YES!" : "aim through prism"}</b></p><p className="text-xs text-slate-500">Angle in = angle out on mirrors!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px]" />
      <Quiz questions={[
        { q: "Light travels...", options: ["In curves", "In straight lines", "In circles"], answer: 1, explain: "Until something bends it!" },
        { q: "A prism makes rainbows by...", options: ["Painting", "Bending each color differently", "Heating"], answer: 1, explain: "Refraction splits white light!" },
        { q: "Mirror rule?", options: ["Angle in = angle out", "Light stops", "Random bounce"], answer: 0, explain: "Reflection law!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- MAGNET LAB ---- */
const SORT_OBJECTS = [
  { e: "🔩", n: "Nail", mag: true }, { e: "🪙", n: "Coin", mag: false },
  { e: "📎", n: "Paperclip", mag: true }, { e: "🧸", n: "Teddy", mag: false },
  { e: "🔧", n: "Wrench", mag: true }, { e: "🍎", n: "Apple", mag: false },
  { e: "🥫", n: "Can", mag: true }, { e: "📱", n: "Phone", mag: false },
];
export function MagnetLab({ moduleId }: { moduleId: string }) {
  const [dist, setDist] = useState(40);
  const [flip, setFlip] = useState(false);
  const [filings, setFilings] = useState(true);
  const [coils, setCoils] = useState(10);
  const [batts, setBatts] = useState(1);
  const [sortIdx, setSortIdx] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const { recordProgress } = useAppStore();
  const attract = !flip;
  const force = Math.round((attract ? 1000 : -600) / Math.max(4, dist / 8));
  const emStrength = coils * batts;
  const clips = Math.min(12, Math.floor(emStrength / 6));
  const sort = (isMag: boolean) => {
    const o = SORT_OBJECTS[sortIdx % SORT_OBJECTS.length];
    if (o.mag === isMag) {
      const s = sortScore + 1; setSortScore(s);
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 85 });
      if (s >= 8) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
    setSortIdx(sortIdx + 1);
  };
  const o = SORT_OBJECTS[sortIdx % SORT_OBJECTS.length];
  return (
    <SimulationShell title="Magnet Lab" icon="🧲"
      controls={<>
        <Slider label="Magnet distance" value={dist} min={10} max={100} onChange={setDist} />
        <Button size="sm" variant="outline" onClick={() => setFlip(!flip)} className="w-full">🔄 Flip magnet {flip ? "(S-N)" : "(N-S)"}</Button>
        <Button size="sm" variant={filings ? "default" : "outline"} onClick={() => setFilings(!filings)} className="w-full">✨ Iron filings {filings ? "ON" : "OFF"}</Button>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🔌 Electromagnet:</p>
          <Slider label="Coils" value={coils} min={2} max={30} onChange={setCoils} />
          <Slider label="Batteries" value={batts} min={0} max={3} onChange={setBatts} />
          <p className="text-sm">Lifts <b>{clips} paperclips</b> 📎 {clips >= 10 ? "🎉 Super magnet!" : ""}</p>
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1">
        <p>🧲 Force: <b className={force > 0 ? "text-green-600" : "text-red-500"}>{force > 0 ? `+${force} pull!` : `${force} push!`}</b></p>
        <p>🧲 Sort game: <b>{sortScore}/8</b> — {o.e} {o.n}: magnetic?</p>
        <div className="flex gap-2"><Button size="sm" onClick={() => sort(true)} className="flex-1">🧲 Yes</Button><Button size="sm" variant="outline" onClick={() => sort(false)} className="flex-1">🚫 No</Button></div>
      </div>}>
      <div className="p-6">
        <div className="relative h-36 bg-slate-50 rounded-xl border-2 overflow-hidden">
          <div className="absolute top-1/2 -translate-y-1/2 text-5xl transition-all" style={{ left: "8%" }}>🧲</div>
          <div className="absolute top-1/2 -translate-y-1/2 text-5xl transition-all" style={{ left: `${8 + dist * 0.7}%`, transform: `translateY(-50%) ${flip ? "scaleX(-1)" : ""}` }}>🧲</div>
          {filings && <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-60 text-xs">
            {Array.from({ length: 12 }).map((_, i) => <span key={i} style={{ transform: `rotate(${(i - 6) * (attract ? 8 : -8)}deg)` }}>📍</span>)}
          </div>}
          <p className="absolute bottom-1 inset-x-0 text-center text-xs font-bold">{attract ? "⬅️ ➡️ Opposite poles ATTRACT!" : "⬅️ ⬅️ Like poles REPEL!"}</p>
        </div>
        <Quiz questions={[
          { q: "North + South poles...", options: ["Repel", "Attract", "Explode"], answer: 1, explain: "Opposites attract!" },
          { q: "Electromagnets need...", options: ["Coils + electricity", "Glue", "Sunlight"], answer: 0, explain: "Current makes the field!" },
          { q: "Compasses work because...", options: ["Magic", "Earth is a giant magnet", "GPS"], answer: 1, explain: "Needles align with Earth's field!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- BUOYANCY ---- */
const FLOAT_OBJECTS = [
  { e: "🪨", n: "Pebble", d: 2.6 }, { e: "🪵", n: "Wood block", d: 0.6 },
  { e: "🔩", n: "Bolt", d: 7.8 }, { e: "🍎", n: "Apple", d: 0.8 },
  { e: "🧱", n: "Brick", d: 1.8 }, { e: "🏀", n: "Ball", d: 0.3 },
];
const LIQUIDS = [
  { n: "💧 Water", d: 1.0, c: "#7dd3fc" }, { n: "🍯 Honey", d: 1.4, c: "#f59e0b" }, { n: "🫗 Oil", d: 0.9, c: "#fde047" },
];
export function BuoyancyLab({ moduleId }: { moduleId: string }) {
  const [obj, setObj] = useState(1);
  const [liq, setLiq] = useState(0);
  const [dropped, setDropped] = useState(false);
  const [boatW, setBoatW] = useState(3);
  const [cargo, setCargo] = useState(0);
  const [sunk, setSunk] = useState(false);
  const [streak, setStreak] = useState(0);
  const [guessMode, setGuessMode] = useState(false);
  const { recordProgress } = useAppStore();
  const o = FLOAT_OBJECTS[obj];
  const l = LIQUIDS[liq];
  const floats = o.d < l.d;
  const capacity = boatW * 4;
  const drop = () => { setDropped(true); setGuessMode(false); recordProgress(moduleId, { timeSpentSeconds: 20, score: 75 }); };
  const predict = (willFloat: boolean) => {
    if (willFloat === floats) {
      const s = streak + 1; setStreak(s);
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 90 });
      if (s >= 6) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setObj(Math.floor(Math.random() * FLOAT_OBJECTS.length));
      setLiq(Math.floor(Math.random() * LIQUIDS.length));
      setDropped(false);
    } else { setStreak(0); setDropped(true); setGuessMode(false); }
  };
  const addCargo = () => {
    if (sunk) return;
    const c = cargo + 1; setCargo(c);
    if (c > capacity) { setSunk(true); recordProgress(moduleId, { timeSpentSeconds: 30, score: 70 }); }
    else if (c === capacity) recordProgress(moduleId, { timeSpentSeconds: 40, score: 95, status: "completed" });
  };
  return (
    <SimulationShell title="Float or Sink?" icon="🚢"
      controls={<>
        <p className="text-sm font-bold">🧪 Test tank:</p>
        <div className="flex gap-1 flex-wrap">{FLOAT_OBJECTS.map((x, i) => <button key={i} onClick={() => { setObj(i); setDropped(false); }} className={`text-2xl p-1 rounded-lg ${obj === i ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}>{x.e}</button>)}</div>
        <div className="flex gap-1.5">{LIQUIDS.map((x, i) => <Button key={i} size="sm" variant={liq === i ? "default" : "outline"} onClick={() => { setLiq(i); setDropped(false); }} className="flex-1 text-xs">{x.n}</Button>)}</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setGuessMode(true)} className="flex-1">🔮 Predict first!</Button>
          <Button size="sm" variant="outline" onClick={drop} className="flex-1">💧 Drop!</Button>
        </div>
        {guessMode && !dropped && <div className="flex gap-2"><Button size="sm" variant="fun" onClick={() => predict(true)} className="flex-1">🛟 Floats</Button><Button size="sm" variant="outline" onClick={() => predict(false)} className="flex-1">🪨 Sinks</Button></div>}
        <p className="text-xs">🔮 Streak: {streak}/6</p>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🚢 Boat: width {boatW} (holds {capacity})</p>
          <Slider label="Hull width" value={boatW} min={1} max={5} onChange={(v) => { setBoatW(v); setCargo(0); setSunk(false); }} />
          <Button size="sm" variant="fun" onClick={addCargo} disabled={sunk} className="w-full">📦 Load cargo ({cargo})</Button>
          {sunk && <p className="text-xs font-bold text-red-500">💦 SUNK! Wider hull displaces more!</p>}
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>{o.e} density <b>{o.d}</b> vs {l.n} <b>{l.d}</b></p><p className="font-extrabold text-lg">{dropped ? (floats ? "🛟 FLOATS!" : "🪨 SINKS!") : "Drop it!"}</p><p className="text-xs text-slate-500">Density wins, not weight! Ships spread steel wide.</p></div>}>
      <div className="p-4">
        <div className="relative h-44 rounded-xl overflow-hidden border-4 border-slate-300" style={{ backgroundColor: l.c + "55" }}>
          <div className="absolute inset-x-0 bottom-0" style={{ height: "70%", backgroundColor: l.c }} />
          <div className="absolute text-5xl transition-all duration-700" style={{ left: "15%", top: dropped ? (floats ? "38%" : "72%") : "5%" }}>{o.e}</div>
          <div className="absolute text-4xl" style={{ right: "10%", bottom: sunk ? "2%" : `${8 + Math.min(20, cargo * 1.5)}%`, transition: "all .5s" }}>🚢{cargo > 0 ? `+${cargo}📦` : ""}</div>
        </div>
        <Quiz questions={[
          { q: "Steel ships float because...", options: ["Steel is light", "Hull shape displaces lots of water", "Magic paint"], answer: 1, explain: "Spread weight = float!" },
          { q: "Something denser than water will...", options: ["Float", "Sink", "Fly"], answer: 1, explain: "Density decides!" },
          { q: "Honey floats MORE things than water since it's...", options: ["Sweeter", "Denser", "Stickier"], answer: 1, explain: "1.4 vs 1.0!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- PULLEY WORKSHOP ---- */
export function PulleyWorkshop({ moduleId }: { moduleId: string }) {
  const [pulleys, setPulleys] = useState(1);
  const [lifted, setLifted] = useState(0);
  const [lifting, setLifting] = useState(false);
  const { recordProgress } = useAppStore();
  const LOAD = 400;
  const force = Math.round(LOAD / pulleys);
  const rope = pulleys * 10;
  const lift = () => {
    setLifting(true); setLifted(0);
    const t = setInterval(() => {
      setLifted((h) => {
        if (h >= 100) {
          clearInterval(t); setLifting(false);
          recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
          if (pulleys >= 4) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
          return 100;
        }
        return h + 4;
      });
    }, 60);
  };
  return (
    <SimulationShell title="Pulley Workshop" icon="🏗️"
      controls={<>
        <Slider label="Pulleys rigged" value={pulleys} min={1} max={4} onChange={setPulleys} />
        <Button variant="fun" onClick={lift} disabled={lifting} className="w-full">{lifting ? "Lifting... 🏋️" : "🐘 LIFT THE ELEPHANT!"}</Button>
        <p className="text-xs text-slate-500">🎯 Mission: lift with 4 pulleys (only 100kg effort!)</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🐘 Load: <b>{LOAD} kg</b></p><p>💪 Your pull: <b>{force} kg</b> ({pulleys}× easier!)</p><p>🪢 Rope pulled: <b>{rope} m</b> to lift 10 m</p><p className="text-xs text-slate-500">Less force, MORE rope — always a trade!</p></div>}>
      <div className="p-4">
        <div className="relative h-56 bg-gradient-to-b from-sky-100 to-green-100 rounded-xl overflow-hidden">
          <div className="absolute top-2 inset-x-0 flex justify-center gap-8">
            {Array.from({ length: pulleys }).map((_, i) => <span key={i} className="text-3xl">⚙️</span>)}
          </div>
          {Array.from({ length: pulleys }).map((_, i) => (
            <div key={i} className="absolute top-10 bottom-16 w-0.5 bg-amber-700" style={{ left: `${30 + i * 10}%` }} />
          ))}
          <div className="absolute text-6xl transition-all" style={{ left: "40%", bottom: `${10 + lifted * 0.35}%` }}>🐘</div>
          <div className="absolute bottom-2 right-3 text-4xl">🧍‍♂️💪</div>
        </div>
        <div className="h-3 bg-slate-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${lifted}%` }} /></div>
        <Quiz questions={[
          { q: "4 pulleys make 400kg feel like...", options: ["400kg", "100kg", "800kg"], answer: 1, explain: "400 ÷ 4!" },
          { q: "The catch? You must pull...", options: ["Less rope", "4× MORE rope", "No rope"], answer: 1, explain: "Force–distance trade!" },
          { q: "Elevators use pulleys plus...", options: ["Counterweights", "Ballons", "Springs"], answer: 0, explain: "Balance the load!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- HEAT LAB ---- */
const MATERIALS = [
  { n: "🔩 Metal", k: 1.0 }, { n: "🪵 Wood", k: 0.3 }, { n: "🧽 Plastic", k: 0.15 }, { n: "🧶 Wool", k: 0.05 },
];
export function HeatLab({ moduleId }: { moduleId: string }) {
  const [racing, setRacing] = useState(false);
  const [heat, setHeat] = useState<number[]>([0, 0, 0]);
  const [wrap, setWrap] = useState(3);
  const [melt, setMelt] = useState(0);
  const [melting, setMelting] = useState(false);
  const { recordProgress } = useAppStore();
  const race = () => {
    setRacing(true); setHeat([0, 0, 0]);
    const ks = [1.0, 0.3, 0.15];
    const t = setInterval(() => {
      setHeat((h) => {
        const n = h.map((v, i) => Math.min(100, v + ks[i] * 9));
        if (n[0] >= 100) {
          clearInterval(t); setRacing(false);
          recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
        }
        return n;
      });
    }, 200);
  };
  const startMelt = () => {
    setMelting(true); setMelt(0);
    const rate = MATERIALS[wrap].k * 14;
    const t = setInterval(() => {
      setMelt((m) => {
        const n = m + rate;
        if (n >= 100) {
          clearInterval(t); setMelting(false);
          if (wrap === 3) recordProgress(moduleId, { timeSpentSeconds: 60, score: 100, status: "completed" });
          else recordProgress(moduleId, { timeSpentSeconds: 40, score: 70 });
        }
        return Math.min(100, n);
      });
    }, 300);
  };
  const tempColor = (t: number) => `rgb(${Math.round(100 + t * 1.5)},${Math.round(150 - t)},80)`;
  return (
    <SimulationShell title="Heat & Insulation Lab" icon="🌡️"
      controls={<>
        <Button variant="fun" size="sm" onClick={race} disabled={racing} className="w-full">{racing ? "🔥 Racing..." : "🏁 Start conduction race!"}</Button>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🐧 Wrap the ice house:</p>
          <div className="grid grid-cols-2 gap-1.5">{MATERIALS.map((m, i) => (
            <Button key={m.n} size="sm" variant={wrap === i ? "default" : "outline"} onClick={() => setWrap(i)}>{m.n}</Button>
          ))}</div>
          <Button size="sm" variant="outline" onClick={startMelt} disabled={melting} className="w-full mt-1">{melting ? "☀️ Melting..." : "☀️ Start sunny day!"}</Button>
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🏁 Race: metal vs wood vs plastic</p><p>🧊 Ice melted: <b>{Math.round(melt)}%</b> ({MATERIALS[wrap].n})</p><p className="text-xs text-slate-500">Wool wins! A thermos wins more (vacuum!).</p></div>}>
      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          {[["🔩 Metal", 0], ["🪵 Wood", 1], ["🧽 Plastic", 2]].map(([n, i]) => (
            <div key={n as string} className="flex items-center gap-2">
              <span className="w-24 text-sm font-bold">{n}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden"><div className="h-full transition-all" style={{ width: `${heat[i as number]}%`, backgroundColor: tempColor(heat[i as number]) }} /></div>
              <span className="text-xs font-bold w-10">{Math.round(heat[i as number])}°</span>
            </div>
          ))}
        </div>
        <div className="text-center bg-sky-50 rounded-xl p-3">
          <p className="text-5xl">{melt >= 100 ? "💧" : "🧊"}</p>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden mt-1"><div className="h-full bg-sky-400" style={{ width: `${100 - melt}%` }} /></div>
        </div>
        <Quiz questions={[
          { q: "Heat flows...", options: ["Cold → hot", "Hot → cold", "Never"], answer: 1, explain: "Always downhill!" },
          { q: "Best insulator here?", options: ["Metal", "Wool", "Wood"], answer: 1, explain: "Trapped air slows heat!" },
          { q: "Metal spoons get hot fast (they're...)", options: ["Insulators", "Conductors", "Cold makers"], answer: 1, explain: "Heat zooms through!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
