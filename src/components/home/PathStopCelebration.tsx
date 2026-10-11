"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LEARNING_PATHS } from "@/lib/paths";
import { useAppStore } from "@/stores/appStore";

interface StopToast {
  emoji: string;
  title: string;
  body: string;
  pathSlug: string;
  pathColor: string;
  complete: boolean;
  key: number;
}

/**
 * Watches module progress and celebrates when a completed lab belongs to a
 * learning path — "Stop 2/6 done!" — with a grander message when the whole
 * path finishes. Fires only on transitions, never on initial page load.
 */
export function PathStopCelebration() {
  const { moduleProgress } = useAppStore();
  const prevRef = useRef<Record<string, string> | null>(null);
  const [toast, setToast] = useState<StopToast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    const now: Record<string, string> = {};
    for (const [id, p] of Object.entries(moduleProgress)) now[id] = p.status;

    if (prev) {
      for (const [id, status] of Object.entries(now)) {
        if (status !== "completed") continue;
        // Only fire for modules we've actually seen before in a non-completed
        // state — avoids false celebrations when progress loads on page mount.
        if (!(id in prev) || prev[id] === "completed") continue;
        const path = LEARNING_PATHS.find((p) => p.moduleIds.includes(id));
        if (!path) continue;
        const done = path.moduleIds.filter((mid) => now[mid] === "completed").length;
        const total = path.moduleIds.length;
        const stopNum = path.moduleIds.indexOf(id) + 1;
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast({
          emoji: path.emoji,
          title: done === total ? "🏆 Path complete!" : `Stop ${stopNum} of ${total} done!`,
          body: done === total
            ? `You finished every stop on the ${path.title} journey — Champion badge earned!`
            : `${path.title}: ${done}/${total} stops. Keep exploring!`,
          pathSlug: path.slug,
          pathColor: path.color,
          complete: done === total,
          key: Date.now(),
        });
        timerRef.current = setTimeout(() => setToast(null), 7000);
        break; // one celebration at a time
      }
    }
    // Establish/refresh the baseline only once progress is actually populated,
    // so the initial empty→filled store update isn't mistaken for completions.
    if (prev === null || Object.keys(now).length > 0) prevRef.current = now;
  }, [moduleProgress]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <Link href={`/paths/${toast.pathSlug}`}>
        <div
          className={`rounded-2xl p-5 shadow-2xl max-w-sm animate-celebrate text-white ${toast.complete ? "bg-gradient-to-r from-amber-400 to-orange-500" : ""}`}
          style={toast.complete ? undefined : { background: `linear-gradient(135deg, ${toast.pathColor}, ${toast.pathColor}cc)` }}
        >
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">🗺️ Journey milestone</p>
          <p className="text-3xl my-1">{toast.emoji}</p>
          <p className="font-display font-extrabold text-xl">{toast.title}</p>
          <p className="text-sm opacity-90 mt-1">{toast.body}</p>
        </div>
      </Link>
    </div>
  );
}
