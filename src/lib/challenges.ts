export interface DailyChallengeDef {
  title: string;
  description: string;
  moduleId: string;
  subjectId: string;
  xpReward: number;
}

const POOL: DailyChallengeDef[] = [
  { title: "Launch Master", description: "Hit the target 3 times in Projectile Launcher", moduleId: "physics-projectile", subjectId: "physics", xpReward: 30 },
  { title: "Atom Architect", description: "Build Oxygen (8 protons) in Atom Builder", moduleId: "chem-atom-builder", subjectId: "chemistry", xpReward: 30 },
  { title: "Beat Maker", description: "Create an 8-step drum pattern", moduleId: "music-beats", subjectId: "music", xpReward: 25 },
  { title: "Fraction Star", description: "Match 5 fractions correctly", moduleId: "math-fractions", subjectId: "math", xpReward: 25 },
  { title: "Pixel Artist", description: "Finish a 16×16 pixel artwork and save it", moduleId: "art-pixel", subjectId: "art", xpReward: 25 },
  { title: "Code Turtle", description: "Draw a square with Turtle Graphics", moduleId: "cs-turtle", subjectId: "cs", xpReward: 30 },
  { title: "Wave Rider", description: "Make a wave with frequency 5 Hz in Wave Simulator", moduleId: "physics-waves", subjectId: "physics", xpReward: 25 },
  { title: "Cell Detective", description: "Identify 5 organelles in Cell Explorer", moduleId: "bio-cell-explorer", subjectId: "biology", xpReward: 25 },
  { title: "Story Spark", description: "Write a 5-sentence story in Story Workshop", moduleId: "lang-story-writer", subjectId: "language", xpReward: 25 },
  { title: "Probability Pro", description: "Roll the dice 20 times and record results", moduleId: "math-probability", subjectId: "math", xpReward: 25 },
  { title: "Bend the Beam", description: "Hit all 3 targets in the Light & Optics Bench", moduleId: "physics-optics", subjectId: "physics", xpReward: 30 },
  { title: "Element Hunter", description: "Find 5 elements by riddle in the Periodic Table", moduleId: "chem-periodic", subjectId: "chemistry", xpReward: 30 },
  { title: "Fossil Finder", description: "Excavate 6 bones in Dino Dig", moduleId: "bio-dinos", subjectId: "biology", xpReward: 25 },
  { title: "Phase Predictor", description: "Name 5 moon phases in a row", moduleId: "earth-moon", subjectId: "earthspace", xpReward: 25 },
  { title: "Times Hero", description: "Finish a belt test in the Times Table Dojo", moduleId: "math-timestable", subjectId: "math", xpReward: 30 },
  { title: "Chord Changer", description: "Play the 4-chord song in Chord Studio", moduleId: "music-chords", subjectId: "music", xpReward: 25 },
  { title: "Vanishing Point", description: "Draw a room in Perspective Studio", moduleId: "art-perspective", subjectId: "art", xpReward: 25 },
  { title: "Maze Runner", description: "Park the robot without crashing in Robot Simulator", moduleId: "cs-robots", subjectId: "cs", xpReward: 30 },
  { title: "Spelling Star", description: "Get a 5-word streak in Spelling Bee Arena", moduleId: "lang-spelling", subjectId: "language", xpReward: 25 },
  { title: "Song Writer", description: "Compose and save a song in Song Maker", moduleId: "web-song-maker", subjectId: "music", xpReward: 30 },
  { title: "Stargazer", description: "Find the Moon in Stellarium Night Sky", moduleId: "web-stellarium", subjectId: "earthspace", xpReward: 25 },
  { title: "Orbit Ace", description: "Score a circular orbit in the Satellite Game", moduleId: "web-orbit-game", subjectId: "physics", xpReward: 30 },
  { title: "Snake Charmer", description: "Score 50 in Pixel Snake arcade", moduleId: "web-pixel-snake", subjectId: "cs", xpReward: 25 },
  { title: "Tactician", description: "Solve the daily puzzle in Chess Puzzles", moduleId: "web-chess", subjectId: "math", xpReward: 30 },
  { title: "World Traveler", description: "Guess the country in 5 tries in Globle", moduleId: "web-globle", subjectId: "geography", xpReward: 25 },
  { title: "Flag Fan", description: "Get a 5-flag streak in Flag Detective", moduleId: "geo-flags", subjectId: "geography", xpReward: 25 },
  { title: "Storm Tracker", description: "Find one storm on Windy Weather Maps", moduleId: "web-windy", subjectId: "earthspace", xpReward: 25 },
  { title: "Galaxy Coder", description: "Finish 3 puzzles in Star Wars Coding", moduleId: "web-starwars", subjectId: "cs", xpReward: 30 },
  { title: "Radio Explorer", description: "Hear stations on 3 continents in Radio Garden", moduleId: "web-radiogarden", subjectId: "geography", xpReward: 25 },
  { title: "Tower Master", description: "Solve 4 discs in Tower of Hanoi", moduleId: "web-hanoi", subjectId: "math", xpReward: 30 },
  { title: "Cradle Rocker", description: "Swing 2 balls in Newton's Cradle", moduleId: "web-newton-cradle", subjectId: "physics", xpReward: 25 },
  { title: "Maze Coder", description: "Finish level 5 in Blockly Maze", moduleId: "web-blockly-maze", subjectId: "cs", xpReward: 25 },
  { title: "Puzzle Solver", description: "Finish a 5×5 Loopy puzzle", moduleId: "web-loopy", subjectId: "math", xpReward: 30 },
  { title: "Story Builder", description: "Write 3 linked passages in Twine", moduleId: "web-twine", subjectId: "language", xpReward: 30 },
  { title: "Continent Pro", description: "Score 60% on the Europe map quiz", moduleId: "web-wgg-europe", subjectId: "geography", xpReward: 25 },
];

export function challengeForDate(dateStr: string): DailyChallengeDef {
  let hash = 0;
  for (const c of dateStr) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return POOL[hash % POOL.length];
}
