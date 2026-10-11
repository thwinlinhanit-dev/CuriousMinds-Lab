"use client";
import React, { useState, useEffect } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- WORD EXPLORER ---- */
const DECKS: Record<string, Array<{ w: string; d: string; e: string }>> = {
  science: [
    { w: "Gravity", d: "Force pulling objects together", e: "Gravity keeps us on the ground" },
    { w: "Molecule", d: "Two or more atoms bonded", e: "Water is a molecule" },
    { w: "Energy", d: "Ability to do work", e: "Sunlight gives plants energy" },
    { w: "Ecosystem", d: "Living things + environment", e: "A pond is an ecosystem" },
    { w: "Hypothesis", d: "A testable guess", e: "My hypothesis: plants need light" },
    { w: "Friction", d: "Force slowing sliding things", e: "Shoes grip because of friction" },
    { w: "Photosynthesis", d: "Plants making food from sun", e: "Leaves do photosynthesis" },
    { w: "Orbit", d: "Path around another object", e: "Earth orbits the Sun" },
  ],
  math: [
    { w: "Perimeter", d: "Distance around a shape", e: "Fence = perimeter" },
    { w: "Fraction", d: "Part of a whole", e: "Half a pizza is 1/2" },
    { w: "Symmetry", d: "Matching halves", e: "Butterflies have symmetry" },
    { w: "Probability", d: "Chance of happening", e: "Coin heads: 1/2 probability" },
  ],
  art: [
    { w: "Palette", d: "Set of colors", e: "Pick 5 for your painting" },
    { w: "Tessellation", d: "Shapes tiling, no gaps", e: "Honeycomb tessellates" },
    { w: "Contrast", d: "Big differences side by side", e: "Black on white = contrast" },
  ],
};
export function WordExplorer({ moduleId }: { moduleId: string }) {
  const [deck, setDeck] = useState("science");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const cards = DECKS[deck];
  const card = cards[idx % cards.length];
  const mark = (knew: boolean) => {
    if (knew && !mastered.includes(card.w)) {
      const m = [...mastered, card.w];
      setMastered(m);
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 85 });
      if (m.length >= 6) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
    setIdx(idx + 1); setFlipped(false);
  };
  return (
    <SimulationShell title="Word Explorer" icon="📖"
      controls={<>
        <div className="flex gap-1.5">{Object.keys(DECKS).map((d) => <Button key={d} size="sm" variant={deck === d ? "default" : "outline"} onClick={() => { setDeck(d); setIdx(0); setFlipped(false); }} className="flex-1 capitalize">{d}</Button>)}</div>
        <p className="text-sm">⭐ Mastered: {mastered.length}/6 {mastered.join(", ")}</p>
      </>}
      dataPanel={<div className="text-sm"><p>📖 English: 170,000+ words!</p><p>🔍 Roots unlock meanings: photo=light, bio=life</p><p>🃏 Flip, guess, repeat!</p></div>}>
      <div className="p-6 text-center">
        <div onClick={() => setFlipped(!flipped)} className="max-w-sm mx-auto h-52 rounded-2xl border-4 border-violet-300 bg-gradient-to-br from-violet-50 to-fuchsia-50 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform p-4">
          {!flipped ? <><p className="font-display font-black text-3xl">{card.w}</p><p className="text-sm text-slate-500 mt-2">Tap to flip! 🔄</p></> : <><p className="font-bold">{card.d}</p><p className="text-sm italic text-slate-500 mt-2">e.g. {card.e}</p></>}
        </div>
        <div className="flex justify-center gap-2 mt-3">
          <Button variant="outline" onClick={() => mark(false)}>😅 Still learning</Button>
          <Button variant="fun" onClick={() => mark(true)}>✅ I knew it!</Button>
        </div>
        <Quiz questions={[
          { q: "'Bio' in biology means...", options: ["Book", "Life", "Big"], answer: 1, explain: "Biography = life story!" },
          { q: "Best way to learn words?", options: ["Memorize once", "Use in sentences", "Ignore"], answer: 1, explain: "Use it = keep it!" },
          { q: "Context clues are...", options: ["Surrounding words", "Dictionary only", "Guessing randomly"], answer: 0, explain: "Neighbors hint meaning!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- STORY WORKSHOP ---- */
const STARTERS = [
  "A robot woke up in your backyard...",
  "The gravity on Earth suddenly turned off for one hour...",
  "You found a door at the bottom of the ocean...",
  "Your drawing came to life at midnight...",
  "A dragon who loves math moved next door...",
  "The Moon started slowly falling toward Earth...",
];
const CHARACTERS = ["🧑‍🚀 a brave astronaut", "🤖 a curious robot", "🧙 a forgetful wizard", "🐉 a shy dragon", "🔬 a kid scientist", "🐙 an alien octopus"];
const SETTINGS = ["on Mars in 2087", "inside a volcano", "in a floating city", "under the ocean", "in a library that never ends", "on a tiny island"];
export function StoryWriter({ moduleId }: { moduleId: string }) {
  const [starter, setStarter] = useState(STARTERS[0]);
  const [character, setCharacter] = useState(CHARACTERS[4]);
  const [setting, setSetting] = useState(SETTINGS[0]);
  const [text, setText] = useState("");
  const { recordProgress } = useAppStore();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const spin = () => {
    setStarter(STARTERS[Math.floor(Math.random() * STARTERS.length)]);
    setCharacter(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]);
    setSetting(SETTINGS[Math.floor(Math.random() * SETTINGS.length)]);
  };
  const publish = async () => {
    await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: starter.slice(0, 40), content: `${character} ${setting}\n\n${text}`, mood: "✍️" }) });
    await saveCreation(starter.slice(0, 30), "writing", { text, starter }, { moduleId, subjectId: "language" });
    recordProgress(moduleId, { timeSpentSeconds: 180, score: 95, status: "completed" });
    alert("📖 Published to your Journal!");
  };
  return (
    <SimulationShell title="Story Workshop" icon="✍️"
      controls={<>
        <Button variant="fun" size="sm" onClick={spin} className="w-full">🎲 Spin a story!</Button>
        <div className="text-sm space-y-1 bg-amber-50 rounded-xl p-2">
          <p><b>Start:</b> {starter}</p>
          <p><b>Hero:</b> {character}</p>
          <p><b>Place:</b> {setting}</p>
        </div>
        <p className="text-xs text-slate-500">Words: {words} {words >= 50 ? "🎉 Author!" : "(50 = published author!)"}</p>
        <SaveButton onSave={publish} label="📖 Publish story!" />
      </>}
      dataPanel={<div className="text-sm"><p>📖 Beginning → middle → end</p><p>💬 Show, don't tell: "hands shook" {">"}  "was scared"</p><p>✏️ Great writers REVISE!</p></div>}
      onSave={publish}>
      <div className="p-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder={`${starter}\n\n${character} woke up ${setting}... (start writing!)`} className="w-full border-2 border-slate-200 rounded-xl p-3 font-serif leading-relaxed" />
        <Quiz questions={[
          { q: "A story needs...", options: ["Only a hero", "Character + setting + problem", "Only jokes"], answer: 1, explain: "Who, where, what goes wrong!" },
          { q: "'Show don't tell' means...", options: ["Use pictures only", "Describe senses/actions", "Shout"], answer: 1, explain: "'Hands shook' > 'was scared'!" },
          { q: "Dialogue shows...", options: ["What characters say", "The weather", "Nothing"], answer: 0, explain: '"Let\'s go!" she said.' },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- POETRY LAB ---- */
const MAGNETS = ["moon", "dances", "silver", "wild", "river", "sings", "brave", "stars", "whispers", "electric", "dream", "thunder", "softly", "fireflies", "ancient", "laughs"];
const countSyllables = (w: string) => {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const m = w.replace(/(?:[^laeiouy]|ed|es)$/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
};
export function PoetryLab({ moduleId }: { moduleId: string }) {
  const [lines, setLines] = useState<string[]>(["An old silent pond", "A frog jumps into the pond", "Splash! Silence again"]);
  const [editIdx, setEditIdx] = useState(0);
  const [poem, setPoem] = useState<string[]>([]);
  const { recordProgress } = useAppStore();
  const counts = lines.map((l) => l.split(/\s+/).filter(Boolean).reduce((s, w) => s + countSyllables(w), 0));
  const isHaiku = counts[0] === 5 && counts[1] === 7 && counts[2] === 5;
  useEffect(() => { if (isHaiku) recordProgress(moduleId, { timeSpentSeconds: 120, score: 100, status: "completed" }); }, [isHaiku]);
  return (
    <SimulationShell title="Poetry Lab" icon="📜"
      controls={<>
        <p className="text-sm font-bold">🧲 Magnetic words (click to add):</p>
        <div className="flex flex-wrap gap-1">{MAGNETS.map((w) => <button key={w} onClick={() => setPoem([...poem, w])} className="px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded shadow">{w}</button>)}</div>
        <div className="bg-white border-2 rounded-xl p-2 min-h-[60px] text-sm font-serif">
          {poem.join(" ") || <span className="text-slate-400">Your magnet poem...</span>}
          {poem.length > 0 && <button onClick={() => setPoem([])} className="ml-2 text-red-500 font-bold">✕</button>}
        </div>
        {poem.length >= 6 && <Button size="sm" variant="fun" onClick={() => { saveCreation("Magnet Poem", "writing", { poem: poem.join(" ") }, { moduleId, subjectId: "language" }); recordProgress(moduleId, { timeSpentSeconds: 60, score: 90 }); }}>💾 Save poem!</Button>}
      </>}
      dataPanel={<div className="text-sm"><p>📜 Haiku: 5-7-5 syllables</p><p>🎵 Rhyme: cat/hat, moon/spoon</p><p>👁️ Imagery: sense-pictures!</p>{isHaiku && <p className="font-bold text-green-600">🎉 PERFECT HAIKU!</p>}</div>}>
      <div className="p-4">
        <p className="font-bold text-sm">✍️ Haiku builder (click a line, then type):</p>
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 items-center mt-1">
            <span className={`w-14 text-center font-black rounded-lg ${counts[i] === [5, 7, 5][i] ? "bg-green-200" : "bg-amber-100"}`}>{counts[i]}/{[5, 7, 5][i]}</span>
            <input value={l} onChange={(e) => { const n = [...lines]; n[i] = e.target.value; setLines(n); }} onFocus={() => setEditIdx(i)} className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 font-serif" />
          </div>
        ))}
        <Quiz questions={[
          { q: "Haiku pattern:", options: ["5-7-5", "7-7-7", "3-3-3"], answer: 0, explain: "Syllables per line!" },
          { q: "Which pair rhymes?", options: ["cat / dog", "moon / spoon", "red / blue"], answer: 1, explain: "Matching end sounds!" },
          { q: "Imagery means...", options: ["Pictures only", "Sense-pictures in words", "Hiding"], answer: 1, explain: "'Crunchy leaves' — you hear it!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- GRAMMAR QUEST ---- */
const QUESTS = [
  { sentence: ["The", "astronaut", "launches", "the", "shiny", "rocket"], ask: "Tap the VERB (action)! ⚡", answer: "launches", type: "verb" },
  { sentence: ["A", "curious", "robot", "found", "three", "gears"], ask: "Tap an ADJECTIVE (describes)! 🎨", answer: ["curious", "three"], type: "adjective" },
  { sentence: ["Maya", "and", "Leo", "explore", "Mars"], ask: "Tap a NOUN (person/place/thing)! 📦", answer: ["Maya", "Leo", "Mars"], type: "noun" },
  { sentence: ["Wow", "the", "volcano", "erupted", "loudly"], ask: "Tap the ADVERB (describes the action)! 💨", answer: "loudly", type: "adverb" },
];
export function GrammarQuest({ moduleId }: { moduleId: string }) {
  const [q, setQ] = useState(0);
  const [msg, setMsg] = useState("Defeat the Muddle Monster! 👾");
  const [rank, setRank] = useState(0);
  const { recordProgress } = useAppStore();
  const cur = QUESTS[q % QUESTS.length];
  const tap = (w: string) => {
    const ok = Array.isArray(cur.answer) ? cur.answer.includes(w) : cur.answer === w;
    if (ok) {
      const r = rank + 1; setRank(r);
      setMsg(`✅ +1 Knight point! (${r}/8)`);
      recordProgress(moduleId, { timeSpentSeconds: 25, score: 90 });
      if (r >= 8) { recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 }); setMsg("🏆 GRAMMAR KNIGHT! The monster is defeated!"); }
      setTimeout(() => setQ(q + 1), 900);
    } else { setMsg(`❌ "${w}" is not it. ${cur.ask}`); }
  };
  const ranks = ["🥚 Squire", "🛡️ Page", "⚔️ Knight", "🏆 Grammar Champion"];
  return (
    <SimulationShell title="Grammar Quest" icon="🏰"
      controls={<>
        <p className="text-sm font-bold">👾 Muddle Monster HP: {Math.max(0, 8 - rank)}/8</p>
        <div className="h-3 bg-red-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 transition-all" style={{ width: `${(Math.max(0, 8 - rank) / 8) * 100}%` }} /></div>
        <p className="text-sm">🎖️ Rank: <b>{ranks[Math.min(3, Math.floor(rank / 2))]}</b> ({rank} pts)</p>
        <div className="bg-slate-50 rounded-xl p-2 text-xs"><p><b>Noun</b> 📦 person/place/thing</p><p><b>Verb</b> ⚡ action</p><p><b>Adjective</b> 🎨 describes nouns</p><p><b>Adverb</b> 💨 describes actions (often -ly!)</p></div>
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p className="text-xs text-slate-500">Shakespeare invented 1,700 words — including "eyeball"! 👁️</p></div>}>
      <div className="p-6 text-center">
        <p className="font-bold text-lg">{cur.ask}</p>
        <div className="flex justify-center gap-2 flex-wrap mt-3">
          {cur.sentence.map((w, i) => (
            <button key={i} onClick={() => tap(w)} className="px-4 py-3 bg-amber-100 border-2 border-amber-300 rounded-xl font-bold text-lg hover:bg-amber-200 active:scale-95">{w}</button>
          ))}
        </div>
        <Quiz questions={[
          { q: "'Rocket' is a...", options: ["Verb", "Noun", "Adjective"], answer: 1, explain: "A thing!" },
          { q: "'Quickly' is an...", options: ["Adverb", "Noun", "Verb"], answer: 0, explain: "-ly often = adverb!" },
          { q: "Every sentence needs...", options: ["An emoji", "Noun + verb", "A dragon"], answer: 1, explain: "Who + does!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
