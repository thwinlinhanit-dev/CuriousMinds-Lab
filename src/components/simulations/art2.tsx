"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- PERSPECTIVE STUDIO ---- */
export function PerspectiveStudio({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vpx, setVpx] = useState(50);
  const [horizon, setHorizon] = useState(45);
  const [mode, setMode] = useState<"road" | "room" | "city">("road");
  const [nailed, setNailed] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 420;
    const W = c.width, H = c.height;
    const vx = (vpx / 100) * W, hy = (horizon / 100) * H;
    // sky + ground
    ctx.fillStyle = "#bae6fd"; ctx.fillRect(0, 0, W, hy);
    ctx.fillStyle = "#86efac"; ctx.fillRect(0, hy, W, H - hy);
    ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(W - 90, 70, 44, 0, Math.PI * 2); ctx.fill();
    // horizon + vanishing point
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(W, hy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(vx, hy, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif"; ctx.fillText("✕", vx - 8, hy + 8);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 5;
    if (mode === "road") {
      ctx.fillStyle = "#475569";
      ctx.beginPath(); ctx.moveTo(W * 0.3, H); ctx.lineTo(W * 0.7, H); ctx.lineTo(vx + 8, hy); ctx.lineTo(vx - 8, hy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#fde047"; ctx.lineWidth = 5; ctx.setLineDash([24, 18]);
      ctx.beginPath(); ctx.moveTo(W / 2, H); ctx.lineTo(vx, hy); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "60px sans-serif";
      ctx.fillText("🌳", W * 0.15, H - 40); ctx.fillText("🌳", W * 0.8, H - 60);
      ctx.font = "40px sans-serif";
      ctx.fillText("🌳", vx - 90, hy + 44); ctx.fillText("🌳", vx + 60, hy + 40);
    } else if (mode === "room") {
      // back wall
      const bw = W * 0.3, bh = H * 0.3;
      ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 6;
      ctx.strokeRect(vx - bw / 2, hy - bh / 2, bw, bh);
      // corners to canvas corners
      ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 4;
      const corners: Array<[number, number]> = [[vx - bw / 2, hy - bh / 2], [vx + bw / 2, hy - bh / 2], [vx - bw / 2, hy + bh / 2], [vx + bw / 2, hy + bh / 2]];
      const targets: Array<[number, number]> = [[0, 0], [W, 0], [0, H], [W, H]];
      corners.forEach((cn, i) => { ctx.beginPath(); ctx.moveTo(cn[0], cn[1]); ctx.lineTo(targets[i][0], targets[i][1]); ctx.stroke(); });
      ctx.font = "56px sans-serif"; ctx.fillText("🖼️", vx - 28, hy + 10); ctx.fillText("🛋️", vx - 90, hy + bh / 2 - 10);
    } else {
      // city: boxes shrinking to VP
      for (let i = 0; i < 5; i++) {
        const t = i / 5;
        const bx = W * 0.1 + t * (vx - W * 0.1);
        const by = H - t * (H - hy);
        const s = 90 * (1 - t * 0.8);
        ctx.fillStyle = `hsl(${210 + i * 10}, 60%, ${55 - i * 5}%)`;
        ctx.fillRect(bx - s / 2, by - s * 1.4, s, s * 1.4);
        ctx.fillStyle = "#fef08a";
        for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 2; wx++) ctx.fillRect(bx - s / 2 + 8 + wx * (s / 2), by - s * 1.4 + 8 + wy * (s / 3.4), s / 4, s / 5);
      }
    }
  }, [vpx, horizon, mode]);
  const nail = () => {
    if (!nailed.includes(mode)) {
      const n = [...nailed, mode];
      setNailed(n);
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 90 });
      if (n.length >= 3) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
  };
  return (
    <SimulationShell title="Perspective Studio" icon="🛤️"
      controls={<>
        <div className="flex gap-1.5">{(["road", "room", "city"] as const).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="flex-1 capitalize">{m === "road" ? "🛤️ Road" : m === "room" ? "🛋️ Room" : "🏙️ City"}</Button>
        ))}</div>
        <Slider label="Vanishing point ↔" value={vpx} min={10} max={90} onChange={setVpx} format={(v) => `${v}%`} />
        <Slider label="Horizon (eye level) ↕" value={horizon} min={15} max={80} onChange={setHorizon} format={(v) => `${v}%`} />
        <Button size="sm" variant="fun" onClick={nail} className="w-full">🔨 Nailed this scene! ({nailed.length}/3)</Button>
      </>}
      dataPanel={<div className="text-sm"><p>👁️ Horizon = YOUR eye level</p><p>✕ All parallels meet at the VP</p><p>🔍 Far = smaller + higher (up to horizon)</p></div>}
      onSave={() => saveCreation("Perspective Art", "art", { mode, vpx, horizon }, { moduleId, subjectId: "art" })}>
      <canvas ref={canvasRef} className="w-full h-[270px]" />
      <Quiz questions={[
        { q: "Parallel lines in perspective...", options: ["Stay parallel", "Meet at the vanishing point", "Curve"], answer: 1, explain: "Like train tracks!" },
        { q: "The horizon line shows...", options: ["The ground", "Your eye level", "The sky"], answer: 1, explain: "Crouch down — horizon drops!" },
        { q: "Far objects look...", options: ["Bigger", "Smaller", "Brighter"], answer: 1, explain: "Size shrinks with distance!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- PRINTMAKING ---- */
export function PrintmakingPress({ moduleId }: { moduleId: string }) {
  const [cells, setCells] = useState<boolean[]>(() => {
    const g = Array(64).fill(false);
    [10, 11, 12, 17, 21, 25, 29, 33, 37, 41, 45, 51, 52, 53].forEach((i) => (g[i] = true));
    return g;
  });
  const [ink, setInk] = useState("#1e40af");
  const [prints, setPrints] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const toggle = (i: number) => setCells(cells.map((c, j) => (j === i ? !c : c)));
  const press = () => {
    // mirror horizontally
    const mirrored = cells.map((_, i) => {
      const r = Math.floor(i / 8), c = i % 8;
      return cells[r * 8 + (7 - c)];
    });
    const key = mirrored.map((m) => (m ? "1" : "0")).join("") + ink;
    const n = [...prints, key];
    setPrints(n.slice(-4));
    recordProgress(moduleId, { timeSpentSeconds: 40, score: 85 });
    if (n.length >= 4) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
  };
  const Grid = ({ data, label }: { data: boolean[]; label: string }) => (
    <div>
      <p className="text-xs font-bold text-center mb-1">{label}</p>
      <div className="grid grid-cols-8 gap-px bg-amber-800 border-4 border-amber-800 rounded-lg overflow-hidden mx-auto" style={{ maxWidth: "220px" }}>
        {data.map((on, i) => (
          <div key={i} className="aspect-square" style={{ backgroundColor: on ? ink : "#fef3c7" }} />
        ))}
      </div>
    </div>
  );
  return (
    <SimulationShell title="Printmaking Press" icon="🖨️"
      controls={<>
        <p className="text-sm font-bold">🔪 Carve: tap squares (dark = inked!)</p>
        <div className="grid grid-cols-8 gap-px bg-amber-800 border-4 border-amber-800 rounded-lg overflow-hidden">
          {cells.map((on, i) => (
            <button key={i} onClick={() => toggle(i)} className="aspect-square" style={{ backgroundColor: on ? ink : "#fef3c7" }} />
          ))}
        </div>
        <div className="flex gap-1.5">{["#1e40af", "#b91c1c", "#15803d", "#0f172a", "#c026d3"].map((c) => (
          <button key={c} onClick={() => setInk(c)} className={`w-9 h-9 rounded-full border-4 ${ink === c ? "border-slate-800" : "border-slate-200"}`} style={{ backgroundColor: c }} />
        ))}</div>
        <Button variant="fun" onClick={press} className="w-full">🖨️ PRESS! Edition {Math.min(prints.length + 1, 4)}/4</Button>
        <p className="text-xs text-slate-500">Letters must be carved BACKWARDS — prints mirror!</p>
      </>}
      dataPanel={<div className="text-sm"><p>🪞 Press = mirror image!</p><p>🔪 Carve away the white</p><p>🔢 Edition of 4 = matching set</p></div>}
      onSave={() => saveCreation("My Print", "art", { cells, ink }, { moduleId, subjectId: "art" })}>
      <div className="p-4 flex gap-4 justify-center flex-wrap">
        <Grid data={cells.map((_, i) => { const r = Math.floor(i / 8), c = i % 8; return cells[r * 8 + (7 - c)]; })} label="🖨️ Latest print (mirrored!)" />
        <div>
          <p className="text-xs font-bold text-center mb-1">🗂️ Edition ({prints.length}/4)</p>
          <div className="flex gap-1">{[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-12 h-12 rounded border-2 border-slate-300 bg-white flex items-center justify-center text-xl">{i < prints.length ? "🖼️" : "·"}</div>
          ))}</div>
        </div>
        <Quiz questions={[
          { q: "Prints come out...", options: ["Same as stamp", "Mirrored", "Upside only"], answer: 1, explain: "Flip happens at press!" },
          { q: "To print the letter R, carve it...", options: ["Normal", "Backwards", "Twice"], answer: 1, explain: "Mirror of a mirror = normal!" },
          { q: "An edition is...", options: ["One print", "A matching set", "A book"], answer: 1, explain: "Numbered 1/4, 2/4..." },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- SCULPTURE 3D ---- */
type Blob = { x: number; y: number; z: number; r: number; color: string };
export function Sculpture3D({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blobs, setBlobs] = useState<Blob[]>([
    { x: 0, y: -30, z: 0, r: 34, color: "#b45309" },
    { x: 0, y: 30, z: 0, r: 46, color: "#b45309" },
  ]);
  const [rot, setRot] = useState(0);
  const [color, setColor] = useState("#b45309");
  const [mode, setMode] = useState<"add" | "carve">("add");
  const [gallery, setGallery] = useState(0);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const t = setInterval(() => setRot((r) => (r + 2) % 360), 70);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth * 2; c.height = 380;
    const W = c.width, H = c.height;
    ctx.fillStyle = "#f1f5f9"; ctx.fillRect(0, 0, W, H);
    // turntable
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath(); ctx.ellipse(W / 2, H - 50, 190, 44, 0, 0, Math.PI * 2); ctx.fill();
    const a = (rot * Math.PI) / 180;
    const proj = blobs.map((b) => {
      const rx = b.x * Math.cos(a) - b.z * Math.sin(a);
      const rz = b.x * Math.sin(a) + b.z * Math.cos(a);
      return { ...b, sx: W / 2 + rx * 2.4, sy: H / 2 + b.y * 2.2 - rz * 0.4, depth: rz, scale: 1 + rz / 400 };
    }).sort((p, q) => p.depth - q.depth);
    for (const p of proj) {
      ctx.beginPath(); ctx.arc(p.sx, p.sy, p.r * 2.2 * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
      ctx.beginPath(); ctx.arc(p.sx - p.r * 0.7, p.sy - p.r * 0.7, p.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff55"; ctx.fill();
    }
  }, [blobs, rot]);
  const sculpt = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * c.width;
    const py = ((e.clientY - r.top) / r.height) * c.height;
    const a = (rot * Math.PI) / 180;
    // unproject (approx, z=0 plane)
    const bx = (px - c.width / 2) / 2.4;
    const by = (py - c.height / 2) / 2.2;
    if (mode === "add" && blobs.length < 14) {
      setBlobs([...blobs, { x: bx * Math.cos(a), y: by, z: -bx * Math.sin(a), r: 22, color }]);
    } else if (mode === "carve" && blobs.length > 1) {
      let best = -1, bd = 1e9;
      blobs.forEach((b, i) => {
        const rx = b.x * Math.cos(a) - b.z * Math.sin(a);
        const sx = c.width / 2 + rx * 2.4, sy = c.height / 2 + b.y * 2.2;
        const d = Math.hypot(sx - px, sy - py);
        if (d < bd) { bd = d; best = i; }
      });
      if (best >= 0 && bd < 90) setBlobs(blobs.filter((_, i) => i !== best));
    }
    recordProgress(moduleId, { timeSpentSeconds: 15 });
  };
  const finish = async () => {
    const n = gallery + 1; setGallery(n);
    await saveCreation(`Sculpture ${n}`, "art", { blobs }, { moduleId, subjectId: "art" });
    recordProgress(moduleId, { timeSpentSeconds: 90, score: 90 });
    if (n >= 2) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    setBlobs([{ x: 0, y: -30, z: 0, r: 34, color }, { x: 0, y: 30, z: 0, r: 46, color }]);
  };
  return (
    <SimulationShell title="Clay Sculpture 3D" icon="🗿"
      controls={<>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "add" ? "default" : "outline"} onClick={() => setMode("add")} className="flex-1">➕ Add clay</Button>
          <Button size="sm" variant={mode === "carve" ? "default" : "outline"} onClick={() => setMode("carve")} className="flex-1">🔪 Carve</Button>
        </div>
        <div className="flex gap-1.5 flex-wrap">{["#b45309", "#78716c", "#3b82f6", "#22c55e", "#ec4899", "#eab308"].map((cc) => (
          <button key={cc} onClick={() => setColor(cc)} className={`w-9 h-9 rounded-full border-4 ${color === cc ? "border-slate-800" : "border-slate-200"}`} style={{ backgroundColor: cc }} />
        ))}</div>
        <Button size="sm" variant="fun" onClick={finish} className="w-full">🏛️ Finish → gallery! ({gallery}/2)</Button>
        <p className="text-xs text-slate-500">Tap the turntable to sculpt. Check ALL sides!</p>
      </>}
      dataPanel={<div className="text-sm"><p>🗿 Blobs: <b>{blobs.length}</b></p><p>🔄 Turntable spins — backs matter!</p><p className="text-xs text-slate-500">8,000 unique Terracotta soldiers!</p></div>}
      onSave={() => saveCreation("My Sculpture", "art", { blobs }, { moduleId, subjectId: "art" })}>
      <canvas ref={canvasRef} onPointerDown={sculpt} className="w-full h-[250px] cursor-crosshair touch-none" />
      <Quiz questions={[
        { q: "Sculpture differs from painting: it's viewed...", options: ["From front only", "From ALL sides", "Never"], answer: 1, explain: "Walk around it!" },
        { q: "An armature is...", options: ["Paint", "A hidden support skeleton", "A tool"], answer: 1, explain: "Wire holds tall clay!" },
        { q: "Adding clay is called... building?", options: ["Subtractive", "Additive", "Magic"], answer: 1, explain: "Carving = subtractive!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- ART HISTORY ---- */
const ERAS = [
  { id: "cave", n: "🦣 Cave Art", colors: ["#78350f", "#b45309", "#1c1917"], prompt: "Paint a hunt using ONLY 3 earth colors!", fact: "17,000 years old — still glowing!" },
  { id: "egypt", n: "🏺 Egypt", colors: ["#f59e0b", "#0ea5e9", "#1c1917"], prompt: "Draw a person: head sideways, eye forward — Egyptian style!", fact: "Heads sideways, eyes front — always!" },
  { id: "vangogh", n: "🌻 Van Gogh", colors: ["#facc15", "#2563eb", "#16a34a"], prompt: "Swirl the sky with thick dabs!", fact: "He sold ONE painting in his life." },
  { id: "pixel", n: "👾 Pixel Era", colors: ["#ef4444", "#3b82f6", "#22c55e", "#0f172a"], prompt: "Design a game hero in chunky pixels!", fact: "Mario was 16×16 pixels!" },
];
export function ArtHistory({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [era, setEra] = useState(0);
  const [color, setColor] = useState(ERAS[0].colors[0]);
  const [done, setDone] = useState<string[]>([]);
  const drawing = useRef(false);
  const { recordProgress } = useAppStore();
  const E = ERAS[era % ERAS.length];
  useEffect(() => {
    const c = canvasRef.current!;
    c.width = c.offsetWidth * 2; c.height = 380;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = era % ERAS.length === 0 ? "#d6b48a" : "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    setColor(ERAS[era % ERAS.length].colors[0]);
  }, [era]);
  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, era % ERAS.length === 3 ? 16 : 12, 0, Math.PI * 2); ctx.fill();
  };
  const finishEra = async () => {
    if (!done.includes(E.id)) {
      const n = [...done, E.id];
      setDone(n);
      await saveCreation(`${E.n} mimic`, "art", { era: E.id }, { moduleId, subjectId: "art" });
      recordProgress(moduleId, { timeSpentSeconds: 90, score: 90 });
      if (n.length >= 4) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      else setEra(era + 1);
    }
  };
  return (
    <SimulationShell title="Art Time Machine" icon="🏛️"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{ERAS.map((e, i) => (
          <Button key={e.id} size="sm" variant={era % ERAS.length === i ? "default" : "outline"} onClick={() => setEra(i)} className="text-xs">
            {done.includes(e.id) ? "✅ " : ""}{e.n}
          </Button>
        ))}</div>
        <div className="flex gap-1.5">{E.colors.map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`flex-1 h-10 rounded-lg border-4 ${color === c ? "border-slate-800" : "border-slate-200"}`} style={{ backgroundColor: c }} />
        ))}</div>
        <p className="text-xs bg-amber-50 rounded-lg p-2">🎯 {E.prompt}</p>
        <Button size="sm" variant="fun" onClick={finishEra} className="w-full">✅ Era complete! ({done.length}/4)</Button>
      </>}
      dataPanel={<div className="text-sm"><p className="font-extrabold">{E.n}</p><p>🤯 {E.fact}</p><p className="text-xs text-slate-500">Mona Lisa has no eyebrows — style!</p></div>}
      onSave={() => saveCreation("Era Art", "art", { era: E.id }, { moduleId, subjectId: "art" })}>
      <canvas ref={canvasRef} className="w-full h-[240px] cursor-crosshair touch-none"
        onPointerDown={(e) => { drawing.current = true; draw(e); }} onPointerMove={draw}
        onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
      <Quiz questions={[
        { q: "Cave artists used...", options: ["Oil tubes", "Charcoal + earth pigments", "Spray cans"], answer: 1, explain: "17,000 years of glow!" },
        { q: "Egyptian people face...", options: ["Forward fully", "Sideways head, front eye", "Backwards"], answer: 1, explain: "Their style rule!" },
        { q: "Copying masters helps you...", options: ["Cheat", "Learn technique", "Nothing"], answer: 1, explain: "Every master copied first!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}
