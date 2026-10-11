"use client";
import React, { useState, useEffect } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- PERIODIC TABLE ---- */
const ELEMENTS: Array<{ n: number; s: string; name: string; g: string; fact: string; use: string }> = [
  { n: 1, s: "H", name: "Hydrogen", g: "nonmetal", fact: "Lightest element — stars burn it!", use: "Rockets, stars" },
  { n: 2, s: "He", name: "Helium", g: "noble", fact: "Makes balloons float and voices squeaky", use: "Balloons, MRI" },
  { n: 3, s: "Li", name: "Lithium", g: "alkali", fact: "Lightest metal — floats on oil!", use: "Batteries" },
  { n: 4, s: "Be", name: "Beryllium", g: "alkaline", fact: "Stiff and light — used in spacecraft", use: "X-ray windows" },
  { n: 5, s: "B", name: "Boron", g: "metalloid", fact: "Makes glass heat-proof", use: "Lab glass, slime" },
  { n: 6, s: "C", name: "Carbon", g: "nonmetal", fact: "Diamond AND pencil lead — both carbon!", use: "Life itself" },
  { n: 7, s: "N", name: "Nitrogen", g: "nonmetal", fact: "78% of the air you breathe", use: "Fertilizer" },
  { n: 8, s: "O", name: "Oxygen", g: "nonmetal", fact: "You need it every second", use: "Breathing, fire" },
  { n: 9, s: "F", name: "Fluorine", g: "halogen", fact: "Most reactive of all!", use: "Toothpaste" },
  { n: 10, s: "Ne", name: "Neon", g: "noble", fact: "Glows bright red-orange in signs", use: "Neon signs" },
  { n: 11, s: "Na", name: "Sodium", g: "alkali", fact: "Explodes in water — but salt needs it!", use: "Table salt" },
  { n: 12, s: "Mg", name: "Magnesium", g: "alkaline", fact: "Burns blinding white", use: "Fireworks, bikes" },
  { n: 13, s: "Al", name: "Aluminum", g: "metal", fact: "Most common metal in Earth's crust", use: "Cans, planes" },
  { n: 14, s: "Si", name: "Silicon", g: "metalloid", fact: "Computer chips are made of it", use: "Phones, solar" },
  { n: 15, s: "P", name: "Phosphorus", g: "nonmetal", fact: "Glows in the dark (white kind)", use: "Matches, DNA" },
  { n: 16, s: "S", name: "Sulfur", g: "nonmetal", fact: "Smells like rotten eggs", use: "Volcanoes" },
  { n: 17, s: "Cl", name: "Chlorine", g: "halogen", fact: "Keeps pools clean, deadly pure", use: "Pools, salt" },
  { n: 18, s: "Ar", name: "Argon", g: "noble", fact: "Fills light bulbs so they last", use: "Welding, bulbs" },
  { n: 19, s: "K", name: "Potassium", g: "alkali", fact: "Bananas are slightly radioactive from it!", use: "Bananas, nerves" },
  { n: 20, s: "Ca", name: "Calcium", g: "alkaline", fact: "Builds your bones and teeth", use: "Milk, chalk" },
  { n: 26, s: "Fe", name: "Iron", g: "metal", fact: "Your blood carries oxygen with it", use: "Steel, blood" },
  { n: 29, s: "Cu", name: "Copper", g: "metal", fact: "Wires the whole world", use: "Pennies, wires" },
  { n: 31, s: "Ga", name: "Gallium", g: "metal", fact: "Melts in your palm at 29.8°C!", use: "LEDs" },
  { n: 47, s: "Ag", name: "Silver", g: "metal", fact: "Best electricity conductor of all", use: "Jewelry, mirrors" },
  { n: 79, s: "Au", name: "Gold", g: "metal", fact: "Never rusts — pharaohs' favorite", use: "Money, phones" },
  { n: 82, s: "Pb", name: "Lead", g: "metal", fact: "Heavy and toxic — no longer in paint", use: "Batteries" },
  { n: 92, s: "U", name: "Uranium", g: "metal", fact: "Heaviest natural element — powers reactors", use: "Nuclear power" },
];
const GROUP_COLORS: Record<string, string> = {
  alkali: "bg-red-200", alkaline: "bg-orange-200", metal: "bg-amber-100", metalloid: "bg-yellow-200",
  nonmetal: "bg-green-100", halogen: "bg-teal-200", noble: "bg-purple-200",
};
const RIDDLES = [
  { clue: "I melt in your palm! 🤲", answer: "Gallium" },
  { clue: "Bananas carry me ⚡", answer: "Potassium" },
  { clue: "Diamond and pencil — both me 💎", answer: "Carbon" },
  { clue: "I make balloons float 🎈", answer: "Helium" },
  { clue: "Your bones need me 🦴", answer: "Calcium" },
  { clue: "I never rust — pharaohs loved me 👑", answer: "Gold" },
  { clue: "Toothpaste has me 🪥", answer: "Fluorine" },
  { clue: "Computer chips are me 💻", answer: "Silicon" },
  { clue: "I wire the whole world 🔌", answer: "Copper" },
  { clue: "78% of air is me 🌬️", answer: "Nitrogen" },
];
export function PeriodicTable({ moduleId }: { moduleId: string }) {
  const [family, setFamily] = useState("all");
  const [sel, setSel] = useState(ELEMENTS[5]);
  const [riddle, setRiddle] = useState(0);
  const [found, setFound] = useState(0);
  const [msg, setMsg] = useState("Solve the riddle — tap the element!");
  const { recordProgress } = useAppStore();
  const tap = (e: (typeof ELEMENTS)[number]) => {
    setSel(e);
    if (e.name === RIDDLES[riddle % RIDDLES.length].answer) {
      const f = found + 1; setFound(f); setMsg(`✅ ${e.name}! Next riddle...`);
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 });
      if (f >= 10) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setRiddle(riddle + 1);
    } else setMsg(`That's ${e.name} — keep hunting! 🔍`);
  };
  const shown = family === "all" ? ELEMENTS : ELEMENTS.filter((e) => e.g === family);
  return (
    <SimulationShell title="Periodic Table Explorer" icon="🧬"
      controls={<>
        <div className="flex flex-wrap gap-1">{["all", "alkali", "noble", "halogen", "metal", "nonmetal"].map((g) => (
          <Button key={g} size="sm" variant={family === g ? "default" : "outline"} onClick={() => setFamily(g)} className="text-xs capitalize">{g}</Button>
        ))}</div>
        <div className="bg-indigo-50 rounded-xl p-2">
          <p className="text-sm font-bold">🔍 Riddle {found + 1}/10: {RIDDLES[riddle % RIDDLES.length].clue}</p>
          <p className="text-xs font-bold">{msg}</p>
        </div>
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl font-black">{sel.s}</p><p className="font-extrabold">#{sel.n} {sel.name}</p><p className="text-sm">🤯 {sel.fact}</p><p className="text-xs text-slate-500">Used for: {sel.use}</p></div>}>
      <div className="p-3">
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-1">
          {shown.map((e) => (
            <button key={e.n} onClick={() => tap(e)} title={e.name}
              className={`aspect-square rounded-lg border-2 font-black text-sm ${GROUP_COLORS[e.g]} ${sel.n === e.n ? "border-slate-900 scale-110" : "border-transparent"}`}>
              {e.s}<span className="block text-[9px] font-normal">{e.n}</span>
            </button>
          ))}
        </div>
        <Quiz questions={[
          { q: "Elements are ordered by...", options: ["Size", "Proton count", "Color"], answer: 1, explain: "Atomic number = protons!" },
          { q: "A column is called a...", options: ["Row", "Group (family)", "Block"], answer: 1, explain: "Family members act alike!" },
          { q: "Noble gases are special because they...", options: ["Explode", "Barely react", "Are liquid"], answer: 1, explain: "Snobby but useful!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- MIX & SEPARATE ---- */
export function MixSeparate({ moduleId }: { moduleId: string }) {
  const [iron, setIron] = useState(true);
  const [sand, setSand] = useState(true);
  const [salt, setSalt] = useState(true);
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState("Disgusting soup! Rescue every ingredient — ORDER matters!");
  const { recordProgress } = useAppStore();
  const use_tool = (tool: string) => {
    if (tool === "magnet" && step === 0 && iron) { setIron(false); setStep(1); setMsg("🧲 Iron rescued! Now the sand..."); recordProgress(moduleId, { timeSpentSeconds: 25, score: 85 }); }
    else if (tool === "filter" && step === 1 && sand) { setSand(false); setStep(2); setMsg("🧻 Sand filtered! Now the dissolved salt..."); recordProgress(moduleId, { timeSpentSeconds: 25, score: 85 }); }
    else if (tool === "heat" && step === 2 && salt) {
      setSalt(false); setStep(3); setMsg("🎉 Salt crystals recovered! ALL SEPARATED!");
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 100, status: "completed" });
    }
    else setMsg(`❌ ${tool} won't work now! Think: magnet → filter → evaporate.`);
  };
  const reset = () => { setIron(true); setSand(true); setSalt(true); setStep(0); setMsg("Fresh soup! Magnet first!"); };
  return (
    <SimulationShell title="Mix & Separate Lab" icon="🥣"
      controls={<>
        <div className="grid grid-cols-3 gap-1.5">
          <Button size="sm" variant="outline" onClick={() => use_tool("magnet")}>🧲 Magnet</Button>
          <Button size="sm" variant="outline" onClick={() => use_tool("filter")}>🧻 Filter</Button>
          <Button size="sm" variant="outline" onClick={() => use_tool("heat")}>🔥 Evaporate</Button>
        </div>
        <Button size="sm" variant="ghost" onClick={reset} className="w-full">🔄 Fresh soup</Button>
        <p className="text-xs text-slate-500">Step {Math.min(step + 1, 3)}/3 • Filtering salt water does NOTHING — it's dissolved!</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🔩 Iron: <b>{iron ? "in soup" : "✅ rescued"}</b></p><p>⏳ Sand: <b>{sand ? "in soup" : "✅ rescued"}</b></p><p>🧂 Salt: <b>{salt ? "dissolved" : "✅ rescued"}</b></p><p className="font-bold">{msg}</p></div>}>
      <div className="p-6 text-center">
        <div className="w-40 h-40 mx-auto rounded-b-full rounded-t-lg border-4 border-slate-400 bg-amber-200/70 relative overflow-hidden">
          {iron && <span className="absolute text-3xl" style={{ left: "20%", top: "55%" }}>🔩</span>}
          {sand && <span className="absolute text-3xl" style={{ left: "55%", top: "65%" }}>⏳</span>}
          {salt && <span className="absolute text-2xl" style={{ left: "40%", top: "40%" }}>🧂</span>}
          {!iron && !sand && !salt && <span className="absolute inset-0 flex items-center justify-center text-4xl">✨💧✨</span>}
        </div>
        <Quiz questions={[
          { q: "First tool for iron + sand + salt water?", options: ["Filter", "Magnet", "Heater"], answer: 1, explain: "Grab the iron while it's easy!" },
          { q: "Salt is recovered by...", options: ["Filtering", "Evaporating the water", "Freezing"], answer: 1, explain: "Water leaves, salt stays!" },
          { q: "Mixtures differ from compounds: you can...", options: ["Un-mix them", "Never separate", "Eat them"], answer: 0, explain: "No reactions happened!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- BATTERY LAB ---- */
const FRUITS = [
  { n: "🍋 Lemon", v: 0.9 }, { n: "🥔 Potato", v: 0.7 }, { n: "🍎 Apple", v: 0.8 }, { n: "🥤 Cola", v: 0.5 },
];
export function BatteryLab({ moduleId }: { moduleId: string }) {
  const [cells, setCells] = useState<number[]>([]);
  const [electrode, setElectrode] = useState("zinc-copper");
  const { recordProgress } = useAppStore();
  const factor = electrode === "zinc-copper" ? 1 : electrode === "zinc-zinc" ? 0 : 0.5;
  const volts = cells.reduce((s, i) => s + FRUITS[i].v, 0) * factor;
  const lit = volts >= 2;
  const add = (i: number) => { if (cells.length < 4) { setCells([...cells, i]); recordProgress(moduleId, { timeSpentSeconds: 20, score: 75 }); } };
  return (
    <BatteryLitEffect volts={volts} moduleId={moduleId} lit={lit}>
      <SimulationShell title="Battery Lab" icon="🔋"
        controls={<>
          <p className="text-sm font-bold">🍋 Slot a fruit cell ({cells.length}/4):</p>
          <div className="grid grid-cols-2 gap-1.5">{FRUITS.map((f, i) => (
            <Button key={f.n} size="sm" variant="outline" onClick={() => add(i)}>{f.n} {f.v}V</Button>
          ))}</div>
          <label className="block text-sm font-medium">Electrodes
            <select value={electrode} onChange={(e) => setElectrode(e.target.value)} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-2 py-1.5 text-sm font-bold">
              <option value="zinc-copper">Zinc + Copper ✅</option>
              <option value="zinc-zinc">Zinc + Zinc ❌ (same metal!)</option>
              <option value="copper-copper">Copper + Copper ❌</option>
            </select></label>
          <Button size="sm" variant="ghost" onClick={() => setCells([])} className="w-full">🧹 Clear cells</Button>
          <p className="text-xs text-slate-500">Two DIFFERENT metals needed! Series wiring adds volts.</p>
        </>}
        dataPanel={<div className="text-center"><p className="text-sm">🔋 Voltmeter</p><p className="text-5xl font-black font-mono">{volts.toFixed(1)}V</p><p className="font-extrabold text-xl">{lit ? "💡 LIT! 2V reached!" : `Need ${(2 - volts).toFixed(1)}V more`}</p></div>}>
        <div className="p-4">
          <div className="flex items-center justify-center gap-1 flex-wrap min-h-[90px]">
            {cells.map((ci, i) => <span key={i} className="text-5xl">{FRUITS[ci].n.split(" ")[0]}<span className="text-xs font-bold block text-center">{FRUITS[ci].v}V</span></span>)}
            {cells.length === 0 && <p className="text-slate-400 text-sm">Slot fruits to build your battery...</p>}
          </div>
          <div className="text-center text-7xl my-2 relative">
            💡{lit && <span className="absolute inset-0 flex items-center justify-center"><span className="w-24 h-24 rounded-full bg-yellow-300 opacity-50 animate-ping" /></span>}
          </div>
          <Quiz questions={[
            { q: "A battery cell needs...", options: ["Two same metals", "Two DIFFERENT metals + chemical", "Just water"], answer: 1, explain: "Different metals trade electrons!" },
            { q: "Wiring cells in series...", options: ["Adds voltage", "Reduces voltage", "Does nothing"], answer: 0, explain: "Voltages stack!" },
            { q: "A lemon cell makes about...", options: ["9 volts", "0.9 volts", "900 volts"], answer: 1, explain: "Stack ~3 for an LED!" },
          ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
        </div>
      </SimulationShell>
    </BatteryLitEffect>
  );
}
function BatteryLitEffect({ volts, moduleId, lit, children }: { volts: number; moduleId: string; lit: boolean; children: React.ReactNode }) {
  const { recordProgress } = useAppStore();
  useEffect(() => {
    if (lit) recordProgress(moduleId, { timeSpentSeconds: 60, score: 100, status: "completed" });
  }, [lit]);
  void volts;
  return <>{children}</>;
}

/* ---- POLYMER LAB ---- */
export function PolymerLab({ moduleId }: { moduleId: string }) {
  const [links, setLinks] = useState(6);
  const [cross, setCross] = useState(20);
  const [stretch, setStretch] = useState(0);
  const [built, setBuilt] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const maxStretch = Math.max(10, 160 - cross * 1.4);
  const snapped = stretch > maxStretch;
  const identify = () => {
    const kind = cross < 25 ? "Slime 🟢" : cross < 65 ? "Rubber 🛞" : "Tough plastic 🧱";
    if (!built.includes(kind)) {
      const n = [...built, kind];
      setBuilt(n);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 90 });
      if (n.length >= 3) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
  };
  return (
    <SimulationShell title="Plastic & Polymer Lab" icon="🧶"
      controls={<>
        <Slider label="Monomer links" value={links} min={2} max={14} onChange={setLinks} />
        <Slider label="Cross-links %" value={cross} min={0} max={100} step={5} onChange={setCross} format={(v) => `${v}%`} />
        <Slider label="Stretch pull" value={stretch} min={0} max={160} onChange={setStretch} format={(v) => `${v}%`} />
        <Button size="sm" variant="fun" onClick={identify} className="w-full">🔬 Identify this plastic!</Button>
        <p className="text-xs text-slate-500">Built: {built.join(", ") || "—"} (3 kinds!)</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🔗 Chain: <b>{links} monomers</b></p><p>✖️ Cross-links: <b>{cross}%</b></p><p className="font-extrabold">{snapped ? "💥 SNAPPED! Too many cross-links for that pull!" : `Stretches to ${Math.round(maxStretch)}%`}</p></div>}>
      <div className="p-4">
        <svg viewBox="0 0 400 160" className="w-full bg-slate-50 rounded-xl border-2">
          {Array.from({ length: links }).map((_, i) => {
            const x = 30 + i * ((340 / Math.max(1, links - 1)) || 0);
            const y = 80 + Math.sin(i * 1.2) * (snapped ? 8 : 30 * (stretch / 160));
            return (
              <g key={i}>
                {i > 0 && <line x1={30 + (i - 1) * (340 / Math.max(1, links - 1))} y1={80 + Math.sin((i - 1) * 1.2) * 30 * (stretch / 160)} x2={x} y2={y} stroke="#a855f7" strokeWidth="6" />}
                <circle cx={x} cy={y} r="13" fill={snapped ? "#ef4444" : "#c084fc"} stroke="#6b21a8" strokeWidth="2" />
                {cross > 40 && i % 2 === 0 && <line x1={x} y1={y} x2={x + 20} y2={y + (i % 4 === 0 ? 34 : -34)} stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 3" />}
              </g>
            );
          })}
        </svg>
        <Quiz questions={[
          { q: "A polymer is...", options: ["One atom", "A long chain of monomers", "A rock"], answer: 1, explain: "Beads on a string!" },
          { q: "More cross-links = ...", options: ["Stretchier", "Stiffer, snaps sooner", "Melts"], answer: 1, explain: "Bridges lock chains!" },
          { q: "Which is a NATURAL polymer?", options: ["Nylon", "Hair", "PVC"], answer: 1, explain: "Plus silk, DNA, spider webs!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
