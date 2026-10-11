"use client";
import React, { useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- CELL EXPLORER ---- */
const ORGANELLES = [
  { id: "nucleus", name: "Nucleus 🧠", x: 50, y: 42, desc: "The brain! Holds DNA instructions.", plant: true },
  { id: "mitochondria", name: "Mitochondria ⚡", x: 72, y: 60, desc: "Power plants making energy.", plant: true },
  { id: "ribosome", name: "Ribosomes 🏭", x: 30, y: 65, desc: "Tiny factories building proteins.", plant: true },
  { id: "membrane", name: "Cell Membrane 🛡️", x: 50, y: 90, desc: "Gatekeeper: decides what enters/exits.", plant: true },
  { id: "cytoplasm", name: "Cytoplasm 🌊", x: 22, y: 35, desc: "Jelly filling everything floats in.", plant: true },
  { id: "chloroplast", name: "Chloroplast 🌿", x: 70, y: 28, desc: "PLANTS ONLY: captures sunlight for food!", plant: false, plantOnly: true },
  { id: "cellwall", name: "Cell Wall 🧱", x: 50, y: 8, desc: "PLANTS ONLY: stiff outer wall.", plant: false, plantOnly: true },
  { id: "vacuole", name: "Vacuole 💧", x: 35, y: 25, desc: "Storage sac (giant in plants!).", plant: true },
];
export function CellExplorer({ moduleId }: { moduleId: string }) {
  const [cellType, setCellType] = useState<"animal" | "plant">("animal");
  const [sel, setSel] = useState(ORGANELLES[0]);
  const [found, setFound] = useState<string[]>(["nucleus"]);
  const { recordProgress } = useAppStore();
  const visible = ORGANELLES.filter((o) => cellType === "plant" || !(o as any).plantOnly);
  const pick = (o: any) => {
    setSel(o);
    if (!found.includes(o.id)) {
      const nf = [...found, o.id];
      setFound(nf);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 });
      if (nf.length >= 6) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    }
  };
  return (
    <SimulationShell title="Cell Explorer" icon="🔬"
      controls={<>
        <div className="flex gap-2">
          {(["animal", "plant"] as const).map((t) => <Button key={t} size="sm" variant={cellType === t ? "default" : "outline"} onClick={() => setCellType(t)} className="flex-1 capitalize">{t === "animal" ? "🐶 Animal" : "🌿 Plant"}</Button>)}
        </div>
        <p className="text-sm font-bold">Click parts of the cell! Found {found.length}/{visible.length}</p>
        <div className="flex flex-wrap gap-1.5">
          {visible.map((o) => (
            <button key={o.id} onClick={() => pick(o)} className={`text-xs px-2 py-1 rounded-full font-bold ${found.includes(o.id) ? "bg-green-100 text-green-800" : "bg-slate-100"}`}>{found.includes(o.id) ? "✅ " : "❓ "}{o.name}</button>
          ))}
        </div>
      </>}
      dataPanel={<div><p className="font-extrabold text-lg">{sel.name}</p><p className="text-sm text-slate-600">{sel.desc}</p><p className="text-xs text-slate-500 mt-2">Your body: ~37 trillion cells!</p></div>}>
      <div className="p-4">
        <svg viewBox="0 0 100 100" className="w-full max-w-md mx-auto">
          <ellipse cx="50" cy="50" rx="44" ry="40" fill={cellType === "plant" ? "#dcfce7" : "#fce7f3"} stroke="#0f172a" strokeWidth="1.5" />
          {cellType === "plant" && <ellipse cx="50" cy="50" rx="48" ry="44" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray="4 2" />}
          {visible.map((o) => (
            <g key={o.id} onClick={() => pick(o)} style={{ cursor: "pointer" }}>
              <circle cx={o.x} cy={o.y} r="8" fill={sel.id === o.id ? "#fbbf24" : found.includes(o.id) ? "#22c55e" : "#94a3b8"} stroke="#0f172a" />
              <text x={o.x} y={o.y + 2.5} textAnchor="middle" fontSize="6">🔬</text>
            </g>
          ))}
        </svg>
        <Quiz questions={[
          { q: "The 'brain' of the cell is the...", options: ["Mitochondria", "Nucleus", "Membrane"], answer: 1, explain: "It holds DNA!" },
          { q: "Which makes energy?", options: ["Ribosome", "Mitochondria", "Vacuole"], answer: 1, explain: "Power plants!" },
          { q: "Only in PLANT cells:", options: ["Nucleus", "Chloroplast + wall", "Membrane"], answer: 1, explain: "For photosynthesis + stiffness!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- ECOSYSTEM BUILDER ---- */
const SPECIES = [
  { id: "grass", emoji: "🌱", type: "producer", eats: [] }, { id: "trees", emoji: "🌳", type: "producer", eats: [] },
  { id: "flowers", emoji: "🌸", type: "producer", eats: [] }, { id: "rabbit", emoji: "🐰", type: "herbivore", eats: ["grass", "flowers"] },
  { id: "deer", emoji: "🦌", type: "herbivore", eats: ["grass", "trees"] }, { id: "mouse", emoji: "🐭", type: "herbivore", eats: ["grass"] },
  { id: "fox", emoji: "🦊", type: "carnivore", eats: ["rabbit", "mouse"] }, { id: "hawk", emoji: "🦅", type: "carnivore", eats: ["rabbit", "mouse", "snake"] },
  { id: "snake", emoji: "🐍", type: "carnivore", eats: ["mouse", "rabbit"] }, { id: "mushroom", emoji: "🍄", type: "decomposer", eats: ["*"] },
];
export function EcosystemBuilder({ moduleId }: { moduleId: string }) {
  const [pop, setPop] = useState<Record<string, number>>({ grass: 6, rabbit: 3, fox: 1, mushroom: 2 });
  const [log, setLog] = useState<string[]>(["🌍 Ecosystem created! Press ▶ Run a season."]);
  const { recordProgress } = useAppStore();
  const total = Object.values(pop).reduce((a, b) => a + b, 0);
  const add = (id: string) => setPop({ ...pop, [id]: Math.min(15, (pop[id] ?? 0) + 1) });
  const remove = (id: string) => setPop({ ...pop, [id]: Math.max(0, (pop[id] ?? 0) - 1) });
  const runSeason = () => {
    const next = { ...pop };
    const msgs: string[] = [];
    const producers = Object.entries(next).filter(([k]) => SPECIES.find((s) => s.id === k)?.type === "producer").reduce((a, [, v]) => a + v, 0);
    const herbivores = Object.entries(next).filter(([k]) => SPECIES.find((s) => s.id === k)?.type === "herbivore").reduce((a, [, v]) => a + v, 0);
    const carnivores = Object.entries(next).filter(([k]) => SPECIES.find((s) => s.id === k)?.type === "carnivore").reduce((a, [, v]) => a + v, 0);
    // plants grow
    for (const [k, v] of Object.entries(next)) {
      const sp = SPECIES.find((s) => s.id === k);
      if (sp?.type === "producer") next[k] = Math.min(15, v + 2);
    }
    // herbivores eat plants, breed if food, starve if not
    if (herbivores > 0) {
      if (producers >= herbivores) { msgs.push(`🌱 Plenty of plants! Herbivores munch and multiply (+1 each).`); for (const [k] of Object.entries(next)) if (SPECIES.find((s) => s.id === k)?.type === "herbivore") next[k] = Math.min(12, next[k] + 1); }
      else { msgs.push(`⚠️ Not enough plants! A herbivore starves. 😢`); const hk = Object.keys(next).find((k) => SPECIES.find((s) => s.id === k)?.type === "herbivore" && next[k] > 0); if (hk) next[hk]--; }
    }
    if (carnivores > 0) {
      if (herbivores >= carnivores * 2) { msgs.push(`🦊 Predators feast! Pups born (+1).`); const ck = Object.keys(next).find((k) => SPECIES.find((s) => s.id === k)?.type === "carnivore"); if (ck) next[ck] = Math.min(8, next[ck] + 1); }
      else { msgs.push(`⚠️ Prey scarce! A predator leaves. `); const ck = Object.keys(next).find((k) => SPECIES.find((s) => s.id === k)?.type === "carnivore" && next[k] > 0); if (ck) next[ck]--; }
    }
    setPop(next);
    setLog([`🍂 Season results: ${msgs.join(" ")}`, ...log].slice(0, 5));
    recordProgress(moduleId, { timeSpentSeconds: 45, score: 80 });
  };
  const balanced = total >= 8 && total <= 25 && Object.keys(pop).filter((k) => pop[k] > 0).length >= 4;
  return (
    <SimulationShell title="Ecosystem Builder" icon="🌿"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
          {SPECIES.map((s) => (
            <div key={s.id} className="flex items-center gap-1 bg-slate-50 rounded-lg px-1.5 py-1 text-sm">
              <span className="text-xl">{s.emoji}</span>
              <b>{pop[s.id] ?? 0}</b>
              <button onClick={() => add(s.id)} className="ml-auto font-black text-green-600 px-1">+</button>
              <button onClick={() => remove(s.id)} className="font-black text-red-500 px-1">−</button>
            </div>
          ))}
        </div>
        <Button variant="fun" onClick={runSeason} className="w-full">▶️ Run a season</Button>
        <Button variant="secondary" size="sm" onClick={() => { if (balanced) recordProgress(moduleId, { timeSpentSeconds: 60, status: "completed", score: 95 }); }}>✅ {balanced ? "Claim balanced ecosystem!" : "Balance: 8-25 animals, 4+ species"}</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🌱 Producers: <b>{Object.entries(pop).filter(([k]) => SPECIES.find((s) => s.id === k)?.type === "producer").reduce((a, [, v]) => a + v, 0)}</b></p><p>🐰 Herbivores: <b>{Object.entries(pop).filter(([k]) => SPECIES.find((s) => s.id === k)?.type === "herbivore").reduce((a, [, v]) => a + v, 0)}</b></p><p>🦊 Carnivores: <b>{Object.entries(pop).filter(([k]) => SPECIES.find((s) => s.id === k)?.type === "carnivore").reduce((a, [, v]) => a + v, 0)}</b></p><div className="border-t pt-1 max-h-32 overflow-y-auto">{log.map((l, i) => <p key={i} className="text-xs">{l}</p>)}</div></div>}>
      <div className="p-6 min-h-[240px] bg-gradient-to-b from-sky-100 to-green-100 rounded-b-xl">
        <div className="flex flex-wrap gap-2 text-4xl">
          {Object.entries(pop).flatMap(([k, v]) => Array.from({ length: Math.min(12, v) }).map((_, i) => <span key={`${k}${i}`} className="animate-fade-in">{SPECIES.find((s) => s.id === k)?.emoji}</span>))}
          {total === 0 && <p className="text-slate-500 font-bold">Empty habitat... add species! 🏜️</p>}
        </div>
        <Quiz questions={[
          { q: "Producers (plants) get energy from...", options: ["Eating animals", "Sunlight", "Water only"], answer: 1, explain: "Photosynthesis!" },
          { q: "Remove ALL plants. What happens?", options: ["Nothing", "Herbivores starve, then predators", "More animals"], answer: 1, explain: "Everything depends on producers!" },
          { q: "Mushrooms are...", options: ["Producers", "Decomposers", "Predators"], answer: 1, explain: "They recycle dead matter!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- GENETICS CREATOR ---- */
const TRAIT_OPTS: Record<string, { dom: string; rec: string; domE: string; recE: string }> = {
  color: { dom: "Purple 💜", rec: "Green 💚", domE: "P", recE: "g" },
  size: { dom: "Big 🦣", rec: "Tiny 🐭", domE: "B", recE: "t" },
  pattern: { dom: "Spots 🔴", rec: "Stripes 🦓", domE: "S", recE: "s" },
};
type Genes = Record<string, [string, string]>;
const randomGenes = (): Genes => Object.fromEntries(Object.entries(TRAIT_OPTS).map(([k, v]) => [k, (Math.random() < 0.5 ? [v.domE, v.recE] : [v.recE, v.domE]) as [string, string]]));
const shows = (trait: string, g: [string, string]) => {
  const t = TRAIT_OPTS[trait];
  return g.includes(t.domE) ? t.dom : t.rec;
};
export function GeneticsCreator({ moduleId }: { moduleId: string }) {
  const [mom, setMom] = useState<Genes>({ color: ["P", "g"], size: ["B", "t"], pattern: ["S", "s"] });
  const [dad, setDad] = useState<Genes>(randomGenes);
  const [babies, setBabies] = useState<Genes[]>([]);
  const [generations, setGenerations] = useState(0);
  const { recordProgress } = useAppStore();
  const breed = () => {
    const baby: Genes = {};
    for (const trait of Object.keys(TRAIT_OPTS)) {
      baby[trait] = [mom[trait][Math.floor(Math.random() * 2)], dad[trait][Math.floor(Math.random() * 2)]];
    }
    setBabies([baby, ...babies].slice(0, 8));
    const g = generations + 1;
    setGenerations(g);
    recordProgress(moduleId, { timeSpentSeconds: 40, score: 80 });
    if (g >= 4) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
  };
  const Creature = ({ genes, label }: { genes: Genes; label: string }) => (
    <div className="text-center bg-white rounded-xl border p-2">
      <p className="text-4xl">{genes.size.includes("B") ? "🦣" : "🐭"}</p>
      <p className="text-xs font-bold">{label}</p>
      <p className="text-xs">{shows("color", genes.color)} • {shows("pattern", genes.pattern)}</p>
      <p className="text-[10px] font-mono text-slate-500">{Object.entries(genes).map(([k, v]) => `${v[0]}${v[1]}`).join(" ")}</p>
    </div>
  );
  return (
    <SimulationShell title="Creature Creator: Genetics" icon="🧬"
      controls={<>
        <p className="text-sm font-bold">🧬 Punnett square: Color (P=purple dominant)</p>
        <div className="grid grid-cols-3 gap-1 text-center text-xs font-mono">
          <span />{dad.color.map((d, i) => <span key={i} className="bg-blue-100 rounded p-1 font-bold">{d}</span>)}
          {mom.color.map((m, i) => (
            <React.Fragment key={i}><span className="bg-pink-100 rounded p-1 font-bold">{m}</span>{dad.color.map((d, j) => <span key={j} className="bg-slate-50 border rounded p-1">{m}{d}</span>)}</React.Fragment>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setDad(randomGenes)} className="flex-1">🎲 New dad</Button>
          <Button size="sm" variant="fun" onClick={breed} className="flex-1">❤️ Breed!</Button>
        </div>
        <p className="text-xs text-slate-500">Generations: {generations} (4 = mission complete!)</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>👩 Mom: {Object.entries(mom).map(([k, v]) => `${k}:${v.join("")}`).join(" ")}</p><p>👨 Dad: {Object.entries(dad).map(([k, v]) => `${k}:${v.join("")}`).join(" ")}</p><p>👶 Babies: {babies.length}</p><p className="text-xs text-slate-500">Dominant shows with just ONE copy!</p></div>}>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto"><Creature genes={mom} label="👩 Mom" /><Creature genes={dad} label="👨 Dad" /></div>
        <p className="font-bold text-sm mt-3">👶 Babies ({babies.length}):</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">{babies.map((b, i) => <Creature key={i} genes={b} label={`Baby ${babies.length - i}`} />)}{babies.length === 0 && <p className="text-sm text-slate-500">Press Breed! ❤️</p>}</div>
        <Quiz questions={[
          { q: "Brown eyes (B) dominate blue (b). Bb person has...", options: ["Blue eyes", "Brown eyes", "Green"], answer: 1, explain: "One B is enough!" },
          { q: "Blue eyes appear only with...", options: ["BB", "bb", "Bb"], answer: 1, explain: "Recessive needs TWO copies!" },
          { q: "Babies get genes...", options: ["Only from mom", "From BOTH parents", "From nobody"], answer: 1, explain: "Half + half!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- HUMAN BODY ---- */
const SYSTEMS: Record<string, { emoji: string; organs: Array<{ n: string; e: string; d: string; x: number; y: number }> }> = {
  circulatory: { emoji: "❤️", organs: [{ n: "Heart", e: "❤️", d: "Pump! Beats 100,000×/day pushing blood.", x: 50, y: 38 }, { n: "Blood vessels", e: "🩸", d: "Highways! 100,000 km of tubes.", x: 30, y: 55 }, { n: "Blood", e: "🔴", d: "Carries oxygen + food to cells.", x: 70, y: 55 }] },
  respiratory: { emoji: "🫁", organs: [{ n: "Lungs", e: "🫁", d: "Sponges grabbing oxygen from air.", x: 50, y: 38 }, { n: "Windpipe", e: "🎺", d: "Air tube to the lungs.", x: 50, y: 22 }, { n: "Diaphragm", e: "🪭", d: "Muscle pulling air in!", x: 50, y: 55 }] },
  digestive: { emoji: "🍎", organs: [{ n: "Stomach", e: "🫄", d: "Acid churner dissolving food.", x: 45, y: 50 }, { n: "Intestines", e: "🥨", d: "7m of nutrient-absorbing twists!", x: 55, y: 65 }, { n: "Liver", e: "🟤", d: "Chemical factory + filter.", x: 60, y: 45 }] },
  nervous: { emoji: "🧠", organs: [{ n: "Brain", e: "🧠", d: "86 billion neurons commanding all!", x: 50, y: 15 }, { n: "Spinal cord", e: "🦴", d: "Message superhighway.", x: 50, y: 40 }, { n: "Nerves", e: "⚡", d: "Signals at 400 km/h!", x: 30, y: 65 }] },
  skeletal: { emoji: "🦴", organs: [{ n: "Skull", e: "💀", d: "Helmet for your brain.", x: 50, y: 15 }, { n: "Ribs", e: "🩻", d: "Cage guarding heart + lungs.", x: 50, y: 38 }, { n: "Femur", e: "🦵", d: "Strongest bone: your thigh!", x: 50, y: 75 }] },
  muscular: { emoji: "💪", organs: [{ n: "Biceps", e: "💪", d: "Pulls your forearm up.", x: 30, y: 35 }, { n: "Heart muscle", e: "❤️", d: "Never-tiring pump!", x: 50, y: 42 }, { n: "Legs", e: "🦵", d: "Biggest muscles: running + jumping.", x: 55, y: 72 }] },
};
export function HumanBody({ moduleId }: { moduleId: string }) {
  const [sys, setSys] = useState("circulatory");
  const [sel, setSel] = useState(0);
  const [visited, setVisited] = useState<string[]>(["circulatory"]);
  const { recordProgress } = useAppStore();
  const cur = SYSTEMS[sys];
  const organ = cur.organs[sel % cur.organs.length];
  const choose = (s: string) => {
    setSys(s); setSel(0);
    if (!visited.includes(s)) {
      const v = [...visited, s];
      setVisited(v);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 });
      if (v.length >= 5) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
    }
  };
  return (
    <SimulationShell title="Human Body Systems" icon="🫀"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(SYSTEMS).map(([k, v]) => (
            <Button key={k} size="sm" variant={sys === k ? "default" : "outline"} onClick={() => choose(k)} className="capitalize">{v.emoji} {k.slice(0, 8)}</Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {cur.organs.map((o, i) => (
            <button key={i} onClick={() => setSel(i)} className={`flex-1 p-2 rounded-xl border-2 text-2xl ${sel % cur.organs.length === i ? "border-red-400 bg-red-50" : "border-slate-200"}`}>{o.e}<span className="block text-[10px] font-bold">{o.n}</span></button>
          ))}
        </div>
        <p className="text-xs text-slate-500">Systems visited: {visited.length}/6</p>
      </>}
      dataPanel={<div><p className="text-4xl">{organ.e}</p><p className="font-extrabold text-lg">{organ.n}</p><p className="text-sm text-slate-600">{organ.d}</p></div>}>
      <div className="p-4">
        <svg viewBox="0 0 100 100" className="w-full max-w-xs mx-auto">
          <circle cx="50" cy="14" r="10" fill="#fde68a" />
          <rect x="38" y="26" width="24" height="40" rx="10" fill="#e0f2fe" />
          <rect x="22" y="30" width="8" height="26" rx="4" fill="#e0f2fe" />
          <rect x="70" y="30" width="8" height="26" rx="4" fill="#e0f2fe" />
          <rect x="40" y="66" width="7" height="26" rx="3" fill="#e0f2fe" />
          <rect x="53" y="66" width="7" height="26" rx="3" fill="#e0f2fe" />
          {cur.organs.map((o, i) => (
            <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
              <circle cx={o.x} cy={o.y} r="7" fill={sel % cur.organs.length === i ? "#fbbf24" : "#f87171"} stroke="#0f172a" />
              <text x={o.x} y={o.y + 3} textAnchor="middle" fontSize="7">{o.e}</text>
            </g>
          ))}
        </svg>
        <Quiz questions={[
          { q: "What pumps blood?", options: ["Lungs", "Heart", "Stomach"], answer: 1, explain: "100,000 beats a day!" },
          { q: "Messages travel via...", options: ["Bones", "Nerves", "Muscles"], answer: 1, explain: "Up to 400 km/h!" },
          { q: "Food is dissolved in the...", options: ["Brain", "Stomach", "Heart"], answer: 1, explain: "Acid + churning!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- PLANT GROWTH ---- */
export function PlantGrowth({ moduleId }: { moduleId: string }) {
  const [light, setLight] = useState(50);
  const [water, setWater] = useState(50);
  const [temp, setTemp] = useState(22);
  const [day, setDay] = useState(1);
  const [height, setHeight] = useState(2);
  const { recordProgress } = useAppStore();
  const health = Math.max(0, 100 - Math.abs(light - 70) * 0.8 - Math.abs(water - 60) * 0.9 - Math.abs(temp - 22) * 3);
  const grow = () => {
    const growth = (health / 100) * 6;
    setHeight((h) => Math.min(100, h + growth));
    setDay((d) => d + 1);
    recordProgress(moduleId, { timeSpentSeconds: 30, score: Math.round(health) });
    if (height + growth >= 80) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
  };
  const stage = height < 5 ? "🌱 Sprout" : height < 25 ? "🌿 Seedling" : height < 60 ? "🪴 Growing" : "🌻 Flowering!";
  return (
    <SimulationShell title="Plant Growth Lab" icon="🌱"
      controls={<>
        <Slider label="☀️ Light" value={light} min={0} max={100} onChange={setLight} />
        <Slider label="💧 Water" value={water} min={0} max={100} onChange={setWater} />
        <Slider label="🌡️ Temperature" value={temp} min={5} max={35} onChange={setTemp} format={(v) => `${v}°C`} />
        <Button variant="fun" onClick={grow} className="w-full">☀️ Grow one day (Day {day})</Button>
        <Button variant="secondary" size="sm" onClick={() => { setDay(1); setHeight(2); }}>🌱 Restart seed</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>📏 Height: <b>{height.toFixed(0)} cm</b></p><p>💚 Health: <b>{Math.round(health)}%</b></p><p>🌿 Stage: <b>{stage}</b></p><p className="text-xs text-slate-500">Sweet spot: light ~70, water ~60, 22°C!</p></div>}>
      <div className="p-6 flex flex-col items-center bg-gradient-to-b from-sky-100 to-amber-50 rounded-b-xl">
        <div className="h-56 flex items-end justify-center">
          <div className="text-center">
            <div style={{ fontSize: `${24 + height * 0.5}px` }}>{height >= 60 ? "🌻" : height >= 25 ? "🪴" : height >= 5 ? "🌿" : "🌱"}</div>
            <div className="text-4xl">🟫</div>
          </div>
        </div>
        <div className="w-full max-w-xs h-3 bg-slate-200 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-green-500" style={{ width: `${health}%` }} />
        </div>
        <Quiz questions={[
          { q: "Plants make food with...", options: ["Sunlight + water + CO₂", "Candy", "Sand"], answer: 0, explain: "Photosynthesis!" },
          { q: "Too much water causes...", options: ["Faster growth", "Root rot 🥀", "Flowers"], answer: 1, explain: "Roots need air too!" },
          { q: "Leaves are green because of...", options: ["Paint", "Chlorophyll", "Water"], answer: 1, explain: "It captures sunlight!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
