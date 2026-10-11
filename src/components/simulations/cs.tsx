"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- BLOCK CODING ---- */
type Block = { id: number; kind: "move" | "left" | "right" | "repeat"; steps?: number; times?: number };
const LEVELS = [
  { name: "Level 1: Straight path", maze: ["S", ".", ".", "G"], answer: "move×3" },
  { name: "Level 2: Turn!", maze: ["S", ".", "T", "G"], answer: "move, turn, move" },
  { name: "Level 3: Loops rock", maze: ["S", ".", ".", ".", ".", "G"], answer: "repeat!" },
];
export function BlockCoding({ moduleId }: { moduleId: string }) {
  const [blocks, setBlocks] = useState<Block[]>([{ id: 1, kind: "move", steps: 1 }]);
  const [level, setLevel] = useState(0);
  const [robot, setRobot] = useState(0);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("Build blocks, press ▶ Run!");
  const { recordProgress } = useAppStore();
  const idRef = useRef(2);
  const add = (kind: Block["kind"]) => setBlocks([...blocks, { id: idRef.current++, kind, steps: 1, times: 2 }]);
  const expand = (): string[] => {
    const out: string[] = [];
    for (const b of blocks) {
      if (b.kind === "repeat") { for (let i = 0; i < (b.times ?? 2); i++) out.push("move"); }
      else out.push(b.kind);
    }
    return out;
  };
  const run = async () => {
    setRunning(true); setRobot(0); setMsg("Running... 🤖");
    const steps = expand();
    const goal = LEVELS[level].maze.length - 1;
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      if (steps[i] === "move") setRobot((p) => Math.min(goal + 1, p + 1));
    }
    await new Promise((r) => setTimeout(r, 300));
    setRunning(false);
    setRobot((p) => {
      if (p >= goal) {
        setMsg(`🎉 LEVEL ${level + 1} COMPLETE!`);
        recordProgress(moduleId, { timeSpentSeconds: 60, score: 90 });
        if (level + 1 >= LEVELS.length) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
        else setTimeout(() => { setLevel(level + 1); setRobot(0); setBlocks([{ id: idRef.current++, kind: "move", steps: 1 }]); setMsg("Next level! 🆙"); }, 1200);
      } else setMsg(`🤖 Stopped at ${p}/${goal}. Add more moves or a loop!`);
      return p;
    });
  };
  const maze = LEVELS[level].maze;
  return (
    <SimulationShell title="Block Coding Puzzles" icon="🧩"
      controls={<>
        <p className="text-sm font-bold">{LEVELS[level].name}</p>
        <div className="grid grid-cols-2 gap-1.5">
          <Button size="sm" onClick={() => add("move")}>➡️ Move</Button>
          <Button size="sm" onClick={() => add("left")}>↩️ Turn L</Button>
          <Button size="sm" onClick={() => add("right")}>↪️ Turn R</Button>
          <Button size="sm" variant="fun" onClick={() => add("repeat")}>🔁 Repeat</Button>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {blocks.map((b, i) => (
            <div key={b.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm font-bold ${b.kind === "repeat" ? "bg-purple-100 text-purple-800" : b.kind === "move" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
              <span>{i + 1}. {b.kind === "move" ? "➡️ Move" : b.kind === "left" ? "↩️ Left" : b.kind === "right" ? "↪️ Right" : `🔁 Repeat ×${b.times}`}</span>
              {b.kind === "repeat" && <input type="range" min={2} max={5} value={b.times} onChange={(e) => setBlocks(blocks.map((x) => (x.id === b.id ? { ...x, times: Number(e.target.value) } : x)))} className="w-16" />}
              <button onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))} className="ml-auto text-red-500">✕</button>
            </div>
          ))}
        </div>
        <Button variant="fun" onClick={run} disabled={running} className="w-full">{running ? "Running... 🤖" : "▶️ Run!"}</Button>
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p className="text-xs text-slate-500 mt-1">💡 Loops beat long lines! First computer bug: a real moth (1947)!</p></div>}>
      <div className="p-6">
        <div className="flex gap-1 justify-center">
          {maze.map((cell, i) => (
            <div key={i} className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-4 flex items-center justify-center text-3xl ${i === robot ? "border-blue-500 bg-blue-100 scale-110" : "border-slate-200 bg-white"}`}>
              {i === robot ? "🤖" : cell === "S" ? "🏁" : cell === "G" ? "🏆" : cell === "T" ? "↪️" : "·"}
            </div>
          ))}
        </div>
        <Quiz questions={[
          { q: "A sequence is...", options: ["Steps in order", "A bug", "A robot"], answer: 0, explain: "Order matters!" },
          { q: "Loops are great for...", options: ["Repeating steps", "Stopping", "Deleting"], answer: 0, explain: "Repeat 4 = square!" },
          { q: "A bug is...", options: ["An insect only", "A coding mistake", "A feature"], answer: 1, explain: "Debug = fix it! 🔧" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- TURTLE GRAPHICS ---- */
export function TurtleGraphics({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState("repeat 4 [ forward 100 turn 90 ]");
  const [error, setError] = useState("");
  const { recordProgress } = useAppStore();
  const runCode = (src: string) => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 480;
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, c.width, c.height);
    let x = c.width / 2, y = c.height / 2, ang = -Math.PI / 2;
    ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 5; ctx.lineCap = "round";
    setError("");
    try {
      const tokens = src.toLowerCase().replace(/\[/g, " [ ").replace(/\]/g, " ] ").trim().split(/\s+/);
      let i = 0;
      const exec = (toks: string[]) => {
        let j = 0;
        const step = () => {
          if (j >= toks.length) return;
          const t = toks[j++];
          if (t === "forward" || t === "fd") {
            const d = Number(toks[j++]) * 2.4;
            const nx = x + Math.cos(ang) * d, ny = y + Math.sin(ang) * d;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
            x = nx; y = ny;
          } else if (t === "turn" || t === "rt" || t === "right") ang += (Number(toks[j++]) * Math.PI) / 180;
          else if (t === "left" || t === "lt") ang -= (Number(toks[j++]) * Math.PI) / 180;
          else if (t === "repeat") {
            const n = Number(toks[j++]);
            if (toks[j++] !== "[") throw new Error("Expected [ after repeat");
            let depth = 1; const inner: string[] = [];
            while (depth > 0) { const w = toks[j++]; if (w === "[") depth++; else if (w === "]") depth--; if (depth > 0) inner.push(w); }
            for (let k = 0; k < n; k++) exec([...inner]);
          } else if (t === "[" || t === "]" || t === "") { /* skip */ }
          else throw new Error(`Unknown word: "${t}"`);
          step();
        };
        step();
      };
      exec(tokens);
      // turtle
      ctx.font = "44px sans-serif";
      ctx.fillText("🐢", x - 22, y + 16);
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 85 });
      if (/repeat/i.test(src)) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
    } catch (e: any) { setError(e.message); }
  };
  useEffect(() => { runCode(code); }, []);
  const presets = [
    { n: "⬜ Square", c: "repeat 4 [ forward 100 turn 90 ]" },
    { n: "🔺 Triangle", c: "repeat 3 [ forward 120 turn 120 ]" },
    { n: "⭐ Star", c: "repeat 5 [ forward 130 turn 144 ]" },
    { n: "🌀 Spiral", c: "repeat 24 [ forward 90 turn 95 ]" },
    { n: "⬡ Hexagon", c: "repeat 6 [ forward 80 turn 60 ]" },
  ];
  return (
    <SimulationShell title="Turtle Graphics" icon="🐢"
      controls={<>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={3} className="w-full font-mono text-sm border-2 border-slate-200 rounded-xl p-2" spellCheck={false} />
        <Button variant="fun" onClick={() => runCode(code)} className="w-full">▶️ Run code!</Button>
        <div className="flex flex-wrap gap-1.5">{presets.map((p) => <Button key={p.n} size="sm" variant="outline" onClick={() => { setCode(p.c); runCode(p.c); }}>{p.n}</Button>)}</div>
        {error && <p className="text-sm text-red-600 font-bold">⚠️ {error}</p>}
        <p className="text-xs text-slate-500">Words: forward, turn, left, repeat N [ ... ] • Square: 4×90°, triangle: 3×120°!</p>
      </>}
      dataPanel={<div className="text-sm"><p>🐢 Shelly draws what you code!</p><p>Turn angle = 360° ÷ sides</p><p className="text-xs text-slate-500">Logo turtle language: 1967!</p></div>}
      onSave={() => saveCreation("Turtle Art", "code", { code }, { moduleId, subjectId: "cs" })}>
      <canvas ref={canvasRef} className="w-full h-[300px] md:h-[340px]" />
      <Quiz questions={[
        { q: "To draw a square: repeat 4...", options: ["forward 100, turn 90", "forward 100, turn 45", "stop"], answer: 0, explain: "4 × 90° = 360°!" },
        { q: "Triangle turn angle?", options: ["90°", "120°", "60°"], answer: 1, explain: "360 ÷ 3 = 120!" },
        { q: "Loops help you...", options: ["Avoid repeating yourself", "Slow down", "Erase"], answer: 0, explain: "DRY: Don't Repeat Yourself!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- PYTHON PLAYGROUND (mini interpreter for kid-safe subset) ---- */
function runMiniPython(src: string): { output: string[]; error?: string } {
  const out: string[] = [];
  const vars: Record<string, any> = {};
  try {
    const lines = src.split("\n");
    const execBlock = (block: string[], indent: number): void => {
      for (let i = 0; i < block.length; i++) {
        const raw = block[i];
        if (!raw.trim() || raw.trim().startsWith("#")) continue;
        const cur = raw.match(/^\s*/)?.[0].length ?? 0;
        if (cur < indent) return;
        const line = raw.trim();
        // for loop
        let m = line.match(/^for\s+(\w+)\s+in\s+range\((\d+)(?:\s*,\s*(\d+))?\)\s*:/);
        if (m) {
          const [, v, a, b] = m;
          const start = b ? Number(a) : 0, end = b ? Number(b) : Number(a);
          const inner: string[] = [];
          let j = i + 1;
          while (j < block.length && ((block[j].match(/^\s*/)?.[0].length ?? 0) > cur || !block[j].trim())) { inner.push(block[j]); j++; }
          for (let k = start; k < end; k++) { vars[v] = k; execBlock(inner, cur + 1); }
          i = j - 1;
          continue;
        }
        // if
        m = line.match(/^if\s+(.+)\s*:/);
        if (m) {
          const cond = evalExpr(m[1], vars);
          const inner: string[] = [];
          let j = i + 1;
          while (j < block.length && ((block[j].match(/^\s*/)?.[0].length ?? 0) > cur || !block[j].trim())) { inner.push(block[j]); j++; }
          // else?
          let elseBlock: string[] = [];
          if (j < block.length && block[j].trim().startsWith("else:")) {
            let k = j + 1;
            while (k < block.length && ((block[k].match(/^\s*/)?.[0].length ?? 0) > cur || !block[k].trim())) { elseBlock.push(block[k]); k++; }
            j = k;
          }
          execBlock(cond ? inner : elseBlock, cur + 1);
          i = j - 1;
          continue;
        }
        // print
        m = line.match(/^print\((.*)\)$/);
        if (m) { out.push(formatVal(evalExpr(m[1], vars))); continue; }
        // assignment
        m = line.match(/^(\w+)\s*=\s*(.+)$/);
        if (m) { vars[m[1]] = evalExpr(m[2], vars); continue; }
        // expression statement
        evalExpr(line, vars);
      }
    };
    execBlock(lines, 0);
    return { output: out };
  } catch (e: any) { return { output: out, error: String(e.message || e) }; }
}
function evalExpr(expr: string, vars: Record<string, any>): any {
  const safe = expr
    .replace(/\bprint\b/g, "__print")
    .replace(/\brange\b/g, "__range");
  const names = Object.keys(vars);
  const vals = Object.values(vars);
  const fn = new Function(...names, "__print", "__range", `"use strict"; return (${safe});`);
  return fn(...vals, (...a: any[]) => a.join(" "), (n: number) => Array.from({ length: n }).map((_, i) => i));
}
function formatVal(v: any): string {
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
const PY_PUZZLES = [
  { title: "Say hello 3×", starter: 'for i in range(3):\n    print("Hello!")', hint: "Use a for loop with range(3)!" },
  { title: "Count to 5", starter: 'for i in range(6):\n    print(i)', hint: "range(6) gives 0-5!" },
  { title: "Even or odd?", starter: 'x = 7\nif x % 2 == 0:\n    print("even")\nelse:\n    print("odd")', hint: "% gives remainder!" },
  { title: "FizzBuzz lite", starter: 'for i in range(1, 11):\n    if i % 3 == 0:\n        print("Fizz")\n    else:\n        print(i)', hint: "Multiples of 3 say Fizz!" },
];
export function PythonPlayground({ moduleId }: { moduleId: string }) {
  const [code, setCode] = useState(PY_PUZZLES[0].starter);
  const [output, setOutput] = useState<string[]>(['Press ▶ Run!']);
  const [puzzle, setPuzzle] = useState(0);
  const { recordProgress } = useAppStore();
  const run = () => {
    const res = runMiniPython(code);
    setOutput(res.error ? [...res.output, `⚠️ Error: ${res.error}`] : res.output.length ? res.output : ["(no output — try print()!)"]);
    if (!res.error) {
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 85 });
      if (res.output.length >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
    }
  };
  return (
    <SimulationShell title="Python Playground" icon="🐍"
      controls={<>
        <p className="text-sm font-bold">🧩 Puzzles:</p>
        <div className="grid grid-cols-2 gap-1.5">{PY_PUZZLES.map((p, i) => <Button key={i} size="sm" variant={puzzle === i ? "default" : "outline"} onClick={() => { setPuzzle(i); setCode(p.starter); }}>{p.title}</Button>)}</div>
        <p className="text-xs text-slate-500">💡 Hint: {PY_PUZZLES[puzzle].hint}</p>
        <Button variant="fun" onClick={run} className="w-full">▶️ Run Python!</Button>
        <SaveButton onSave={() => saveCreation("My Python", "code", { code }, { moduleId, subjectId: "cs" })} label="💾 Save code" />
      </>}
      dataPanel={<div className="text-sm"><p>🐍 print() shows things</p><p>📦 x = 5 stores values</p><p>🔁 for i in range(5) repeats</p><p>❓ if/else decides</p><p className="text-xs text-slate-500">Same language as NASA + Instagram!</p></div>}
      onSave={() => saveCreation("My Python", "code", { code }, { moduleId, subjectId: "cs" })}>
      <div className="p-3 grid md:grid-cols-2 gap-3">
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={12} spellCheck={false} className="w-full font-mono text-sm bg-slate-900 text-green-300 rounded-xl p-3" />
        <div className="bg-black text-green-300 font-mono text-sm rounded-xl p-3 min-h-[200px] whitespace-pre-wrap">{output.map((l, i) => <p key={i}>{"> "}{l}</p>)}</div>
      </div>
      <Quiz questions={[
        { q: "print('Hi') does what?", options: ["Deletes", "Shows Hi", "Nothing"], answer: 1, explain: "Output!" },
        { q: "range(3) gives...", options: ["1,2,3", "0,1,2", "3,3,3"], answer: 1, explain: "Starts at 0!" },
        { q: "x = 5 means...", options: ["x equals 5 forever in math", "Store 5 in x", "Delete x"], answer: 1, explain: "Assignment!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- ALGORITHM VISUALIZER ---- */
export function AlgorithmVisualizer({ moduleId }: { moduleId: string }) {
  const [arr, setArr] = useState<number[]>(() => [34, 12, 56, 7, 23, 45, 3, 67, 29, 15, 50, 9]);
  const [algo, setAlgo] = useState<"bubble" | "insertion" | "quick">("bubble");
  const [running, setRunning] = useState(false);
  const [highlight, setHighlight] = useState<[number, number]>([-1, -1]);
  const [comparisons, setComparisons] = useState(0);
  const [target, setTarget] = useState(23);
  const [searchSteps, setSearchSteps] = useState<number[]>([]);
  const { recordProgress } = useAppStore();
  const shuffle = () => { setArr([...arr].sort(() => Math.random() - 0.5)); setComparisons(0); setSearchSteps([]); };
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const sort = async () => {
    setRunning(true);
    const a = [...arr];
    let comps = 0;
    if (algo === "bubble") {
      for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length - 1 - i; j++) {
        comps++; setHighlight([j, j + 1]); setComparisons(comps);
        if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; setArr([...a]); }
        await sleep(120);
      }
    } else if (algo === "insertion") {
      for (let i = 1; i < a.length; i++) {
        let j = i;
        while (j > 0) { comps++; setHighlight([j, j - 1]); setComparisons(comps); if (a[j] < a[j - 1]) { [a[j], a[j - 1]] = [a[j - 1], a[j]]; setArr([...a]); j--; } else break; await sleep(150); }
      }
    } else {
      const quick = async (lo: number, hi: number): Promise<void> => {
        if (lo >= hi) return;
        const pivot = a[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) { comps++; setHighlight([j, hi]); setComparisons(comps); setArr([...a]); await sleep(120); if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; } }
        [a[i], a[hi]] = [a[hi], a[i]]; setArr([...a]);
        await quick(lo, i - 1); await quick(i + 1, hi);
      };
      await quick(0, a.length - 1);
    }
    setRunning(false); setHighlight([-1, -1]);
    recordProgress(moduleId, { timeSpentSeconds: 90, score: 90, status: "completed" });
  };
  const binarySearch = async () => {
    const sorted = [...arr].sort((x, y) => x - y);
    setArr(sorted);
    setSearchSteps([]);
    let lo = 0, hi = sorted.length - 1;
    const visited: number[] = [];
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      visited.push(mid); setSearchSteps([...visited]); setHighlight([mid, mid]);
      await sleep(600);
      if (sorted[mid] === target) break;
      else if (sorted[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
    recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
  };
  const max = Math.max(...arr);
  return (
    <SimulationShell title="Algorithm Visualizer" icon="📊"
      controls={<>
        <div className="flex gap-1.5">{(["bubble", "insertion", "quick"] as const).map((a) => <Button key={a} size="sm" variant={algo === a ? "default" : "outline"} onClick={() => setAlgo(a)} className="flex-1 capitalize">{a}</Button>)}</div>
        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={shuffle} disabled={running} className="flex-1">🎲 Shuffle</Button><Button size="sm" variant="fun" onClick={sort} disabled={running} className="flex-1">{running ? "Sorting..." : "▶️ Sort!"}</Button></div>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🔍 Binary search for:</p>
          <div className="flex gap-1"><input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="flex-1 border-2 rounded-lg px-2 py-1 font-bold" /><Button size="sm" onClick={binarySearch}>Find!</Button></div>
          <p className="text-xs">Guessed indexes: {searchSteps.join(" → ") || "—"}</p>
        </div>
      </>}
      dataPanel={<div className="text-sm"><p>🔍 Comparisons: <b>{comparisons}</b></p><p>Bubble: simple, slow 🫧</p><p>Quick: fast! ⚡</p><p>Binary search: 1M items in ~20 guesses! 🤯</p></div>}>
      <div className="p-4">
        <div className="flex items-end gap-1 h-44">{arr.map((v, i) => (
          <div key={i} className={`flex-1 rounded-t ${highlight.includes(i) ? "bg-red-400" : searchSteps.includes(i) ? "bg-amber-400" : "bg-teal-500"}`} style={{ height: `${(v / max) * 100}%` }} title={String(v)} />
        ))}</div>
        <div className="flex gap-1">{arr.map((v, i) => <span key={i} className="flex-1 text-center text-[10px] font-bold">{v}</span>)}</div>
        <Quiz questions={[
          { q: "Binary search works on...", options: ["Sorted lists", "Any list", "Only letters"], answer: 0, explain: "Must be sorted to halve!" },
          { q: "Quicksort vs bubble sort:", options: ["Bubble is faster", "Quick is usually faster", "Same"], answer: 1, explain: "Divide and conquer wins!" },
          { q: "An algorithm is...", options: ["A robot", "Step-by-step recipe", "A computer"], answer: 1, explain: "Like a cooking recipe!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- LOGIC GATES ---- */
function gateOut(g: string, a: boolean, b: boolean): boolean {
  if (g === "AND") return a && b;
  if (g === "OR") return a || b;
  if (g === "XOR") return a !== b;
  if (g === "NAND") return !(a && b);
  return false;
}
export function LogicGates({ moduleId }: { moduleId: string }) {
  const [gate, setGate] = useState("AND");
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [notIn, setNotIn] = useState(true);
  const [solved, setSolved] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const out = gateOut(gate, a, b);
  const challenges = [
    { g: "AND", want: true, hint: "Both ON!" }, { g: "OR", want: true, hint: "Either ON!" }, { g: "XOR", want: true, hint: "Different!" },
  ];
  const ch = challenges[solved.length % challenges.length];
  useEffect(() => {
    if (gate === ch.g && gateOut(gate, a, b) === ch.want && !solved.includes(`${ch.g}${solved.length}`)) {
      const n = [...solved, `${ch.g}${solved.length}`];
      setSolved(n);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 85 });
      if (n.length >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    }
  }, [a, b, gate]);
  return (
    <SimulationShell title="Logic Gate Lab" icon="🔌"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{["AND", "OR", "XOR", "NAND"].map((g) => <Button key={g} size="sm" variant={gate === g ? "default" : "outline"} onClick={() => setGate(g)}>{g}</Button>)}</div>
        <div className="flex gap-2">
          <Button onClick={() => setA(!a)} variant={a ? "default" : "outline"} className="flex-1">A: {a ? "1 ✅" : "0"}</Button>
          <Button onClick={() => setB(!b)} variant={b ? "default" : "outline"} className="flex-1">B: {b ? "1 ✅" : "0"}</Button>
        </div>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🎯 Challenge {solved.length + 1}/3: make {ch.g} output {ch.want ? "1 (ON)" : "0"} <span className="text-xs">({ch.hint})</span></p>
        </div>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">↩️ NOT gate: in <Button size="sm" variant="outline" onClick={() => setNotIn(!notIn)}>{notIn ? "1" : "0"}</Button> → out <b>{!notIn ? "1" : "0"}</b> (flips!)</p>
        </div>
      </>}
      dataPanel={<div className="text-center"><p className="text-sm">Inputs A={a ? 1 : 0} B={b ? 1 : 0}</p><p className="text-5xl my-1">{out ? "💡" : "⚫"}</p><p className="font-extrabold text-2xl">{gate} → {out ? "1 ON!" : "0 off"}</p><p className="text-xs text-slate-500">Billions of gates in one chip!</p></div>}>
      <div className="p-6">
        <svg viewBox="0 0 300 160" className="w-full max-w-sm mx-auto">
          <line x1="40" y1="50" x2="110" y2="50" stroke={a ? "#fbbf24" : "#94a3b8"} strokeWidth="6" />
          <line x1="40" y1="110" x2="110" y2="110" stroke={b ? "#fbbf24" : "#94a3b8"} strokeWidth="6" />
          <circle cx="30" cy="50" r="12" fill={a ? "#22c55e" : "#cbd5e1"} /><circle cx="30" cy="110" r="12" fill={b ? "#22c55e" : "#cbd5e1"} />
          <path d="M110,30 h40 a50,50 0 0 1 0,100 h-40 z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
          <text x="135" y="90" textAnchor="middle" fontWeight="black" fontSize="20">{gate}</text>
          <line x1="200" y1="80" x2="250" y2="80" stroke={out ? "#fbbf24" : "#94a3b8"} strokeWidth="6" />
          <circle cx="265" cy="80" r="16" fill={out ? "#fef08a" : "#e2e8f0"} stroke="#a16207" strokeWidth="3" />
        </svg>
        <Quiz questions={[
          { q: "AND outputs 1 when...", options: ["Either is 1", "BOTH are 1", "Both are 0"], answer: 1, explain: "AND needs all!" },
          { q: "NOT does what?", options: ["Doubles", "Flips 1↔0", "Nothing"], answer: 1, explain: "Opposite!" },
          { q: "Computers think in...", options: ["Words", "1s and 0s", "Pictures"], answer: 1, explain: "Billions of on/off switches!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- BINARY ---- */
export function BinaryExplorer({ moduleId }: { moduleId: string }) {
  const [bits, setBits] = useState<boolean[]>([false, false, false, false, true, true, false, true]);
  const [msg, setMsg] = useState("");
  const { recordProgress } = useAppStore();
  const value = bits.reduce((s, b, i) => s + (b ? 2 ** (7 - i) : 0), 0);
  const char = value >= 32 && value < 127 ? String.fromCharCode(value) : "?";
  const flip = (i: number) => setBits(bits.map((b, j) => (j === i ? !b : b)));
  const targets = [13, 42, 65];
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => {
    if (value === targets[tIdx]) {
      setMsg(`🎉 ${value} = '${String.fromCharCode(value)}'!`);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 90 });
      if (tIdx + 1 >= targets.length) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      else setTimeout(() => setTIdx(tIdx + 1), 1200);
    } else setMsg("");
  }, [value]);
  return (
    <SimulationShell title="Binary & Data" icon="0️⃣"
      controls={<>
        <p className="text-sm font-bold">🎯 Make: {targets[tIdx]} ('{String.fromCharCode(targets[tIdx])}') — {tIdx + 1}/{targets.length}</p>
        <p className="font-bold text-green-600">{msg}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setBits(Array(8).fill(false))} className="flex-1">0</Button>
          <Button size="sm" variant="outline" onClick={() => setBits(value.toString(2).padStart(8, "0").split("").map((c) => c === "1"))} className="flex-1">🎲 Random</Button>
        </div>
        <p className="text-xs text-slate-500">Place values double: 128 64 32 16 8 4 2 1!</p>
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl font-black font-mono">{value}</p><p className="text-3xl">Letter: <b>{char}</b></p><p className="text-xs text-slate-500">8 bits = 1 byte ≈ 1 letter!</p></div>}>
      <div className="p-6">
        <div className="flex gap-1.5 justify-center flex-wrap">
          {bits.map((b, i) => (
            <button key={i} onClick={() => flip(i)} className="text-center">
              <span className="block text-[10px] font-bold text-slate-400">{2 ** (7 - i)}</span>
              <span className={`block w-12 h-16 md:w-14 md:h-20 rounded-xl font-black text-2xl border-4 ${b ? "bg-amber-400 border-amber-600" : "bg-slate-100 border-slate-300"}`}>{b ? "1" : "0"}</span>
            </button>
          ))}
        </div>
        <p className="text-center font-mono font-bold mt-2">{bits.map((b) => (b ? "1" : "0")).join("")}₂</p>
        <Quiz questions={[
          { q: "Binary 10 equals...", options: ["10", "2", "1"], answer: 1, explain: "1×2 + 0 = 2!" },
          { q: "8 bits = ...", options: ["1 bit", "1 byte", "1 megabyte"], answer: 1, explain: "One letter ≈ one byte!" },
          { q: "Computers use binary because...", options: ["Switches: on/off", "It's pretty", "It's faster to type"], answer: 0, explain: "Two states = reliable!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- WEB BUILDER ---- */
export function WebBuilder({ moduleId }: { moduleId: string }) {
  const [html, setHtml] = useState("<h1>🚀 My Page</h1>\n<p>I built this myself!</p>\n<button>Click me!</button>");
  const [css, setCss] = useState("h1 { color: #3b82f6; }\np { font-size: 18px; }\nbutton { background: #ec4899; color: white; padding: 10px 20px; border: none; border-radius: 10px; }");
  const { recordProgress } = useAppStore();
  return (
    <SimulationShell title="Web Page Builder" icon="🌐"
      controls={<>
        <p className="text-sm font-bold">📝 HTML (structure):</p>
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={6} spellCheck={false} className="w-full font-mono text-xs border-2 border-slate-200 rounded-xl p-2" />
        <p className="text-sm font-bold">🎨 CSS (style):</p>
        <textarea value={css} onChange={(e) => setCss(e.target.value)} rows={5} spellCheck={false} className="w-full font-mono text-xs border-2 border-slate-200 rounded-xl p-2" />
        <SaveButton onSave={async () => { await saveCreation("My Webpage", "code", { html, css }, { moduleId, subjectId: "cs" }); recordProgress(moduleId, { timeSpentSeconds: 120, score: 95, status: "completed" }); }} label="🌐 Publish page!" />
      </>}
      dataPanel={<div className="text-sm"><p>🧱 HTML = bones</p><p>🎨 CSS = clothes</p><p>⚡ JS = muscles</p><p className="text-xs text-slate-500">First website 1991 — still online!</p></div>}
      onSave={() => saveCreation("My Webpage", "code", { html, css }, { moduleId, subjectId: "cs" })}>
      <div className="p-4">
        <p className="text-sm font-bold mb-1">👁️ Live preview (you're viewing a webpage NOW!):</p>
        <div className="border-4 border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-3 py-1 text-xs font-mono">🌐 mypage.lab</div>
          <iframe title="preview" className="w-full h-56 bg-white" srcDoc={`<style>${css}</style>${html}`} sandbox="" />
        </div>
        <Quiz questions={[
          { q: "HTML does what?", options: ["Styles pages", "Structures content", "Runs servers"], answer: 1, explain: "Tags wrap content!" },
          { q: "<h1> is a...", options: ["Big heading", "Picture", "Link"], answer: 0, explain: "Headings h1-h6!" },
          { q: "CSS changes the...", options: ["Structure", "Look (colors, sizes)", "Address"], answer: 1, explain: "Style!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- AI PLAYGROUND ---- */
const SENTIMENT_WORDS: Record<string, number> = { love: 1, happy: 1, awesome: 1, great: 1, fun: 1, best: 1, hate: -1, sad: -1, boring: -1, terrible: -1, awful: -1, worst: -1 };
export function AIPlayground({ moduleId }: { moduleId: string }) {
  const [trained, setTrained] = useState<string[]>(["I love this game", "This is awesome", "I hate bugs", "This is boring"]);
  const [input, setInput] = useState("I love pizza");
  const [result, setResult] = useState("");
  const [tests, setTests] = useState(0);
  const { recordProgress } = useAppStore();
  const classify = (text: string) => {
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    for (const w of words) {
      for (const t of trained) {
        if (t.toLowerCase().includes(w) && w.length > 2) {
          const label = /love|awesome|happy|great|fun|best/i.test(t) ? 1 : -1;
          score += label * (SENTIMENT_WORDS[w] ?? 0.5);
        }
      }
      score += SENTIMENT_WORDS[w] ?? 0;
    }
    return score;
  };
  const test = () => {
    const s = classify(input);
    setResult(s > 0 ? "😊 HAPPY (positive!)" : s < 0 ? "😢 SAD (negative!)" : "😐 UNSURE — needs more training data!");
    const t = tests + 1; setTests(t);
    recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 });
    if (t >= 5) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
  };
  return (
    <SimulationShell title="AI Playground" icon="🤖"
      controls={<>
        <p className="text-sm font-bold">📚 Training examples ({trained.length}):</p>
        <div className="max-h-28 overflow-y-auto space-y-1">
          {trained.map((t, i) => <div key={i} className="flex gap-1 text-xs bg-slate-50 rounded-lg px-2 py-1"><span className="flex-1">{t}</span><button onClick={() => setTrained(trained.filter((_, j) => j !== i))} className="text-red-500 font-bold">✕</button></div>)}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setTrained([...trained, "I love " + ["pizza", "robots", "coding"][Math.floor(Math.random() * 3)]])} className="flex-1">+ 😊 Happy</Button>
          <Button size="sm" variant="outline" onClick={() => setTrained([...trained, "I hate " + ["broccoli", "waiting", "errors"][Math.floor(Math.random() * 3)]])} className="flex-1">+ 😢 Sad</Button>
        </div>
        <p className="text-xs text-slate-500">Tests: {tests}/5 • More examples = smarter!</p>
      </>}
      dataPanel={<div className="text-sm"><p>🧠 AI = pattern finder</p><p>📊 Data in → predictions out</p><p>⚠️ Biased data → biased AI!</p><p>🔍 Always verify AI answers!</p></div>}>
      <div className="p-4">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold" placeholder="Type a sentence..." />
          <Button variant="fun" onClick={test}>🤖 Classify!</Button>
        </div>
        {result && <p className="text-center font-extrabold text-2xl mt-3">{result}</p>}
        <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-sm">
          <p className="font-bold">🧪 Bias experiment:</p>
          <p>Train ONLY happy examples, then test "I hate Mondays". What happens? The AI never learned "sad" words! Real AIs have the same problem — that's why diverse data matters.</p>
        </div>
        <Quiz questions={[
          { q: "AI learns from...", options: ["Magic", "Training examples", "Nothing"], answer: 1, explain: "Data in, patterns out!" },
          { q: "Biased training data gives...", options: ["Perfect AI", "Biased AI", "No AI"], answer: 1, explain: "Garbage in, garbage out!" },
          { q: "AI 'hallucination' means...", options: ["Confident wrong answer", "Seeing ghosts", "Turning off"], answer: 0, explain: "Always double-check!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
