"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- FRACTIONS ---- */
export function FractionVisualizer({ moduleId }: { moduleId: string }) {
  const [num, setNum] = useState(3);
  const [den, setDen] = useState(4);
  const [view, setView] = useState<"pizza" | "bar" | "line">("pizza");
  const [streak, setStreak] = useState(0);
  const [q, setQ] = useState({ n: 1, d: 2 });
  const { recordProgress } = useAppStore();
  const newQ = () => {
    const d = 2 + Math.floor(Math.random() * 6);
    setQ({ n: 1 + Math.floor(Math.random() * (d - 1)), d });
  };
  const guess = (more: boolean) => {
    const actual = num / den, target = q.n / q.d;
    const correct = more ? actual > target : actual < target;
    if (Math.abs(actual - target) < 0.001) { alert("They're EQUAL! 🤝"); return; }
    if (correct) {
      const s = streak + 1; setStreak(s);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 85 });
      if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
      newQ();
    } else { setStreak(0); alert(`Not quite! ${num}/${den} = ${actual.toFixed(2)}, target = ${target.toFixed(2)}`); }
  };
  return (
    <SimulationShell title="Fraction Visualizer" icon="🍕"
      controls={<>
        <Slider label="🍕 Eaten slices (top)" value={num} min={0} max={den} onChange={setNum} />
        <Slider label="🍕 Total slices (bottom)" value={den} min={1} max={12} onChange={(v) => { setDen(v); setNum(Math.min(num, v)); }} />
        <div className="flex gap-2">{(["pizza", "bar", "line"] as const).map((v) => <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => setView(v)} className="flex-1 capitalize">{v === "pizza" ? "🍕" : v === "bar" ? "🍫" : "📏"}</Button>)}</div>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">⚔️ Battle: is yours bigger than {q.n}/{q.d}?</p>
          <div className="flex gap-2"><Button size="sm" onClick={() => guess(true)} className="flex-1">Mine's bigger!</Button><Button size="sm" variant="outline" onClick={() => guess(false)} className="flex-1">Mine's smaller!</Button></div>
          <p className="text-xs">🔥 Streak: {streak}/5</p>
        </div>
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl font-black">{num}<span className="text-slate-300">/</span>{den}</p><p className="text-xl font-bold">= {(num / den).toFixed(2)} = {Math.round((num / den) * 100)}%</p></div>}>
      <div className="p-6 flex justify-center">
        {view === "pizza" && (
          <svg viewBox="0 0 200 200" className="w-64 h-64">
            {Array.from({ length: den }).map((_, i) => {
              const a0 = (i / den) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 1) / den) * Math.PI * 2 - Math.PI / 2;
              const large = den <= 2 ? 0 : 1;
              const d = `M100,100 L${100 + 90 * Math.cos(a0)},${100 + 90 * Math.sin(a0)} A90,90 0 ${a1 - a0 > Math.PI ? 1 : 0},1 ${100 + 90 * Math.cos(a1)},${100 + 90 * Math.sin(a1)} Z`;
              return <path key={i} d={d} fill={i < num ? "#fbbf24" : "#f1f5f9"} stroke="#92400e" strokeWidth="2" />;
            })}
          </svg>
        )}
        {view === "bar" && (
          <div className="w-full max-w-md"><div className="flex h-16 rounded-xl overflow-hidden border-4 border-amber-800">{Array.from({ length: den }).map((_, i) => <div key={i} className={`flex-1 border-r border-amber-800 ${i < num ? "bg-amber-400" : "bg-white"}`} />)}</div><p className="text-center text-sm font-bold mt-1">🍫 Chocolate bar</p></div>
        )}
        {view === "line" && (
          <div className="w-full max-w-md"><div className="relative h-4 bg-slate-200 rounded-full"><div className="absolute h-full bg-green-500 rounded-full" style={{ width: `${(num / den) * 100}%` }} /><div className="absolute -top-1 w-6 h-6 bg-green-600 rounded-full border-4 border-white shadow" style={{ left: `calc(${(num / den) * 100}% - 12px)` }} /></div><div className="flex justify-between text-xs font-bold mt-1"><span>0</span><span>1/2</span><span>1</span></div></div>
        )}
      </div>
      <Quiz questions={[
        { q: "Which is bigger: 1/2 or 1/4?", options: ["1/2", "1/4", "Equal"], answer: 0, explain: "Halves are bigger pieces!" },
        { q: "Top number is the...", options: ["Denominator", "Numerator", "Divider"], answer: 1, explain: "Numerator = pieces you HAVE." },
        { q: "2/4 equals...", options: ["1/4", "1/2", "2/2"], answer: 1, explain: "Equivalent fractions!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- GEOMETRY ---- */
export function GeometryPlayground({ moduleId }: { moduleId: string }) {
  const [shape, setShape] = useState("triangle");
  const [size, setSize] = useState(80);
  const [sides, setSides] = useState(5);
  const { recordProgress } = useAppStore();
  const info: Record<string, { area: string; per: string; fact: string }> = {
    triangle: { area: `½×b×h ≈ ${Math.round(0.5 * size * size * 0.86)}`, per: `3×${size} = ${size * 3}`, fact: "Angles always sum to 180°!" },
    square: { area: `${size}×${size} = ${size * size}`, per: `4×${size} = ${size * 4}`, fact: "All angles 90°!" },
    circle: { area: `π×${Math.round(size / 2)}² ≈ ${Math.round(Math.PI * (size / 2) ** 2)}`, per: `2πr ≈ ${Math.round(2 * Math.PI * (size / 2))}`, fact: "Perfectly round — no corners!" },
    polygon: { area: `≈ ${Math.round(sides * size * size * 0.2)}`, per: `${sides}×${Math.round(size / 2)} = ${sides * Math.round(size / 2)}`, fact: `${sides}-sided! Hexagons tile perfectly (bees know!).` },
  };
  const cur = info[shape];
  return (
    <SimulationShell title="Geometry Playground" icon="📐"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{["triangle", "square", "circle", "polygon"].map((s) => <Button key={s} size="sm" variant={shape === s ? "default" : "outline"} onClick={() => setShape(s)} className="capitalize">{s}</Button>)}</div>
        <Slider label="Size" value={size} min={40} max={120} onChange={setSize} />
        {shape === "polygon" && <Slider label="Sides" value={sides} min={5} max={10} onChange={setSides} />}
        <Button variant="secondary" size="sm" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 90, score: 85, status: "completed" })}>✅ I measured 4 shapes!</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>📏 Perimeter: <b>{cur.per}</b></p><p>🟧 Area: <b>{cur.area}</b></p><p className="text-xs">🤯 {cur.fact}</p></div>}>
      <div className="p-6 flex justify-center bg-grid">
        <svg viewBox="0 0 200 200" className="w-64 h-64">
          {shape === "triangle" && <polygon points={`100,${100 - size * 0.6} ${100 - size * 0.55},${100 + size * 0.4} ${100 + size * 0.55},${100 + size * 0.4}`} fill="#bfdbfe" stroke="#2563eb" strokeWidth="3" />}
          {shape === "square" && <rect x={100 - size / 2} y={100 - size / 2} width={size} height={size} fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />}
          {shape === "circle" && <circle cx="100" cy="100" r={size / 2} fill="#bbf7d0" stroke="#16a34a" strokeWidth="3" />}
          {shape === "polygon" && <polygon points={Array.from({ length: sides }).map((_, i) => { const a = (i / sides) * Math.PI * 2 - Math.PI / 2; return `${100 + (size / 2) * Math.cos(a)},${100 + (size / 2) * Math.sin(a)}`; }).join(" ")} fill="#fbcfe8" stroke="#db2777" strokeWidth="3" />}
        </svg>
      </div>
      <Quiz questions={[
        { q: "Triangle angles add up to...", options: ["90°", "180°", "360°"], answer: 1, explain: "Always 180°!" },
        { q: "Perimeter means...", options: ["Inside space", "Around the edge", "Number of sides"], answer: 1, explain: "Fence around the yard!" },
        { q: "A square has how many right angles?", options: ["2", "3", "4"], answer: 2, explain: "Four 90° corners!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- NUMBER LINE ---- */
export function NumberLine({ moduleId }: { moduleId: string }) {
  const [pos, setPos] = useState(0);
  const [target, setTarget] = useState(7);
  const [score, setScore] = useState(0);
  const { recordProgress } = useAppStore();
  const move = (d: number) => {
    const np = Math.max(-10, Math.min(20, pos + d));
    setPos(np);
    if (np === target) {
      const s = score + 1; setScore(s);
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 85 });
      if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTarget(-10 + Math.floor(Math.random() * 31));
    }
  };
  return (
    <SimulationShell title="Number Line Adventure" icon="📏"
      controls={<>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => move(-1)}>⬅️ -1</Button><Button onClick={() => move(1)}>+1 ➡️</Button>
          <Button variant="outline" onClick={() => move(-5)}>⬅️ -5</Button><Button variant="outline" onClick={() => move(5)}>+5 ➡️</Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setPos(0)}>🏠 Reset to 0</Button>
      </>}
      dataPanel={<div className="text-center"><p className="text-sm">🐸 Hop to <b className="text-xl">{target}</b></p><p className="text-sm">You: <b className="text-xl">{pos}</b></p><p>⭐ {score}/5 to win!</p>{score >= 5 && <p className="font-bold text-green-600">🎉 NUMBER HERO!</p>}</div>}>
      <div className="p-6">
        <div className="relative h-20 bg-gradient-to-r from-blue-100 via-slate-100 to-green-100 rounded-xl">
          {Array.from({ length: 31 }).map((_, i) => {
            const v = i - 10;
            return <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-300" style={{ left: `${(i / 30) * 100}%` }}><span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold">{v % 5 === 0 ? v : ""}</span></div>;
          })}
          <div className="absolute text-3xl" style={{ left: `calc(${((target + 10) / 30) * 100}% - 14px)`, top: "-6px" }}>🎯</div>
          <div className="absolute text-4xl transition-all" style={{ left: `calc(${((pos + 10) / 30) * 100}% - 18px)`, bottom: "2px" }}>🐸</div>
        </div>
        <Quiz questions={[
          { q: "5 + (-3) = ?", options: ["8", "2", "-2"], answer: 1, explain: "Hop right 5, left 3 → 2!" },
          { q: "Which is left of zero?", options: ["5", "-3", "0"], answer: 1, explain: "Negatives live left!" },
          { q: "-2 is...", options: ["Bigger than 2", "Smaller than 0", "Equal to 2"], answer: 1, explain: "All negatives < 0!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- PATTERNS ---- */
const PATTERNS = [
  { seq: [2, 4, 6, 8], next: 10, rule: "+2 each time", opts: [9, 10, 12] },
  { seq: [1, 1, 2, 3, 5, 8], next: 13, rule: "Add last two (Fibonacci!)", opts: [11, 13, 10] },
  { seq: [3, 6, 12, 24], next: 48, rule: "×2 each time", opts: [36, 48, 30] },
  { seq: [5, 10, 15, 20], next: 25, rule: "+5 (counting by 5s)", opts: [24, 25, 30] },
  { seq: [1, 4, 9, 16], next: 25, rule: "Square numbers!", opts: [20, 25, 24] },
];
export function PatternExplorer({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState("");
  const { recordProgress } = useAppStore();
  const p = PATTERNS[idx % PATTERNS.length];
  const pick = (v: number) => {
    if (v === p.next) {
      const s = streak + 1; setStreak(s); setMsg(`✅ YES! Rule: ${p.rule}`);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 90 });
      if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(() => { setIdx(idx + 1); setMsg(""); }, 1200);
    } else { setStreak(0); setMsg("❌ Hmm, look for the rule..."); }
  };
  return (
    <SimulationShell title="Pattern Explorer" icon="🔷"
      controls={<>
        <p className="text-sm font-bold">What's the rule?</p>
        <div className="flex gap-1.5">{["🔴", "🔵", "🔴", "🔵", "❓"].map((e, i) => <span key={i} className="text-3xl">{e}</span>)}</div>
        <p className="text-xs text-slate-500">Colors repeat too! 🔴🔵🔴🔵...</p>
        <p className="text-sm">🔥 Streak: {streak}/5</p>
      </>}
      dataPanel={<div className="text-center"><p className="font-bold">Fibonacci in nature 🌻</p><p className="text-sm">1, 1, 2, 3, 5, 8, 13... petals & shells!</p><p className="text-4xl">🌻🐚🍍</p></div>}>
      <div className="p-6 text-center">
        <div className="flex justify-center gap-2 flex-wrap">{p.seq.map((n, i) => <span key={i} className="w-14 h-14 flex items-center justify-center text-2xl font-black bg-blue-100 rounded-2xl">{n}</span>)}<span className="w-14 h-14 flex items-center justify-center text-2xl font-black bg-amber-200 rounded-2xl animate-pulse">?</span></div>
        <div className="flex justify-center gap-2 mt-4">{p.opts.map((o) => <Button key={o} onClick={() => pick(o)} className="w-16">{o}</Button>)}</div>
        {msg && <p className="font-bold mt-2">{msg}</p>}
        <Quiz questions={[
          { q: "2, 4, 8, 16... next?", options: ["20", "32", "24"], answer: 1, explain: "Doubling!" },
          { q: "Fibonacci starts 1, 1, 2, 3, 5... next?", options: ["7", "8", "6"], answer: 1, explain: "3+5=8!" },
          { q: "Odd, even, odd, even... after even comes?", options: ["Odd", "Even", "Zero"], answer: 0, explain: "They alternate!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- PROBABILITY ---- */
export function ProbabilityLab({ moduleId }: { moduleId: string }) {
  const [tool, setTool] = useState<"dice" | "coin" | "spinner">("dice");
  const [rolls, setRolls] = useState<number[]>([]);
  const { recordProgress } = useAppStore();
  const roll = (n = 1) => {
    const res: number[] = [];
    for (let i = 0; i < n; i++) {
      if (tool === "dice") res.push(1 + Math.floor(Math.random() * 6));
      else if (tool === "coin") res.push(Math.random() < 0.5 ? 0 : 1);
      else res.push(1 + Math.floor(Math.random() * 4));
    }
    const nr = [...rolls, ...res].slice(-200);
    setRolls(nr);
    recordProgress(moduleId, { timeSpentSeconds: 15 });
    if (nr.length >= 50) recordProgress(moduleId, { timeSpentSeconds: 30, score: 85, status: "completed" });
  };
  const faces = tool === "dice" ? [1, 2, 3, 4, 5, 6] : tool === "coin" ? [0, 1] : [1, 2, 3, 4];
  const counts = faces.map((f) => rolls.filter((r) => r === f).length);
  const max = Math.max(1, ...counts);
  const diceEmoji = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <SimulationShell title="Probability Lab" icon="🎲"
      controls={<>
        <div className="flex gap-2">{(["dice", "coin", "spinner"] as const).map((t) => <Button key={t} size="sm" variant={tool === t ? "default" : "outline"} onClick={() => { setTool(t); setRolls([]); }} className="flex-1 capitalize">{t === "dice" ? "🎲" : t === "coin" ? "🪙" : "🎡"}</Button>)}</div>
        <div className="flex gap-2"><Button onClick={() => roll(1)} className="flex-1">Roll 1</Button><Button variant="fun" onClick={() => roll(20)} className="flex-1">Roll 20! ⚡</Button></div>
        <Button variant="outline" size="sm" onClick={() => setRolls([])}>🧹 Reset</Button>
        <p className="text-xs text-slate-500">Total rolls: {rolls.length} (50 = scientist!)</p>
      </>}
      dataPanel={<div className="text-sm"><p>Total: <b>{rolls.length}</b></p>{faces.map((f, i) => <p key={i}>{tool === "dice" ? diceEmoji[f] : tool === "coin" ? (f === 0 ? "Heads" : "Tails") : `Color ${f}`}: <b>{counts[i]}</b> ({rolls.length ? Math.round((counts[i] / rolls.length) * 100) : 0}%)</p>)}<p className="text-xs text-slate-500">More rolls → closer to theory!</p></div>}>
      <div className="p-6">
        <div className="flex items-end gap-2 h-40">{faces.map((f, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all" style={{ height: `${(counts[i] / max) * 120}px`, minHeight: counts[i] ? "8px" : "2px" }} />
            <span className="text-2xl">{tool === "dice" ? diceEmoji[f] : tool === "coin" ? (f === 0 ? "👑" : "🔢") : ["🔴", "🔵", "🟢", "🟡"][i]}</span>
          </div>
        ))}</div>
        <p className="text-center text-2xl mt-2">{rolls.slice(-8).map((r, i) => <span key={i}>{tool === "dice" ? diceEmoji[r] : tool === "coin" ? (r === 0 ? "👑" : "🔢") : ["🔴", "🔵", "🟢", "🟡"][r - 1]}</span>)}</p>
        <Quiz questions={[
          { q: "Chance of coin heads?", options: ["1/4", "1/2", "1/1"], answer: 1, explain: "Two equal sides!" },
          { q: "Rolling a 6 on a die?", options: ["1/6", "1/2", "6/6"], answer: 0, explain: "One of six faces!" },
          { q: "After 5 heads, next flip is...", options: ["Always tails", "Still 50/50", "Always heads"], answer: 1, explain: "Coins have no memory!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- GRAPHING ---- */
export function GraphingTool({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exprs, setExprs] = useState(["2*x+1", "x*x/10-2"]);
  const [input, setInput] = useState("0.5*x*x-3");
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 440);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    const X = (x: number) => W / 2 + x * 30;
    const Y = (y: number) => H / 2 - y * 30;
    ctx.strokeStyle = "#e2e8f0";
    for (let x = -15; x <= 15; x++) { ctx.beginPath(); ctx.moveTo(X(x), 0); ctx.lineTo(X(x), H); ctx.stroke(); }
    for (let y = -10; y <= 10; y++) { ctx.beginPath(); ctx.moveTo(0, Y(y)); ctx.lineTo(W, Y(y)); ctx.stroke(); }
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    const colors = ["#2563eb", "#db2777", "#16a34a"];
    exprs.forEach((e, i) => {
      try {
        const fn = new Function("x", `with(Math){return ${e.replace(/\^/g, "**")};}`);
        ctx.strokeStyle = colors[i % 3]; ctx.lineWidth = 5; ctx.beginPath();
        let started = false;
        for (let px = 0; px < W; px += 3) {
          const x = (px - W / 2) / 30;
          const y = Number(fn(x));
          if (!isFinite(y) || Math.abs(y) > 20) { started = false; continue; }
          started ? ctx.lineTo(px, Y(y)) : ctx.moveTo(px, Y(y));
          started = true;
        }
        ctx.stroke();
      } catch {}
    });
  }, [exprs]);
  return (
    <SimulationShell title="Graphing Calculator" icon="📊"
      controls={<>
        {exprs.map((e, i) => (
          <div key={i} className="flex gap-1 items-center text-sm">
            <span className="font-black">y=</span>
            <input value={e} onChange={(ev) => setExprs(exprs.map((x, j) => (j === i ? ev.target.value : x)))} className="flex-1 border-2 border-slate-200 rounded-lg px-2 py-1 font-mono text-xs" />
            <button onClick={() => setExprs(exprs.filter((_, j) => j !== i))} className="text-red-500 font-bold">✕</button>
          </div>
        ))}
        <div className="flex gap-1">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 0.5*x*x-3" className="flex-1 border-2 border-slate-200 rounded-lg px-2 py-1 font-mono text-xs" />
          <Button size="sm" onClick={() => { if (exprs.length < 3) { setExprs([...exprs, input]); recordProgress(moduleId, { timeSpentSeconds: 60, score: 85, status: exprs.length >= 1 ? "completed" : undefined }); } }}>+ Plot</Button>
        </div>
        <p className="text-xs text-slate-500">Try: 2*x+1, -x+5, x*x/8, sin(x)*3, abs(x)</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>y = 2x+1: slope <b>2</b> (steep!), crosses y at <b>1</b></p><p>y = x²: <b>parabola</b> U-shape!</p><p className="text-xs text-slate-500">Steeper number = steeper line!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "In y = 3x + 2, the slope is...", options: ["2", "3", "5"], answer: 1, explain: "Number before x = steepness!" },
        { q: "y = x² makes a...", options: ["Straight line", "U-shaped parabola", "Circle"], answer: 1, explain: "Squares curve!" },
        { q: "Point (3, 2) means...", options: ["x=2, y=3", "x=3, y=2", "3+2"], answer: 1, explain: "x first, then y!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- SYMMETRY ---- */
export function SymmetryStudio({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#ec4899");
  const [mirror, setMirror] = useState(true);
  const { recordProgress } = useAppStore();
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2; canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);
  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    if (mirror) { ctx.beginPath(); ctx.arc(c.width - x, y, 12, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#e2e8f055"; ctx.fillRect(c.width / 2 - 2, 0, 4, c.height);
  };
  return (
    <SimulationShell title="Symmetry Studio" icon="🦋"
      controls={<>
        <div className="flex gap-1.5">{["#ec4899", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#0f172a"].map((c) => <button key={c} onClick={() => setColor(c)} className={`w-9 h-9 rounded-full border-4 ${color === c ? "border-slate-800" : "border-slate-200"}`} style={{ backgroundColor: c }} />)}</div>
        <Button size="sm" variant={mirror ? "default" : "outline"} onClick={() => setMirror(!mirror)} className="w-full">🪞 Mirror {mirror ? "ON" : "OFF"}</Button>
        <Button size="sm" variant="outline" onClick={() => { const c = canvasRef.current!; const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }}>🧹 Clear</Button>
        <Button variant="secondary" size="sm" onClick={() => { recordProgress(moduleId, { timeSpentSeconds: 90, score: 85, status: "completed" }); }}>✅ I made mirror art!</Button>
      </>}
      dataPanel={<div className="text-sm"><p>🦋 Butterflies: <b>1 line</b></p><p>❄️ Snowflakes: <b>6 lines!</b></p><p>⭐ Starfish: <b>5 lines</b></p><p className="text-xs text-slate-500">Draw on the left — mirror completes it!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[300px] touch-none cursor-crosshair" onPointerDown={(e) => { drawing.current = true; draw(e); }} onPointerMove={draw} onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
      <Quiz questions={[
        { q: "A line of symmetry...", options: ["Cuts randomly", "Folds into matching halves", "Is always vertical"], answer: 1, explain: "Mirror halves!" },
        { q: "How many lines does a square have?", options: ["1", "2", "4"], answer: 2, explain: "Vertical, horizontal + 2 diagonals!" },
        { q: "Which has NO symmetry?", options: ["❤️ Heart", "🦋 Butterfly", "🌊 Random scribble"], answer: 2, explain: "Random = no mirror!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- FRACTALS ---- */
export function FractalExplorer({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(7);
  const [angle, setAngle] = useState(25);
  const [type, setType] = useState<"tree" | "snowflake" | "triangle">("tree");
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 440);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2;
    if (type === "tree") {
      const branch = (x: number, y: number, len: number, a: number, d: number) => {
        if (d === 0 || len < 3) return;
        const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
        ctx.strokeStyle = `hsl(${120 + d * 8}, 70%, ${40 + d * 3}%)`;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
        const spread = (angle * Math.PI) / 180;
        branch(nx, ny, len * 0.75, a - spread, d - 1);
        branch(nx, ny, len * 0.75, a + spread, d - 1);
      };
      branch(W / 2, H - 20, 120, -Math.PI / 2, depth);
    } else if (type === "snowflake") {
      const koch = (x1: number, y1: number, x2: number, y2: number, d: number) => {
        if (d === 0) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = "#7dd3fc"; ctx.stroke(); return; }
        const dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
        const ax = x1 + dx, ay = y1 + dy, bx = x1 + 2 * dx, by = y1 + 2 * dy;
        const mx = (ax + bx) / 2 - (by - ay) * 0.866, my = (ay + by) / 2 + (bx - ax) * 0.866;
        koch(x1, y1, ax, ay, d - 1); koch(ax, ay, mx, my, d - 1); koch(mx, my, bx, by, d - 1); koch(bx, by, x2, y2, d - 1);
      };
      const cx = W / 2, cy = H / 2, R = 150;
      for (let i = 0; i < 3; i++) {
        const a1 = (i / 3) * Math.PI * 2 - Math.PI / 2, a2 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2;
        koch(cx + R * Math.cos(a1), cy + R * Math.sin(a1), cx + R * Math.cos(a2), cy + R * Math.sin(a2), Math.min(4, depth - 3));
      }
    } else {
      const tri = (x: number, y: number, s: number, d: number) => {
        if (d === 0) {
          ctx.fillStyle = `hsl(${(x + y) % 360}, 80%, 60%)`;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s / 2, y - s * 0.866); ctx.closePath(); ctx.fill();
          return;
        }
        const h = s / 2;
        tri(x, y, h, d - 1); tri(x + h, y, h, d - 1); tri(x + h / 2, y - h * 0.866, h, d - 1);
      };
      tri(W / 2 - 190, H - 60, 380, Math.min(6, depth - 1));
    }
    recordProgress(moduleId, { timeSpentSeconds: 15 });
  }, [depth, angle, type]);
  return (
    <SimulationShell title="Fractal Explorer" icon="🌀"
      controls={<>
        <div className="flex gap-1.5">{(["tree", "snowflake", "triangle"] as const).map((t) => <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)} className="flex-1 capitalize">{t === "tree" ? "🌳" : t === "snowflake" ? "❄️" : "🔺"}</Button>)}</div>
        <Slider label="Depth (recursion!)" value={depth} min={1} max={10} onChange={setDepth} />
        {type === "tree" && <Slider label="Branch angle" value={angle} min={10} max={60} onChange={setAngle} format={(v) => `${v}°`} />}
        <Button variant="secondary" size="sm" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 90, score: 90, status: "completed" })}>✅ Infinity explored!</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🌀 A fractal repeats <b>at every zoom!</b></p><p>🌳 Tree branches: {Math.pow(2, depth).toLocaleString()} tips!</p><p className="text-xs text-slate-500">Nature: ferns, lungs, coastlines, galaxies!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "A fractal is...", options: ["Random dots", "Pattern repeating at every scale", "A straight line"], answer: 1, explain: "Zoom in — same pattern!" },
        { q: "Recursion means...", options: ["Rule applied to its own result", "Deleting things", "Drawing circles"], answer: 0, explain: "Branches make branches!" },
        { q: "Which is fractal-like?", options: ["Perfect square", "Fern leaf", "Basketball"], answer: 1, explain: "Leaflets copy the whole leaf!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}
