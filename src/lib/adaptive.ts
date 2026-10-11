export function getAdaptiveDifficulty(childAge: number, bestScore: number, currentDifficulty: number, preferred: string): number {
  if (preferred === "easy") return 1;
  if (preferred === "medium") return 2;
  if (preferred === "hard") return 4;
  // auto mode
  if (bestScore >= 85 && currentDifficulty < 5) return currentDifficulty + 1;
  if (bestScore < 50 && currentDifficulty > 1) return currentDifficulty - 1;
  if (childAge <= 7) return Math.min(currentDifficulty, 2);
  if (childAge >= 12) return Math.max(currentDifficulty, 2);
  return currentDifficulty;
}

export function difficultyLabel(d: number): string {
  return ["", "Starter 🌱", "Explorer 🔍", "Challenger 💪", "Expert 🧠", "Master 🏆"][d] ?? "Explorer";
}

export function suggestNextModule(completedIds: string[], allIds: string[]): string | null {
  const remaining = allIds.filter((id) => !completedIds.includes(id));
  return remaining[0] ?? null;
}
