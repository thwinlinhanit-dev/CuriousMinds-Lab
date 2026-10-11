"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- SOLAR SYSTEM 3D (canvas pseudo-3D) ---- */
const PLANETS = [
  { name: "Mercury", emoji: "🪨", color: "#a8a29e", size: 8, dist: 60, year: 88, fact: "Fastest planet: 88-day years!" },
  { name: "Venus", emoji: "🟡", color: "#fbbf24", size: 13, dist: 85, year: 225, fact: "Spins backwards! Hottest planet." },
  { name: "Earth", emoji: "🌍", color: "#3b82f6", size: 14, dist: 115, year: 365, fact: "Our home — liquid water + life!" },
  { name: "Mars", emoji: "🔴", color: "#ef4444", size: 11, dist: 145, year: 687, fact: "Home to Olympus Mons, tallest volcano!" },
  { name: "Jupiter", emoji: "🟠", color: "#fb923c", size: 30, dist: 190, year: 4333, fact: "1,300 Earths fit inside!" },
  { name: "Saturn", emoji: "🪐", color: "#fde68a", size: 26, dist: 240, year: 10759, fact: "Rings made of ice + rock!" },
  { name: "Uranus", emoji: "🔵", color: "#67e8f9", size: 18, dist: 285, year: 30687, fact: "Rolls on its side!" },
  { name: "Neptune", emoji: "🔷", color: "#6366f1", size: 17, dist: 325, year: 60190, fact: "Winds: 2,000 km/h!" },
];
export function SolarSystem3D({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1);
  const [sel, setSel] = useState(2);
  const [visited, setVisited] = useState<number[]>([2]);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0; let t = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 460);
    const draw = () => {
      t += 0.004 * speed;
      ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 120; i++) ctx.fillRect((i * 173) % W, (i * 97) % H, 3, 3);
      const cx = W / 2, cy = H / 2;
      ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      const sun = ctx.createRadialGradient(cx, cy, 5, cx, cy, 34);
      sun.addColorStop(0, "#fef08a"); sun.addColorStop(1, "#f97316");
      ctx.fillStyle = sun; ctx.fill();
      PLANETS.forEach((p, i) => {
        ctx.beginPath(); ctx.ellipse(cx, cy, p.dist * 1.9, p.dist * 0.62, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "#1e293b"; ctx.stroke();
        const a = t * (365 / p.year) * 4 + i;
        const x = cx + Math.cos(a) * p.dist * 1.9;
        const y = cy + Math.sin(a) * p.dist * 0.62;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        if (i === sel) { ctx.beginPath(); ctx.arc(x, y, p.size + 8, 0, Math.PI * 2); ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4; ctx.stroke(); }
        ctx.font = `${Math.max(16, p.size)}px sans-serif`;
        ctx.fillText(p.emoji, x - p.size / 1.5, y + p.size / 2.5);
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [speed, sel]);
  const pick = (i: number) => {
    setSel(i);
    if (!visited.includes(i)) {
      const v = [...visited, i];
      setVisited(v);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 });
      if (v.length >= 6) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
    }
  };
  const p = PLANETS[sel];
  return (
    <SimulationShell title="Solar System Explorer" icon="☀️"
      controls={<>
        <Slider label="Time speed" value={speed} min={1} max={50} onChange={setSpeed} format={(v) => `${v}×`} />
        <div className="grid grid-cols-4 gap-1.5">
          {PLANETS.map((x, i) => (
            <button key={i} onClick={() => pick(i)} className={`p-1.5 rounded-xl border-2 text-xl ${sel === i ? "border-amber-400 bg-amber-50" : "border-slate-200"}`} title={x.name}>{x.emoji}</button>
          ))}
        </div>
        <p className="text-xs text-slate-500">Visited {visited.length}/8 planets</p>
      </>}
      dataPanel={<div className="text-center"><p className="text-4xl">{p.emoji}</p><p className="font-extrabold text-xl">{p.name}</p><p className="text-sm">Year: <b>{p.year.toLocaleString()} days</b></p><p className="text-sm">🤯 {p.fact}</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[300px] md:h-[340px]" />
      <Quiz questions={[
        { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter"], answer: 1, explain: "Iron rust makes it red!" },
        { q: "Biggest planet?", options: ["Saturn", "Jupiter", "Earth"], answer: 1, explain: "1,300 Earths fit!" },
        { q: "A year is...", options: ["One spin", "One orbit around the Sun", "One moon"], answer: 1, explain: "Earth: 365 days per orbit!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- VOLCANO ---- */
export function VolcanoSimulator({ moduleId }: { moduleId: string }) {
  const [viscosity, setViscosity] = useState(50);
  const [gas, setGas] = useState(60);
  const [pressure, setPressure] = useState(0);
  const [erupting, setErupting] = useState(false);
  const [eruptions, setEruptions] = useState(0);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    if (erupting) return;
    const t = setInterval(() => setPressure((p) => Math.min(100, p + gas / 25)), 200);
    return () => clearInterval(t);
  }, [gas, erupting]);
  useEffect(() => {
    if (pressure >= 100 && !erupting) {
      setErupting(true);
      setEruptions((e) => e + 1);
      recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
      if (eruptions + 1 >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 95 });
      setTimeout(() => { setErupting(false); setPressure(0); }, 3500);
    }
  }, [pressure]);
  const style = viscosity > 65 ? "💥 EXPLOSIVE (thick lava traps gas!)" : viscosity < 35 ? "🌊 GENTLE (runny lava flows!)" : "🌋 MODERATE eruption";
  return (
    <SimulationShell title="Volcano Lab" icon="🌋"
      controls={<>
        <Slider label="🧪 Magma thickness" value={viscosity} min={0} max={100} onChange={setViscosity} />
        <Slider label="💨 Gas amount" value={gas} min={10} max={100} onChange={setGas} />
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${pressure > 80 ? "bg-red-500" : "bg-orange-400"}`} style={{ width: `${pressure}%` }} /></div>
        <p className="text-sm font-bold">Pressure: {Math.round(pressure)}% {erupting ? "🌋 ERUPTING!" : pressure > 80 ? "⚠️ About to blow!" : "Building..."}</p>
        <Button variant="fun" onClick={() => setPressure(100)} disabled={erupting} className="w-full">{erupting ? "🌋 ERUPTION!" : "💥 Trigger eruption"}</Button>
        <p className="text-xs text-slate-500">Eruptions: {eruptions} (3 = volcanologist!)</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🌋 Style: <b>{erupting || pressure > 80 ? style : "—"}</b></p><p className="text-xs text-slate-500">Thick lava + lots of gas = explosive! Like Mount St. Helens.</p></div>}>
      <div className="p-6 flex flex-col items-center bg-gradient-to-b from-slate-800 to-orange-100 rounded-b-xl min-h-[280px] justify-end">
        <div className="text-center">
          {erupting && <div className="text-6xl animate-bounce">🔥💨🪨<br />🌋</div>}
          <div className="text-8xl -mt-4">🗻</div>
          <div className="flex justify-center gap-1 text-3xl">{erupting && viscosity < 35 ? "🟠🟠🟠 lava flows!" : ""}</div>
        </div>
        <Quiz questions={[
          { q: "Melted rock UNDERGROUND is called...", options: ["Lava", "Magma", "Ash"], answer: 1, explain: "Magma below, lava above!" },
          { q: "Explosive eruptions come from...", options: ["Runny lava", "Thick lava + gas", "Cold rock"], answer: 1, explain: "Trapped gas blasts out!" },
          { q: "New islands like Hawaii form from...", options: ["Earthquakes", "Volcanoes", "Rain"], answer: 1, explain: "Layer after layer of lava!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- WEATHER STATION ---- */
export function WeatherStation({ moduleId }: { moduleId: string }) {
  const [temp, setTemp] = useState(20);
  const [humidity, setHumidity] = useState(55);
  const [pressure, setPressure] = useState(1013);
  const [wind, setWind] = useState(10);
  const { recordProgress } = useAppStore();
  const forecast = humidity > 80 && pressure < 1005 ? { e: "⛈️", t: "Storm!", d: "Low pressure + wet air = thunderstorms." } :
    humidity > 70 ? { e: "🌧️", t: "Rain", d: "Wet air condenses into rain clouds." } :
    humidity > 45 ? { e: "⛅", t: "Cloudy", d: "Some clouds drifting by." } :
    temp > 30 ? { e: "☀️", t: "Hot & Sunny", d: "Drink water! UV is strong." } :
    temp < 0 ? { e: "❄️", t: "Snow!", d: "Below freezing — snowflakes!" } :
    { e: "☀️", t: "Sunny", d: "Great day to explore outside!" };
  useEffect(() => { recordProgress(moduleId, { timeSpentSeconds: 20 }); }, []);
  return (
    <SimulationShell title="Weather Station" icon="🌤️"
      controls={<>
        <Slider label="🌡️ Temperature" value={temp} min={-10} max={40} onChange={setTemp} format={(v) => `${v}°C`} />
        <Slider label="💧 Humidity" value={humidity} min={0} max={100} onChange={setHumidity} format={(v) => `${v}%`} />
        <Slider label="🧭 Pressure" value={pressure} min={980} max={1040} onChange={setPressure} format={(v) => `${v} hPa`} />
        <Slider label="💨 Wind" value={wind} min={0} max={100} onChange={setWind} format={(v) => `${v} km/h`} />
        <Button variant="secondary" size="sm" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 90, score: 85, status: "completed" })}>✅ I forecasted 3 weathers!</Button>
      </>}
      dataPanel={<div className="text-center"><p className="text-6xl">{forecast.e}</p><p className="font-extrabold text-2xl">{forecast.t}</p><p className="text-sm text-slate-600">{forecast.d}</p>{wind > 60 && <p className="text-sm font-bold text-red-500">⚠️ Wind warning!</p>}</div>}>
      <div className="p-6">
        <div className="relative h-44 bg-gradient-to-b from-sky-200 to-sky-50 rounded-xl overflow-hidden">
          <span className="absolute text-5xl" style={{ left: `${(wind / 100) * 70 + 5}%`, top: "20%" }}>☁️</span>
          <span className="absolute text-4xl" style={{ left: `${60 - (wind / 100) * 40}%`, top: "45%" }}>☁️</span>
          {forecast.e === "🌧️" || forecast.e === "⛈️" ? <span className="absolute inset-x-0 top-1/2 text-center text-4xl">🌧️🌧️🌧️</span> : null}
          {forecast.e === "❄️" ? <span className="absolute inset-x-0 top-1/2 text-center text-4xl">❄️❄️❄️</span> : null}
          {forecast.e.includes("☀") ? <span className="absolute right-6 top-4 text-6xl">☀️</span> : null}
          {forecast.e === "⛈️" ? <span className="absolute left-1/2 top-6 text-5xl">⚡</span> : null}
        </div>
        <Quiz questions={[
          { q: "Storms usually come with...", options: ["High pressure", "Low pressure", "No pressure"], answer: 1, explain: "Rising air + low pressure = storms!" },
          { q: "Humidity measures...", options: ["Heat", "Moisture in air", "Wind"], answer: 1, explain: "Sticky days = humid!" },
          { q: "Wind blows from...", options: ["Low to high pressure", "High to low pressure", "Nowhere"], answer: 1, explain: "Air flows to fill lows!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- ROCK CYCLE ---- */
const ROCKS = [
  { name: "Granite", type: "igneous", emoji: "🪨", desc: "Cooled magma. Speckled pink-gray!" },
  { name: "Basalt", type: "igneous", emoji: "⬛", desc: "Fast-cooled lava. Dark + fine!" },
  { name: "Sandstone", type: "sedimentary", emoji: "🟨", desc: "Pressed sand layers!" },
  { name: "Limestone", type: "sedimentary", emoji: "⬜", desc: "From ancient sea shells!" },
  { name: "Marble", type: "metamorphic", emoji: "🤍", desc: "Limestone squeezed + heated!" },
  { name: "Slate", type: "metamorphic", emoji: "🩶", desc: "Squished mudstone. Splits flat!" },
];
export function RockCycle({ moduleId }: { moduleId: string }) {
  const [cur, setCur] = useState(0);
  const [identified, setIdentified] = useState<number[]>([]);
  const [quizRock, setQuizRock] = useState(2);
  const [picked, setPicked] = useState<string | null>(null);
  const { recordProgress } = useAppStore();
  const r = ROCKS[cur];
  const guess = (type: string) => {
    setPicked(type);
    if (type === ROCKS[quizRock].type && !identified.includes(quizRock)) {
      const n = [...identified, quizRock];
      setIdentified(n);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 85 });
      if (n.length >= 4) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
    }
  };
  const transform = (action: string) => {
    // cycle logic
    if (action === "melt" && r.type !== "igneous") setCur(0);
    else if (action === "squeeze" && r.type !== "metamorphic") setCur(4);
    else if (action === "weather" && r.type !== "sedimentary") setCur(2);
    else setCur((cur + 1) % ROCKS.length);
  };
  return (
    <SimulationShell title="Rock Cycle Explorer" icon="🪨"
      controls={<>
        <p className="text-sm font-bold">🔄 Transform this rock:</p>
        <div className="grid grid-cols-3 gap-1.5">
          <Button size="sm" variant="outline" onClick={() => transform("melt")}>🔥 Melt</Button>
          <Button size="sm" variant="outline" onClick={() => transform("squeeze")}>🗜️ Squeeze</Button>
          <Button size="sm" variant="outline" onClick={() => transform("weather")}>🌊 Weather</Button>
        </div>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🔍 Mystery rock ({identified.length}/6): <span className="text-3xl">{ROCKS[quizRock].emoji}</span></p>
          <div className="flex gap-1.5 mt-1">
            {["igneous", "sedimentary", "metamorphic"].map((t) => (
              <Button key={t} size="sm" variant={picked === t && ROCKS[quizRock].type === t ? "default" : "outline"} onClick={() => guess(t)} className="flex-1 text-xs capitalize">{t.slice(0, 4)}.</Button>
            ))}
          </div>
          {picked && <p className="text-xs font-bold">{picked === ROCKS[quizRock].type ? `🎉 Yes! ${ROCKS[quizRock].name}!` : "❌ Try again — read the clues!"} <button className="underline" onClick={() => { setQuizRock(Math.floor(Math.random() * ROCKS.length)); setPicked(null); }}>Next rock →</button></p>}
          <p className="text-xs text-slate-500">Clue: {ROCKS[quizRock].desc}</p>
        </div>
      </>}
      dataPanel={<div className="text-center"><p className="text-6xl">{r.emoji}</p><p className="font-extrabold text-xl">{r.name}</p><p className="text-sm font-bold text-purple-700 capitalize">{r.type}</p><p className="text-sm text-slate-600">{r.desc}</p><div className="flex gap-1 justify-center mt-1">{ROCKS.map((x, i) => <button key={i} onClick={() => setCur(i)} className={`text-2xl ${i === cur ? "scale-125" : "opacity-50"}`}>{x.emoji}</button>)}</div></div>}>
      <div className="p-6">
        <div className="flex items-center justify-center gap-2 text-sm font-bold flex-wrap">
          <span className="px-3 py-2 bg-red-100 rounded-xl">🔥 Magma</span>→
          <span className="px-3 py-2 bg-orange-100 rounded-xl">Igneous</span>→
          <span className="px-3 py-2 bg-yellow-100 rounded-xl">Weathering</span>→
          <span className="px-3 py-2 bg-green-100 rounded-xl">Sedimentary</span>→
          <span className="px-3 py-2 bg-purple-100 rounded-xl">Heat+Pressure</span>→
          <span className="px-3 py-2 bg-blue-100 rounded-xl">Metamorphic</span>→
          <span className="px-3 py-2 bg-red-100 rounded-xl">Melt ♻️</span>
        </div>
        <Quiz questions={[
          { q: "Granite (cooled magma) is...", options: ["Sedimentary", "Igneous", "Metamorphic"], answer: 1, explain: "Igneous = from fire!" },
          { q: "Marble forms when limestone is...", options: ["Heated + squeezed", "Melted fully", "Frozen"], answer: 0, explain: "Changed, not melted = metamorphic!" },
          { q: "The rock cycle...", options: ["Ends", "Never ends ♻️", "Takes seconds"], answer: 1, explain: "Millions of years, forever looping!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
