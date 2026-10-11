"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- TIMES DOJO ---- */
const BELTS = ["🤍 White", "💛 Yellow", "🟠 Orange", "🟢 Green", "💙 Blue", "🟤 Brown", "🥋 BLACK"];
export function TimesDojo({ moduleId }: { moduleId: string }) {
  const [table, setTable] = useState(5);
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [belt, setBelt] = useState(0);
  const [msg, setMsg] = useState("Bow! 🥋");
  const { recordProgress } = useAppStore();
  const newQ = (t = table) => {
    setA(2 + Math.floor(Math.random() * 8));
    setB(2 + Math.floor(Math.random() * 8));
    setInput("");
  };
  const submit = () => {
    if (Number(input) === a * b) {
      const s = streak + 1; setStreak(s); setMsg("✅ Correct! Kiai!");
      recordProgress(moduleId, { timeSpentSeconds: 15, score: 90 });
      if (s >= 10) {
        const nb = Math.min(6, belt + 1); setBelt(nb); setStreak(0);
        setMsg(`🎉 ${BELTS[nb]} BELT!`);
        recordProgress(moduleId, { timeSpentSeconds: 30, score: 100, status: nb >= 6 ? "completed" : undefined });
      }
      newQ();
    } else { setStreak(0); setMsg(`❌ ${a}×${b} = ${a * b}. Again, warrior!`); newQ(); }
  };
  return (
    <SimulationShell title="Times Table Dojo" icon="🥋"
      controls={<>
        <Slider label="Train table" value={table} min={2} max={10} onChange={(t) => { setTable(t); newQ(t); }} format={(v) => `×${v}`} />
        <p className="text-sm font-bold">Belt: {BELTS[belt]} (10 streaks to grade up!)</p>
        <p className="text-xs text-slate-500">Tip: 7×8 = 7 rows of 8 dots. Count the rectangle!</p>
      </>}
      dataPanel={<div><p className="font-bold">{msg}</p><p className="text-sm">🔥 Streak: {streak}/10</p><p className="text-xs text-slate-500">3×7 = 7×3 — order never matters!</p></div>}>
      <div className="p-4 text-center">
        <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto my-3">
          {Array.from({ length: Math.min(a * b, 80) }).map((_, i) => <span key={i} className="w-3 h-3 rounded-full bg-blue-500" />)}
          {a * b > 80 && <span className="text-xs font-bold">+{a * b - 80} more!</span>}
        </div>
        <p className="font-display font-black text-5xl">{a} × {b} = ?</p>
        <div className="flex justify-center gap-2 mt-3">
          <input value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-24 text-center text-2xl font-black border-4 border-slate-300 rounded-xl" placeholder="?" />
          <Button variant="fun" onClick={submit}>Strike! ⚡</Button>
        </div>
        <Quiz questions={[
          { q: "7 × 0 = ?", options: ["7", "0", "70"], answer: 1, explain: "Zero groups = zero!" },
          { q: "3 × 7 equals...", options: ["21", "24", "10"], answer: 0, explain: "Three sevens!" },
          { q: "9 × 6 = 6 × 9 because...", options: ["Luck", "Order never matters", "9 is bigger"], answer: 1, explain: "Commutativity!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- MONEY MARKET ---- */
const SHOP = [
  { name: "🚀 Rocket", price: 145 }, { name: "🧸 Bear", price: 80 },
  { name: "🎨 Paints", price: 230 }, { name: "📚 Book", price: 115 }, { name: "🪁 Kite", price: 65 },
];
const COINS = [200, 100, 50, 20, 10, 5, 1];
export function MoneyMarket({ moduleId }: { moduleId: string }) {
  const [cash, setCash] = useState(500);
  const [customer, setCustomer] = useState(0);
  const [paid, setPaid] = useState(0);
  const [change, setChange] = useState<number[]>([]);
  const [sales, setSales] = useState(0);
  const [msg, setMsg] = useState("Customer incoming! 🛎️");
  const { recordProgress } = useAppStore();
  const item = SHOP[customer % SHOP.length];
  const addCoin = (v: number) => setPaid(paid + v);
  const checkout = () => {
    if (paid < item.price) { setMsg(`Need ${item.price}¢, have ${paid}¢ — add coins!`); return; }
    let rest = paid - item.price;
    const out: number[] = [];
    for (const c of COINS) while (rest >= c) { out.push(c); rest -= c; }
    setChange(out);
    const exact = paid === item.price;
    const s = sales + 1; setSales(s);
    setCash(cash + item.price);
    setMsg(exact ? `🎉 EXACT PAYMENT! Perfect merchant!` : `Change: ${out.join("+")}¢. Count up to check!`);
    recordProgress(moduleId, { timeSpentSeconds: 40, score: exact ? 100 : 80 });
    if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    setTimeout(() => { setCustomer(customer + 1); setPaid(0); setChange([]); }, 2500);
  };
  return (
    <SimulationShell title="Money Market" icon="🪙"
      controls={<>
        <p className="text-sm font-bold">💰 Till: {cash}¢ • Sales: {sales}/5</p>
        <p className="text-sm font-bold">Customer pays with — tap coins:</p>
        <div className="flex flex-wrap gap-1.5">{COINS.map((c) => (
          <button key={c} onClick={() => addCoin(c)} className="px-2.5 py-1.5 rounded-full bg-amber-200 border-2 border-amber-500 font-black text-sm">ⓒ{c}</button>
        ))}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setPaid(0); setChange([]); }} className="flex-1">🧹 Clear</Button>
          <Button size="sm" variant="fun" onClick={checkout} className="flex-1">💵 Checkout</Button>
        </div>
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p>Paid: <b>{paid}¢</b> for <b>{item.price}¢</b></p><p>Change given: <b>{change.length ? change.join(" + ") + "¢" : "—"}</b></p></div>}>
      <div className="p-4 text-center">
        <p className="text-sm text-slate-500">Customer {sales + 1} wants:</p>
        <p className="text-5xl">{item.name.split(" ")[0]}</p>
        <p className="font-display font-black text-3xl">{item.name} — {item.price}¢</p>
        <Quiz questions={[
          { q: "A quarter + a dime = ?", options: ["30¢", "35¢", "15¢"], answer: 1, explain: "25 + 10!" },
          { q: "Pay 100¢ for 70¢. Change?", options: ["20¢", "30¢", "40¢"], answer: 1, explain: "Count up: 70→80→90→100!" },
          { q: "A budget is...", options: ["Free money", "A spending plan", "A bank"], answer: 1, explain: "Plan it before you spend it!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- CLOCK WORKSHOP ---- */
export function ClockWorkshop({ moduleId }: { moduleId: string }) {
  const [hour, setHour] = useState(3);
  const [min, setMin] = useState(30);
  const [mode, setMode] = useState<"read" | "set">("read");
  const [target, setTarget] = useState({ h: 4, m: 15 });
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("What time is it?");
  const { recordProgress } = useAppStore();
  const fmt = (h: number, m: number) => `${((h - 1) % 12) + 1}:${String(m).padStart(2, "0")}`;
  const newTarget = () => setTarget({ h: 1 + Math.floor(Math.random() * 12), m: [0, 15, 30, 45][Math.floor(Math.random() * 4)] });
  useEffect(newTarget, []);
  const read = (h: number, m: number) => {
    if (mode === "set") {
      if (h === target.h && m === target.m) {
        const s = score + 1; setScore(s); setMsg("✅ Perfect time!");
        recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 });
        if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
        newTarget();
      } else setMsg(`❌ Clock shows ${fmt(h, m)} — aim for ${fmt(target.h, target.m)}!`);
    }
  };
  const hr = ((hour % 12) + min / 60) * 30;
  const mr = min * 6;
  return (
    <SimulationShell title="Clock & Time Workshop" icon="🕐"
      controls={<>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "read" ? "default" : "outline"} onClick={() => setMode("read")} className="flex-1">👀 Read it</Button>
          <Button size="sm" variant={mode === "set" ? "default" : "outline"} onClick={() => setMode("set")} className="flex-1">🎯 Set it</Button>
        </div>
        <Slider label="Hour hand" value={hour} min={1} max={12} onChange={(v) => { setHour(v); read(v, min); }} />
        <Slider label="Minute hand" value={min} min={0} max={55} step={5} onChange={(v) => { setMin(v); read(hour, v); }} format={(v) => `:${String(v).padStart(2, "0")}`} />
        {mode === "set" && <p className="text-sm font-bold">🎯 Make: {fmt(target.h, target.m)} ({score}/5)</p>}
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl font-black font-mono">{fmt(hour, min)}</p><p className="font-bold text-sm">{msg}</p><p className="text-xs text-slate-500">Short hand = hours, long hand = minutes!</p></div>}>
      <div className="p-4 flex justify-center">
        <svg viewBox="0 0 200 200" className="w-64 h-64">
          <circle cx="100" cy="100" r="92" fill="#fff" stroke="#0f172a" strokeWidth="6" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <g key={i}>
              <text x={100 + 68 * Math.sin(a)} y={108 - 68 * Math.cos(a)} textAnchor="middle" fontSize="20" fontWeight="bold">{i === 0 ? 12 : i}</text>
            </g>;
          })}
          <line x1="100" y1="100" x2={100 + 48 * Math.sin((hr * Math.PI) / 180)} y2={100 - 48 * Math.cos((hr * Math.PI) / 180)} stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />
          <line x1="100" y1="100" x2={100 + 72 * Math.sin((mr * Math.PI) / 180)} y2={100 - 72 * Math.cos((mr * Math.PI) / 180)} stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="100" r="8" fill="#0f172a" />
        </svg>
      </div>
      <Quiz questions={[
        { q: "The SHORT hand shows...", options: ["Minutes", "Hours", "Seconds"], answer: 1, explain: "Short = hours!" },
        { q: "Minute hand on 6 means...", options: ["6 minutes", "30 minutes", "6 o'clock"], answer: 1, explain: "6 × 5 = 30!" },
        { q: "Movie 2:00→3:30 lasted...", options: ["1 hr", "1.5 hrs", "3.5 hrs"], answer: 1, explain: "End minus start!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- 3D SHAPES ---- */
const SOLIDS = [
  { name: "Cube 🎲", faces: 6, edges: 12, vertices: 8, net: "✚ cross" },
  { name: "Pyramid 🔺", faces: 5, edges: 8, vertices: 5, net: "square + 4 triangles" },
  { name: "Cylinder 🛢️", faces: 3, edges: 2, vertices: 0, net: "rectangle + 2 circles" },
  { name: "Cone 🍦", faces: 2, edges: 1, vertices: 1, net: "sector + circle" },
  { name: "Sphere ⚽", faces: 1, edges: 0, vertices: 0, net: "cannot fold flat!" },
  { name: "Prism 📦", faces: 5, edges: 9, vertices: 6, net: "3 rectangles + 2 triangles" },
];
export function Shapes3D({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [idx, setIdx] = useState(0);
  const [rot, setRot] = useState(0);
  const [guess, setGuess] = useState({ f: "", e: "", v: "" });
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const s = SOLIDS[idx % SOLIDS.length];
  useEffect(() => {
    const t = setInterval(() => setRot((r) => (r + 2) % 360), 60);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 320;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2 - 20, R = 120;
    const a = (rot * Math.PI) / 180;
    // spinning cube-ish wireframe scaled per solid
    const squash = 0.5 + (idx % 3) * 0.15;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < 8; i++) {
      const x = (i & 1 ? 1 : -1), y = (i & 2 ? 1 : -1), z = (i & 4 ? 1 : -1);
      const rx = x * Math.cos(a) - z * Math.sin(a);
      const rz = x * Math.sin(a) + z * Math.cos(a);
      pts.push([cx + rx * R, cy + y * R * squash + rz * 18]);
    }
    const edges: Array<[number, number]> = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 5;
    for (const [p, q] of edges) { ctx.beginPath(); ctx.moveTo(pts[p][0], pts[p][1]); ctx.lineTo(pts[q][0], pts[q][1]); ctx.stroke(); }
    ctx.fillStyle = "#7c3aed";
    for (const p of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 26px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(s.name, cx, H - 30);
  }, [rot, idx]);
  const check = () => {
    const ok = Number(guess.f) === s.faces && Number(guess.e) === s.edges && Number(guess.v) === s.vertices;
    setChecked(true);
    if (ok && !solved.includes(s.name)) {
      const n = [...solved, s.name];
      setSolved(n);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 95 });
      if (n.length >= 4) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(() => { setIdx(idx + 1); setGuess({ f: "", e: "", v: "" }); setChecked(false); }, 1200);
    }
  };
  return (
    <SimulationShell title="3D Shape Lab" icon="🧊"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{SOLIDS.map((x, i) => (
          <Button key={x.name} size="sm" variant={idx % SOLIDS.length === i ? "default" : "outline"} onClick={() => { setIdx(i); setGuess({ f: "", e: "", v: "" }); setChecked(false); }} className="text-xs">
            {solved.includes(x.name) ? "✅ " : ""}{x.name}
          </Button>
        ))}</div>
        <p className="text-xs text-slate-500">Net: {s.net} • Solved {solved.length}/4</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>Faces/Edges/Vertices?</p>
        <div className="flex gap-1">{[["f", "Faces"], ["e", "Edges"], ["v", "Vertices"]].map(([k, l]) => (
          <input key={k} value={(guess as any)[k]} onChange={(e) => setGuess({ ...guess, [k]: e.target.value.replace(/\D/g, "") })}
            placeholder={l} className="w-full border-2 rounded-lg px-1 py-1 text-sm font-bold text-center" />
        ))}</div>
        <Button size="sm" variant="fun" onClick={check} className="w-full">Check! ✅</Button>
        {checked && <p className="font-bold text-sm">{Number(guess.f) === s.faces && Number(guess.e) === s.edges && Number(guess.v) === s.vertices ? "🎉 Correct!" : `❌ It's ${s.faces} faces, ${s.edges} edges, ${s.vertices} vertices`}</p>}
        <p className="text-xs text-slate-500">Euler: F + V − E = 2, always!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[210px]" />
      <Quiz questions={[
        { q: "A cube has how many faces?", options: ["4", "6", "8"], answer: 1, explain: "Front, back, left, right, top, bottom!" },
        { q: "A net is...", options: ["A fishing tool", "A flat fold-into-solid pattern", "A website"], answer: 1, explain: "Cut, fold, tape!" },
        { q: "A sphere has...", options: ["1 face, no edges", "6 faces", "8 vertices"], answer: 0, explain: "Perfectly smooth!" },
      ]} onComplete={(sc) => recordProgress(moduleId, { timeSpentSeconds: 90, score: sc, status: sc >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- LOGIC PUZZLES ---- */
const SUDOKU = [
  [1, 0, 0, 4], [0, 0, 1, 0], [0, 1, 0, 0], [4, 0, 0, 1],
];
const SUDOKU_SOL = [
  [1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1],
];
export function LogicPuzzles({ moduleId }: { moduleId: string }) {
  const [puzzle, setPuzzle] = useState(1);
  const [grid, setGrid] = useState<number[][]>(SUDOKU.map((r) => [...r]));
  const [knavePick, setKnavePick] = useState("");
  const [seqPick, setSeqPick] = useState("");
  const [solved, setSolved] = useState<number[]>([]);
  const { recordProgress } = useAppStore();
  const win = (n: number) => {
    if (!solved.includes(n)) {
      const s = [...solved, n];
      setSolved(s);
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 90 });
      if (s.length >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
      if (puzzle < 3) setTimeout(() => setPuzzle(puzzle + 1), 1000);
    }
  };
  const setCell = (r: number, c: number, v: number) => {
    if (SUDOKU[r][c] !== 0) return;
    const n = grid.map((row) => [...row]);
    n[r][c] = v;
    setGrid(n);
    if (n.every((row, i) => row.every((x, j) => x === SUDOKU_SOL[i][j]))) win(1);
  };
  return (
    <SimulationShell title="Logic Puzzle Room" icon="🧩"
      controls={<>
        {[1, 2, 3].map((p) => (
          <Button key={p} size="sm" variant={puzzle === p ? "default" : "outline"} onClick={() => setPuzzle(p)} className="w-full mb-1">
            {solved.includes(p) ? "✅ " : ""}Door {p}: {p === 1 ? "4×4 Sudoku" : p === 2 ? "Knights & Knaves" : "Pattern Lock"}
          </Button>
        ))}
        <p className="text-xs text-slate-500">Escape all 3 doors! {solved.length}/3</p>
      </>}
      dataPanel={<div className="text-sm"><p>🧠 Rule out the impossible!</p><p>🕵️ If-then chains win</p><p>♟️ More game trees than atoms!</p></div>}>
      <div className="p-4">
        {puzzle === 1 && <div className="text-center">
          <p className="font-bold text-sm mb-2">Fill 1–4: every row, column & 2×2 box!</p>
          <div className="grid grid-cols-4 gap-1 max-w-[240px] mx-auto">
            {grid.map((row, r) => row.map((v, c) => (
              <button key={`${r}${c}`} onClick={() => setCell(r, c, (v % 4) + 1)}
                className={`aspect-square text-2xl font-black rounded-lg border-2 ${SUDOKU[r][c] !== 0 ? "bg-slate-200 border-slate-300" : "bg-white border-blue-300 hover:bg-blue-50"}`}>
                {v || "·"}
              </button>
            )))}
          </div>
          <p className="text-xs text-slate-500 mt-1">Tap empty cells to cycle 1→4</p>
        </div>}
        {puzzle === 2 && <div className="text-center max-w-md mx-auto">
          <p className="font-bold text-sm">🤥 One always lies, one always tells truth. A says: "We are BOTH knaves!" Who is who?</p>
          <div className="flex gap-4 justify-center text-5xl my-3"><span>🧙 A</span><span>🧝 B</span></div>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={() => { setKnavePick("A knight"); }}>A = truth-teller</Button>
            <Button size="sm" variant="outline" onClick={() => { setKnavePick("A knave"); if (!solved.includes(2)) win(2); }}>A = liar</Button>
          </div>
          {knavePick && <p className="font-bold text-sm mt-2">{knavePick === "A knave" ? "✅ Right! A liar claiming both lie = contradiction, so B tells truth!" : "❌ If A told truth, both would be liars — impossible!"}</p>}
        </div>}
        {puzzle === 3 && <div className="text-center">
          <p className="font-bold text-sm">🔓 2, 6, 12, 20, 30, ? — crack the lock!</p>
          <div className="flex gap-2 justify-center mt-3">{["36", "42", "40"].map((o) => (
            <Button key={o} onClick={() => { setSeqPick(o); if (o === "42") win(3); }} className="w-16">{o}</Button>
          ))}</div>
          {seqPick && <p className="font-bold text-sm mt-2">{seqPick === "42" ? "✅ 42! (n²+n: 6×7=42)" : "❌ Differences grow: +4,+6,+8,+10,+12..."}</p>}
        </div>}
        <Quiz questions={[
          { q: "Deduction means...", options: ["Guessing fast", "Ruling out the impossible", "Asking mom"], answer: 1, explain: "Sherlock style!" },
          { q: "A contradiction proves...", options: ["Nothing", "Someone is wrong", "Both true"], answer: 1, explain: "Both can't be true!" },
          { q: "Best first Sudoku move?", options: ["Random guesses", "Fill forced cells", "Close eyes"], answer: 1, explain: "Certainty first!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
