"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- MOON PHASES ---- */
const PHASES = ["🌑 New Moon", "🌒 Waxing Crescent", "🌓 First Quarter", "🌔 Waxing Gibbous", "🌕 Full Moon", "🌖 Waning Gibbous", "🌗 Last Quarter", "🌘 Waning Crescent"];
const phaseName = (angle: number) => PHASES[Math.floor(((angle % 360) + 360) % 360 / 45) % 8];
export function MoonPhases({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [quizAngle, setQuizAngle] = useState(90);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState("");
  const { recordProgress } = useAppStore();
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setAngle((a) => (a + 4) % 360), 80);
    return () => clearInterval(t);
  }, [playing]);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 400;
    const W = c.width, H = c.height;
    ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 90; i++) ctx.fillRect((i * 173) % W, (i * 97) % H, 3, 3);
    const cx = W / 2, cy = H / 2, R = 130;
    // sun rays
    ctx.font = "50px sans-serif"; ctx.fillText("☀️", 20, 70);
    // orbit
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.stroke();
    // earth
    ctx.font = "64px sans-serif"; ctx.fillText("🌍", cx - 32, cy + 22);
    // moon
    const a = (angle * Math.PI) / 180;
    const mx = cx + Math.cos(a) * R, my = cy + Math.sin(a) * R;
    const lit = (Math.cos(a) + 1) / 2; // 0=new,1=full (simplified)
    ctx.beginPath(); ctx.arc(mx, my, 26, 0, Math.PI * 2); ctx.fillStyle = "#1e293b"; ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my, 26, 0, Math.PI * 2); ctx.fillStyle = "#e2e8f0";
    ctx.save(); ctx.clip();
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(mx + 26 - lit * 52, my - 26, 52, 52);
    ctx.restore();
    ctx.font = "30px sans-serif"; ctx.fillText("🌙", mx - 15, my + 10);
  }, [angle]);
  const guess = (p: string) => {
    if (p === phaseName(quizAngle)) {
      const s = streak + 1; setStreak(s); setMsg("✅ Correct!");
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 });
      if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setQuizAngle(Math.floor(Math.random() * 8) * 45 + 10);
    } else { setStreak(0); setMsg(`❌ It was ${phaseName(quizAngle)} — watch the dial!`); }
  };
  return (
    <SimulationShell title="Moon Phase Studio" icon="🌙"
      controls={<>
        <Slider label="Moon orbit" value={angle} min={0} max={359} onChange={setAngle} format={(v) => `${v}°`} />
        <Button size="sm" variant={playing ? "default" : "outline"} onClick={() => setPlaying(!playing)} className="w-full">{playing ? "⏸️ Pause orbit" : "▶️ Orbit the Moon"}</Button>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🔮 Name this phase: <span className="text-3xl">{["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"][Math.floor(quizAngle / 45) % 8]}</span></p>
          <div className="grid grid-cols-2 gap-1 mt-1">{PHASES.map((p) => <Button key={p} size="sm" variant="outline" onClick={() => guess(p)} className="text-[11px]">{p}</Button>)}</div>
          <p className="text-xs font-bold mt-1">{msg} 🔥 {streak}/5</p>
        </div>
      </>}
      dataPanel={<div className="text-center"><p className="text-5xl">{phaseName(angle).split(" ")[0]}</p><p className="font-extrabold text-xl">{phaseName(angle)}</p><p className="text-xs text-slate-500">Orbit: ~29.5 days • Moon drifts 3.8cm/yr away!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[260px]" />
      <Quiz questions={[
        { q: "Moon phases happen because...", options: ["Earth's shadow", "Our viewing angle changes", "Clouds"], answer: 1, explain: "We see different lit slices!" },
        { q: "Waxing means the lit part is...", options: ["Shrinking", "Growing", "Green"], answer: 1, explain: "Wax on = grow!" },
        { q: "A full Moon is...", options: ["Moon behind Earth from Sun", "Moon between Sun and Earth", "No Moon"], answer: 0, explain: "Fully lit face toward us!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- SEASONS SPINNER ---- */
const CITIES = [
  { name: "London 🇬🇧", lat: 51.5 }, { name: "New York 🇺🇸", lat: 40.7 },
  { name: "Quito 🇪🇨", lat: -0.2 }, { name: "Sydney 🇦🇺", lat: -33.9 },
];
export function SeasonsSpinner({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [orbit, setOrbit] = useState(0);
  const [city, setCity] = useState(3);
  const { recordProgress } = useAppStore();
  const daylight = (lat: number, o: number) => {
    const h = 12 + 4.2 * Math.sin((lat * Math.PI) / 180) * Math.cos((o * Math.PI) / 180);
    return Math.max(0, Math.min(24, h));
  };
  const dl = daylight(CITIES[city].lat, orbit);
  const season = dl > 13 ? "☀️ Summer!" : dl < 11 ? "❄️ Winter!" : "🍂 Spring/Autumn";
  useEffect(() => {
    if (CITIES[city].name.startsWith("Sydney") && dl > 13 && orbit > 150 && orbit < 210) {
      recordProgress(moduleId, { timeSpentSeconds: 90, score: 95, status: "completed" });
    }
  }, [dl, orbit, city]);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 380;
    const W = c.width, H = c.height;
    ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 70; i++) ctx.fillRect((i * 211) % W, (i * 131) % H, 3, 3);
    const cx = W / 2, cy = H / 2;
    ctx.font = "70px sans-serif"; ctx.fillText("☀️", cx - 35, cy + 25);
    const a = (orbit * Math.PI) / 180;
    const ex = cx + Math.cos(a) * 260, ey = cy + Math.sin(a) * 100;
    ctx.beginPath(); ctx.ellipse(cx, cy, 260, 100, 0, 0, Math.PI * 2); ctx.strokeStyle = "#334155"; ctx.stroke();
    // earth with tilt
    ctx.save(); ctx.translate(ex, ey);
    ctx.font = "52px sans-serif"; ctx.fillText("🌍", -26, 18);
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(10, -34); ctx.lineTo(-10, 34); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif";
    const months = ["Jan", "Apr", "Jul", "Oct"];
    ctx.fillText(months[Math.floor(orbit / 90) % 4] + " →", 20, 40);
  }, [orbit]);
  return (
    <SimulationShell title="Seasons Spinner" icon="🌤️"
      controls={<>
        <Slider label="Orbit around Sun" value={orbit} min={0} max={359} onChange={(v) => { setOrbit(v); recordProgress(moduleId, { timeSpentSeconds: 10 }); }} format={(v) => `${v}°`} />
        <div className="grid grid-cols-2 gap-1.5">{CITIES.map((ct, i) => (
          <Button key={ct.name} size="sm" variant={city === i ? "default" : "outline"} onClick={() => setCity(i)}>{ct.name}</Button>
        ))}</div>
        <p className="text-xs text-slate-500">🎯 Mission: give Sydney a sunny Christmas (Dec ≈ orbit 180°)! Tilt stays 23.5° — what if it were 0°?</p>
      </>}
      dataPanel={<div className="text-center"><p className="text-4xl">{season.split(" ")[0]}</p><p className="font-extrabold">{CITIES[city].name}: {season}</p><p className="text-sm">☀️ Daylight: <b>{dl.toFixed(1)} hrs</b></p><p className="text-xs text-slate-500">Simplified model • Earth closest to Sun in January!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[240px]" />
      <Quiz questions={[
        { q: "Seasons are caused by...", options: ["Distance from Sun", "Earth's tilt", "Clouds"], answer: 1, explain: "23.5° lean aims hemispheres at the Sun!" },
        { q: "When it's summer in London, Sydney has...", options: ["Summer too", "Winter", "Nothing"], answer: 1, explain: "Opposite hemispheres, opposite seasons!" },
        { q: "June 21 in the north is the...", options: ["Winter solstice", "Summer solstice", "Equinox"], answer: 1, explain: "Longest day of the year!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- QUAKE LAB ---- */
export function QuakeLab({ moduleId }: { moduleId: string }) {
  const shakeRef = useRef<HTMLCanvasElement>(null);
  const seismoRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(5);
  const [braced, setBraced] = useState(false);
  const [mag, setMag] = useState(4);
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState("");
  const [best, setBest] = useState(0);
  const { recordProgress } = useAppStore();
  const strength = width * 2 + (braced ? 3 : 0) - height * 0.7 + 4;
  const shake = () => {
    setShaking(true); setResult("");
    const survives = strength + (Math.random() * 2 - 1) > mag;
    setTimeout(() => {
      setShaking(false);
      if (survives) {
        setBest(Math.max(best, mag));
        setResult(`🎉 Tower SURVIVED magnitude ${mag}!`);
        recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
        if (mag >= 7) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
      } else setResult(`🏚️ CRASH at magnitude ${mag}! Wider base? Braces? Shorter?`);
    }, 1800);
  };
  useEffect(() => {
    const c = shakeRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0; let t = 0;
    c.width = c.offsetWidth * 2; c.height = 300;
    const draw = () => {
      t += 0.3;
      const W = c.width, H = c.height;
      ctx.fillStyle = "#fef3c7"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#65a30d"; ctx.fillRect(0, H - 30, W, 30);
      const shift = shaking ? Math.sin(t) * mag * 3 : 0;
      const bw = 60 * width, bh = 26 * height;
      const bx = W / 2 - bw / 2 + shift, by = H - 30 - bh;
      ctx.fillStyle = "#94a3b8";
      for (let f = 0; f < height; f++) ctx.fillRect(bx, by + f * 26, bw, 22);
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
      for (let f = 0; f < height; f++) ctx.strokeRect(bx, by + f * 26, bw, 22);
      if (braced) {
        ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 5;
        for (let f = 0; f < height; f++) {
          ctx.beginPath(); ctx.moveTo(bx, by + f * 26 + 22); ctx.lineTo(bx + bw, by + f * 26); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height, braced, shaking, mag]);
  useEffect(() => {
    const c = seismoRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, x = 0;
    c.width = c.offsetWidth * 2; c.height = 120;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    const draw = () => {
      x = (x + 4) % c.width;
      const amp = shaking ? mag * 6 : 2;
      const y = 60 + (Math.random() - 0.5) * amp;
      ctx.fillStyle = "#fff"; ctx.fillRect(x, 0, 4, c.height);
      ctx.fillStyle = "#dc2626"; ctx.fillRect(x, y, 4, 4);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [shaking, mag]);
  return (
    <SimulationShell title="Quake Lab" icon="🏚️"
      controls={<>
        <Slider label="Base width" value={width} min={1} max={3} onChange={setWidth} />
        <Slider label="Height (floors)" value={height} min={2} max={8} onChange={setHeight} />
        <Button size="sm" variant={braced ? "default" : "outline"} onClick={() => setBraced(!braced)} className="w-full">🔧 Cross-bracing {braced ? "ON" : "OFF"}</Button>
        <Slider label="Magnitude" value={mag} min={1} max={9} onChange={setMag} format={(v) => `${v}.0`} />
        <Button variant="fun" onClick={shake} disabled={shaking} className="w-full">{shaking ? "🌊 SHAKING..." : "🌊 EARTHQUAKE!"}</Button>
        <p className="text-xs text-slate-500">Best survived: {best > 0 ? `${best}.0 🎖️ (7.0 = engineer!)` : "—"}</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🏗️ Strength: <b>{strength.toFixed(1)}</b> vs magnitude <b>{mag}</b></p><p className="font-bold">{result}</p><p className="text-xs text-slate-500">Each +1 magnitude = 32× more energy!</p>
        <canvas ref={seismoRef} className="w-full h-[70px] border rounded-lg" /></div>}>
      <canvas ref={shakeRef} className="w-full h-[200px]" />
      <Quiz questions={[
        { q: "Earthquakes come from...", options: ["Wind", "Moving tectonic plates", "Rain"], answer: 1, explain: "Stuck faults suddenly slip!" },
        { q: "Magnitude 6 vs 5 releases...", options: ["A bit more", "32× more energy", "Less"], answer: 1, explain: "Logarithmic scale — huge jumps!" },
        { q: "Best anti-quake design?", options: ["Tall + narrow", "Wide + braced", "Heavy roof"], answer: 1, explain: "Low, wide, and cross-braced wins!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- WATER CYCLE ---- */
const STAGES = ["🌊 Ocean", "☀️ Evaporation", "☁️ Cloud", "🌧️ Precipitation", "🏔️ Mountain", "🏞️ River"];
export function WaterCycle({ moduleId }: { moduleId: string }) {
  const [stage, setStage] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>(["💧 You are a droplet in the ocean. Roll!"]);
  const { recordProgress } = useAppStore();
  const roll = () => {
    let n = stage + 1;
    // random detour: clouds can blow to a new ocean
    if (stage === 2 && Math.random() < 0.3) {
      setLog([`💨 Wind blew you to a new ocean!`, ...log].slice(0, 4));
      n = 0;
    } else {
      setLog([`${STAGES[n % 6]}! ${["Splish!", "Whoosh!", "Drip!", "Flow!", "Splash!", "Round again!"][n % 6]}`, ...log].slice(0, 4));
    }
    if (n >= 6) {
      const c = cycles + 1;
      setCycles(c);
      const b = ["🌊", "❄️", "🌪️"][c - 1];
      if (b) setBadges([...badges, b]);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 85 });
      if (c >= 3) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setStage(0);
    } else setStage(n);
  };
  return (
    <SimulationShell title="Water Cycle Journey" icon="💧"
      controls={<>
        <Button variant="fun" onClick={roll} className="w-full">🎲 Journey on!</Button>
        <p className="text-sm font-bold">Full cycles: {cycles}/3 {badges.join(" ")}</p>
        <div className="max-h-28 overflow-y-auto">{log.map((l, i) => <p key={i} className="text-xs">{l}</p>)}</div>
      </>}
      dataPanel={<div className="text-sm"><p>♻️ No new water — ever!</p><p>Your drink passed through dinosaurs 🦕</p><p>One cloud weighs ~500 tons!</p></div>}>
      <div className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-1">
          {STAGES.map((s, i) => (
            <div key={i} className={`text-center px-2 py-2 rounded-xl border-4 text-sm font-bold ${i === stage % 6 ? "border-blue-500 bg-blue-100 scale-110" : i < stage ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
              <span className="text-2xl block">{s.split(" ")[0]}</span>{s.split(" ")[1]}
            </div>
          ))}
        </div>
        <div className="text-center text-5xl my-3 animate-bounce">{STAGES[stage % 6].split(" ")[0]}</div>
        <Quiz questions={[
          { q: "Puddles vanish by...", options: ["Evaporation", "Magic", "Wind eating"], answer: 0, explain: "Heat lifts vapor up!" },
          { q: "Clouds form by...", options: ["Condensation", "Freezing time", "Paint"], answer: 0, explain: "Vapor cools into droplets!" },
          { q: "The water cycle...", options: ["Ends at the sea", "Loops forever ♻️", "Is new each year"], answer: 1, explain: "Billions of years old, same water!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- CONSTELLATIONS ---- */
const CONSTELLATIONS: Array<{ name: string; myth: string; stars: Array<[number, number]> }> = [
  { name: "Big Dipper 🥄", myth: "A great bear chased across the sky!", stars: [[10, 70], [22, 62], [34, 60], [46, 64], [58, 55], [70, 60], [82, 70]] },
  { name: "Cassiopeia 👑", myth: "A vain queen seated in the stars.", stars: [[10, 40], [25, 55], [40, 42], [55, 58], [70, 45]] },
  { name: "Orion 🏹", myth: "The hunter with his shining belt.", stars: [[30, 15], [38, 35], [46, 50], [54, 50], [62, 50], [50, 75], [68, 75]] },
  { name: "Leo 🦁", myth: "The Nemean lion of legends.", stars: [[20, 60], [32, 50], [44, 55], [56, 45], [68, 55], [78, 40]] },
  { name: "Scorpius 🦂", myth: "The scorpion that stung Orion!", stars: [[12, 30], [24, 40], [38, 48], [52, 52], [64, 60], [74, 72]] },
  { name: "Cygnus 🦢", myth: "The swan flying down the Milky Way.", stars: [[50, 10], [50, 35], [50, 60], [30, 45], [70, 45]] },
];
export function ConstellationStudio({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(0);
  const [traced, setTraced] = useState<number[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const cur = CONSTELLATIONS[idx % CONSTELLATIONS.length];
  const click = (i: number) => {
    if (traced.length === i) {
      const n = [...traced, i];
      setTraced(n);
      if (n.length === cur.stars.length) {
        const d = [...done, cur.name];
        setDone(d);
        recordProgress(moduleId, { timeSpentSeconds: 40, score: 90 });
        if (d.length >= 6) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
        setTimeout(() => { setIdx(idx + 1); setTraced([]); }, 1200);
      }
    }
  };
  return (
    <SimulationShell title="Constellation Studio" icon="✨"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{CONSTELLATIONS.map((c, i) => (
          <Button key={c.name} size="sm" variant={idx % CONSTELLATIONS.length === i ? "default" : "outline"} onClick={() => { setIdx(i); setTraced([]); }} className="text-xs">
            {done.includes(c.name) ? "✅ " : ""}{c.name}
          </Button>
        ))}</div>
        <p className="text-xs text-slate-500">Traced: {done.length}/6 • Click stars IN ORDER 1→2→3...</p>
      </>}
      dataPanel={<div className="text-sm"><p className="font-extrabold">{cur.name}</p><p className="italic text-slate-600">"{cur.myth}"</p><p className="text-xs text-slate-500 mt-1">Find Polaris via the Dipper's pointer stars!</p></div>}>
      <div className="p-4 bg-[#020617] rounded-b-xl">
        <svg viewBox="0 0 100 90" className="w-full max-w-md mx-auto">
          {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(i * 37) % 100} cy={(i * 53) % 90} r="0.7" fill="#475569" />)}
          {cur.stars.slice(0, Math.max(1, traced.length)).map((s, i) => {
            if (i === 0) return null;
            const p = cur.stars[i - 1];
            return <line key={i} x1={p[0]} y1={p[1]} x2={s[0]} y2={s[1]} stroke="#fbbf24" strokeWidth="1.2" />;
          })}
          {cur.stars.map((s, i) => (
            <g key={i} onClick={() => click(i)} style={{ cursor: "pointer" }}>
              <circle cx={s[0]} cy={s[1]} r="4" fill={traced.includes(i) ? "#fbbf24" : "#e2e8f0"} stroke="#0f172a" />
              <text x={s[0]} y={s[1] - 5} textAnchor="middle" fontSize="5" fill="#93c5fd" fontWeight="bold">{traced.includes(i) ? "✓" : i + 1}</text>
            </g>
          ))}
        </svg>
        <Quiz questions={[
          { q: "Constellations are...", options: ["Close star families", "Patterns people imagined", "Planets"], answer: 1, explain: "Dot-to-dot stories!" },
          { q: "Stars are...", options: ["Tiny lights", "Distant suns", "Holes in the sky"], answer: 1, explain: "Our Sun is one too!" },
          { q: "Find north with...", options: ["Orion", "Big Dipper → Polaris", "The Moon"], answer: 1, explain: "Pointer stars aim at Polaris!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
