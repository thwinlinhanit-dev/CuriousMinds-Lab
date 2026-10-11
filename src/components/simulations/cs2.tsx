"use client";
import React, { useEffect, useState } from "react";
import { SimulationShell, Quiz, SaveButton, saveCreation } from "./shared";
import { Slider, Button } from "@/components/ui/primitives";
import { useAppStore } from "@/stores/appStore";

/* ---- INTERNET JOURNEY ---- */
const MSGS = ["Hi!", "🐱 pic", "GG!", "❤️", "LOL"];
export function InternetJourney({ moduleId }: { moduleId: string }) {
  const [round, setRound] = useState(0);
  const [stage, setStage] = useState(0);
  const [broken, setBroken] = useState(0);
  const [log, setLog] = useState<string[]>(["📦 Message 1 split into packets. Pick a router!"]);
  const { recordProgress } = useAppStore();
  useEffect(() => { setBroken(Math.floor(Math.random() * 2)); }, [round]);
  const route = (pick: number) => {
    if (pick === broken) {
      setLog([`💥 Router ${pick === 0 ? "A" : "B"} cable CUT! Packet re-sent...`, ...log].slice(0, 4));
      setBroken(Math.floor(Math.random() * 2));
      return;
    }
    const s = stage + 1;
    setStage(s);
    setLog([`✅ Packet hopped via Router ${pick === 0 ? "A" : "B"} (${s}/2 hops)`, ...log].slice(0, 4));
    if (s >= 2) {
      const r = round + 1;
      setRound(r); setStage(0);
      recordProgress(moduleId, { timeSpentSeconds: 30, score: 90 });
      setLog([`🎉 "${MSGS[round % MSGS.length]}" DELIVERED! (${r}/5)`, ...log].slice(0, 4));
      if (r >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
    }
  };
  return (
    <SimulationShell title="How the Internet Works" icon="🌐"
      controls={<>
        <p className="text-sm font-bold">📦 Deliver 5 messages ({round}/5)</p>
        <div className="flex gap-2">
          <Button onClick={() => route(0)} className="flex-1">🅰️ Router A</Button>
          <Button onClick={() => route(1)} className="flex-1">🅱️ Router B</Button>
        </div>
        <p className="text-xs text-slate-500">⚠️ One cable is secretly cut each round — packets find another path!</p>
        <div className="max-h-28 overflow-y-auto">{log.map((l, i) => <p key={i} className="text-xs">{l}</p>)}</div>
      </>}
      dataPanel={<div className="text-sm"><p>📦 Split → route → rebuild!</p><p>🌊 99% rides undersea cables</p><p>📬 IP = street address</p></div>}>
      <div className="p-4">
        <div className="flex items-center justify-between text-center">
          <div><p className="text-4xl">📱</p><p className="text-xs font-bold">You</p></div>
          <div><p className="text-4xl">🅰️</p><p className="text-xs font-bold">Router A</p></div>
          <div><p className="text-4xl">🅱️</p><p className="text-xs font-bold">Router B</p></div>
          <div><p className="text-4xl">🖥️</p><p className="text-xs font-bold">Server</p></div>
        </div>
        <div className="flex gap-1 justify-center mt-2">
          {MSGS.map((m, i) => <span key={i} className={`text-2xl ${i < round ? "" : "grayscale opacity-30"}`}>{i < round ? "✅" : "📦"}</span>)}
        </div>
        {round >= 5 && <p className="text-center font-extrabold text-xl mt-2">🎉 All messages delivered! (First one ever crashed after "LO"!)</p>}
        <Quiz questions={[
          { q: "Messages travel as...", options: ["Whole letters", "Packets on many paths", "Pigeons"], answer: 1, explain: "Split, scattered, rebuilt!" },
          { q: "A router is like a...", options: ["Mailbox", "Mail sorter", "Stamp"], answer: 1, explain: "Forwards packets onward!" },
          { q: "An IP address is...", options: ["A password", "A computer's address", "A game"], answer: 1, explain: "So packets find home!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- SECURITY LAB ---- */
const PHISH = [
  { from: "🏦 Your Bank", text: "URGENT! Click here to verify your account NOW!", fake: true, why: "Banks never demand clicks!" },
  { from: "👩 Mom", text: "Don't forget soccer practice at 5!", fake: false, why: "Normal message, no links!" },
  { from: "🎮 Free Games!!!", text: "YOU WON! Enter your password to claim Robux!", fake: true, why: "Prizes + password = trap!" },
  { from: "🏫 School", text: "Field trip forms due Friday. See the office.", fake: false, why: "No urgency tricks or links!" },
  { from: "📦 Package Delivery", text: "Delivery failed! Pay $1 fee at sketchy-link.xyz", fake: true, why: "Weird link + tiny fee trick!" },
];
function pwScore(pw: string): { score: number; tips: string[] } {
  let s = 0; const tips: string[] = [];
  if (pw.length >= 12) s += 2; else if (pw.length >= 8) s += 1; else tips.push("longer! (12+ chars)");
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1; else tips.push("mix UPPER + lower");
  if (/\d/.test(pw)) s += 1; else tips.push("add numbers");
  if (/[^A-Za-z0-9]/.test(pw)) s += 1; else tips.push("add symbols like !?");
  if (/123|password|abc/i.test(pw)) { s = Math.min(s, 1); tips.push("too guessable!"); }
  return { score: Math.min(5, s), tips };
}
export function SecurityLab({ moduleId }: { moduleId: string }) {
  const [pw, setPw] = useState("");
  const [strong, setStrong] = useState(false);
  const [phishIdx, setPhishIdx] = useState(0);
  const [phishScore, setPhishScore] = useState(0);
  const [shift, setShift] = useState(3);
  const [plain, setPlain] = useState("HELLO");
  const [cipherDone, setCipherDone] = useState(false);
  const { recordProgress } = useAppStore();
  const { score, tips } = pwScore(pw);
  useEffect(() => {
    if (score >= 4 && !strong) {
      setStrong(true);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 90 });
      checkDone(true, phishScore >= 5, cipherDone);
    }
  }, [score]);
  const checkDone = (st = strong, ph = phishScore >= 5, ci = cipherDone) => {
    if (st && ph && ci) recordProgress(moduleId, { timeSpentSeconds: 30, status: "completed", score: 100 });
  };
  const judge = (fake: boolean) => {
    const cur = PHISH[phishIdx % PHISH.length];
    if (fake === cur.fake) {
      const s = phishScore + 1; setPhishScore(s);
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 85 });
      checkDone(strong, s >= 5, cipherDone);
    }
    setPhishIdx(phishIdx + 1);
  };
  const cur = PHISH[phishIdx % PHISH.length];
  const encoded = plain.toUpperCase().split("").map((ch) => {
    const c = ch.charCodeAt(0);
    return c >= 65 && c <= 90 ? String.fromCharCode(((c - 65 + shift) % 26) + 65) : ch;
  }).join("");
  return (
    <SimulationShell title="Password & Safety Lab" icon="🔐"
      controls={<>
        <p className="text-sm font-bold">🔑 Password tester:</p>
        <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Try a password..." className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-mono" />
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${score >= 4 ? "bg-green-500" : score >= 2 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${score * 20}%` }} /></div>
        <p className="text-xs font-bold">{score >= 4 ? "🛡️ STRONG! White-hat approved!" : `Weak — ${tips.join(", ") || "type more!"}`}</p>
        <div className="border-t pt-2">
          <p className="text-sm font-bold">🔄 Caesar cipher (shift {shift}):</p>
          <input value={plain} onChange={(e) => setPlain(e.target.value.replace(/[^a-zA-Z ]/g, ""))} className="w-full border-2 rounded-xl px-2 py-1 font-mono text-sm" />
          <Slider label="Key shift" value={shift} min={1} max={25} onChange={setShift} />
          <p className="font-mono font-bold text-sm">→ {encoded}</p>
          <Button size="sm" variant="outline" onClick={() => { setCipherDone(true); checkDone(strong, phishScore >= 5, true); recordProgress(moduleId, { timeSpentSeconds: 25, score: 85 }); }} className="w-full">📨 Send secret message!</Button>
        </div>
      </>}
      dataPanel={<div className="text-sm space-y-1"><p>🔑 Password: <b>{strong ? "✅ strong" : "❌ weak"}</b></p><p>🎣 Phishing: <b>{phishScore}/5</b></p><p>🔄 Cipher: <b>{cipherDone ? "✅ sent" : "—"}</b></p><p className="text-xs text-slate-500">Never share passwords or codes!</p></div>}>
      <div className="p-4 max-w-md mx-auto">
        <p className="font-bold text-sm">🎣 Inbox — real or PHISH? ({Math.min(phishScore, 5)}/5 correct)</p>
        <div className="border-2 border-slate-200 rounded-xl p-3 mt-1 bg-white">
          <p className="font-bold text-sm">{cur.from}</p>
          <p className="text-sm">{cur.text}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={() => judge(false)} className="flex-1">✅ Real</Button>
          <Button size="sm" variant="outline" onClick={() => judge(true)} className="flex-1">🎣 PHISH!</Button>
        </div>
        <Quiz questions={[
          { q: "Strong passwords are...", options: ["Short + simple", "Long + random + unique", "Your birthday"], answer: 1, explain: "12+ chars, mixed!" },
          { q: "Phishing wants your...", options: ["Friendship", "Info via fakes", "Homework"], answer: 1, explain: "Urgency + links = red flags!" },
          { q: "Two-factor adds...", options: ["A second check", "Two passwords", "Nothing"], answer: 0, explain: "Password + code!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- ROBOT SIMULATOR ---- */
const MAZES = [
  ["########", "#R.....#", "#.###..#", "#...#..#", "#.###..#", "#.....G#", "########"],
  ["########", "#R..#..#", "##..#..#", "#...##.#", "#.#...G#", "#...####", "########"],
  ["########", "#R#....#", "#.#.##.#", "#.#..#.#", "#.##.#.#", "#....#G#", "########"],
];
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const ARROWS = ["⬆️", "➡️", "⬇️", "⬅️"];
export function RobotSimulator({ moduleId }: { moduleId: string }) {
  const [level, setLevel] = useState(0);
  const [pos, setPos] = useState<[number, number]>([1, 1]);
  const [dir, setDir] = useState(1);
  const [queue, setQueue] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("Queue commands, then ▶ Run!");
  const [wins, setWins] = useState(0);
  const { recordProgress } = useAppStore();
  const maze = MAZES[level % MAZES.length];
  const reset = () => { setPos([1, 1]); setDir(1); setQueue([]); setMsg("Queue commands, then ▶ Run!"); };
  useEffect(reset, [level]);
  const run = async () => {
    setRunning(true);
    let [x, y] = pos; let d = dir;
    for (const cmd of queue) {
      await new Promise((r) => setTimeout(r, 350));
      if (cmd === "L") d = (d + 3) % 4;
      else if (cmd === "R") d = (d + 1) % 4;
      else {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        if (maze[ny]?.[nx] === "#") { setMsg("🛑 SENSOR STOP! Wall ahead — crash avoided!"); setRunning(false); return; }
        x = nx; y = ny;
      }
      setPos([x, y]); setDir(d);
    }
    setRunning(false);
    if (maze[y][x] === "G") {
      const w = wins + 1; setWins(w);
      setMsg(`🎉 PARKED! Level ${level + 1} clear!`);
      recordProgress(moduleId, { timeSpentSeconds: 60, score: 95 });
      if (w >= 3) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      else setTimeout(() => setLevel(level + 1), 1200);
    } else setMsg("🤖 Ran out of commands — not at the goal. Debug!");
  };
  return (
    <SimulationShell title="Robot Simulator" icon="🤖"
      controls={<>
        <p className="text-sm font-bold">Level {level + 1}/3 • Parked {wins}/3 🏁</p>
        <div className="grid grid-cols-3 gap-1.5">
          <Button size="sm" onClick={() => setQueue([...queue, "F"])}>⬆️ Forward</Button>
          <Button size="sm" onClick={() => setQueue([...queue, "L"])}>↩️ Left</Button>
          <Button size="sm" onClick={() => setQueue([...queue, "R"])} >↪️ Right</Button>
        </div>
        <div className="bg-slate-800 text-green-300 rounded-xl p-2 text-sm font-mono min-h-[44px]">
          {queue.map((c, i) => <span key={i} className="mr-1">{c === "F" ? "⬆️" : c === "L" ? "↩️" : "↪️"}</span>) || <span className="text-slate-500">...empty...</span>}
          <button onClick={() => setQueue([])} className="ml-2 text-red-400 font-bold">✕</button>
        </div>
        <Button variant="fun" onClick={run} disabled={running || queue.length === 0} className="w-full">{running ? "Running... 🤖" : "▶️ Run program!"}</Button>
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p className="text-xs text-slate-500 mt-1">Mars rovers drive themselves between check-ins!</p></div>}>
      <div className="p-4">
        <div className="grid gap-0.5 mx-auto" style={{ gridTemplateColumns: "repeat(8, 1fr)", maxWidth: "340px" }}>
          {maze.map((row, y) => row.split("").map((cell, x) => (
            <div key={`${x}${y}`} className={`aspect-square rounded flex items-center justify-center text-xl ${cell === "#" ? "bg-slate-700" : cell === "G" ? "bg-green-200" : "bg-slate-100"}`}>
              {pos[0] === x && pos[1] === y ? ARROWS[dir] : cell === "G" ? "🏁" : ""}
            </div>
          )))}
        </div>
        <Quiz questions={[
          { q: "Robots follow...", options: ["Feelings", "Exact instructions", "Luck"], answer: 1, explain: "Code is law!" },
          { q: "A wall sensor prevents...", options: ["Boredom", "Crashes", "Noise"], answer: 1, explain: "Senses = robot eyes!" },
          { q: "Your program failed? You should...", options: ["Quit", "Debug step by step", "Shake it"], answer: 1, explain: "Test small, fix calmly!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- GAME DESIGNER ---- */
const GW = 10, GH = 7;
export function GameDesigner({ moduleId }: { moduleId: string }) {
  const [tool, setTool] = useState("wall");
  const [walls, setWalls] = useState<number[]>([]);
  const [coins, setCoins] = useState<number[]>([14, 25, 36]);
  const [enemies, setEnemies] = useState<number[]>([33]);
  const [player, setPlayer] = useState(3);
  const [goal, setGoal] = useState(66);
  const [playing, setPlaying] = useState(false);
  const [got, setGot] = useState<number[]>([]);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState("Design, then ▶ Playtest!");
  const { recordProgress } = useAppStore();
  const cell = (i: number) => {
    if (playing) return;
    if (tool === "wall") setWalls(walls.includes(i) ? walls.filter((w) => w !== i) : [...walls, i]);
    else if (tool === "coin") setCoins(coins.includes(i) ? coins.filter((c) => c !== i) : [...coins, i]);
    else if (tool === "enemy") setEnemies(enemies.includes(i) ? enemies.filter((e) => e !== i) : [...enemies, i]);
    else if (tool === "player") setPlayer(i);
    else if (tool === "goal") setGoal(i);
  };
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTick((x) => x + 1), 600);
    return () => clearInterval(t);
  }, [playing]);
  const enemyPos = (e: number) => {
    const x = e % GW;
    const range = 2;
    const off = [0, 1, 0, -1][tick % 4];
    const nx = Math.max(0, Math.min(GW - 1, x + off > x ? range : off < 0 ? -range : 0));
    void nx;
    return e + ([0, 1, 0, -1][tick % 4]);
  };
  const move = (dx: number, dy: number) => {
    if (!playing) return;
    const x = player % GW, y = Math.floor(player / GW);
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= GW || ny < 0 || ny >= GH) return;
    const ni = ny * GW + nx;
    if (walls.includes(ni)) return;
    if (enemies.map(enemyPos).includes(ni)) {
      setMsg("💥 Chomped! Enemies patrol — time your run!");
      setPlaying(false); setPlayer(3); setGot([]);
      return;
    }
    setPlayer(ni);
    if (coins.includes(ni) && !got.includes(ni)) {
      const g = [...got, ni]; setGot(g);
      recordProgress(moduleId, { timeSpentSeconds: 20, score: 80 });
    }
    if (ni === goal) {
      if (got.length + (coins.includes(ni) && !got.includes(ni) ? 1 : 0) >= coins.length && coins.length > 0) {
        setMsg("🏆 LEVEL BEATEN! Published to arcade!");
        setPlaying(false);
        recordProgress(moduleId, { timeSpentSeconds: 90, score: 100, status: "completed" });
      } else setMsg(`🏁 Goal! But grab all ${coins.length} coins first! (${got.length})`);
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!playing) return;
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  return (
    <SimulationShell title="Game Designer Studio" icon="🎮"
      controls={<>
        <div className="grid grid-cols-3 gap-1.5">{[["wall", "🧱 Wall"], ["coin", "🪙 Coin"], ["enemy", "👾 Enemy"], ["player", "😀 Player"], ["goal", "🏁 Goal"], ["erase", "🧽 Erase"]].map(([v, l]) => (
          <Button key={v} size="sm" variant={tool === v ? "default" : "outline"} onClick={() => setTool(v)} className="text-xs">{l}</Button>
        ))}</div>
        <Button variant={playing ? "default" : "fun"} onClick={() => { setPlaying(!playing); setGot([]); setPlayer(3); setMsg(playing ? "Design, then ▶ Playtest!" : "Playtest! Arrows/WASD move. Get coins, dodge, reach 🏁!"); }} className="w-full">
          {playing ? "⏸️ Stop test" : "▶️ Playtest my level!"}
        </Button>
        <SaveButton onSave={() => saveCreation("My Level", "code", { walls, coins, enemies, goal }, { moduleId, subjectId: "cs" })} label="🎮 Publish level!" />
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p>🪙 {got.length}/{coins.length} • Goal needs ALL coins!</p><p className="text-xs text-slate-500">Fair but tricky = great design!</p></div>}
      onSave={() => saveCreation("My Level", "code", { walls, coins, enemies, goal }, { moduleId, subjectId: "cs" })}>
      <div className="p-3">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GW}, 1fr)` }}>
          {Array.from({ length: GW * GH }).map((_, i) => {
            const ep = enemies.map(enemyPos);
            return (
              <button key={i} onClick={() => cell(i)} className={`aspect-square rounded text-lg ${walls.includes(i) ? "bg-amber-700" : "bg-slate-100 hover:bg-slate-200"}`}>
                {i === player ? "😀" : i === goal ? "🏁" : ep.includes(i) ? "👾" : coins.includes(i) ? (got.includes(i) ? "✨" : "🪙") : ""}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-1 max-w-[200px] mx-auto mt-2 md:hidden">
          <span /><Button size="sm" onClick={() => move(0, -1)}>⬆️</Button><span />
          <Button size="sm" onClick={() => move(-1, 0)}>⬅️</Button><Button size="sm" onClick={() => move(0, 1)}>⬇️</Button><Button size="sm" onClick={() => move(1, 0)}>➡️</Button>
        </div>
        <Quiz questions={[
          { q: "Great levels are...", options: ["Impossible", "Fair but tricky", "Empty"], answer: 1, explain: "Challenge + fairness!" },
          { q: "Playtesting means...", options: ["Playing alone", "Watching others play to fix issues", "Deleting"], answer: 1, explain: "Real players find real bugs!" },
          { q: "Difficulty should...", options: ["Stay flat", "Ramp up gradually", "Start max"], answer: 1, explain: "Teach, then test!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}

/* ---- DATABASE DETECTIVE ---- */
const DINOS = [
  { name: "T. rex", diet: "carnivore", period: "Cretaceous", height: 4, length: 12 },
  { name: "Triceratops", diet: "herbivore", period: "Cretaceous", height: 3, length: 9 },
  { name: "Brachiosaurus", diet: "herbivore", period: "Jurassic", height: 13, length: 25 },
  { name: "Velociraptor", diet: "carnivore", period: "Cretaceous", height: 0.5, length: 2 },
  { name: "Stegosaurus", diet: "herbivore", period: "Jurassic", height: 4, length: 9 },
  { name: "Spinosaurus", diet: "carnivore", period: "Cretaceous", height: 5, length: 15 },
  { name: "Coelophysis", diet: "carnivore", period: "Triassic", height: 1, length: 3 },
  { name: "Diplodocus", diet: "herbivore", period: "Jurassic", height: 5, length: 27 },
  { name: "Ankylosaurus", diet: "herbivore", period: "Cretaceous", height: 2, length: 8 },
  { name: "Allosaurus", diet: "carnivore", period: "Jurassic", height: 3.5, length: 9 },
  { name: "Parasaurolophus", diet: "herbivore", period: "Cretaceous", height: 3, length: 10 },
  { name: "Dilophosaurus", diet: "carnivore", period: "Jurassic", height: 2, length: 6 },
];
const DB_CASES = [
  { q: "Who was the TALLEST carnivore?", answer: "Spinosaurus" },
  { q: "Which Triassic dino is in the records?", answer: "Coelophysis" },
  { q: "Longest herbivore of the Jurassic?", answer: "Diplodocus" },
  { q: "Smallest carnivore here?", answer: "Velociraptor" },
  { q: "Tallest of ALL dinosaurs?", answer: "Brachiosaurus" },
];
export function DatabaseDetective({ moduleId }: { moduleId: string }) {
  const [diet, setDiet] = useState("all");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("name");
  const [caseIdx, setCaseIdx] = useState(0);
  const [solved, setSolved] = useState(0);
  const [msg, setMsg] = useState("Filter + sort to crack the case!");
  const { recordProgress } = useAppStore();
  let rows = DINOS.filter((d) => (diet === "all" || d.diet === diet) && (period === "all" || d.period === period));
  rows = [...rows].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "height" ? b.height - a.height : b.length - a.length);
  const c = DB_CASES[caseIdx % DB_CASES.length];
  const accuse = (name: string) => {
    if (name === c.answer) {
      const s = solved + 1; setSolved(s); setMsg(`✅ ${name}! Case closed!`);
      recordProgress(moduleId, { timeSpentSeconds: 40, score: 95 });
      if (s >= 5) recordProgress(moduleId, { timeSpentSeconds: 20, status: "completed", score: 100 });
      setTimeout(() => { setCaseIdx(caseIdx + 1); setMsg("New case! Filter + sort!"); }, 1200);
    } else setMsg(`❌ Not ${name}. Query the data!`);
  };
  return (
    <SimulationShell title="Database Detective" icon="🗄️"
      controls={<>
        <p className="text-sm font-bold">🔍 Case {solved + 1}/5: {c.q}</p>
        <label className="block text-xs font-bold">Filter diet
          <select value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full border-2 rounded-lg px-2 py-1 mt-0.5">
            <option value="all">All diets</option><option value="carnivore">🥩 Carnivore</option><option value="herbivore">🌿 Herbivore</option>
          </select></label>
        <label className="block text-xs font-bold">Filter period
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full border-2 rounded-lg px-2 py-1 mt-0.5">
            <option value="all">All periods</option><option value="Triassic">Triassic</option><option value="Jurassic">Jurassic</option><option value="Cretaceous">Cretaceous</option>
          </select></label>
        <label className="block text-xs font-bold">Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border-2 rounded-lg px-2 py-1 mt-0.5">
            <option value="name">Name A–Z</option><option value="height">Height ↓</option><option value="length">Length ↓</option>
          </select></label>
      </>}
      dataPanel={<div className="text-sm"><p className="font-bold">{msg}</p><p>📊 Showing {rows.length}/12 rows</p><p className="text-xs text-slate-500">Ask precisely, filter bravely!</p></div>}>
      <div className="p-3">
        <div className="text-xs font-mono">
          <div className="grid grid-cols-5 gap-1 font-bold bg-slate-800 text-white rounded-t-lg px-2 py-1"><span>Name</span><span>Diet</span><span>Period</span><span>H (m)</span><span>L (m)</span></div>
          {rows.map((d) => (
            <button key={d.name} onClick={() => accuse(d.name)} className="grid grid-cols-5 gap-1 w-full text-left px-2 py-1 border-b hover:bg-amber-50">
              <span className="font-bold">🦕 {d.name}</span><span>{d.diet === "carnivore" ? "🥩" : "🌿"}</span><span>{d.period.slice(0, 4)}.</span><span>{d.height}</span><span>{d.length}</span>
            </button>
          ))}
          {rows.length === 0 && <p className="p-2 text-slate-400">No rows! Loosen a filter.</p>}
        </div>
        <p className="text-xs text-slate-500 mt-1">👆 Click the guilty dinosaur to close the case!</p>
        <Quiz questions={[
          { q: "A database stores data in...", options: ["Piles", "Rows + columns", "Songs"], answer: 1, explain: "Organized tables!" },
          { q: "Filtering means...", options: ["Deleting forever", "Keeping only matches", "Mixing up"], answer: 1, explain: "Narrow it down!" },
          { q: "Sorting by height ↓ shows...", options: ["Shortest first", "Tallest first", "Random"], answer: 1, explain: "Extremes pop out!" },
        ]} onComplete={(s) => recordProgress(moduleId, { timeSpentSeconds: 90, score: s, status: s >= 66 ? "completed" : undefined })} />
      </div>
    </SimulationShell>
  );
}
