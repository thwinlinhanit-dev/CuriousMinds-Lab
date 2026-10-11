"use client";
import React, { useRef, useEffect, useState } from "react";
import { SimulationShell, Quiz } from "./shared";
import { Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

function speak(text: string) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    speechSynthesis.speak(u);
  } catch {}
}

/* ---- SPELLING BEE ---- */
const BEE_WORDS = [
  { w: "cat", hint: "A furry pet that meows" }, { w: "ship", hint: "It sails the sea" },
  { w: "plant", hint: "It grows in soil" }, { w: "bridge", hint: "You cross rivers on it" },
  { w: "elephant", hint: "Big gray animal, long trunk" }, { w: "bicycle", hint: "Two wheels, pedals" },
  { w: "beautiful", hint: "Very pretty (tricky 'eau'!)" }, { w: "because", hint: "Big Elephants Can Always Understand Small Elephants!" },
  { w: "friend", hint: "'i' before 'e'... usually!" }, { w: "together", hint: "To-get-her!" },
  { w: "chocolate", hint: "Sweet brown treat" }, { w: "adventure", hint: "An exciting journey" },
];
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
export function SpellingBee({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState("🔔 Ding! Spell what you hear!");
  const { recordProgress } = useAppStore();
  const word = BEE_WORDS[idx % BEE_WORDS.length];
  useEffect(() => { speak(word.w); }, [idx]);
  const add = (l: string) => { if (tiles.length < word.w.length) setTiles([...tiles, l]); };
  const check = () => {
    if (tiles.join("") === word.w) {
      const s = streak + 1; setStreak(s); setMsg(`✅ "${word.w}" — brilliant!`);
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 });
      if (s >= 10) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(() => { setIdx(idx + 1); setTiles([]); }, 900);
    } else { setStreak(0); setMsg(`❌ That spells "${tiles.join("")}". Listen again! 👂`); setTiles([]); }
  };
  return (
    <SimulationShell title="Spelling Bee Arena" icon="🐝"
      controls={<>
        <Button variant="fun" onClick={() => speak(word.w)} className="w-full">🔊 Hear it again</Button>
        <p className="text-sm bg-amber-50 rounded-xl p-2">💡 Hint: {word.hint}</p>
        <p className="text-sm font-bold">🔥 Streak: {streak}/10 (trophy at 10!)</p>
      </>}
      dataPanel={<div><p className="font-bold">{msg}</p><p className="text-xs text-slate-500 mt-1">Sound it out, syllable by syllable! Their/there/they're — homophones!</p></div>}>
      <div className="p-4 text-center">
        <div className="flex justify-center gap-1.5 min-h-[56px] flex-wrap">
          {word.w.split("").map((_, i) => (
            <span key={i} className="w-10 h-12 flex items-center justify-center text-2xl font-black border-b-4 border-amber-500 bg-amber-50 rounded-t-lg">
              {tiles[i] ?? ""}
            </span>
          ))}
        </div>
        <div className="flex gap-2 justify-center mt-2">
          <Button size="sm" variant="outline" onClick={() => setTiles([])}>🧹</Button>
          <Button size="sm" variant="fun" onClick={check}>🔔 Submit!</Button>
        </div>
        <div className="flex flex-wrap gap-1 justify-center mt-3 max-w-md mx-auto">
          {LETTERS.map((l) => <button key={l} onClick={() => add(l)} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-black hover:bg-slate-600">{l}</button>)}
        </div>
        <Quiz questions={[
          { q: "Best first step for a long word?", options: ["Guess fast", "Split into syllables", "Skip it"], answer: 1, explain: "But-ter-fly!" },
          { q: "Their / there / they're are...", options: ["Synonyms", "Homophones", "Antonyms"], answer: 1, explain: "Same sound, different spelling!" },
          { q: "'i' before 'e' except after...", options: ["'c'", "'z'", "never"], answer: 0, explain: "Friend vs receive!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- READING DETECTIVES ---- */
const CASES = [
  { title: "The Missing Cookies 🍪", text: "Maya came home to crumbs on the floor, an open jar on the counter, and Max the dog licking his lips. Mom had been at work all day.", q: "Who took the cookies?", opts: ["Mom", "Max the dog", "A burglar"], answer: 1, evidence: "crumbs on the floor + Max licking his lips" },
  { title: "Rainy Morning ☔", text: "Leo grabbed his umbrella, pulled on boots, and waved at the gray clouds. The forecast had promised storms, and the sidewalk already glistened.", q: "What is the weather?", opts: ["Sunny", "Rainy", "Snowy"], answer: 1, evidence: "umbrella + boots + glistening sidewalk" },
  { title: "The Late Bus 🚌", text: "Ava waited 40 minutes, missing breakfast. Her stomach growled through math class, and she kept glancing at the clock.", q: "How does Ava feel?", opts: ["Excited", "Hungry and frustrated", "Sleepy"], answer: 1, evidence: "missed breakfast + stomach growled" },
  { title: "Night Howls 🐺", text: "The tents shook in the wind. From the dark pines came a long howl, and the campers zipped their sleeping bags tighter.", q: "Where are the campers?", opts: ["At home", "Camping in the woods", "At school"], answer: 1, evidence: "tents + pines + sleeping bags" },
  { title: "The Big Game 🏆", text: "The crowd roared as the whistle blew. Sam sprinted past the last defender and kicked — the net rippled, and teammates piled on top of him.", q: "What just happened?", opts: ["Sam scored a goal", "It started raining", "The game ended"], answer: 0, evidence: "net rippled + teammates piled on" },
];
export function ReadingDetectives({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [cited, setCited] = useState(false);
  const [closed, setClosed] = useState(0);
  const { recordProgress } = useAppStore();
  const c = CASES[idx % CASES.length];
  const answer = (i: number) => {
    setPicked(i);
    if (i === c.answer) {
      const n = closed + (cited ? 0 : 0);
      void n;
    }
  };
  const cite = () => {
    if (picked === c.answer) {
      setCited(true);
      const n = closed + 1; setClosed(n);
      recordProgress(moduleId, { timeSpentSeconds: 45, score: 95 });
      if (n >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(() => { setIdx(idx + 1); setPicked(null); setCited(false); }, 1600);
    }
  };
  return (
    <SimulationShell title="Reading Detectives" icon="🔍"
      controls={<>
        <p className="text-sm font-bold">📁 Cases closed: {closed}/5</p>
        <div className="bg-slate-800 text-green-300 rounded-xl p-2 text-xs font-mono">
          <p>DETECTIVE RULES:</p>
          <p>1. Read everything 👀</p>
          <p>2. Answer 🕵️</p>
          <p>3. CITE evidence 🔖</p>
        </div>
      </>}
      dataPanel={<div className="text-sm"><p>🔖 Evidence = exact words!</p><p>🧠 Inference = clues + brain</p><p>20 min/day = 1.8M words a year!</p></div>}>
      <div className="p-4 max-w-xl mx-auto">
        <p className="font-display font-extrabold text-xl">{c.title}</p>
        <p className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 mt-2 font-serif leading-relaxed">{c.text}</p>
        <p className="font-bold mt-3">{c.q}</p>
        <div className="grid gap-2 mt-1">
          {c.opts.map((o, i) => (
            <button key={i} onClick={() => answer(i)}
              className={`text-left px-3 py-2 rounded-xl border-2 font-medium text-sm ${picked === null ? "border-slate-200 hover:border-amber-400" : i === c.answer ? "border-green-500 bg-green-50" : picked === i ? "border-red-400 bg-red-50" : "border-slate-200 opacity-60"}`}>{o}</button>
          ))}
        </div>
        {picked !== null && picked !== c.answer && <p className="text-sm font-bold text-red-500 mt-1">❌ Re-read the passage, detective!</p>}
        {picked === c.answer && !cited && (
          <div className="mt-2">
            <p className="text-sm font-bold text-green-600">✅ Right! Now CITE your evidence:</p>
            <Button size="sm" variant="fun" onClick={cite} className="mt-1">🔖 "I cite: {c.evidence}!"</Button>
          </div>
        )}
        {cited && <p className="font-bold text-green-600 mt-2">🎉 Case closed with evidence!</p>}
        <Quiz questions={[
          { q: "An inference is...", options: ["A wild guess", "Clues + what you know", "Copying text"], answer: 1, explain: "Wet umbrella → it rained!" },
          { q: "The main idea is...", options: ["One detail", "What it's mostly about", "The title only"], answer: 1, explain: "One-sentence summary!" },
          { q: "Strong answers always have...", options: ["Emojis", "Text evidence", "Big words"], answer: 1, explain: "Quote the proof!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- TYPE RACER ---- */
const SENTENCES = [
  "the cat sat on the mat", "dogs run fast in the park", "i like red apples",
  "we read books at school", "fish swim in blue water", "birds sing in the morning",
];
export function TypeRacer({ moduleId }: { moduleId: string }) {
  const [target] = useState(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [races, setRaces] = useState(0);
  const [best, setBest] = useState(0);
  const { recordProgress } = useAppStore();
  const onType = (v: string) => {
    if (start === null && v.length === 1) setStart(Date.now());
    const clean = v.slice(0, target.length);
    setTyped(clean);
    if (clean === target && !done) {
      setDone(true);
      const secs = (Date.now() - (start ?? Date.now())) / 1000;
      const wpm = Math.round((target.length / 5 / secs) * 60);
      const acc = 100; // exact match required
      setBest(Math.max(best, wpm));
      const r = races + 1; setRaces(r);
      recordProgress(moduleId, { timeSpentSeconds: Math.round(secs), score: Math.min(100, wpm * 3) });
      if (wpm >= 20) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      void acc;
    }
  };
  const reset = () => window.location.reload();
  const correct = typed.split("").filter((ch, i) => ch === target[i]).length;
  return (
    <SimulationShell title="Type Racer" icon="⌨️"
      controls={<>
        <p className="text-sm font-bold">🏁 Races: {races} • Best: {best} WPM</p>
        <p className="text-xs bg-slate-800 text-green-300 rounded-xl p-2 font-mono">Fingers: A S D F = left, J K L ; = right. Bumps on F + J!</p>
        <p className="text-xs text-slate-500">🎯 License: 20 WPM. Accuracy first, speed follows!</p>
        <Button size="sm" variant="outline" onClick={reset} className="w-full">🔀 New sentence</Button>
      </>}
      dataPanel={<div className="text-sm"><p>⌨️ WPM = words per minute</p><p>👀 Eyes on screen, not keys!</p><p>🏆 Fastest ever: 216 WPM</p></div>}>
      <div className="p-4">
        <div className="text-2xl font-mono leading-relaxed bg-slate-50 rounded-xl p-4">
          {target.split("").map((ch, i) => (
            <span key={i} className={i < typed.length ? (typed[i] === ch ? "text-green-600" : "text-red-500 bg-red-100") : "text-slate-400"}>{ch}</span>
          ))}
        </div>
        <input value={typed} onChange={(e) => onType(e.target.value)} placeholder="Type here..." autoFocus
          className="w-full mt-3 border-4 border-blue-300 rounded-xl px-3 py-2 font-mono text-xl" />
        <p className="text-sm font-bold mt-1">{correct}/{target.length} correct {done ? "🎉 FINISH! Race again for a better WPM!" : ""}</p>
        <div className="text-center text-4xl mt-1">🏎️💨 {"▬".repeat(Math.min(20, Math.floor((correct / target.length) * 20)))}🏁</div>
        <Quiz questions={[
          { q: "Home row left hand?", options: ["J K L ;", "A S D F", "Q W E R"], answer: 1, explain: "Left rests on ASDF!" },
          { q: "The bumps are on...", options: ["A and ;", "F and J", "Space"], answer: 1, explain: "Feel your way home!" },
          { q: "Type faster by...", options: ["Looking at keys", "Accuracy first, then speed", "One finger"], answer: 1, explain: "Clean strokes get fast!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- WORLD LANGUAGES ---- */
const LANGS = [
  { name: "Spanish 🇪🇸", hello: "¡Hola!", thanks: "¡Gracias!", count: "uno, dos, tres", script: "¡Hola! (Latin + ¡!)" },
  { name: "French 🇫🇷", hello: "Bonjour!", thanks: "Merci!", count: "un, deux, trois", script: "Bonjour! (Latin + accents)" },
  { name: "Japanese 🇯🇵", hello: "こんにちは!", thanks: "ありがとう!", count: "いち、に、さん", script: "Trace: こ ん に ち は" },
  { name: "Arabic 🇪🇬", hello: "!مرحبا", thanks: "!شكرا", count: "واحد، اثنان، ثلاثة", script: "Right-to-left! مرحبا" },
  { name: "German 🇩🇪", hello: "Hallo!", thanks: "Danke!", count: "eins, zwei, drei", script: "Hallo! (ß is fun: Straße)" },
  { name: "Italian 🇮🇹", hello: "Ciao!", thanks: "Grazie!", count: "uno, due, tre", script: "Ciao! (musical words)" },
  { name: "Portuguese 🇧🇷", hello: "Olá!", thanks: "Obrigado!", count: "um, dois, três", script: "Olá! (nasal ão!)" },
  { name: "Hindi 🇮🇳", hello: "नमस्ते!", thanks: "धन्यवाद!", count: "एक, दो, तीन", script: "Trace: न म स् ते" },
];
export function WorldLanguages({ moduleId }: { moduleId: string }) {
  const [idx, setIdx] = useState(0);
  const [stamps, setStamps] = useState<string[]>([]);
  const [said, setSaid] = useState(false);
  const { recordProgress } = useAppStore();
  const L = LANGS[idx % LANGS.length];
  const sayHello = () => {
    speak(L.hello.replace(/[!¡]/g, ""));
    setSaid(true);
    if (!stamps.includes(L.name)) {
      const n = [...stamps, L.name];
      setStamps(n);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 85 });
      if (n.length >= 8) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
  };
  return (
    <SimulationShell title="Languages of the World" icon="🌍"
      controls={<>
        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">{LANGS.map((l, i) => (
          <Button key={l.name} size="sm" variant={idx % LANGS.length === i ? "default" : "outline"} onClick={() => { setIdx(i); setSaid(false); }} className="text-xs">
            {stamps.includes(l.name) ? "🛂 " : ""}{l.name}
          </Button>
        ))}</div>
        <p className="text-xs text-slate-500">Passport: {stamps.length}/8 stamps</p>
      </>}
      dataPanel={<div className="text-sm"><p>🗣️ 7,000+ languages alive!</p><p>🐄 'Animal' works in Spanish too — cognate!</p><p>🎵 Tones change meaning in Mandarin</p></div>}>
      <div className="p-4 text-center">
        <p className="font-display font-black text-2xl">{L.name}</p>
        <p className="text-5xl my-2">{L.hello}</p>
        <Button variant="fun" onClick={sayHello}>🔊 Say it + stamp passport!</Button>
        {said && <div className="mt-3 bg-violet-50 rounded-xl p-3 text-sm space-y-1">
          <p>🙏 Thanks: <b>{L.thanks}</b></p>
          <p>🔢 Count: <b>{L.count}</b></p>
          <p>✏️ Script: <b>{L.script}</b></p>
        </div>}
        <Quiz questions={[
          { q: "'Animal' in Spanish is also 'animal' — that's a...", options: ["Cognate", "Antonym", "Verb"], answer: 0, explain: "Free vocabulary!" },
          { q: "Arabic is written...", options: ["Left to right", "Right to left", "Upside down"], answer: 1, explain: "Start from the right!" },
          { q: "How many languages exist?", options: ["~100", "~700", "~7,000"], answer: 2, explain: "A huge human family!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
