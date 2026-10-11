"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

const ELEMENTS: Record<number, { sym: string; name: string; color: string }> = {
  1: { sym: "H", name: "Hydrogen", color: "#e2e8f0" }, 2: { sym: "He", name: "Helium", color: "#fde68a" },
  3: { sym: "Li", name: "Lithium", color: "#f9a8d4" }, 4: { sym: "Be", name: "Beryllium", color: "#a7f3d0" },
  5: { sym: "B", name: "Boron", color: "#fed7aa" }, 6: { sym: "C", name: "Carbon", color: "#94a3b8" },
  7: { sym: "N", name: "Nitrogen", color: "#93c5fd" }, 8: { sym: "O", name: "Oxygen", color: "#f87171" },
  9: { sym: "F", name: "Fluorine", color: "#bef264" }, 10: { sym: "Ne", name: "Neon", color: "#67e8f9" },
  11: { sym: "Na", name: "Sodium", color: "#c4b5fd" }, 12: { sym: "Mg", name: "Magnesium", color: "#86efac" },
  13: { sym: "Al", name: "Aluminum", color: "#cbd5e1" }, 14: { sym: "Si", name: "Silicon", color: "#fcd34d" },
  15: { sym: "P", name: "Phosphorus", color: "#fdba74" }, 16: { sym: "S", name: "Sulfur", color: "#fde047" },
  17: { sym: "Cl", name: "Chlorine", color: "#86efac" }, 18: { sym: "Ar", name: "Argon", color: "#bae6fd" },
  19: { sym: "K", name: "Potassium", color: "#d8b4fe" }, 20: { sym: "Ca", name: "Calcium", color: "#fca5a5" },
};

/* ============ ATOM BUILDER ============ */
export function AtomBuilder({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const el = ELEMENTS[protons];
  const charge = protons - electrons;
  const ionLabel = charge === 0 ? "Neutral atom ✅" : charge > 0 ? `Positive ion (+${charge}) ⚡` : `Negative ion (${charge}) ⚡`;
  const stable = Math.abs(neutrons - protons) <= 2 || protons <= 2 ? "Stable ✅" : "Unstable! Add/remove neutrons ☢️";

  useEffect(() => {
    if (el && !discovered.includes(el.name)) {
      setDiscovered((d) => [...d, el.name]);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 });
      if (discovered.length + 1 >= 8) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
    }
  }, [protons]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0; let a = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 440);
    const draw = () => {
      a += 0.02;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W / 2);
      bg.addColorStop(0, "#faf5ff"); bg.addColorStop(1, "#e9d5ff");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      // shells
      const shells = [Math.min(2, electrons), Math.min(8, Math.max(0, electrons - 2)), Math.max(0, electrons - 10)];
      shells.forEach((n, i) => {
        if (i > 0 && shells.slice(0, i).reduce((s, x) => s + x, 0) >= electrons && n === 0) return;
        const r = 90 + i * 62;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 3; ctx.stroke();
        for (let e = 0; e < n; e++) {
          const ang = a * (1 - i * 0.15) + (e / Math.max(1, n)) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 13, 0, Math.PI * 2);
          ctx.fillStyle = "#3b82f6"; ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.fillText("e⁻", cx + Math.cos(ang) * r - 10, cy + Math.sin(ang) * r + 6);
        }
      });
      // nucleus
      const total = protons + neutrons;
      for (let i = 0; i < total; i++) {
        const ang = (i / total) * Math.PI * 2;
        const rr = total > 1 ? 26 : 0;
        const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
        ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2);
        ctx.fillStyle = i < protons ? "#ef4444" : "#94a3b8"; ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 17px sans-serif";
        ctx.fillText(i < protons ? "p⁺" : "n⁰", x - 11, y + 6);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [protons, neutrons, electrons]);

  return (
    <SimulationShell title="Atom Builder" icon="⚛️"
      controls={<>
        <Slider label="🔴 Protons" value={protons} min={1} max={20} onChange={setProtons} />
        <Slider label="⚪ Neutrons" value={neutrons} min={0} max={25} onChange={setNeutrons} />
        <Slider label="🔵 Electrons" value={electrons} min={0} max={20} onChange={setElectrons} />
        <p className="text-xs text-slate-500">Discovered: {discovered.length}/20 {discovered.join(", ") || "—"}</p>
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl font-black" style={{ color: el?.color }}>{el?.sym}</p><p className="font-display font-extrabold text-xl">{el?.name}</p><p className="text-sm mt-1">{ionLabel}</p><p className="text-sm">{stable}</p><p className="text-xs text-slate-500 mt-1">Protons decide the element!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "What decides which element an atom is?", options: ["Neutrons", "Protons", "Electrons"], answer: 1, explain: "Proton count = atomic number!" },
        { q: "Carbon has 6 protons but 4 electrons. It is...", options: ["Neutral", "A positive ion", "A new element"], answer: 1, explain: "Fewer electrons = positive!" },
        { q: "Electrons live...", options: ["In the nucleus", "In shells around it", "Nowhere"], answer: 1, explain: "Shells fill inside-out: 2, 8, 8..." },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ============ MOLECULE BUILDER 3D ============ */
const TARGETS = [
  { formula: "H2O", name: "Water 💧", atoms: ["O", "H", "H"], shape: "Bent! 104.5°" },
  { formula: "CO2", name: "Carbon Dioxide 💨", atoms: ["O", "C", "O"], shape: "Straight line" },
  { formula: "CH4", name: "Methane 🔥", atoms: ["C", "H", "H", "H", "H"], shape: "Pyramid (tetrahedron)" },
  { formula: "O2", name: "Oxygen 🌬️", atoms: ["O", "O"], shape: "Pair" },
  { formula: "NH3", name: "Ammonia 🧪", atoms: ["N", "H", "H", "H"], shape: "Pyramid" },
  { formula: "NaCl", name: "Table Salt 🧂", atoms: ["Na", "Cl"], shape: "Pair (ionic!)" },
];
const ATOM_STYLE: Record<string, { c: string; r: number }> = {
  H: { c: "#e2e8f0", r: 22 }, C: { c: "#475569", r: 34 }, N: { c: "#3b82f6", r: 32 }, O: { c: "#ef4444", r: 34 },
  S: { c: "#eab308", r: 36 }, Cl: { c: "#22c55e", r: 38 }, Na: { c: "#a855f7", r: 36 },
};

export function MoleculeBuilder3D({ moduleId }: { moduleId: string }) {
  const [built, setBuilt] = useState<string[]>(["O", "H", "H"]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [rot, setRot] = useState(0);
  const [built2, setBuilt2] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const target = TARGETS[targetIdx];
  useEffect(() => {
    const t = setInterval(() => setRot((r) => (r + 2) % 360), 50);
    return () => clearInterval(t);
  }, []);
  const checkMatch = (arr: string[]) => {
    const a = [...arr].sort().join(",");
    const b = [...target.atoms].sort().join(",");
    return a === b;
  };
  const matched = checkMatch(built);
  useEffect(() => {
    if (matched) {
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 90 });
      if (targetIdx >= TARGETS.length - 1) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    }
  }, [matched]);

  const addAtom = (a: string) => { if (built.length < 8) setBuilt([...built, a]); };

  return (
    <SimulationShell title="Molecule Builder" icon="🔬"
      controls={<>
        <p className="text-sm font-bold">🎯 Build: {target.name} ({target.formula})</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setTargetIdx((targetIdx + TARGETS.length - 1) % TARGETS.length)}>←</Button>
          <Button size="sm" variant="outline" onClick={() => setTargetIdx((targetIdx + 1) % TARGETS.length)}>→</Button>
        </div>
        <p className="text-sm font-bold">➕ Add atoms:</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(ATOM_STYLE).map((a) => (
            <button key={a} onClick={() => addAtom(a)} className="w-10 h-10 rounded-full font-black text-white shadow" style={{ backgroundColor: ATOM_STYLE[a].c }}>{a}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setBuilt([])} className="flex-1">🧹 Clear</Button>
          <Button size="sm" variant="outline" onClick={() => setBuilt([...target.atoms])} className="flex-1">💡 Hint</Button>
        </div>
        <p className={`font-bold text-sm ${matched ? "text-green-600" : ""}`}>{matched ? `🎉 ${target.name} complete! Shape: ${target.shape}` : `Your molecule: ${built.join("–") || "empty"}`}</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🧪 Formula: <b>{target.formula}</b></p><p>📐 Shape: <b>{target.shape}</b></p><p>✅ {TARGETS.filter((t) => checkMatch(t.atoms) && t.formula === target.formula).length ? "Built!" : "Not yet..."}</p><p className="text-xs text-slate-500">H₂O = 2 hydrogen + 1 oxygen!</p></div>}>
      <div className="p-6">
        <svg viewBox="0 0 400 260" className="w-full" style={{ transform: `rotate(${0}deg)` }}>
          {built.map((a, i) => {
            const cx = 200 + Math.cos((i / Math.max(1, built.length)) * Math.PI * 2 + (rot * Math.PI) / 180) * (built.length > 1 ? 80 : 0);
            const cy = 130 + Math.sin((i / Math.max(1, built.length)) * Math.PI * 2 + (rot * Math.PI) / 180) * (built.length > 1 ? 60 : 0);
            return (
              <g key={i} onClick={() => setBuilt(built.filter((_, j) => j !== i))} style={{ cursor: "pointer" }}>
                {built.length > 1 && <line x1={200} y1={130} x2={cx} y2={cy} stroke="#94a3b8" strokeWidth="8" />}
                <circle cx={cx} cy={cy} r={ATOM_STYLE[a]?.r ?? 28} fill={ATOM_STYLE[a]?.c ?? "#999"} stroke="#0f172a" strokeWidth="2" />
                <text x={cx} y={cy + 7} textAnchor="middle" fontWeight="black" fill="#fff" fontSize="18">{a}</text>
              </g>
            );
          })}
          {built.length === 0 && <text x={200} y={130} textAnchor="middle" fill="#94a3b8">Click atoms to add! (click atom to remove)</text>}
        </svg>
        <Quiz questions={[
          { q: "H₂O means...", options: ["2 oxygen + 1 hydrogen", "2 hydrogen + 1 oxygen", "2 helium"], answer: 1, explain: "Big letters = elements, small numbers = counts!" },
          { q: "Atoms stick together with...", options: ["Glue", "Chemical bonds", "Magnets"], answer: 1, explain: "Sharing or trading electrons!" },
          { q: "Diamond and pencil lead are both...", options: ["Pure carbon", "Pure gold", "Plastic"], answer: 0, explain: "Same atoms, different arrangement!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ============ REACTION LAB ============ */
const REACTIONS = [
  { name: "🔥 Burning Methane", reactants: "CH₄ + 2O₂", products: "CO₂ + 2H₂O", left: { C: 1, H: 4, O: 4 }, right: { C: 1, H: 4, O: 4 }, visual: "flame", type: "combustion" },
  { name: "💧 Making Water", reactants: "2H₂ + O₂", products: "2H₂O", left: { H: 4, O: 2 }, right: { H: 4, O: 2 }, visual: "pop", type: "synthesis" },
  { name: "🫧 Baking Soda + Vinegar", reactants: "NaHCO₃ + CH₃COOH", products: "CO₂ + H₂O + CH₃COONa", left: { Na: 1, H: 5, C: 3, O: 5 }, right: { Na: 1, H: 5, C: 3, O: 5 }, visual: "fizz", type: "acid-base" },
  { name: "🌿 Photosynthesis", reactants: "6CO₂ + 6H₂O", products: "C₆H₁₂O₆ + 6O₂", left: { C: 6, H: 12, O: 18 }, right: { C: 6, H: 12, O: 18 }, visual: "glow", type: "synthesis" },
  { name: "🦀 Rusting Iron", reactants: "4Fe + 3O₂", products: "2Fe₂O₃", left: { Fe: 4, O: 6 }, right: { Fe: 4, O: 6 }, visual: "rust", type: "oxidation" },
];

export function ReactionLab({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(0);
  const [coeffs, setCoeffs] = useState<number[]>([1, 1, 1]);
  const [mixed, setMixed] = useState(false);
  const [bubbles, setBubbles] = useState<number[]>([]);
  const { recordProgress } = useAppStore();
  const r = REACTIONS[idx];

  useEffect(() => {
    if (!mixed) return;
    const t = setInterval(() => setBubbles((b) => [...b.slice(-25), Math.random()]), 150);
    const stop = setTimeout(() => { setMixed(false); setBubbles([]); }, 4000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [mixed]);

  // balancing mini-game: is CH4 + O2 -> CO2 + H2O balanced with user coefficients?
  const [bal, setBal] = useState({ ch4: 1, o2: 1, co2: 1, h2o: 1 });
  const balanced = bal.ch4 === 1 && bal.o2 === 2 && bal.co2 === 1 && bal.h2o === 2;

  useEffect(() => {
    if (balanced) recordProgress(moduleId, { timeSpentSeconds: 90, score: 100, status: "completed" });
  }, [balanced]);

  return (
    <SimulationShell title="Reaction Lab" icon="⚗️"
      controls={<>
        <label className="block text-sm font-medium">Reaction
          <select value={idx} onChange={(e) => { setIdx(Number(e.target.value)); setMixed(false); }} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold">
            {REACTIONS.map((x, i) => <option key={i} value={i}>{x.name}</option>)}
          </select></label>
        <Button variant="fun" className="w-full" onClick={() => { setMixed(true); recordProgress(moduleId, { timeSpentSeconds: 45 }); }}>⚗️ MIX! ({r.visual === "flame" ? "🔥" : r.visual === "fizz" ? "🫧" : r.visual === "glow" ? "🌟" : "💥"})</Button>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">⚖️ Balance: CH₄ + O₂ → CO₂ + H₂O</p>
          {(["ch4", "o2", "co2", "h2o"] as const).map((k) => (
            <div key={k} className="flex items-center gap-2 text-sm">
              <span className="w-10 font-bold">{k.toUpperCase()}</span>
              <input type="range" min={1} max={4} value={bal[k]} onChange={(e) => setBal({ ...bal, [k]: Number(e.target.value) })} className="flex-1" />
              <b>{bal[k]}</b>
            </div>
          ))}
          <p className="text-sm font-bold">{balanced ? "🎉 BALANCED! Atoms equal both sides!" : "H: ? O: ? — make atoms equal!"}</p>
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p><b>Reactants:</b> {r.reactants}</p><p><b>Products:</b> {r.products}</p><p><b>Type:</b> {r.type}</p><p className="text-xs text-slate-500">Atoms rearrange — never created or destroyed!</p></div>}>
      <div className="p-6">
        <div className="relative h-48 bg-gradient-to-b from-slate-100 to-slate-200 rounded-xl overflow-hidden flex items-end justify-center">
          <div className="w-32 h-32 rounded-b-full rounded-t-lg border-4 border-slate-400 bg-cyan-200/70 relative overflow-hidden mb-2">
            {bubbles.map((b, i) => (
              <span key={i} className="absolute rounded-full bg-white/80" style={{ left: `${b * 80}%`, bottom: `${(i * 37) % 90}%`, width: 6 + (b * 10), height: 6 + (b * 10) }}>🫧</span>
            ))}
            {!mixed && <span className="absolute inset-0 flex items-center justify-center text-3xl">🧪</span>}
            {mixed && <span className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">{r.visual === "flame" ? "🔥" : r.visual === "fizz" ? "🫧" : r.visual === "glow" ? "🌟" : "✨"}</span>}
          </div>
        </div>
        <div className="flex justify-between mt-3 text-sm font-bold"><span>⬅️ {r.reactants}</span><span>➡️ {r.products}</span></div>
        <Quiz questions={[
          { q: "In a reaction, atoms are...", options: ["Destroyed", "Rearranged", "Created from nothing"], answer: 1, explain: "Same atoms, new arrangement!" },
          { q: "Balanced means...", options: ["Equal atoms each side", "Equal liquids", "Pretty colors"], answer: 0, explain: "Count every atom!" },
          { q: "Baking soda + vinegar makes...", options: ["Oxygen", "CO₂ bubbles", "Gold"], answer: 1, explain: "Fizz = CO₂ gas escaping!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ============ PH EXPLORER ============ */
const SUBSTANCES = [
  { name: "Stomach Acid", ph: 1.5, icon: "🫄" }, { name: "Lemon Juice", ph: 2, icon: "🍋" },
  { name: "Vinegar", ph: 3, icon: "🫗" }, { name: "Orange Juice", ph: 3.5, icon: "🍊" },
  { name: "Tomato", ph: 4, icon: "🍅" }, { name: "Coffee", ph: 5, icon: "☕" },
  { name: "Rain Water", ph: 5.6, icon: "🌧️" }, { name: "Milk", ph: 6.5, icon: "🥛" },
  { name: "Pure Water", ph: 7, icon: "💧" }, { name: "Blood", ph: 7.4, icon: "🩸" },
  { name: "Sea Water", ph: 8, icon: "🌊" }, { name: "Baking Soda", ph: 9, icon: "🥄" },
  { name: "Soap", ph: 10, icon: "🧼" }, { name: "Ammonia", ph: 11, icon: "🧪" }, { name: "Bleach", ph: 12.5, icon: "🧴" },
];
const phColor = (ph: number) => `hsl(${Math.max(0, 350 - ph * 26)}, 85%, 55%)`;

export function PhExplorer({ moduleId }: { moduleId: string }) {
  const [sel, setSel] = useState(8);
  const [mixA, setMixA] = useState(1);
  const [mixB, setMixB] = useState(12);
  const [tested, setTested] = useState<number[]>([8]);
  const { recordProgress } = useAppStore();
  const s = SUBSTANCES[sel];
  const label = s.ph < 7 ? "ACID 🔴" : s.ph > 7 ? "BASE 🔵" : "NEUTRAL 🟢";
  const mixedPh = ((SUBSTANCES[mixA].ph + SUBSTANCES[mixB].ph) / 2).toFixed(1);

  useEffect(() => {
    if (tested.length >= 8) recordProgress(moduleId, { timeSpentSeconds: 90, score: 90, status: "completed" });
  }, [tested.length]);

  return (
    <SimulationShell title="pH & Acids Explorer" icon="🧫"
      controls={<>
        <p className="text-sm font-bold">🧪 Dip the strip into:</p>
        <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
          {SUBSTANCES.map((x, i) => (
            <button key={i} onClick={() => { setSel(i); setTested((t) => (t.includes(i) ? t : [...t, i])); }} className={`p-2 rounded-xl border-2 text-xs font-bold ${sel === i ? "border-purple-500 bg-purple-50" : "border-slate-200"}`}>
              <span className="text-xl block">{x.icon}</span>{x.name}
            </button>
          ))}
        </div>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">⚗️ Neutralize: mix acid + base</p>
          <div className="flex gap-1">
            <select value={mixA} onChange={(e) => setMixA(Number(e.target.value))} className="flex-1 border-2 rounded-lg text-xs p-1">{SUBSTANCES.map((x, i) => <option key={i} value={i}>{x.icon} {x.name}</option>)}</select>
            <select value={mixB} onChange={(e) => setMixB(Number(e.target.value))} className="flex-1 border-2 rounded-lg text-xs p-1">{SUBSTANCES.map((x, i) => <option key={i} value={i}>{x.icon} {x.name}</option>)}</select>
          </div>
          <p className="text-sm">Mixed pH ≈ <b>{mixedPh}</b> {Number(mixedPh) > 6 && Number(mixedPh) < 8 ? "🎉 NEUTRALIZED!" : ""}</p>
        </div>
        <p className="text-xs text-slate-500">Tested {tested.length}/{SUBSTANCES.length}</p>
      </>}
      dataPanel={<div className="text-center"><div className="h-24 rounded-xl flex items-center justify-center text-4xl font-black text-white" style={{ backgroundColor: phColor(s.ph) }}>{s.icon} {s.ph}</div><p className="font-extrabold text-xl mt-2">{s.name}: {label}</p>
        <div className="mt-2 h-4 rounded-full" style={{ background: "linear-gradient(to right, #ff0000, #ff8800, #cccc00, #00cc00, #00aaff, #4400ff)" }} />
        <div className="flex justify-between text-[10px] font-bold"><span>0 acid</span><span>7</span><span>14 base</span></div></div>}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-40 rounded-xl border-4 border-slate-300 relative overflow-hidden" style={{ backgroundColor: phColor(s.ph) + "33" }}>
            <div className="absolute bottom-0 left-0 right-0 transition-all" style={{ height: "70%", backgroundColor: phColor(s.ph) }} />
            <span className="absolute inset-0 flex items-center justify-center text-4xl">{s.icon}</span>
          </div>
          <div>
            <p className="font-bold">Litmus strip says:</p>
            <div className="w-40 h-8 rounded" style={{ backgroundColor: phColor(s.ph) }} />
            <p className="text-sm mt-1">{s.ph < 7 ? "🔴 Red in acid!" : s.ph > 7 ? "🔵 Blue in base!" : "🟣 Neutral stays purple!"}</p>
          </div>
        </div>
        <Quiz questions={[
          { q: "Lemon juice (pH 2) is...", options: ["An acid", "A base", "Neutral"], answer: 0, explain: "Below 7 = acid!" },
          { q: "Pure water is pH...", options: ["1", "7", "14"], answer: 1, explain: "7 = neutral!" },
          { q: "Mixing acid + base makes...", options: ["Explosion always", "Closer to neutral", "Pure acid"], answer: 1, explain: "They neutralize each other!" },
        ]} onComplete={(sc) => recordProgress(moduleId, { timeSpentSeconds: 90, score: sc, status: sc >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ============ STATES OF MATTER ============ */
export function StatesOfMatter({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temp, setTemp] = useState(25);
  const [substance, setSubstance] = useState("water");
  const info: Record<string, { melt: number; boil: number; emoji: string }> = {
    water: { melt: 0, boil: 100, emoji: "💧" }, oxygen: { melt: -219, boil: -183, emoji: "🌬️" },
    iron: { melt: 1538, boil: 2862, emoji: "🔩" }, "carbon-dioxide": { melt: -57, boil: -78, emoji: "💨" },
  };
  const { recordProgress } = useAppStore();
  const cur = info[substance];
  const state = temp <= cur.melt ? "SOLID 🧊" : temp >= cur.boil ? "GAS 💨" : "LIQUID 💧";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 400);
    const dots = Array.from({ length: 50 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, ox: (i % 10) * (W / 10) + 30, oy: Math.floor(i / 10) * (H / 5) + 40 }));
    const heat = Math.max(0.2, (temp + 60) / 120);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = temp <= cur.melt ? "#dbeafe" : temp >= cur.boil ? "#fef3c7" : "#e0f2fe";
      ctx.fillRect(0, 0, W, H);
      const solid = temp <= cur.melt;
      dots.forEach((d) => {
        if (solid) {
          d.x += (d.ox - d.x) * 0.05 + (Math.random() - 0.5) * 2;
          d.y += (d.oy - d.y) * 0.05 + (Math.random() - 0.5) * 2;
        } else {
          d.x += (Math.random() - 0.5) * heat * 8;
          d.y += (Math.random() - 0.5) * heat * 8;
          if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
          if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        }
        ctx.beginPath(); ctx.arc(d.x, d.y, 13, 0, Math.PI * 2);
        ctx.fillStyle = substance === "water" ? "#38bdf8" : substance === "iron" ? "#94a3b8" : "#a5b4fc";
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [temp, substance]);

  return (
    <SimulationShell title="States of Matter" icon="🧊"
      controls={<>
        <label className="block text-sm font-medium">Substance
          <select value={substance} onChange={(e) => setSubstance(e.target.value)} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold">
            <option value="water">💧 Water</option><option value="oxygen">🌬️ Oxygen</option>
            <option value="iron">🔩 Iron</option><option value="carbon-dioxide">💨 Carbon Dioxide</option>
          </select></label>
        <Slider label="🌡️ Temperature" value={temp} min={substance === "water" ? -50 : -220} max={substance === "water" ? 150 : temp > 500 ? 3000 : 150} onChange={setTemp} format={(v) => `${v}°C`} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setTemp((t) => t - 20)} className="flex-1">❄️ Cool</Button>
          <Button size="sm" variant="outline" onClick={() => setTemp((t) => t + 20)} className="flex-1">🔥 Heat</Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 90, score: 85, status: "completed" })}>✅ I changed states!</Button>
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl">{cur.emoji}</p><p className="font-extrabold text-2xl">{state}</p><p className="text-sm">Melts: {cur.melt}°C • Boils: {cur.boil}°C</p><p className="text-xs text-slate-500">Heat = molecules move faster!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[260px]" />
      <Quiz questions={[
        { q: "Ice melting is...", options: ["Solid → liquid", "Liquid → gas", "Magic"], answer: 0, explain: "Heat loosens molecules!" },
        { q: "Gas molecules compared to solid...", options: ["Move freely & fast", "Don't move", "Are bigger"], answer: 0, explain: "Heat = speed!" },
        { q: "Boiling point of water?", options: ["0°C", "100°C", "50°C"], answer: 1, explain: "100°C at sea level!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}
