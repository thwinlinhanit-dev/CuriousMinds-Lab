// Curated learning paths: ordered journeys that connect labs across topics.
// Progress is derived client-side from module progress — no extra backend.
// Path completion badges are seeded as achievements with the
// "specific_modules_completed" criteria, so the existing award engine grants them.

export interface LearningPath {
  slug: string;
  title: string;
  emoji: string;
  color: string;       // tailwind-ish accent used on cards
  description: string;
  ages: string;
  moduleIds: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "waves-motion",
    title: "Wave & Motion Explorer",
    emoji: "🌊",
    color: "#0ea5e9",
    description: "Follow a ripple from a quiet pond to a standing guitar string. You'll bend springs, play with sound, and discover why pendulums tick like clockwork.",
    ages: "Ages 8–14",
    moduleIds: ["physics-waves", "phet-wave-string", "web-spring-wave", "web-standing-waves", "phet-sound-waves", "web-pendulum-wave"],
  },
  {
    slug: "space-mission",
    title: "Space Mission",
    emoji: "🚀",
    color: "#7c3aed",
    description: "Blast off on a grand tour: build your solar system, master gravity, fly a satellite, and decode the Moon's phases like a mission commander.",
    ages: "Ages 7–14",
    moduleIds: ["earth-solar-system", "phet-gravity-orbits", "web-orbit-game", "web-moon-phases", "earth-moon", "web-scale-solar"],
  },
  {
    slug: "chemistry-kitchen",
    title: "Chemistry Kitchen",
    emoji: "🧪",
    color: "#f59e0b",
    description: "Cook up matter itself: separate mixtures, trigger reactions, balance equations, and build a battery — the lab meets the kitchen.",
    ages: "Ages 8–14",
    moduleIds: ["chem-states-matter", "chem-mixtures", "chem-reactions", "chem-ph", "phet-balancing-equations", "chem-battery"],
  },
  {
    slug: "number-ninja",
    title: "Number Ninja",
    emoji: "🥷",
    color: "#10b981",
    description: "Slice through numbers: from the number line to times-table belts, fraction duels, and pattern puzzles. Quietly becoming a math black belt.",
    ages: "Ages 6–12",
    moduleIds: ["math-number-line", "math-timestable", "math-fractions", "phet-fractions-equality", "web-num-pyramid", "math-patterns"],
  },
  {
    slug: "code-captain",
    title: "Code Captain",
    emoji: "🤖",
    color: "#3b82f6",
    description: "Steer from block puzzles to real Python: command turtles, tame algorithms, park robots, and think like a computer step by step.",
    ages: "Ages 7–14",
    moduleIds: ["cs-block-coding", "web-blockly-maze", "cs-turtle", "cs-algorithms", "cs-python", "cs-robots"],
  },
  {
    slug: "music-maker",
    title: "Music Maker",
    emoji: "🎹",
    color: "#ec4899",
    description: "From first piano keys to your own songs: beats, scales, chords, and ear training — compose like the pros do, one layer at a time.",
    ages: "Ages 6–14",
    moduleIds: ["music-piano", "web-song-maker", "music-beats", "music-scales", "music-chords", "music-ear-training"],
  },
  {
    slug: "world-explorer",
    title: "World Explorer",
    emoji: "🌍",
    color: "#14b8a6",
    description: "Circle the globe without leaving your chair: flags, capitals, country-guessing games, and the true size of nations.",
    ages: "Ages 6–14",
    moduleIds: ["web-wgg-world", "geo-flags", "geo-capitals", "web-globle", "web-thetruesize", "web-cityguesser"],
  },
  {
    slug: "body-cells",
    title: "Body & Cells",
    emoji: "🧬",
    color: "#ef4444",
    description: "Shrink down to cell size, then zoom out to whole body systems: hearts, germs, genes, and the ecosystems they all live in.",
    ages: "Ages 8–14",
    moduleIds: ["bio-cell-explorer", "bio-human-body", "web-heart-3d", "bio-germs", "bio-genetics", "bio-ecosystem"],
  },
];

// Achievement rows for the seed — one per path, criteria type already
// supported by the award engine in /api/progress.
export function pathAchievements(): Array<{ id: string; name: string; description: string; icon: string; category: string; criteria: string; xpBonus: number; rarity: string; isSecret: boolean }> {
  return LEARNING_PATHS.map((p) => ({
    id: `path-${p.slug}`,
    name: `${p.title} Champion`,
    description: `Complete every lab in the ${p.title} learning path.`,
    icon: p.emoji,
    category: "paths",
    criteria: JSON.stringify({ type: "specific_modules_completed", modules: p.moduleIds, count: p.moduleIds.length }),
    xpBonus: 100,
    rarity: "rare",
    isSecret: false,
  }));
}
