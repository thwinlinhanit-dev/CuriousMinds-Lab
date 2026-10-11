"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- DINO DIG ---- */
const BONE_CELLS = [3, 7, 12, 19, 22, 28, 31, 34];
const DINO_TIMELINE = [
  { name: "Brachiosaurus 🦕", period: "Jurassic" },
  { name: "T. rex 🦖", period: "Cretaceous" },
  { name: "Coelophysis 🦎", period: "Triassic" },
];
export function DinoDig({ moduleId }: { moduleId: string }) {
  const [dug, setDug] = useState<number[]>([]);
  const [bones, setBones] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [dinoIdx, setDinoIdx] = useState(0);
  const { recordProgress } = useAppStore();
  const dig = (i: number) => {
    if (dug.includes(i)) return;
    setDug([...dug, i]);
    if (BONE_CELLS.includes(i)) {
      const b = bones + 1;
      setBones(b);
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 80 });
    }
  };
  const done = bones >= 8 && Object.keys(placed).length >= 3;
  useEffect(() => {
    if (done) recordProgress(moduleId, { timeSpentSeconds: 60, score: 100, status: "completed" });
  }, [done]);
  const cur = DINO_TIMELINE[dinoIdx % DINO_TIMELINE.length];
  return (
    <SimulationShell title="Dino Dig" icon="🦕"
      controls={<>
        <p className="text-sm font-bold">🖌️ Brush the grid! {bones}/8 bones found</p>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🦴 Place: {cur.name} → ?</p>
          <div className="flex gap-1.5">{["Triassic", "Jurassic", "Cretaceous"].map((p) => (
            <Button key={p} size="sm" variant={placed[cur.name] === p ? (p === cur.period ? "default" : "outline") : "outline"}
              onClick={() => {
                setPlaced({ ...placed, [cur.name]: p });
                if (p === cur.period) { recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 }); setTimeout(() => setDinoIdx(dinoIdx + 1), 800); }
              }} className="flex-1 text-xs">{p}</Button>
          ))}</div>
          {placed[cur.name] && placed[cur.name] !== cur.period && <p className="text-xs font-bold text-red-500">❌ Not quite — think big-to-bigger!</p>}
          {placed[cur.name] === cur.period && <p className="text-xs font-bold text-green-600">✅ Correct!</p>}
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🦴 Bones: <b>{bones}/8</b></p><p>📅 Timeline: <b>{Object.keys(placed).length}/3</b></p><p className="text-xs text-slate-500">Triassic → Jurassic → Cretaceous (old → young)</p>{done && <p className="font-bold text-green-600">🎉 Master paleontologist!</p>}</div>}>
      <div className="p-4">
        <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
          {Array.from({ length: 36 }).map((_, i) => {
            const isDug = dug.includes(i);
            const isBone = BONE_CELLS.includes(i);
            return (
              <button key={i} onClick={() => dig(i)} disabled={isDug}
                className={`aspect-square rounded-lg text-xl border-2 ${isDug ? (isBone ? "bg-amber-100 border-amber-400" : "bg-stone-200 border-stone-300") : "bg-amber-700 border-amber-800 hover:bg-amber-600"}`}>
                {isDug ? (isBone ? "🦴" : "·") : "🟫"}
              </button>
            );
          })}
        </div>
        <Quiz questions={[
          { q: "A fossil is...", options: ["A living dinosaur", "Preserved remains of ancient life", "A rock candy"], answer: 1, explain: "Bones, footprints, even poop!" },
          { q: "Which period came LAST?", options: ["Triassic", "Jurassic", "Cretaceous"], answer: 2, explain: "T. rex ruled the Cretaceous!" },
          { q: "Birds are...", options: ["Fish", "Living dinosaurs", "Mammals"], answer: 1, explain: "Chickens are tiny theropods!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- SENSES LAB ---- */
function tone(freq: number, dur = 0.6) {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ac = new AC();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.frequency.value = freq; g.gain.value = 0.15;
    o.connect(g); g.connect(ac.destination); o.start();
    setTimeout(() => { o.stop(); ac.close(); }, dur * 1000);
  } catch {}
}
const SMELLS = [
  { emoji: "🍋", name: "Lemon", opts: ["Lemon", "Soap", "Smoke"] },
  { emoji: "☕", name: "Coffee", opts: ["Chocolate", "Coffee", "Grass"] },
  { emoji: "🌸", name: "Flower", opts: ["Flower", "Fish", "Fire"] },
];
export function SensesLab({ moduleId }: { moduleId: string }) {
  const [station, setStation] = useState("vision");
  const [doneStations, setDoneStations] = useState<string[]>([]);
  const [dotPos, setDotPos] = useState(50);
  const [freq, setFreq] = useState(1000);
  const [maxHeard, setMaxHeard] = useState(0);
  const [touchDist, setTouchDist] = useState(30);
  const [touchAnswer, setTouchAnswer] = useState<1 | 2>(2);
  const [touchMsg, setTouchMsg] = useState("");
  const [smellIdx, setSmellIdx] = useState(0);
  const [tasteScore, setTasteScore] = useState(0);
  const { recordProgress } = useAppStore();
  const finish = (s: string) => {
    if (!doneStations.includes(s)) {
      const n = [...doneStations, s];
      setDoneStations(n);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 85 });
      if (n.length >= 5) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    }
  };
  const newTouch = () => {
    setTouchAnswer(Math.random() < 0.5 ? 1 : 2);
    setTouchDist(10 + Math.floor(Math.random() * 50));
    setTouchMsg("");
  };
  useEffect(newTouch, []);
  const stations = [
    { id: "vision", e: "👁️", n: "Vision" }, { id: "hearing", e: "👂", n: "Hearing" },
    { id: "touch", e: "✋", n: "Touch" }, { id: "smell", e: "👃", n: "Smell" }, { id: "taste", e: "👅", n: "Taste" },
  ];
  return (
    <SimulationShell title="Five Senses Lab" icon="👁️"
      controls={<>
        <div className="grid grid-cols-5 gap-1">{stations.map((s) => (
          <button key={s.id} onClick={() => setStation(s.id)} className={`p-1.5 rounded-xl border-2 text-xl ${station === s.id ? "border-blue-500 bg-blue-50" : "border-slate-200"}`} title={s.n}>
            {doneStations.includes(s.id) ? "✅" : s.e}
          </button>
        ))}</div>
        <p className="text-xs text-slate-500">Stations done: {doneStations.length}/5</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>👂 Highest heard: <b>{maxHeard ? maxHeard + " Hz" : "—"}</b></p><p>👅 Taste matches: <b>{tasteScore}/4</b></p><p className="text-xs text-slate-500">Nose can detect a trillion smells!</p></div>}>
      <div className="p-4 min-h-[260px]">
        {station === "vision" && <div className="text-center">
          <p className="font-bold text-sm">Close your RIGHT eye, stare at ✚, drag ● until it VANISHES!</p>
          <div className="relative h-24 bg-slate-900 rounded-xl mt-2 overflow-hidden">
            <span className="absolute left-[15%] top-1/2 -translate-y-1/2 text-3xl text-green-400 font-black">✚</span>
            <span className="absolute top-1/2 -translate-y-1/2 text-3xl" style={{ left: `${dotPos}%` }}>🔴</span>
          </div>
          <Slider label="Move the dot" value={dotPos} min={20} max={95} onChange={setDotPos} />
          <Button size="sm" variant="fun" onClick={() => finish("vision")}>😲 It vanished — blind spot found!</Button>
        </div>}
        {station === "hearing" && <div className="text-center">
          <p className="font-bold text-sm">Slide UP until you hear it. Highest wins!</p>
          <Slider label="Frequency" value={freq} min={100} max={15000} step={100} onChange={setFreq} format={(v) => `${v} Hz`} />
          <div className="flex gap-2 justify-center"><Button size="sm" onClick={() => tone(freq)}>▶️ Play</Button>
            <Button size="sm" variant="outline" onClick={() => { setMaxHeard(Math.max(maxHeard, freq)); finish("hearing"); }}>✅ I hear {freq} Hz!</Button></div>
        </div>}
        {station === "touch" && <div className="text-center">
          <p className="font-bold text-sm">One poke or TWO? (fingertips beat elbows!)</p>
          <div className="flex justify-center gap-4 my-3 text-4xl">
            <span>👆</span>{touchAnswer === 2 && <span>👆</span>}
          </div>
          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={() => { if (touchAnswer === 1) { setTouchMsg("✅ Correct!"); finish("touch"); } else setTouchMsg("❌ It was TWO!"); }}>One</Button>
            <Button size="sm" onClick={() => { if (touchAnswer === 2) { setTouchMsg("✅ Correct!"); finish("touch"); } else setTouchMsg("❌ It was ONE!"); }}>Two</Button>
            <Button size="sm" variant="outline" onClick={newTouch}>🔀 New test</Button>
          </div>
          <p className="font-bold text-sm mt-1">{touchMsg}</p>
        </div>}
        {station === "smell" && <div className="text-center">
          <p className="font-bold text-sm">Sniff the card... what is it? ({smellIdx + 1}/{SMELLS.length})</p>
          <p className="text-6xl my-2">❓</p>
          <div className="flex gap-2 justify-center">{SMELLS[smellIdx % SMELLS.length].opts.map((o) => (
            <Button key={o} size="sm" variant="outline" onClick={() => {
              if (o === SMELLS[smellIdx % SMELLS.length].name) {
                const n = smellIdx + 1; setSmellIdx(n);
                if (n >= SMELLS.length) finish("smell");
              } else alert("Sniff again! 👃");
            }}>{o}</Button>
          ))}</div>
        </div>}
        {station === "taste" && <TasteGame onScore={(s) => { setTasteScore(s); if (s >= 4) finish("taste"); }} />}
        <Quiz questions={[
          { q: "Food tastes boring with a blocked nose because...", options: ["Taste stops", "Smell + taste teamwork", "Tongue sleeps"], answer: 1, explain: "Flavor = taste + smell!" },
          { q: "Your blind spot is where...", options: ["You blink", "The optic nerve leaves the eye", "Glasses sit"], answer: 1, explain: "No sensors there — brain fills in!" },
          { q: "Most sensitive touch?", options: ["Elbow", "Fingertips", "Knee"], answer: 1, explain: "Packed with nerve endings!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
function TasteGame({ onScore }: { onScore: (s: number) => void }) {
  const pairs = [["🍋", "sour"], ["🍯", "sweet"], ["🥨", "salty"], ["☕", "bitter"]];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  if (idx >= pairs.length) return <p className="text-center font-bold">🎉 Taste master! {score}/4</p>;
  return (
    <div className="text-center">
      <p className="font-bold text-sm">Match the taste! ({idx + 1}/4)</p>
      <p className="text-6xl my-2">{pairs[idx][0]}</p>
      <div className="flex gap-2 justify-center">{["sweet", "sour", "salty", "bitter"].map((t) => (
        <Button key={t} size="sm" variant="outline" onClick={() => {
          const s = score + (t === pairs[idx][1] ? 1 : 0);
          setScore(s); onScore(s); setIdx(idx + 1);
        }} className="capitalize">{t}</Button>
      ))}</div>
    </div>
  );
}

/* ---- GERM DEFENSE ---- */
export function GermDefense({ moduleId }: { moduleId: string }) {
  const [wash, setWash] = useState("soap");
  const [germs, setGerms] = useState(100);
  const [vax, setVax] = useState(50);
  const [round, setRound] = useState(1);
  const [wins, setWins] = useState(0);
  const [log, setLog] = useState<string[]>(["🦠 Outbreak 1 of 3 — set vaccinations, then release!"]);
  const { recordProgress } = useAppStore();
  const scrub = () => {
    const kill = wash === "soap" ? 98 : wash === "sanitizer" ? 90 : wash === "water" ? 40 : 5;
    setGerms(100 - kill);
    recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 });
  };
  const outbreak = () => {
    const spread = Math.max(0, 100 - vax - (wash === "soap" ? 20 : wash === "sanitizer" ? 12 : 0));
    const sick = Math.round(spread / 10);
    const win = sick <= 2;
    const w = wins + (win ? 1 : 0);
    setWins(w);
    setLog([`${win ? "🎉" : "😷"} Town: ${sick}/12 sick (vax ${vax}%)`, ...log].slice(0, 4));
    recordProgress(moduleId, { timeSpentSeconds: 40, score: win ? 95 : 60 });
    if (w >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    else setRound(round + 1);
  };
  return (
    <SimulationShell title="Germ Defense HQ" icon="🦠"
      controls={<>
        <p className="text-sm font-bold">🧼 Wash test:</p>
        <div className="grid grid-cols-2 gap-1.5">{[["none", "🚫 None"], ["water", "💧 Water"], ["soap", "🧼 Soap"], ["sanitizer", "🧴 Sanitizer"]].map(([v, l]) => (
          <Button key={v} size="sm" variant={wash === v ? "default" : "outline"} onClick={() => setWash(v)}>{l}</Button>
        ))}</div>
        <Button size="sm" variant="fun" onClick={scrub} className="w-full">🧼 Scrub 20 sec!</Button>
        <div className="border-t pt-2">
          <Slider label="💉 Vaccination %" value={vax} min={0} max={100} step={5} onChange={setVax} format={(v) => `${v}%`} />
          <Button size="sm" variant="fun" onClick={outbreak} className="w-full">🦠 Release outbreak {round}!</Button>
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🦠 Germs left: <b>{germs}%</b></p><p>🏆 Outbreaks stopped: <b>{wins}/3</b></p><div className="max-h-28 overflow-y-auto">{log.map((l, i) => <p key={i} className="text-xs">{l}</p>)}</div></div>}>
      <div className="p-6 text-center bg-slate-900 rounded-b-xl">
        <p className="text-white text-sm font-bold mb-2">🔦 UV lamp — glowing germs on hands:</p>
        <div className="flex justify-center gap-1 flex-wrap max-w-sm mx-auto">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="text-lg" style={{ opacity: i / 40 < germs / 100 ? 1 : 0.12 }}>🦠</span>
          ))}
        </div>
        <p className="text-white text-xs mt-2">Soap breaks germ membranes! Sneeze = 100,000 droplets at 160 km/h 🤧</p>
        <Quiz questions={[
          { q: "Best germ killer?", options: ["Water only", "Soap + 20 sec scrub", "Nothing"], answer: 1, explain: "Soap pops germ membranes!" },
          { q: "Vaccines work by...", options: ["Killing all germs", "Training your immune system", "Magic"], answer: 1, explain: "Practice drills for white blood cells!" },
          { q: "High vaccination protects...", options: ["Only you", "The whole town", "Nobody"], answer: 1, explain: "Herd immunity blocks spread!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- LIFE CYCLE SPINNER ---- */
const CREATURES: Record<string, string[]> = {
  frog: ["🥚 Eggs", "🐟 Tadpole", "🐸 Froglet", "🐸 Adult Frog"],
  butterfly: ["🥚 Eggs", "🐛 Caterpillar", "🛖 Chrysalis", "🦋 Butterfly"],
  chicken: ["🥚 Egg", "🐣 Chick", "🐤 Pullet", "🐔 Hen"],
  bean: ["🌰 Seed", "🌱 Sprout", "🪴 Plant", "🫘 Bean Pods"],
};
export function LifeCycleSpinner({ moduleId }: { moduleId: string }) {
  const [creature, setCreature] = useState("frog");
  const [order, setOrder] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [solved, setSolved] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    setOrder([]);
    setPool([...CREATURES[creature]].sort(() => Math.random() - 0.5));
  }, [creature]);
  const correct = CREATURES[creature];
  const pick = (s: string) => {
    if (order.length >= 4) return;
    const n = [...order, s];
    setOrder(n);
    setPool(pool.filter((x) => x !== s));
    if (n.length === 4) {
      if (n.every((v, i) => v === correct[i])) {
        const sl = [...solved, creature];
        setSolved(sl);
        recordProgress(moduleId, { timeSpentSeconds: 40, score: 95 });
        if (sl.length >= 4) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
        setTimeout(() => {
          const next = Object.keys(CREATURES).find((c) => !sl.includes(c));
          if (next) setCreature(next);
        }, 1000);
      } else {
        setTimeout(() => { setOrder([]); setPool([...correct].sort(() => Math.random() - 0.5)); }, 1200);
      }
    }
  };
  const isRight = order.length === 4 && order.every((v, i) => v === correct[i]);
  return (
    <SimulationShell title="Life Cycle Spinner" icon="🐸"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{Object.keys(CREATURES).map((c) => (
          <Button key={c} size="sm" variant={creature === c ? "default" : "outline"} onClick={() => setCreature(c)} className="capitalize">
            {solved.includes(c) ? "✅ " : ""}{c === "bean" ? "🫘 Bean" : c[0].toUpperCase() + c.slice(1)}
          </Button>
        ))}</div>
        <p className="text-xs text-slate-500">Solved: {solved.length}/4</p>
      </>}
      dataPanel={<div className="text-sm"><p>🥚 Every cycle starts small!</p><p>🦋 Metamorphosis = total rebuild</p>{isRight && <p className="font-bold text-green-600">🎉 Perfect order!</p>}</div>}>
      <div className="p-4">
        <p className="font-bold text-sm text-center">Tap stages FIRST → LAST:</p>
        <div className="flex justify-center gap-2 my-3 min-h-[64px]">
          {order.map((s, i) => <span key={i} className={`px-3 py-2 rounded-xl font-bold text-sm ${isRight ? "bg-green-200" : order.length === 4 ? "bg-red-200" : "bg-blue-100"}`}>{i + 1}. {s}</span>)}
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {pool.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => pick(s)}>{s}</Button>)}
        </div>
        <Quiz questions={[
          { q: "A tadpole becomes a...", options: ["Fish", "Frog", "Bird"], answer: 1, explain: "Legs grow, tail absorbs!" },
          { q: "Butterfly middle stage?", options: ["Cocoon egg", "Chrysalis", "Nest"], answer: 1, explain: "Total rebuild inside!" },
          { q: "Seeds need what to sprout?", options: ["Darkness only", "Water + warmth", "Snow"], answer: 1, explain: "Germination needs both!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- NATURAL SELECTION ---- */
export function NaturalSelection({ moduleId }: { moduleId: string }) {
  const [bark, setBark] = useState<"light" | "dark">("light");
  const [gen, setGen] = useState(1);
  const [light, setLight] = useState(10);
  const [dark, setDark] = useState(10);
  const [moths, setMoths] = useState<Array<{ id: number; dark: boolean }>>([]);
  const [caught, setCaught] = useState(0);
  const [history, setHistory] = useState<Array<{ g: number; l: number; d: number }>>([{ g: 0, l: 10, d: 10 }]);
  const { recordProgress } = useAppStore();
  const QUOTA = 8;
  const startGen = () => {
    const arr: Array<{ id: number; dark: boolean }> = [];
    for (let i = 0; i < light; i++) arr.push({ id: i, dark: false });
    for (let i = 0; i < dark; i++) arr.push({ id: 100 + i, dark: true });
    setMoths(arr.sort(() => Math.random() - 0.5));
    setCaught(0);
  };
  useEffect(startGen, []);
  const catchMoth = (id: number, isDark: boolean) => {
    if (caught >= QUOTA) return;
    // camouflaged moths sometimes escape!
    const camo = (bark === "light") !== isDark;
    if (camo && Math.random() < 0.45) return; // phew, hidden!
    setMoths(moths.filter((m) => m.id !== id));
    const c = caught + 1;
    setCaught(c);
    if (c >= QUOTA) {
      setTimeout(() => {
        const survivors = moths.filter((m) => m.id !== id);
        let nl = 0, nd = 0;
        for (const m of survivors) {
          // each survivor has 1 baby, usually same color
          const babyDark = Math.random() < 0.08 ? !m.dark : m.dark;
          m.dark ? nd++ : nl++;
          babyDark ? nd++ : nl++;
        }
        // keep population bounded
        const total = nl + nd;
        nl = Math.max(2, Math.round((nl / total) * 20));
        nd = Math.max(2, Math.round((nd / total) * 20));
        const g = gen + 1;
        setLight(nl); setDark(nd); setGen(g);
        setHistory([...history, { g, l: nl, d: nd }]);
        recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
        if (g > 10) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
        else startGen();
      }, 400);
    }
  };
  const pct = Math.round((dark / Math.max(1, light + dark)) * 100);
  return (
    <SimulationShell title="Natural Selection Game" icon="🦋"
      controls={<>
        <div className="flex gap-2">
          <Button size="sm" variant={bark === "light" ? "default" : "outline"} onClick={() => setBark("light")} className="flex-1">🌳 Light bark</Button>
          <Button size="sm" variant={bark === "dark" ? "default" : "outline"} onClick={() => setBark("dark")} className="flex-1">🌲 Sooty bark</Button>
        </div>
        <p className="text-sm font-bold">🐦 You are the bird! Catch {QUOTA} moths ({caught}/{QUOTA})</p>
        <p className="text-xs text-slate-500">Camouflaged moths often escape your clicks! Generation {gen}/10</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>⬜ Light: <b>{light}</b> ⬛ Dark: <b>{dark}</b> ({pct}% dark)</p>
        <div className="flex items-end gap-0.5 h-20">{history.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end" title={`Gen ${h.g}`}>
            <div className="bg-stone-800 rounded-t" style={{ height: `${(h.d / 40) * 70}px` }} />
            <div className="bg-stone-300 rounded-b" style={{ height: `${(h.l / 40) * 70}px` }} />
          </div>
        ))}</div>
        <p className="text-xs text-slate-500">Watch dark moths take over sooty bark!</p></div>}>
      <div className={`p-4 rounded-b-xl min-h-[280px] ${bark === "light" ? "bg-amber-100" : "bg-stone-700"}`}>
        {gen > 10 ? <p className="text-center font-extrabold text-xl bg-white rounded-xl p-4">🎉 10 generations! The {pct > 50 ? "DARK" : "LIGHT"} moths won on {bark} bark. That's evolution!</p> : (
          <div className="flex flex-wrap gap-2 justify-center">
            {moths.map((m) => (
              <button key={m.id} onClick={() => catchMoth(m.id, m.dark)}
                className={`w-10 h-10 rounded-full text-xl border-2 ${m.dark ? "bg-stone-800 border-black" : "bg-stone-100 border-stone-300"}`}>🦋</button>
            ))}
          </div>
        )}
        <Quiz questions={[
          { q: "On sooty dark bark, which moths survive?", options: ["Light ones", "Dark ones", "Both equally"], answer: 1, explain: "Birds can't see them!" },
          { q: "Evolution needs...", options: ["One animal", "Variation + selection + time", "Zoos"], answer: 1, explain: "Differences, winners, generations!" },
          { q: "Antibiotic resistance is...", options: ["Magic", "Natural selection in germs", "Fake"], answer: 1, explain: "Survivor germs multiply!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
