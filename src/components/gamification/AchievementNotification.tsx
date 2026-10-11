"use client";
import React from "react";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/primitives";

export function AchievementNotification() {
  const { pendingAchievements, dismissAchievement } = useAppStore();
  if (!pendingAchievements.length) return null;
  const current = pendingAchievements[0];
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-5 shadow-2xl max-w-sm animate-celebrate">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">🏆 Achievement Unlocked!</p>
        <p className="text-3xl my-1">{current.icon}</p>
        <p className="font-display font-extrabold text-xl">{current.name}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => dismissAchievement(current.id)}>Awesome! 🎉</Button>
      </div>
    </div>
  );
}
