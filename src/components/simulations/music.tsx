"use client";
import React, { useRef, useState, useEffect } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

// Tiny WebAudio synth (no external deps needed at runtime)
let AC: AudioContext | null = null;
function ac() {
  if (!AC) AC = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (AC.state === "suspended") AC.resume();
  return AC;
}
export function playNote(freq: number, dur = 0.5, type: OscillatorType = "triangle", vol = 0.2, when = 0) {
  try {
    const ctx = ac();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = ctx.currentTime + when;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  } catch {}
}
const NOTE_FREQ: Record<string, number> = { C: 261.63, "C#": 277.18, D: 293.66, "D#": 311.13, E: 329.63, F: 349.23, "F#": 369.99, G: 392.0, "G#": 415.3, A: 440, "A#": 466.16, B: 493.88 };
const WHITE = ["C", "D", "E", "F", "G", "A", "B"];

/* ---- PIANO ---- */
const SONGS: Record<string, string[]> = {
  "Hot Cross Buns": ["E", "D", "C", "E", "D", "C", "C", "C", "C", "D", "D", "D", "E", "D", "C"],
  "Twinkle": ["C", "C", "G", "G", "A", "A", "G", "F", "F", "E", "E", "D", "D", "C"],
  "Ode to Joy": ["E", "E", "F", "G", "G", "F", "E", "D", "C", "C", "D", "E", "E", "D", "D"],
};
export function PianoLab({ moduleId }: { moduleId: string }) {
  const [song, setSong] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [played, setPlayed] = useState<string[]>([]);
  const [showNames, setShowNames] = useState(true);
  const { recordProgress } = useAppStore();
  const press = (n: string) => {
    playNote(NOTE_FREQ[n]);
    setPlayed([n, ...played].slice(0, 12));
    if (song) {
      const notes = SONGS[song];
      if (n === notes[step]) {
        const ns = step + 1;
        setStep(ns);
        recordProgress(moduleId, { timeSpentSeconds: 15, score: 85 });
        if (ns >= notes.length) {
          recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
          setSong(null); setStep(0);
        }
      }
    } else recordProgress(moduleId, { timeSpentSeconds: 10 });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const map: Record<string, string> = { a: "C", s: "D", d: "E", f: "F", g: "G", h: "A", j: "B" };
      const n = map[e.key.toLowerCase()];
      if (n) press(n);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const target = song ? SONGS[song][step] : null;
  return (
    <SimulationShell title="Piano Lab" icon="🎹"
      controls={<>
        <label className="block text-sm font-medium">🎵 Light-up song
          <select value={song ?? ""} onChange={(e) => { setSong(e.target.value || null); setStep(0); }} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold">
            <option value="">Free play 🎹</option>{Object.keys(SONGS).map((s) => <option key={s} value={s}>{s}</option>)}
          </select></label>
        {song && <p className="text-sm font-bold">Next: <span className="text-2xl">{target}</span> ({step}/{SONGS[song].length})</p>}
        <Button size="sm" variant="outline" onClick={() => setShowNames(!showNames)} className="w-full">Note names {showNames ? "ON" : "OFF"}</Button>
        <p className="text-xs text-slate-500">Keys A–J play C–B! {played.join(" ")}</p>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🎹 88 keys, 7 octaves!</p><p>Right = higher ⬆️ Left = lower ⬇️</p><p>Middle C = 261.6 Hz</p></div>}>
      <div className="p-4">
        <div className="flex rounded-xl overflow-hidden border-4 border-slate-800 select-none">
          {WHITE.map((n) => (
            <button key={n} onMouseDown={() => press(n)} className={`flex-1 h-44 md:h-56 border-r border-slate-300 font-bold ${target === n ? "bg-amber-200" : "bg-white hover:bg-blue-50"} active:bg-blue-200 flex items-end justify-center pb-3`}>{showNames ? n : ""}</button>
          ))}
        </div>
        <div className="flex px-6 -mt-44 md:-mt-56 pointer-events-none">
          {["C#", "D#", "", "F#", "G#", "A#", ""].map((n, i) => (
            <div key={i} className="flex-1 flex justify-center">{n ? <button onMouseDown={() => press(n)} className="pointer-events-auto w-10 md:w-14 h-24 md:h-32 bg-slate-900 rounded-b-lg text-white text-xs font-bold active:bg-slate-700">{showNames ? n : ""}</button> : <span className="w-10" />}</div>
          ))}
        </div>
        <Quiz questions={[
          { q: "Higher notes are on the...", options: ["Left", "Right", "Middle only"], answer: 1, explain: "Pitch rises to the right!" },
          { q: "How many notes before letters repeat?", options: ["5", "7 (A–G)", "12"], answer: 1, explain: "A B C D E F G, then again!" },
          { q: "Black keys are...", options: ["Sharps/flats between whites", "Broken keys", "Louder keys"], answer: 0, explain: "Half-steps!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- BEAT SEQUENCER ---- */
const TRACKS = [
  { id: "kick", emoji: "🥁", freq: 60, type: "sine" as OscillatorType },
  { id: "snare", emoji: "👏", freq: 200, type: "square" as OscillatorType },
  { id: "hihat", emoji: "🎩", freq: 6000, type: "square" as OscillatorType },
  { id: "bass", emoji: "🎸", freq: 110, type: "sawtooth" as OscillatorType },
];
export function BeatSequencer({ moduleId }: { moduleId: string }) {
  const [grid, setGrid] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  ]);
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setStep((s) => {
        const ns = (s + 1) % 16;
        grid.forEach((row, t) => { if (row[ns]) playNote(TRACKS[t].freq, t === 2 ? 0.08 : 0.25, TRACKS[t].type, t === 2 ? 0.06 : 0.25); });
        return ns;
      });
    }, 60000 / bpm / 4);
    return () => clearInterval(iv);
  }, [playing, bpm, grid]);
  const toggle = (t: number, s: number) => setGrid(grid.map((row, i) => (i === t ? row.map((v, j) => (j === s ? !v : v)) : row)));
  return (
    <SimulationShell title="Beat Machine" icon="🥁"
      controls={<>
        <Slider label="Tempo" value={bpm} min={60} max={180} onChange={setBpm} format={(v) => `${v} BPM`} />
        <Button variant={playing ? "default" : "fun"} onClick={() => { setPlaying(!playing); recordProgress(moduleId, { timeSpentSeconds: 45 }); }} className="w-full">{playing ? "⏸️ Stop" : "▶️ Play beat"}</Button>
        <Button variant="outline" size="sm" onClick={() => setGrid(grid.map(() => Array(16).fill(false)))}>🧹 Clear</Button>
        <SaveButton onSave={() => saveCreation("My Beat", "music", { grid, bpm }, { moduleId, subjectId: "music" })} />
      </>}
      dataPanel={<div className="text-sm"><p>🥁 Kick = heartbeat</p><p>👏 Snare = backbeat (2 & 4!)</p><p>🎩 Hi-hat = sparkle</p><p className="text-xs text-slate-500">16 steps = 1 measure of 4 beats!</p></div>}
      onSave={() => saveCreation("My Beat", "music", { grid, bpm }, { moduleId, subjectId: "music" })}>
      <div className="p-3 overflow-x-auto">
        {TRACKS.map((t, ti) => (
          <div key={t.id} className="flex items-center gap-1 mb-1.5">
            <span className="text-2xl w-9">{t.emoji}</span>
            <div className="flex gap-1">
              {grid[ti].map((on, si) => (
                <button key={si} onClick={() => toggle(ti, si)} className={`w-7 h-9 md:w-8 rounded-lg border-2 ${si === step && playing ? "ring-2 ring-amber-400" : ""} ${on ? "bg-pink-500 border-pink-600" : si % 4 === 0 ? "bg-slate-200 border-slate-300" : "bg-slate-50 border-slate-200"}`} />
              ))}
            </div>
          </div>
        ))}
        <Quiz questions={[
          { q: "Tempo (BPM) means...", options: ["Volume", "Speed of beats", "Number of drums"], answer: 1, explain: "Beats Per Minute!" },
          { q: "The snare usually hits on beats...", options: ["1 & 3", "2 & 4", "Every step"], answer: 1, explain: "The backbeat — clap along!" },
          { q: "A 16-step pattern = ...", options: ["16 songs", "1 measure of 4 beats", "16 minutes"], answer: 1, explain: "4 steps per beat × 4 beats!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- SCALE EXPLORER ---- */
const SCALES: Record<string, number[]> = { major: [0, 2, 4, 5, 7, 9, 11, 12], minor: [0, 2, 3, 5, 7, 8, 10, 12], pentatonic: [0, 2, 4, 7, 9, 12], blues: [0, 3, 5, 6, 7, 10, 12] };
export function ScaleExplorer({ moduleId }: { moduleId: string }) {
  const [scale, setScale] = useState("major");
  const [root, setRoot] = useState(0);
  const { recordProgress } = useAppStore();
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const play = (semi: number) => playNote(261.63 * Math.pow(2, semi / 12), 0.6);
  const playScale = () => { SCALES[scale].forEach((s, i) => setTimeout(() => play(root + s), i * 280)); recordProgress(moduleId, { timeSpentSeconds: 45, score: 85, status: "completed" }); };
  return (
    <SimulationShell title="Scale Explorer" icon="🎼"
      controls={<>
        <div className="flex gap-1.5 flex-wrap">{Object.keys(SCALES).map((s) => <Button key={s} size="sm" variant={scale === s ? "default" : "outline"} onClick={() => setScale(s)} className="capitalize">{s}</Button>)}</div>
        <Slider label="Root note" value={root} min={0} max={11} onChange={setRoot} format={(v) => names[v]} />
        <Button variant="fun" onClick={playScale} className="w-full">▶️ Play scale</Button>
      </>}
      dataPanel={<div className="text-sm"><p>{scale === "major" ? "😊 Major = HAPPY (Twinkle Twinkle!)" : scale === "minor" ? "😢 Minor = SAD (spooky movies!)" : scale === "pentatonic" ? "🌍 Pentatonic = worldwide!" : "🎷 Blues = soulful!"}</p><p className="text-xs text-slate-500">Major pattern: whole-whole-half-whole-whole-whole-half</p></div>}>
      <div className="p-6">
        <div className="flex gap-2 justify-center flex-wrap">
          {SCALES[scale].map((s, i) => (
            <button key={i} onClick={() => play(root + s)} className="w-14 h-20 rounded-xl bg-gradient-to-b from-violet-100 to-violet-200 border-2 border-violet-300 font-black hover:scale-105 active:scale-95">{names[(root + s) % 12]}<span className="block text-xs">{i + 1}</span></button>
          ))}
        </div>
        <Quiz questions={[
          { q: "Major scales sound...", options: ["Sad", "Happy", "Angry"], answer: 1, explain: "Do-Re-Mi = happy!" },
          { q: "Minor scales sound...", options: ["Happy", "Sad/spooky", "Silent"], answer: 1, explain: "Movie villains love minor!" },
          { q: "A scale is...", options: ["One note", "Ordered notes", "A drum"], answer: 1, explain: "Stepping stones for songs!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- MELODY COMPOSER ---- */
const ROW_NOTES = ["B", "A", "G", "F", "E", "D", "C", "C2"];
const ROW_FREQ = [493.88, 440, 392, 349.23, 329.63, 293.66, 261.63, 130.81];
export function MelodyComposer({ moduleId }: { moduleId: string }) {
  const [grid, setGrid] = useState<boolean[][]>(Array.from({ length: 8 }).map(() => Array(16).fill(false)));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const { recordProgress } = useAppStore();
  const toggle = (r: number, c: number) => setGrid(grid.map((row, i) => (i === r ? row.map((v, j) => (j === c ? !v : v)) : row)));
  const playAll = () => {
    setPlaying(true);
    for (let c = 0; c < 16; c++) {
      setTimeout(() => {
        setStep(c);
        grid.forEach((row, r) => { if (row[c]) playNote(ROW_FREQ[r], 0.35); });
        if (c === 15) setTimeout(() => { setPlaying(false); setStep(-1); }, 350);
      }, c * 220);
    }
    const notes = grid.flat().filter(Boolean).length;
    if (notes >= 8) recordProgress(moduleId, { timeSpentSeconds: 90, score: 90, status: "completed" });
    else recordProgress(moduleId, { timeSpentSeconds: 45 });
  };
  return (
    <SimulationShell title="Melody Composer" icon="🎵"
      controls={<>
        <Button variant="fun" onClick={playAll} disabled={playing} className="w-full">{playing ? "🎶 Playing..." : "▶️ Play my song"}</Button>
        <Button variant="outline" size="sm" onClick={() => setGrid(Array.from({ length: 8 }).map(() => Array(16).fill(false)))}>🧹 Clear</Button>
        <Button variant="outline" size="sm" onClick={() => { const g = Array.from({ length: 8 }).map(() => Array(16).fill(false)); [0, 1, 2, 1, 0, 4, 4, 0].forEach((r, c) => (g[r][c * 2] = true)); setGrid(g); }}>✨ Starter melody</Button>
        <SaveButton onSave={() => saveCreation("My Melody", "music", { grid }, { moduleId, subjectId: "music" })} />
      </>}
      dataPanel={<div className="text-sm"><p>⬆️ Higher = higher pitch</p><p>➡️ Left to right = time</p><p className="text-xs text-slate-500">Tip: repeat notes to make it catchy!</p></div>}
      onSave={() => saveCreation("My Melody", "music", { grid }, { moduleId, subjectId: "music" })}>
      <div className="p-3 overflow-x-auto">
        {grid.map((row, r) => (
          <div key={r} className="flex items-center gap-1 mb-1">
            <span className="w-8 text-sm font-black">{ROW_NOTES[r]}</span>
            <div className="flex gap-0.5">{row.map((on, c) => <button key={c} onClick={() => toggle(r, c)} className={`w-6 h-8 rounded ${c === step ? "ring-2 ring-amber-400" : ""} ${on ? "bg-gradient-to-b from-pink-400 to-purple-500" : c % 4 === 0 ? "bg-slate-200" : "bg-slate-100"}`} />)}</div>
          </div>
        ))}
        <Quiz questions={[
          { q: "A catchy melody often uses...", options: ["Random notes", "Repetition", "Silence only"], answer: 1, explain: "Repeat + small changes!" },
          { q: "Higher on the grid = ...", options: ["Louder", "Higher pitch", "Longer"], answer: 1, explain: "Up = up in pitch!" },
          { q: "Mozart started composing at age...", options: ["30", "5", "50"], answer: 1, explain: "You're right on time! 🎶" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- SOUND WAVEFORMS ---- */
export function SoundWaveforms({ moduleId }: { moduleId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wave, setWave] = useState<OscillatorType>("sine");
  const [freq, setFreq] = useState(440);
  const { recordProgress } = useAppStore();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0; let t = 0;
    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = 300);
    const draw = () => {
      t += 0.05;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#334155"; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 5; ctx.beginPath();
      const cycles = freq / 110;
      for (let x = 0; x < W; x += 3) {
        const p = (x / W) * Math.PI * 2 * cycles + t;
        let y: number;
        if (wave === "sine") y = Math.sin(p);
        else if (wave === "square") y = Math.sign(Math.sin(p)) * 0.9;
        else if (wave === "sawtooth") y = ((p / Math.PI) % 2) - 1;
        else y = Math.abs(Math.sin(p)) * 1.4 - 0.7;
        const yy = H / 2 - y * H * 0.38;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [wave, freq]);
  const hear = () => { playNote(freq, 1, wave, 0.2); recordProgress(moduleId, { timeSpentSeconds: 30, score: 80 }); };
  return (
    <SimulationShell title="Sound & Waveforms" icon="📡"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{(["sine", "square", "sawtooth", "triangle"] as OscillatorType[]).map((w) => <Button key={w} size="sm" variant={wave === w ? "default" : "outline"} onClick={() => setWave(w)} className="capitalize">{w === "sine" ? "🪈 Sine" : w === "square" ? "👾 Square" : w === "sawtooth" ? "🎺 Saw" : "🔺 Triangle"}</Button>)}</div>
        <Slider label="Frequency" value={freq} min={110} max={880} onChange={setFreq} format={(v) => `${v} Hz`} />
        <Button variant="fun" onClick={hear} className="w-full">▶️ Hear it</Button>
      </>}
      dataPanel={<div className="text-sm"><p>Sine = smooth 🪈 flute</p><p>Square = buzzy 👾 games</p><p>Saw = brassy 🎺</p><p>A4 = <b>440 Hz</b></p></div>}>
      <canvas ref={canvasRef} className="w-full h-[200px]" />
      <Quiz questions={[
        { q: "Wave SHAPE decides the...", options: ["Pitch", "Timbre (character)", "Volume"], answer: 1, explain: "Same note, flute vs trumpet!" },
        { q: "Retro game sounds use...", options: ["Sine", "Square waves", "Silence"], answer: 1, explain: "Buzzy square!" },
        { q: "440 Hz is...", options: ["Concert A", "Middle C", "Dog whistle"], answer: 0, explain: "Orchestras tune to A440!" },
      ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
    </SimulationShell>
  );
}

/* ---- EAR TRAINING ---- */
export function EarTraining({ moduleId }: { moduleId: string }) {
  const [game, setGame] = useState<"higher" | "interval">("higher");
  const [pair, setPair] = useState<[number, number]>([440, 523]);
  const [msg, setMsg] = useState("Press ▶ then guess!");
  const [streak, setStreak] = useState(0);
  const { recordProgress } = useAppStore();
  const newPair = () => {
    const base = [261, 293, 329, 349, 392, 440, 493, 523];
    const a = base[Math.floor(Math.random() * base.length)];
    let b = base[Math.floor(Math.random() * base.length)];
    if (game === "higher" && Math.random() < 0.2) b = a;
    setPair([a, b]); setMsg("Listen... 🎧");
  };
  const listen = () => { playNote(pair[0], 0.5); setTimeout(() => playNote(pair[1], 0.5), 600); };
  const guess = (g: string) => {
    const truth = pair[1] > pair[0] ? "second" : pair[1] < pair[0] ? "first" : "same";
    if (g === truth) {
      const s = streak + 1; setStreak(s); setMsg("✅ Correct! Super ears! 👂");
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 });
      if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(newPair, 1000);
    } else { setStreak(0); setMsg(`❌ It was "${truth}"! Listen again.`); }
  };
  return (
    <SimulationShell title="Ear Training" icon="👂"
      controls={<>
        <div className="flex gap-2"><Button size="sm" variant={game === "higher" ? "default" : "outline"} onClick={() => setGame("higher")} className="flex-1">Higher/Lower</Button></div>
        <Button variant="fun" onClick={() => { newPair(); setTimeout(listen, 300); }} className="w-full">🎲 New mystery pair</Button>
        <Button variant="outline" onClick={listen} className="w-full">▶️ Replay</Button>
        <p className="text-sm">🔥 Streak: {streak}/5</p>
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p className="text-xs text-slate-500">Perfect pitch: 1 in 10,000 — but EVERYONE can train relative pitch!</p></div>}>
      <div className="p-6 text-center">
        <p className="font-bold mb-3">Which note was HIGHER?</p>
        <div className="flex justify-center gap-3">
          <Button size="lg" onClick={() => guess("first")}>1️⃣ First</Button>
          <Button size="lg" variant="secondary" onClick={() => guess("same")}>🟰 Same</Button>
          <Button size="lg" onClick={() => guess("second")}>2️⃣ Second</Button>
        </div>
        <Quiz questions={[
          { q: "An interval is...", options: ["One note", "Distance between two notes", "A drum"], answer: 1, explain: "C to G = a fifth!" },
          { q: "Best way to improve ears?", options: ["Loud music", "Daily guessing practice", "Ignoring music"], answer: 1, explain: "Little + often!" },
          { q: "Musicians' brains...", options: ["Shrink", "Grow with practice", "Stay same"], answer: 1, explain: "Practice builds brains! 🧠" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
