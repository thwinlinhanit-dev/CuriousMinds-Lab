"use client";
import React, { useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";
import { playNote } from "./music";

/* ---- CHORD STUDIO ---- */
const CHORDS: Record<string, { notes: number[]; mood: string }> = {
  C: { notes: [261.63, 329.63, 392.0], mood: "😊 happy" },
  G: { notes: [196.0, 246.94, 392.0], mood: "😊 happy" },
  Am: { notes: [220.0, 261.63, 329.63], mood: "😢 sad" },
  F: { notes: [174.61, 220.0, 349.23], mood: "😊 happy" },
  Em: { notes: [164.81, 196.0, 246.94], mood: "😢 sad" },
  Dm: { notes: [146.83, 174.61, 293.66], mood: "😢 sad" },
};
const SONG = ["C", "G", "Am", "F"];
export function ChordStudio({ moduleId }: { moduleId: string }) {
  const [chord, setChord] = useState("C");
  const [songPlayed, setSongPlayed] = useState(false);
  const [earChord, setEarChord] = useState("C");
  const [earScore, setEarScore] = useState(0);
  const { recordProgress } = useAppStore();
  const strum = (name: string) => {
    CHORDS[name].notes.forEach((f, i) => setTimeout(() => playNote(f, 0.8, "triangle", 0.2), i * 90));
    recordProgress(moduleId, { timeSpentSeconds: 20, score: 75 });
  };
  const playSong = () => {
    SONG.forEach((c, i) => setTimeout(() => strum(c), i * 700));
    setSongPlayed(true);
    recordProgress(moduleId, { timeSpentSeconds: 60, score: 95, status: "completed" });
  };
  const newEar = () => {
    const keys = Object.keys(CHORDS);
    setEarChord(keys[Math.floor(Math.random() * keys.length)]);
  };
  useEffect(newEar, []);
  const guessMood = (happy: boolean) => {
    const isHappy = CHORDS[earChord].mood.includes("happy");
    if ((happy && isHappy) || (!happy && !isHappy)) {
      const s = earScore + 1; setEarScore(s);
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 85 });
    }
    playNote(CHORDS[earChord].notes[0], 0.5);
    setTimeout(newEar, 600);
  };
  return (
    <SimulationShell title="Chord & Guitar Studio" icon="🎸"
      controls={<>
        <div className="grid grid-cols-3 gap-1.5">{Object.keys(CHORDS).map((c) => (
          <Button key={c} size="sm" variant={chord === c ? "default" : "outline"} onClick={() => { setChord(c); strum(c); }}>{c}</Button>
        ))}</div>
        <Button size="sm" variant="fun" onClick={playSong} className="w-full">🎵 Play the 4-chord hit! (C-G-Am-F)</Button>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">👂 Happy or sad? ({earScore} right)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => playNote(CHORDS[earChord].notes[1], 0.7)}>▶️ Hear</Button>
            <Button size="sm" onClick={() => guessMood(true)} className="flex-1">😊</Button>
            <Button size="sm" onClick={() => guessMood(false)} className="flex-1">😢</Button>
          </div>
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🎸 Chord: <b>{chord}</b> {CHORDS[chord].mood}</p><p>🎵 Song played: <b>{songPlayed ? "YES! Hit maker!" : "not yet"}</b></p><p className="text-xs text-slate-500">C-G-Am-F backs dozens of #1 hits!</p></div>}>
      <div className="p-4">
        <div className="relative h-44 bg-amber-900 rounded-2xl overflow-hidden border-4 border-amber-950">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-28 bg-amber-950 rounded-full" />
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => strum(chord)} className="absolute inset-x-4 hover:bg-white/10 rounded" style={{ top: `${12 + s * 12}%`, height: "10%" }}>
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-200" />
            </button>
          ))}
          <p className="absolute left-3 top-2 text-white font-black text-xl">{chord}</p>
          <p className="absolute left-3 bottom-2 text-amber-200 text-xs font-bold">Tap strings to strum! 🎸</p>
        </div>
        <div className="flex justify-center gap-2 mt-2">{SONG.map((c) => <span key={c} className="px-3 py-1.5 rounded-xl bg-purple-100 font-black">{c}</span>)}</div>
        <Quiz questions={[
          { q: "A chord is...", options: ["One note", "3+ notes together", "A drum"], answer: 1, explain: "C-E-G rings as one!" },
          { q: "Minor chords usually sound...", options: ["Happy", "Sad", "Loud"], answer: 1, explain: "Movie villains love minor!" },
          { q: "Strumming means...", options: ["Brushing across strings", "Breaking strings", "Tuning"], answer: 0, explain: "Down-down-up!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- RHYTHM READER ---- */
const RHYTHMS: Array<{ name: string; beats: number[] }> = [
  { name: "Walk 🚶 (1 2 3 4)", beats: [0, 1, 2, 3] },
  { name: "Running 🏃 (1-and-2-and)", beats: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] },
  { name: "Freeze! 🧊 (1 _ 3 _)", beats: [0, 2] },
  { name: "Heartbeat 💓 (1 _ 2-and)", beats: [0, 1.5, 2] },
];
export function RhythmReader({ moduleId }: { moduleId: string }) {
  const [rIdx, setRIdx] = useState(0);
  const [bpm, setBpm] = useState(90);
  const [running, setRunning] = useState(false);
  const [taps, setTaps] = useState<number[]>([]);
  const [start, setStart] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<number[]>([]);
  const { recordProgress } = useAppStore();
  const r = RHYTHMS[rIdx % RHYTHMS.length];
  const beatLen = 60 / bpm;
  const startRun = () => {
    setTaps([]); setScore(null); setRunning(true);
    const t0 = Date.now() + 1000;
    setStart(t0);
    playNote(660, 0.1);
    setTimeout(() => playNote(660, 0.1), 500);
    setTimeout(() => { playNote(880, 0.2); }, 1000);
    setTimeout(() => finishRun(t0), 1000 + 4 * beatLen * 1000 + 600);
  };
  const finishRun = (t0: number) => {
    setRunning(false);
    setTaps((tp) => {
      let good = 0;
      for (const b of r.beats) {
        const expected = t0 + b * beatLen * 1000;
        if (tp.some((t) => Math.abs(t - expected) < beatLen * 300)) good++;
      }
      const pct = Math.round((good / r.beats.length) * 100);
      setScore(pct);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: pct });
      if (pct >= 90 && !passed.includes(rIdx % RHYTHMS.length)) {
        const n = [...passed, rIdx % RHYTHMS.length];
        setPassed(n);
        if (n.length >= 3) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      }
      return tp;
    });
  };
  const tap = () => {
    if (!running) return;
    playNote(440, 0.08, "square", 0.12);
    setTaps([...taps, Date.now()]);
  };
  return (
    <SimulationShell title="Rhythm Reader" icon="🥁"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{RHYTHMS.map((x, i) => (
          <Button key={x.name} size="sm" variant={rIdx % RHYTHMS.length === i ? "default" : "outline"} onClick={() => { setRIdx(i); setScore(null); }} className="text-xs">
            {passed.includes(i) ? "✅ " : ""}{x.name}
          </Button>
        ))}</div>
        <Slider label="Tempo" value={bpm} min={60} max={140} onChange={setBpm} format={(v) => `${v} BPM`} />
        <Button variant="fun" onClick={startRun} disabled={running} className="w-full">{running ? "🎧 Listening... TAP!" : "▶️ Start (2 count-in beeps)"}</Button>
      </>}
      dataPanel={<div className="text-sm"><p>🎯 Score: <b>{score === null ? "—" : `${score}%`}</b> (90% to pass!)</p><p>✅ Passed: {passed.length}/3</p><p className="text-xs text-slate-500">Rests are silent beats — they count!</p></div>}>
      <div className="p-4 text-center">
        <div className="flex justify-center gap-1.5 my-3">
          {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((b) => (
            <div key={b} className={`w-10 h-14 rounded-lg border-2 flex items-center justify-center text-xl ${r.beats.includes(b) ? "bg-blue-500 border-blue-600" : "bg-slate-100 border-slate-200"}`}>
              {r.beats.includes(b) ? "🥁" : "🤫"}
            </div>
          ))}
        </div>
        <Button size="lg" variant="fun" onPointerDown={tap} disabled={!running} className="w-48 h-20 text-2xl">👏 TAP!</Button>
        <p className="text-xs text-slate-500 mt-1">Taps: {taps.length} • Clap ON the blue drums!</p>
        <Quiz questions={[
          { q: "A quarter note lasts...", options: ["Half a beat", "One beat", "Four beats"], answer: 1, explain: "Walk-walk-walk!" },
          { q: "A rest means...", options: ["Play louder", "Silence that counts", "Stop forever"], answer: 1, explain: "Freeze on the rest!" },
          { q: "Eighth notes are...", options: ["Slower", "Twice as fast as quarters", "Silent"], answer: 1, explain: "Run-ning-run-ning!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- GENRE TIME MACHINE ---- */
const ERAS = [
  { id: "classical", n: "🎻 Classical 1700s", bpm: 90, drum: 523.25, bass: 130.81, mel: [523.25, 587.33, 659.25, 783.99], wave: "triangle" as OscillatorType, fact: "Beethoven composed deaf!" },
  { id: "jazz", n: "🎷 Jazz 1920s", bpm: 120, drum: 300, bass: 98, mel: [440, 554.37, 659.25, 880], wave: "sine" as OscillatorType, fact: "Born in New Orleans clubs!" },
  { id: "rock", n: "🎸 Rock 1970s", bpm: 130, drum: 150, bass: 82.41, mel: [329.63, 392, 440, 523.25], wave: "sawtooth" as OscillatorType, fact: "Stadium anthems!" },
  { id: "hiphop", n: "🎤 Hip-Hop 1990s", bpm: 92, drum: 70, bass: 55, mel: [261.63, 311.13, 392, 466.16], wave: "square" as OscillatorType, fact: "Born at a 1973 Bronx party!" },
];
export function GenreMachine({ moduleId }: { moduleId: string }) {
  const [era, setEra] = useState("rock");
  const [layers, setLayers] = useState({ drums: true, bass: true, melody: true });
  const [playing, setPlaying] = useState(false);
  const [mixed, setMixed] = useState<string[]>(["rock"]);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const { recordProgress } = useAppStore();
  const cur = ERAS.find((e) => e.id === era)!;
  const togglePlay = () => {
    if (playing) { if (timer.current) clearInterval(timer.current); setPlaying(false); return; }
    setPlaying(true);
    if (!mixed.includes(era)) {
      const n = [...mixed, era];
      setMixed(n);
      recordProgress(moduleId, { timeSpentSeconds: 45, score: 85 });
      if (n.length >= 4) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
    let step = 0;
    timer.current = setInterval(() => {
      if (layers.drums && step % 2 === 0) playNote(cur.drum, 0.15, "sine", 0.25);
      if (layers.bass && step % 4 === 0) playNote(cur.bass, 0.4, cur.wave, 0.2);
      if (layers.melody) playNote(cur.mel[step % 4], 0.3, cur.wave, 0.12);
      step++;
    }, 60000 / cur.bpm / 2);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const flip = (k: keyof typeof layers) => setLayers({ ...layers, [k]: !layers[k] });
  return (
    <SimulationShell title="Genre Time Machine" icon="🕰️"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5">{ERAS.map((e) => (
          <Button key={e.id} size="sm" variant={era === e.id ? "default" : "outline"} onClick={() => { if (playing) togglePlay(); setEra(e.id); }} className="text-xs">
            {mixed.includes(e.id) ? "✅ " : ""}{e.n}
          </Button>
        ))}</div>
        <div className="flex gap-1.5">{(Object.keys(layers) as Array<keyof typeof layers>).map((k) => (
          <Button key={k} size="sm" variant={layers[k] ? "default" : "outline"} onClick={() => flip(k)} className="flex-1 capitalize">{k === "drums" ? "🥁" : k === "bass" ? "🎸" : "🎵"} {k}</Button>
        ))}</div>
        <Button variant={playing ? "default" : "fun"} onClick={togglePlay} className="w-full">{playing ? "⏸️ Stop time machine" : "▶️ Play this era!"}</Button>
      </>}
      dataPanel={<div className="text-sm"><p className="font-extrabold">{cur.n}</p><p>🤯 {cur.fact}</p><p>Eras mixed: <b>{mixed.length}/4</b></p><p className="text-xs text-slate-500">Same beat, different centuries!</p></div>}>
      <div className="p-4">
        <div className="flex justify-center gap-2 text-5xl">
          <span className={playing && layers.drums ? "animate-bounce" : "opacity-40"}>🥁</span>
          <span className={playing && layers.bass ? "animate-bounce" : "opacity-40"}>🎸</span>
          <span className={playing && layers.melody ? "animate-bounce" : "opacity-40"}>🎵</span>
        </div>
        <div className="flex justify-center gap-1 mt-3">{ERAS.map((e) => <span key={e.id} className={`text-2xl ${mixed.includes(e.id) ? "" : "grayscale opacity-40"}`}>{e.n.split(" ")[0]}</span>)}</div>
        <Quiz questions={[
          { q: "Hip-hop was born...", options: ["In a lab", "At a 1973 Bronx party", "On the Moon"], answer: 1, explain: "DJ Kool Herc's party!" },
          { q: "Jazz loves to...", options: ["Read exactly", "Improvise on the spot", "Stay silent"], answer: 1, explain: "Made-up solos!" },
          { q: "A genre is...", options: ["One song", "A music family/style", "An instrument"], answer: 1, explain: "Rock, jazz, hip-hop..." },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
