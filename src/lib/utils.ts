import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function xpProgress(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - base, needed: next - base, pct: Math.round(((xp - base) / (next - base)) * 100) };
}

export const SUBJECT_META: Record<string, { name: string; icon: string; color: string; bg: string }> = {
  physics: { name: "Physics", icon: "⚡", color: "#3b82f6", bg: "bg-physics-50" },
  chemistry: { name: "Chemistry", icon: "🧪", color: "#a855f7", bg: "bg-chemistry-50" },
  biology: { name: "Biology", icon: "🧬", color: "#22c55e", bg: "bg-biology-50" },
  earthspace: { name: "Earth & Space", icon: "🌍", color: "#f97316", bg: "bg-earthspace-50" },
  math: { name: "Mathematics", icon: "🔢", color: "#eab308", bg: "bg-math-50" },
  music: { name: "Music", icon: "🎵", color: "#ec4899", bg: "bg-music-50" },
  art: { name: "Art & Design", icon: "🎨", color: "#f43f5e", bg: "bg-art-50" },
  cs: { name: "Computer Science", icon: "💻", color: "#14b8a6", bg: "bg-cs-50" },
  language: { name: "Language & Writing", icon: "📝", color: "#8b5cf6", bg: "bg-language-50" },
};
