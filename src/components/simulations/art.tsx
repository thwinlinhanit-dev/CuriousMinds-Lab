"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- DRAWING CANVAS ---- */
export function DrawingCanvas({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(8);
  const [tool, setTool] = useState("brush");
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const c = canvasRef.current!;
    c.width = c.offsetWidth * 2; c.height = 560;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const stamp = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.font = `${size * 6}px sans-serif`;
    ctx.fillText(tool, x - size * 2, y + size * 2);
  };
  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    if (["⭐", "❤️", "🌸", "🐾"].includes(tool)) { stamp(x, y); last.current = { x, y }; return; }
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? size * 4 : size * 2;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(x, y); ctx.stroke();
    last.current = { x, y };
  };
  const save = async () => {
    const thumb = canvasRef.current!.toDataURL("image/png").slice(0, 5000);
    await saveCreation("My Artwork", "art", { tool, color }, { moduleId, subjectId: "art", thumbnail: undefined });
    recordProgress(moduleId, { timeSpentSeconds: 120, score: 90, status: "completed" });
  };
  return (
    <SimulationShell title="Digital Canvas" icon="🖌️"
      controls={<>
        <div className="flex gap-1.5 flex-wrap">{["brush", "eraser", "⭐", "❤️", "🌸", "🐾"].map((t) => <Button key={t} size="sm" variant={tool === t ? "default" : "outline"} onClick={() => setTool(t)}>{t === "brush" ? "🖌️" : t === "eraser" ? "🧽" : t}</Button>)}</div>
        <div className="flex gap-1.5 flex-wrap">{["#0f172a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"].map((c) => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-4 ${color === c ? "border-slate-800" : "border-slate-200"}`} style={{ backgroundColor: c }} />)}</div>
        <Slider label="Brush size" value={size} min={2} max={24} onChange={setSize} />
        <Button size="sm" variant="outline" onClick={() => { const c = canvasRef.current!; const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }}>🧹 Clear</Button>
        <SaveButton onSave={save} />
      </>}
      dataPanel={<div className="text-sm"><p>🖌️ Drag to paint!</p><p>⭐ Stamps for fun</p><p>🧽 Eraser fixes mistakes</p><p className="text-xs text-slate-500">Blue pigment was once worth more than gold!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[320px] md:h-[400px] touch-none cursor-crosshair bg-white" onPointerDown={(e) => { drawing.current = true; last.current = pos(e); draw(e); }} onPointerMove={draw} onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
      <Quiz questions={[
        { q: "Red + yellow makes...", options: ["Green", "Orange", "Purple"], answer: 1, explain: "Warm mix!" },
        { q: "Blue + yellow makes...", options: ["Green", "Orange", "Brown"], answer: 0, explain: "Leaf green!" },
        { q: "Foreground means...", options: ["Far away", "Front/closest", "The sky"], answer: 1, explain: "Front first!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- COLOR LAB ---- */
function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
export function ColorLab({ moduleId }: { moduleId: string }) {
  const [c1, setC1] = useState("#ef4444");
  const [c2, setC2] = useState("#3b82f6");
  const [ratio, setRatio] = useState(50);
  const [mixes, setMixes] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const mixed = mixHex(c1, c2, ratio / 100);
  const keep = () => {
    setMixes([mixed, ...mixes].slice(0, 12));
    recordProgress(moduleId, { timeSpentSeconds: 25, score: 85 });
    if (mixes.length + 1 >= 6) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 95 });
  };
  return (
    <SimulationShell title="Color Lab" icon="🌈"
      controls={<>
        <label className="flex items-center gap-2 text-sm font-bold">Color 1 <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="w-12 h-10" /></label>
        <label className="flex items-center gap-2 text-sm font-bold">Color 2 <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="w-12 h-10" /></label>
        <Slider label="Mix ratio" value={ratio} min={0} max={100} onChange={setRatio} format={(v) => `${v}%`} />
        <Button variant="fun" onClick={keep} className="w-full">🧪 Keep this mix!</Button>
      </>}
      dataPanel={<div className="text-sm"><p>🔴🟡🔵 Primaries can't be mixed!</p><p>🟠🟢🟣 Secondaries = mixed pairs</p><p>Complements (opposites) POP! 💥</p></div>}>
      <div className="p-6">
        <div className="flex h-28 rounded-2xl overflow-hidden border-4 border-slate-200">
          <div className="flex-1" style={{ backgroundColor: c1 }} /><div className="flex-[2]" style={{ backgroundColor: mixed }}><p className="text-center font-mono font-bold text-white drop-shadow mt-10">{mixed}</p></div><div className="flex-1" style={{ backgroundColor: c2 }} />
        </div>
        <div className="mt-3"><p className="font-bold text-sm">🎨 My palette ({mixes.length}/6):</p><div className="flex gap-1.5 flex-wrap mt-1">{mixes.map((m, i) => <div key={i} className="w-12 h-12 rounded-xl border-2" style={{ backgroundColor: m }} title={m} />)}{mixes.length === 0 && <p className="text-sm text-slate-400">Mix and keep colors!</p>}</div></div>
        <div className="mt-3"><p className="font-bold text-sm">🌡️ Warm vs Cool:</p><div className="flex h-10 rounded-xl overflow-hidden"><div className="flex-1 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 flex items-center justify-center font-bold">🔥 Warm</div><div className="flex-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">❄️ Cool</div></div></div>
        <Quiz questions={[
          { q: "Primary colors are...", options: ["Orange, green, purple", "Red, blue, yellow", "Black, white, gray"], answer: 1, explain: "Can't be mixed — they make everything!" },
          { q: "Blue's complement (opposite) is...", options: ["Green", "Orange", "Blue"], answer: 1, explain: "Opposites pop!" },
          { q: "Adding white makes a...", options: ["Shade", "Tint (lighter)", "Nothing"], answer: 1, explain: "Tint = lighter, shade = darker!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- GEOMETRIC ART ---- */
export function GeometricArt({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sym, setSym] = useState(8);
  const [sides, setSides] = useState(3);
  const [hue, setHue] = useState(280);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const c = canvasRef.current!;
    c.width = c.offsetWidth * 2; c.height = 440;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, c.width, c.height);
    const cx = c.width / 2, cy = c.height / 2;
    for (let ring = 1; ring <= 6; ring++) {
      for (let i = 0; i < sym; i++) {
        const a = (i / sym) * Math.PI * 2;
        const x = cx + Math.cos(a) * ring * 52, y = cy + Math.sin(a) * ring * 52;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.fillStyle = `hsla(${(hue + ring * 25 + i * 8) % 360}, 85%, 60%, 0.9)`;
        ctx.beginPath();
        for (let s = 0; s < sides; s++) {
          const sa = (s / sides) * Math.PI * 2;
          const px = Math.cos(sa) * 22, py = Math.sin(sa) * 22;
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    recordProgress(moduleId, { timeSpentSeconds: 15 });
  }, [sym, sides, hue]);
  return (
    <SimulationShell title="Geometric Art Maker" icon="🔷"
      controls={<>
        <Slider label="Symmetry arms" value={sym} min={3} max={16} onChange={setSym} />
        <Slider label="Shape sides" value={sides} min={3} max={8} onChange={setSides} />
        <Slider label="Color mood" value={hue} min={0} max={360} onChange={setHue} />
        <Button variant="secondary" size="sm" onClick={() => { const a = canvasRef.current!.toDataURL(); const l = document.createElement("a"); l.download = "mandala.png"; l.href = a; l.click(); recordProgress(moduleId, { timeSpentSeconds: 60, score: 90, status: "completed" }); }}>⬇️ Download mandala</Button>
      </>}
      dataPanel={<div className="text-sm"><p>🔷 Tessellation = tiles, no gaps!</p><p>🕌 Alhambra palace: 800-year-old math art</p><p>🐝 Bees use hexagons — strongest!</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "Shapes tiling with NO gaps are called...", options: ["Mandalas", "Tessellations", "Doodles"], answer: 1, explain: "Like honeycomb!" },
        { q: "Mandala art is...", options: ["Circular + symmetric", "Random", "Only black"], answer: 0, explain: "Radial symmetry!" },
        { q: "Escher was famous for...", options: ["Impossible tessellations", "Photos", "Songs"], answer: 0, explain: "Lizards becoming birds!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- PIXEL ART ---- */
const PALETTE = ["#0f172a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#ffffff", "#94a3b8"];
export function PixelArt({ moduleId }: { moduleId: string }) {
  const [size] = useState(16);
  const [cells, setCells] = useState<string[]>(Array(256).fill("#ffffff"));
  const [color, setColor] = useState("#ef4444");
  const [mirror, setMirror] = useState(true);
  const paint = useRef(false);
  const { recordProgress } = useAppStore();
  const set = (i: number) => {
    setCells((prev) => {
      const n = [...prev];
      n[i] = color;
      if (mirror) { const x = i % size; n[i - x + (size - 1 - x)] = color; }
      return n;
    });
  };
  const filled = cells.filter((c) => c !== "#ffffff").length;
  return (
    <SimulationShell title="Pixel Art Editor" icon="👾"
      controls={<>
        <div className="grid grid-cols-5 gap-1.5">{PALETTE.map((c) => <button key={c} onClick={() => setColor(c)} className={`h-9 rounded-lg border-4 ${color === c ? "border-slate-800" : "border-slate-200"}`} style={{ backgroundColor: c }} />)}</div>
        <Button size="sm" variant={mirror ? "default" : "outline"} onClick={() => setMirror(!mirror)} className="w-full">🪞 Mirror {mirror ? "ON" : "OFF"}</Button>
        <Button size="sm" variant="outline" onClick={() => setCells(Array(256).fill("#ffffff"))}>🧹 Clear</Button>
        <SaveButton onSave={async () => { await saveCreation("My Sprite", "art", { cells, size }, { moduleId, subjectId: "art" }); recordProgress(moduleId, { timeSpentSeconds: 120, score: 95, status: "completed" }); }} label="💾 Save sprite" />
        <p className="text-xs text-slate-500">{filled} pixels painted {filled >= 40 ? "🎉 Artist!" : ""}</p>
      </>}
      dataPanel={<div className="text-sm"><p>👾 Mario was 16×16!</p><p>🎨 Limited colors = clever choices</p><p>🔍 Zoom into any photo: pixels!</p></div>}
      onSave={() => saveCreation("My Sprite", "art", { cells, size }, { moduleId, subjectId: "art" })}>
      <div className="p-4">
        <div className="grid gap-px bg-slate-300 border-4 border-slate-300 rounded-xl overflow-hidden touch-none select-none mx-auto" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, maxWidth: "420px" }}
          onPointerDown={() => (paint.current = true)} onPointerUp={() => (paint.current = false)} onPointerLeave={() => (paint.current = false)}>
          {cells.map((c, i) => (
            <div key={i} className="aspect-square" style={{ backgroundColor: c }}
              onPointerDown={() => set(i)} onPointerEnter={(e) => { if (paint.current && e.buttons) set(i); }} />
          ))}
        </div>
        <Quiz questions={[
          { q: "A pixel is...", options: ["A sound", "A tiny image square", "A game"], answer: 1, explain: "Picture element!" },
          { q: "A sprite is...", options: ["A drink", "A small game graphic", "A bug"], answer: 1, explain: "Mario = sprite!" },
          { q: "Old games used pixel art because...", options: ["It saved memory", "It was ugly", "No reason"], answer: 0, explain: "Tiny files, big charm!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- SPIROGRAPH ---- */
export function Spirograph({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outer, setOuter] = useState(96);
  const [inner, setInner] = useState(52);
  const [offset, setOffset] = useState(70);
  const [hue, setHue] = useState(300);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const c = canvasRef.current!;
    c.width = c.offsetWidth * 2; c.height = 440;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    const cx = c.width / 2, cy = c.height / 2, scale = 2.2;
    const R = outer * scale, r = inner * scale, d = (offset / 100) * r;
    ctx.strokeStyle = `hsl(${hue}, 80%, 45%)`; ctx.lineWidth = 4; ctx.beginPath();
    const turns = inner / gcd(outer, inner);
    for (let t = 0; t <= Math.PI * 2 * turns; t += 0.01) {
      const x = cx + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = cy + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }
    recordProgress(moduleId, { timeSpentSeconds: 15 });
  }, [outer, inner, offset, hue]);
  const petals = inner / gcd(outer, inner);
  function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }
  return (
    <SimulationShell title="Spirograph Designer" icon="🌀"
      controls={<>
        <Slider label="Outer gear teeth" value={outer} min={48} max={144} step={8} onChange={setOuter} />
        <Slider label="Inner gear teeth" value={inner} min={24} max={120} step={4} onChange={setInner} />
        <Slider label="Pen position" value={offset} min={10} max={100} onChange={setOffset} format={(v) => `${v}%`} />
        <Slider label="Color" value={hue} min={0} max={360} onChange={setHue} />
        <Button variant="secondary" size="sm" onClick={() => recordProgress(moduleId, { timeSpentSeconds: 90, score: 90, status: "completed" })}>✅ Master of gears!</Button>
      </>}
      dataPanel={<div className="text-sm"><p>🌸 Petals: <b>{Math.round(petals)}</b></p><p>📐 Ratio {outer}:{inner} decides!</p><p className="text-xs text-slate-500">Same math as planet gears! 🪐</p></div>}>
      <canvas ref={canvasRef} className="w-full h-[280px] md:h-[320px]" />
      <Quiz questions={[
        { q: "Spirograph patterns come from...", options: ["Random scribbles", "Gear ratios", "Wind"], answer: 1, explain: "Teeth counts decide petals!" },
        { q: "Bigger ratio difference = ...", options: ["Fewer petals", "More petals", "No change"], answer: 1, explain: "Try 144 vs 24!" },
        { q: "Spirograph was invented as a...", options: ["Toy (1965!)", "Car", "Phone"], answer: 0, explain: "Classic toy, real math!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- FLIPBOOK ---- */
export function Flipbook({ moduleId }: { moduleId: string }) {
  const [frames, setFrames] = useState<string[][]>(Array.from({ length: 6 }).map(() => []));
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(6);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setCur((c) => (c + 1) % frames.length), 1000 / fps);
    return () => clearInterval(iv);
  }, [playing, fps, frames.length]);
  const ballX = [20, 35, 50, 65, 80, 65];
  const ballY = [70, 50, 30, 50, 70, 50];
  return (
    <SimulationShell title="Flipbook Animator" icon="🎬"
      controls={<>
        <Button variant={playing ? "default" : "fun"} onClick={() => { setPlaying(!playing); recordProgress(moduleId, { timeSpentSeconds: 60, score: 85, status: "completed" }); }} className="w-full">{playing ? "⏸️ Pause" : "▶️ Play cartoon"}</Button>
        <Slider label="Speed (FPS)" value={fps} min={2} max={12} onChange={setFps} />
        <p className="text-xs text-slate-500">Movies: 24 fps! More = smoother.</p>
      </>}
      dataPanel={<div className="text-sm"><p>🎞️ Frame {cur + 1}/{frames.length}</p><p>👁️ Persistence of vision = still images look alive!</p><p> squash + stretch = juicy motion!</p></div>}>
      <div className="p-6">
        <div className="relative h-52 bg-white border-4 border-slate-200 rounded-xl overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          {cur > 0 && <div className="absolute text-5xl opacity-25" style={{ left: `${ballX[cur - 1]}%`, top: `${ballY[cur - 1]}%` }}>🏀</div>}
          <div className="absolute text-6xl transition-all" style={{ left: `${ballX[cur]}%`, top: `${ballY[cur]}%`, transform: `scaleY(${cur % 2 ? 0.85 : 1.1})` }}>🏀</div>
          <div className="absolute bottom-2 inset-x-0 h-3 bg-green-300" />
        </div>
        <div className="flex gap-1.5 mt-2 justify-center">
          {frames.map((_, i) => (
            <button key={i} onClick={() => { setCur(i); setPlaying(false); }} className={`w-12 h-12 rounded-lg border-4 text-xl ${i === cur ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`}>🏀<span className="block text-[9px]">{i + 1}</span></button>
          ))}
        </div>
        <Quiz questions={[
          { q: "Animation works because of...", options: ["Magic", "Persistence of vision", "Loud sounds"], answer: 1, explain: "Eyes hold images briefly!" },
          { q: "24 fps means...", options: ["24 drawings per second", "24 colors", "24 minutes"], answer: 0, explain: "Frames per second!" },
          { q: "Squash & stretch makes motion...", options: ["Boring", "Juicy + alive", "Invisible"], answer: 1, explain: "Bouncy balls squash!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
