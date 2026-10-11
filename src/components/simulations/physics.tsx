"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Slider, Button, Badge } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ============ 1. PROJECTILE MOTION ============ */
export function ProjectileMotion({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(20);
  const [planet, setPlanet] = useState("earth");
  const [flying, setFlying] = useState(false);
  const [result, setResult] = useState("");
  const [hits, setHits] = useState(0);
  const gravities: Record<string, number> = { earth: 9.8, moon: 1.6, mars: 3.7, jupiter: 24.8 };
  const g = gravities[planet];
  const stateRef = useRef({ t: 0, targetX: 220 + Math.random() * 120 });
  const { recordProgress } = useAppStore();

  const launch = useCallback(() => {
    stateRef.current.t = 0;
    setFlying(true);
    setResult("");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 560);
    const groundY = H - 60;
    const scale = 6;
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const targetX = stateRef.current.targetX;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#dbeafe"); sky.addColorStop(1, "#f0fdf4");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // ground
      ctx.fillStyle = "#86efac"; ctx.fillRect(0, groundY, W, H - groundY);
      // launcher
      ctx.fillStyle = "#1e293b";
      ctx.save(); ctx.translate(80, groundY); ctx.rotate(-rad);
      ctx.fillRect(0, -14, 90, 28); ctx.restore();
      ctx.beginPath(); ctx.arc(80, groundY, 26, 0, Math.PI * 2); ctx.fillStyle = "#475569"; ctx.fill();
      // target
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(targetX * 2, groundY - 50, 44, 50);
      ctx.fillStyle = "#fff"; ctx.font = "bold 28px sans-serif"; ctx.fillText("🎯", targetX * 2 + 4, groundY - 10);
      const t = stateRef.current.t;
      const px = 80 + vx * t * scale * 0.32;
      const py = groundY - (vy * t - 0.5 * g * t * t) * scale * 0.55;
      // trajectory preview
      ctx.strokeStyle = "#3b82f655"; ctx.setLineDash([8, 8]); ctx.beginPath();
      for (let tt = 0; tt < 12; tt += 0.1) {
        const qx = 80 + vx * tt * scale * 0.32;
        const qy = groundY - (vy * tt - 0.5 * g * tt * tt) * scale * 0.55;
        if (qy > groundY) break;
        tt === 0 ? ctx.moveTo(qx, qy) : ctx.lineTo(qx, qy);
      }
      ctx.stroke(); ctx.setLineDash([]);
      if (flying) {
        if (py >= groundY) {
          setFlying(false);
          const landX = px / 2;
          const hit = Math.abs(landX - targetX) < 26;
          const range = ((vx * (2 * vy / g)) ).toFixed(1);
          setResult(hit ? `🎯 DIRECT HIT! Range ${range} m` : `Landed at ${landX.toFixed(0)} m (target ${targetX.toFixed(0)} m). Range ${range} m — adjust!`);
          if (hit) {
            setHits((h) => h + 1);
            recordProgress(moduleId, { timeSpentSeconds: 60, score: 100 });
            if (hits + 1 >= 3) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
            stateRef.current.targetX = 220 + Math.random() * 120;
          }
        } else {
          // ball
          ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2);
          ctx.fillStyle = "#f97316"; ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif"; ctx.fillText("🚀", px - 13, py + 7);
          stateRef.current.t += 0.045;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [angle, velocity, planet, flying, moduleId]);

  const range = ((velocity * Math.cos(angle * Math.PI / 180) * 2 * velocity * Math.sin(angle * Math.PI / 180)) / g).toFixed(1);
  const maxH = ((velocity * Math.sin(angle * Math.PI / 180)) ** 2 / (2 * g)).toFixed(1);

  return (
    <SimulationShell title="Projectile Launcher" icon="🚀"
      controls={<>
        <Slider label="Launch angle" value={angle} min={5} max={85} onChange={setAngle} format={(v) => `${v}°`} />
        <Slider label="Speed" value={velocity} min={5} max={40} onChange={setVelocity} format={(v) => `${v} m/s`} />
        <label className="block text-sm font-medium">Planet (gravity)
          <select value={planet} onChange={(e) => setPlanet(e.target.value)} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold">
            <option value="earth">🌍 Earth (9.8)</option><option value="moon">🌙 Moon (1.6)</option>
            <option value="mars">🔴 Mars (3.7)</option><option value="jupiter">🟠 Jupiter (24.8)</option>
          </select></label>
        <Button variant="fun" className="w-full" onClick={launch}>{flying ? "Flying... 🚀" : "🚀 LAUNCH!"}</Button>
        <Badge>🎯 Hits: {hits}</Badge>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>📏 Predicted range: <b>{range} m</b></p><p>⛰️ Max height: <b>{maxH} m</b></p><p>🌍 Gravity: <b>{g} m/s²</b></p>{result && <p className="font-bold text-blue-700">{result}</p>}<p className="text-xs text-slate-500">Tip: 45° gives max range on Earth!</p></div>}
      onSave={() => saveCreation("My Launch", "simulation_state", { angle, velocity, planet, hits }, { moduleId, subjectId: "physics" })}>
      <canvas ref={canvasRef} className="w-full h-[320px] md:h-[420px]" />
      <Quiz questions={[
        { q: "Which angle gives the farthest flight (no air)?", options: ["15°", "45°", "80°"], answer: 1, explain: "45° balances height and forward speed!" },
        { q: "Where would your rocket fly FARTHEST?", options: ["Jupiter", "Earth", "The Moon"], answer: 2, explain: "Moon gravity is weakest!" },
        { q: "What shape is the flight path?", options: ["Straight line", "Parabola (U-curve)", "Circle"], answer: 1, explain: "Gravity bends it into a parabola." },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ============ 2. PENDULUM LAB ============ */
export function PendulumLab({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(200);
  const [mass, setMass] = useState(2);
  const [angle, setAngle] = useState(30);
  const [gravity, setGravity] = useState(9.8);
  const [running, setRunning] = useState(true);
  const [swings, setSwings] = useState(0);
  const sim = useRef({ theta: (30 * Math.PI) / 180, omega: 0, lastSign: 1 });
  const { recordProgress } = useAppStore();
  const period = (2 * Math.PI * Math.sqrt(length / 100 / gravity)).toFixed(2);

  useEffect(() => { sim.current.theta = (angle * Math.PI) / 180; sim.current.omega = 0; }, [angle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0; let last = performance.now();
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 520);
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = sim.current;
      if (running) {
        const L = length / 100;
        const alpha = (-gravity / L) * Math.sin(s.theta) - 0.05 * s.omega;
        s.omega += alpha * dt; s.theta += s.omega * dt;
        const sign = Math.sign(s.omega) || 1;
        if (sign !== s.lastSign) { s.lastSign = sign; setSwings((w) => w + 0.5); }
      }
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#eff6ff"); bg.addColorStop(1, "#fff");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = 70;
      const px = cx + Math.sin(s.theta) * length * 1.6;
      const py = cy + Math.cos(s.theta) * length * 1.6;
      // trail
      ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, length * 1.6, Math.PI / 2 - 0.9, Math.PI / 2 + 0.9); ctx.stroke();
      // mount + string + bob
      ctx.fillStyle = "#64748b"; ctx.fillRect(cx - 60, cy - 24, 120, 24);
      ctx.strokeStyle = "#334155"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 14 + mass * 7, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6"; ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif"; ctx.fillText(`${mass}kg`, px - 20, py + 7);
      // energy bars
      const h = Math.cos(0) - Math.cos(s.theta);
      const ke = Math.abs(s.omega) * 8;
      ctx.fillStyle = "#22c55e"; ctx.fillRect(30, H - 60 - Math.min(160, ke * 30), 50, Math.min(160, ke * 30));
      ctx.fillStyle = "#f59e0b"; ctx.fillRect(100, H - 60 - Math.min(160, h * 900), 50, Math.min(160, h * 900));
      ctx.fillStyle = "#0f172a"; ctx.font = "bold 20px sans-serif";
      ctx.fillText("KE", 32, H - 20); ctx.fillText("PE", 102, H - 20);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [length, mass, gravity, running]);

  return (
    <SimulationShell title="Pendulum Lab" icon="🕐"
      controls={<>
        <Slider label="String length" value={length} min={80} max={260} onChange={setLength} format={(v) => `${v} cm`} />
        <Slider label="Bob mass" value={mass} min={1} max={5} onChange={setMass} format={(v) => `${v} kg`} />
        <Slider label="Start angle" value={angle} min={5} max={60} onChange={setAngle} format={(v) => `${v}°`} />
        <Slider label="Gravity" value={gravity} min={1.6} max={24.8} step={0.1} onChange={setGravity} format={(v) => `${v}`} />
        <Button onClick={() => setRunning(!running)} className="w-full">{running ? "⏸️ Pause" : "▶️ Swing!"}</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>⏱️ Period: <b>{period} s</b></p><p>🔄 Swings: <b>{Math.floor(swings)}</b></p><p className="text-xs text-slate-500">Change mass — does the period change? (Spoiler: NO!)</p></div>}
      onSave={() => saveCreation("My Pendulum", "simulation_state", { length, mass, angle, gravity }, { moduleId, subjectId: "physics" })}>
      <canvas ref={canvasRef} className="w-full h-[300px] md:h-[380px]" />
      <Quiz questions={[
        { q: "What controls how fast a pendulum swings?", options: ["The mass", "The string length", "The color"], answer: 1, explain: "Longer = slower. Mass doesn't matter!" },
        { q: "Where is kinetic energy biggest?", options: ["At the top", "At the bottom (fastest)", "It never changes"], answer: 1, explain: "Fastest at the bottom!" },
        { q: "On Jupiter (strong gravity), a pendulum swings...", options: ["Slower", "Faster", "The same"], answer: 1, explain: "Stronger gravity pulls it back faster." },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ============ 3. CIRCUIT BUILDER ============ */
export function CircuitBuilder({ moduleId }: { moduleId: string }) {
  const [batteries, setBatteries] = useState(1);
  const [bulbs, setBulbs] = useState(1);
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [switchOn, setSwitchOn] = useState(true);
  const [flow, setFlow] = useState(0);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    if (!switchOn) return;
    const t = setInterval(() => setFlow((f) => (f + 1) % 100), 50);
    return () => clearInterval(t);
  }, [switchOn]);
  const voltage = batteries * 1.5;
  const resistance = bulbs * (mode === "series" ? 10 : 10 / bulbs);
  const current = switchOn ? voltage / (mode === "series" ? bulbs * 10 : 10 / Math.max(1, bulbs)) : 0;
  const brightness = Math.min(100, (current * 60) / Math.max(1, mode === "series" ? bulbs : 1));

  return (
    <SimulationShell title="Circuit Builder" icon="💡"
      controls={<>
        <Slider label="Batteries (1.5V each)" value={batteries} min={1} max={4} onChange={setBatteries} />
        <Slider label="Light bulbs" value={bulbs} min={1} max={4} onChange={setBulbs} />
        <div className="flex gap-2">
          {(["series", "parallel"] as const).map((m) => (
            <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="flex-1 capitalize">{m}</Button>
          ))}
        </div>
        <Button variant={switchOn ? "default" : "outline"} className="w-full" onClick={() => setSwitchOn(!switchOn)}>{switchOn ? "🔌 Switch: ON" : "🔌 Switch: OFF"}</Button>
        <Button variant="secondary" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 120, score: 90, status: "completed" })}>✅ I built a working circuit!</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🔋 Voltage: <b>{voltage}V</b></p><p>⚡ Current: <b>{current.toFixed(2)}A</b></p><p>💡 Brightness: <b>{switchOn ? Math.round(brightness) : 0}%</b></p><p className="text-xs text-slate-500">Series: one path. Parallel: each bulb gets full voltage!</p></div>}>
      <div className="p-6">
        <svg viewBox="0 0 500 300" className="w-full">
          <rect x="60" y="60" width="380" height="180" rx="16" fill="none" stroke="#334155" strokeWidth="6" />
          {switchOn && [0, 1, 2, 3, 4, 5].map((i) => {
            const p = (flow / 100 + i / 6) % 1;
            const per = 2 * (380 + 180);
            let d = p * per; let x = 60, y = 60;
            if (d < 380) { x = 60 + d; } else if (d < 560) { x = 440; y = 60 + (d - 380); }
            else if (d < 940) { x = 440 - (d - 560); y = 240; } else { x = 60; y = 240 - (d - 940); }
            return <circle key={i} cx={x} cy={y} r="7" fill="#fbbf24" />;
          })}
          <g>
            <rect x="200" y="40" width="100" height="40" rx="8" fill="#22c55e" />
            <text x="250" y="66" textAnchor="middle" fill="#fff" fontWeight="bold">{voltage}V 🔋×{batteries}</text>
          </g>
          {Array.from({ length: bulbs }).map((_, i) => {
            const x = mode === "series" ? 130 + i * ((360 - 40) / Math.max(1, bulbs - 1 || 1)) : 250;
            const y = mode === "series" ? 240 : 110 + i * 40;
            return (
              <g key={i} opacity={switchOn ? 1 : 0.4}>
                <circle cx={x} cy={y} r="22" fill={switchOn ? "#fef08a" : "#e2e8f0"} stroke="#a16207" strokeWidth="3" />
                {switchOn && brightness > 10 && <circle cx={x} cy={y} r={22 + brightness / 4} fill="#fde047" opacity="0.35" />}
                <text x={x} y={y + 6} textAnchor="middle" fontSize="18">💡</text>
              </g>
            );
          })}
          <g onClick={() => setSwitchOn(!switchOn)} style={{ cursor: "pointer" }}>
            <rect x="380" y="130" width="60" height="34" rx="8" fill={switchOn ? "#3b82f6" : "#94a3b8"} />
            <text x="410" y="153" textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="13">{switchOn ? "ON" : "OFF"}</text>
          </g>
        </svg>
        <Quiz questions={[
          { q: "Electricity needs what to flow?", options: ["A complete loop", "Just a battery", "Only a bulb"], answer: 0, explain: "A closed circuit loop!" },
          { q: "In a SERIES circuit with 2 bulbs, each bulb is...", options: ["Brighter", "Dimmer (shares voltage)", "The same"], answer: 1, explain: "They share the voltage." },
          { q: "What does a switch do?", options: ["Makes light", "Opens/closes the loop", "Adds voltage"], answer: 1, explain: "Open = no flow; closed = flow!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ============ 4. WAVE SIMULATOR ============ */
export function WaveSimulator({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [freq, setFreq] = useState(2);
  const [amp, setAmp] = useState(50);
  const [speed, setSpeed] = useState(100);
  const [longitudinal, setLongitudinal] = useState(false);
  const [interference, setInterference] = useState(false);
  const [sound, setSound] = useState(false);
  const { recordProgress } = useAppStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0; let t = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 440);
    const draw = () => {
      t += speed / 3000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#334155";
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      const wave = (x: number, phase = 0) => Math.sin((x / W) * Math.PI * 2 * freq + t * 4 + phase) * amp * 1.6;
      if (longitudinal) {
        for (let i = 0; i < 40; i++) {
          const x = (i / 40) * W;
          const compression = Math.sin((i / 40) * Math.PI * 2 * freq + t * 4);
          const px = x + compression * amp;
          ctx.beginPath(); ctx.arc(px, H / 2, 10, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236,72,153,${0.4 + compression * 0.4})`; ctx.fill();
        }
      } else {
        ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 6; ctx.beginPath();
        for (let x = 0; x < W; x += 4) {
          const y = H / 2 + wave(x);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (interference) {
          ctx.strokeStyle = "#f472b6"; ctx.lineWidth = 4; ctx.beginPath();
          for (let x = 0; x < W; x += 4) {
            const y = H / 2 + Math.sin((x / W) * Math.PI * 2 * freq * 1.5 + t * 4) * amp * 1.2;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 5; ctx.setLineDash([10, 6]); ctx.beginPath();
          for (let x = 0; x < W; x += 4) {
            const y = H / 2 + (wave(x) + Math.sin((x / W) * Math.PI * 2 * freq * 1.5 + t * 4) * amp * 1.2) / 2;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke(); ctx.setLineDash([]);
        }
        // crest/trough markers
        ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif";
        ctx.fillText("λ wavelength", W / 2 - 60, 40);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [freq, amp, speed, longitudinal, interference]);

  const playTone = () => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ac = new AC();
      const o = ac.createOscillator(); const gn = ac.createGain();
      o.frequency.value = 110 * freq; gn.gain.value = 0.15;
      o.connect(gn); gn.connect(ac.destination); o.start();
      setSound(true);
      setTimeout(() => { o.stop(); ac.close(); setSound(false); }, 1200);
    } catch {}
  };

  return (
    <SimulationShell title="Wave Simulator" icon="🌊"
      controls={<>
        <Slider label="Frequency" value={freq} min={1} max={8} onChange={setFreq} format={(v) => `${v} Hz`} />
        <Slider label="Amplitude" value={amp} min={10} max={90} onChange={setAmp} />
        <Slider label="Speed" value={speed} min={20} max={200} onChange={setSpeed} />
        <div className="flex gap-2">
          <Button size="sm" variant={!longitudinal ? "default" : "outline"} onClick={() => setLongitudinal(false)} className="flex-1">〰️ Transverse</Button>
          <Button size="sm" variant={longitudinal ? "default" : "outline"} onClick={() => setLongitudinal(true)} className="flex-1">🔊 Longitudinal</Button>
        </div>
        <Button size="sm" variant={interference ? "default" : "outline"} onClick={() => setInterference(!interference)} className="w-full">🌊 Interference {interference ? "ON" : "OFF"}</Button>
        <Button size="sm" variant="fun" onClick={playTone} className="w-full">{sound ? "🔊 Playing..." : "▶️ Hear this frequency"}</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🔁 Frequency: <b>{freq} Hz</b> {freq >= 5 ? "(high pitch!)" : "(low pitch)"}</p><p>📏 Amplitude: <b>{amp}</b> (volume)</p><p className="text-xs text-slate-500">High frequency = high pitch. Big amplitude = loud!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "High FREQUENCY sound is...", options: ["Louder", "Higher pitched", "Longer"], answer: 1, explain: "Frequency = pitch!" },
        { q: "Big AMPLITUDE sound is...", options: ["Louder", "Higher", "Faster"], answer: 0, explain: "Amplitude = volume!" },
        { q: "Sound needs what to travel?", options: ["Air or matter", "Empty space", "Nothing"], answer: 0, explain: "No air in space = silence!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ============ 5. GRAVITY & ORBITS ============ */
export function GravityOrbits({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"drop" | "orbit">("drop");
  const [planet, setPlanet] = useState("earth");
  const [dropY, setDropY] = useState(0);
  const [dropping, setDropping] = useState(false);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const planets: Record<string, { g: number; emoji: string; color: string }> = {
    earth: { g: 9.8, emoji: "🌍", color: "#3b82f6" }, moon: { g: 1.6, emoji: "🌙", color: "#94a3b8" },
    mars: { g: 3.7, emoji: "🔴", color: "#ef4444" }, jupiter: { g: 24.8, emoji: "🟠", color: "#f59e0b" },
  };
  const dropTime = Math.sqrt((2 * 10) / planets[planet].g).toFixed(2);
  const weight = ((30 * planets[planet].g) / 9.8).toFixed(1);
  const { recordProgress } = useAppStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0; let a = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 440);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);
      // stars
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 80; i++) ctx.fillRect((i * 137) % W, (i * 89) % H, 3, 3);
      if (mode === "drop") {
        ctx.font = "100px sans-serif"; ctx.fillText(planets[planet].emoji, W / 2 - 60, H - 40);
        if (dropping) {
          setDropY((y) => {
            const ny = y + planets[planet].g * 0.06;
            if (ny > 100) { setDropping(false); return 0; }
            return ny;
          });
        }
        ctx.font = "60px sans-serif"; ctx.fillText("🍎", W / 2 - 30, 80 + dropY * 2.4);
      } else {
        a += 0.008 * orbitSpeed;
        ctx.beginPath(); ctx.arc(W / 2, H / 2, 46, 0, Math.PI * 2); ctx.fillStyle = "#fbbf24"; ctx.fill();
        ctx.font = "44px sans-serif"; ctx.fillText("☀️", W / 2 - 24, H / 2 + 16);
        const orbits = [{ r: 90, c: "#94a3b8", e: "🪨", s: 2.4 }, { r: 140, c: "#3b82f6", e: "🌍", s: 1.6 }, { r: 195, c: "#ef4444", e: "🔴", s: 1.1 }];
        orbits.forEach((o) => {
          ctx.beginPath(); ctx.arc(W / 2, H / 2, o.r, 0, Math.PI * 2); ctx.strokeStyle = "#334155"; ctx.stroke();
          const ang = a * o.s;
          const x = W / 2 + Math.cos(ang) * o.r, y = H / 2 + Math.sin(ang) * o.r;
          ctx.font = "34px sans-serif"; ctx.fillText(o.e, x - 17, y + 12);
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mode, planet, dropping, orbitSpeed]);

  return (
    <SimulationShell title="Gravity & Orbits" icon="🪐"
      controls={<>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "drop" ? "default" : "outline"} onClick={() => setMode("drop")} className="flex-1">🍎 Drop</Button>
          <Button size="sm" variant={mode === "orbit" ? "default" : "outline"} onClick={() => setMode("orbit")} className="flex-1">🪐 Orbits</Button>
        </div>
        {mode === "drop" ? <>
          <label className="block text-sm font-medium">Planet
            <select value={planet} onChange={(e) => setPlanet(e.target.value)} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold">
              {Object.entries(planets).map(([k, p]) => <option key={k} value={k}>{p.emoji} {k} ({p.g})</option>)}
            </select></label>
          <Button variant="fun" className="w-full" onClick={() => { setDropY(0); setDropping(true); }}>🍎 DROP APPLE</Button>
        </> : <Slider label="Time speed" value={orbitSpeed} min={1} max={50} onChange={(v) => setOrbitSpeed(v / 10)} format={() => `${(orbitSpeed).toFixed(1)}×`} />}
        <Button variant="secondary" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 120, score: 90, status: "completed" })}>✅ Mission complete!</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>⏱️ 10 m fall time: <b>{dropTime} s</b></p><p>⚖️ You'd weigh: <b>{weight} kg</b> (vs 30 kg Earth)</p><p className="text-xs text-slate-500">Orbiting = falling forever around the planet!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "Why do astronauts float in the space station?", options: ["No gravity", "They're falling around Earth", "Magic"], answer: 1, explain: "Constant free-fall = weightlessness!" },
        { q: "You weigh the MOST on...", options: ["The Moon", "Mars", "Jupiter"], answer: 2, explain: "Jupiter's gravity is strongest!" },
        { q: "Farther planets have...", options: ["Shorter years", "Longer years", "No years"], answer: 1, explain: "Bigger orbit = longer trip!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ============ 6. RAMP & FRICTION ============ */
export function RampFriction({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(30);
  const [friction, setFriction] = useState(0.3);
  const [shape, setShape] = useState("ball");
  const [pos, setPos] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [speed, setSpeed] = useState(0);
  const { recordProgress } = useAppStore();
  const surfaces = [{ name: "🧊 Ice", f: 0.05 }, { name: "🪵 Wood", f: 0.3 }, { name: "🧶 Carpet", f: 0.7 }, { name: "🧲 Rubber", f: 1.0 }];

  useEffect(() => {
    if (!rolling) return;
    const accel = Math.max(0.02, 9.8 * Math.sin((angle * Math.PI) / 180) * (1 - friction) * 0.02);
    const t = setInterval(() => {
      setSpeed((s) => s + accel * 10);
      setPos((p) => {
        if (p >= 100) {
          clearInterval(t); setRolling(false);
          recordProgress(moduleId, { timeSpentSeconds: 45 });
          return 100;
        }
        return p + 1 + accel * 8;
      });
    }, 50);
    return () => clearInterval(t);
  }, [rolling]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 400);
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#fefce8"); bg.addColorStop(1, "#fff");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const rad = (angle * Math.PI) / 180;
    const x0 = 80, y0 = 60, len = W - 200;
    const x1 = x0 + Math.cos(rad) * len, y1 = y0 + Math.sin(rad) * len;
    ctx.strokeStyle = "#92400e"; ctx.lineWidth = 18; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = "#166534"; ctx.fillRect(0, y1 + 10, W, H - y1);
    const bx = x0 + (x1 - x0) * (pos / 100), by = y0 + (y1 - y0) * (pos / 100) - 28;
    ctx.font = "56px sans-serif";
    ctx.fillText(shape === "ball" ? "⚽" : shape === "box" ? "📦" : "🛞", bx - 28, by + 28);
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 24px sans-serif";
    ctx.fillText(`💨 ${speed.toFixed(1)} m/s`, 30, 50);
  }, [angle, friction, shape, pos, speed]);

  return (
    <SimulationShell title="Ramp & Friction Lab" icon="📐"
      controls={<>
        <Slider label="Ramp angle" value={angle} min={5} max={60} onChange={setAngle} format={(v) => `${v}°`} />
        <div className="grid grid-cols-2 gap-2">
          {surfaces.map((s) => (
            <Button key={s.name} size="sm" variant={Math.abs(friction - s.f) < 0.01 ? "default" : "outline"} onClick={() => setFriction(s.f)}>{s.name}</Button>
          ))}
        </div>
        <div className="flex gap-2">
          {["ball", "box", "wheel"].map((s) => (
            <Button key={s} size="sm" variant={shape === s ? "default" : "outline"} onClick={() => setShape(s)} className="flex-1 capitalize">{s === "ball" ? "⚽" : s === "box" ? "📦" : "🛞"}</Button>
          ))}
        </div>
        <Button variant="fun" className="w-full" onClick={() => { setPos(0); setSpeed(0); setRolling(true); }}>{rolling ? "Rolling... 🌀" : "▶️ ROLL!"}</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>💨 Speed: <b>{speed.toFixed(1)} m/s</b></p><p>🧱 Friction: <b>{friction}</b></p><p className="text-xs text-slate-500">Steeper + smoother = faster!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[260px]" />
      <Quiz questions={[
        { q: "Friction does what?", options: ["Speeds things up", "Slows things down", "Nothing"], answer: 1, explain: "Friction opposes motion!" },
        { q: "Which surface is fastest?", options: ["Carpet", "Rubber", "Ice"], answer: 2, explain: "Ice has the least friction!" },
        { q: "Steeper ramp means...", options: ["Slower", "Faster acceleration", "No change"], answer: 1, explain: "More downhill pull!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ============ 7. BALANCE & LEVERS ============ */
export function BalanceLevers({ moduleId }: { moduleId: string }) {
  const [left, setLeft] = useState<Array<{ w: number; d: number }>>([{ w: 5, d: 2 }]);
  const [right, setRight] = useState<Array<{ w: number; d: number }>>([{ w: 2, d: 3 }]);
  const [newW, setNewW] = useState(3);
  const [newD, setNewD] = useState(2);
  const { recordProgress } = useAppStore();
  const torque = (arr: Array<{ w: number; d: number }>) => arr.reduce((s, x) => s + x.w * x.d, 0);
  const lt = torque(left), rt = torque(right);
  const tilt = Math.max(-18, Math.min(18, (rt - lt) * 2));
  const balanced = Math.abs(lt - rt) < 0.01 && lt > 0;

  useEffect(() => {
    if (balanced) recordProgress(moduleId, { timeSpentSeconds: 60, score: 100, status: "completed" });
  }, [balanced]);

  const Beam = ({ side, items, setItems, color }: any) => (
    <div className="space-y-2">
      <p className="font-bold text-sm">{side === "L" ? "⬅️ Left side" : "Right side ➡️"}</p>
      {items.map((it: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-2 py-1">
          <span>🏋️ {it.w}kg × {it.d}m</span>
          <button className="ml-auto text-red-500 font-bold" onClick={() => setItems(items.filter((_: any, j: number) => j !== i))}>✕</button>
        </div>
      ))}
      <div className="flex gap-1">
        <select value={newW} onChange={(e) => setNewW(Number(e.target.value))} className="border-2 border-slate-200 rounded-lg px-1 py-1 text-sm font-bold">
          {[1, 2, 3, 5, 10].map((w) => <option key={w} value={w}>{w}kg</option>)}
        </select>
        <select value={newD} onChange={(e) => setNewD(Number(e.target.value))} className="border-2 border-slate-200 rounded-lg px-1 py-1 text-sm font-bold">
          {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}m</option>)}
        </select>
        <Button size="sm" onClick={() => setItems([...items, { w: newW, d: newD }])}>+ Add</Button>
      </div>
    </div>
  );

  return (
    <SimulationShell title="Balance & Levers" icon="⚖️"
      controls={<>
        <Beam side="L" items={left} setItems={setLeft} color="blue" />
        <Beam side="R" items={right} setItems={setRight} color="red" />
        <Button variant="secondary" size="sm" onClick={() => { setLeft([]); setRight([]); }}>🧹 Clear all</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>⬅️ Left torque: <b>{lt}</b></p><p>➡️ Right torque: <b>{rt}</b></p><p className="font-bold text-lg">{balanced ? "🎉 PERFECTLY BALANCED!" : lt > rt ? "⬅️ Tips LEFT" : rt > lt ? "Tips RIGHT ➡️" : "Add weights!"}</p><p className="text-xs text-slate-500">Torque = weight × distance!</p></div>}>
      <div className="p-8 flex flex-col items-center">
        <div className="relative w-full max-w-md h-40">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-slate-500" />
          <div className="absolute bottom-[44px] left-0 right-0 h-4 bg-amber-600 rounded-full origin-center transition-transform" style={{ transform: `rotate(${tilt}deg)` }}>
            {left.map((it, i) => <span key={i} className="absolute text-2xl" style={{ left: `${50 - it.d * 9}%`, top: "-34px" }}>🏋️</span>)}
            {right.map((it, i) => <span key={i} className="absolute text-2xl" style={{ left: `${50 + it.d * 9}%`, top: "-34px" }}>🏋️</span>)}
          </div>
        </div>
        <Quiz questions={[
          { q: "Balance needs...", options: ["Equal weight", "Equal TORQUE both sides", "No weights"], answer: 1, explain: "Torque = weight × distance!" },
          { q: "A 1kg weight 4m out balances...", options: ["4kg at 1m", "1kg at 1m", "2kg at 1m"], answer: 0, explain: "1×4 = 4×1 = 4!" },
          { q: "The pivot point is called the...", options: ["Lever", "Fulcrum", "Torque"], answer: 1, explain: "The fulcrum!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ============ 8. COLLISION LAB ============ */
export function CollisionLab({ moduleId }: { moduleId: string }) {
  const [m1, setM1] = useState(2); const [v1, setV1] = useState(5);
  const [m2, setM2] = useState(2); const [v2, setV2] = useState(-3);
  const [elastic, setElastic] = useState(true);
  const [running, setRunning] = useState(false);
  const [x1, setX1] = useState(15); const [x2, setX2] = useState(75);
  const [out, setOut] = useState("");
  const { recordProgress } = useAppStore();

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setX1((a) => a + v1 * 0.35); setX2((b) => b + v2 * 0.35);
    }, 40);
    return () => clearInterval(t);
  }, [running, v1, v2]);

  useEffect(() => {
    if (running && Math.abs(x1 - x2) < 12) {
      setRunning(false);
      let nv1: number, nv2: number;
      if (elastic) {
        nv1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        nv2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
        setOut(`💥 BOING! Elastic! → Ball 1: ${nv1.toFixed(1)} m/s, Ball 2: ${nv2.toFixed(1)} m/s. Momentum conserved: ${(m1 * v1 + m2 * v2).toFixed(1)}!`);
      } else {
        const v = (m1 * v1 + m2 * v2) / (m1 + m2);
        nv1 = v; nv2 = v;
        setOut(`💥 THUD! Sticky! Both move together at ${v.toFixed(1)} m/s. Momentum conserved!`);
      }
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 85 });
    }
    if (x1 > 100 || x2 < 0) { setRunning(false); setX1(15); setX2(75); }
  }, [x1, x2]);

  const momentum = (m1 * v1 + m2 * v2).toFixed(1);

  return (
    <SimulationShell title="Collision Lab" icon="💥"
      controls={<>
        <Slider label="🔵 Ball 1 mass" value={m1} min={1} max={8} onChange={setM1} format={(v) => `${v} kg`} />
        <Slider label="🔵 Ball 1 speed" value={v1} min={-8} max={8} onChange={setV1} />
        <Slider label="🔴 Ball 2 mass" value={m2} min={1} max={8} onChange={setM2} format={(v) => `${v} kg`} />
        <Slider label="🔴 Ball 2 speed" value={v2} min={-8} max={8} onChange={setV2} />
        <div className="flex gap-2">
          <Button size="sm" variant={elastic ? "default" : "outline"} onClick={() => setElastic(true)} className="flex-1">🏀 Bouncy</Button>
          <Button size="sm" variant={!elastic ? "default" : "outline"} onClick={() => setElastic(false)} className="flex-1">🧲 Sticky</Button>
        </div>
        <Button variant="fun" className="w-full" onClick={() => { setX1(15); setX2(75); setOut(""); setRunning(true); }}>💥 SMASH!</Button>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>➡️ Total momentum: <b>{momentum}</b></p><p>🔵 KE: <b>{(0.5 * m1 * v1 * v1).toFixed(0)}J</b> 🔴 KE: <b>{(0.5 * m2 * v2 * v2).toFixed(0)}J</b></p>{out && <p className="font-bold text-blue-700">{out}</p>}</div>}
      onSave={() => saveCreation("My Collision", "simulation_state", { m1, v1, m2, v2, elastic }, { moduleId, subjectId: "physics" })}>
      <div className="p-6">
        <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden">
          <div className="absolute bottom-4 top-4 left-1/2 w-0.5 bg-red-400" />
          <div className="absolute top-1/2 -translate-y-1/2 text-4xl transition-none" style={{ left: `${x1}%` }}>🔵</div>
          <div className="absolute top-1/2 -translate-y-1/2 text-4xl" style={{ left: `${x2}%` }}>🔴</div>
        </div>
        <Quiz questions={[
          { q: "In EVERY collision, what is conserved?", options: ["Speed", "Momentum", "Color"], answer: 1, explain: "Total momentum never changes!" },
          { q: "Elastic means...", options: ["Sticky", "Bouncy, no energy lost", "Explosive"], answer: 1, explain: "Like billiard balls!" },
          { q: "Heavy truck vs bike at same speed: more momentum?", options: ["Bike", "Truck", "Equal"], answer: 1, explain: "Momentum = mass × velocity!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
