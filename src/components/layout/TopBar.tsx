"use client";

import React from "react";
import Link from "next/link";
import { useAppStore } from "@/stores/appStore";
import { xpProgress } from "@/lib/utils";
import { Flame, Star, Settings } from "lucide-react";

export function TopBar() {
  const { profile } = useAppStore();
  const xp = xpProgress(profile.totalXp);
  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="md:hidden text-2xl">🔬</Link>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: profile.avatarColor + "22" }}>
            {profile.avatarEmoji}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate max-w-[110px] sm:max-w-none">Hi, {profile.name}! 👋</p>
            <p className="text-xs text-slate-500 hidden sm:block">Level {xp.level} Explorer</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full" title="Day streak">
          <Flame size={16} /> {profile.currentStreak}
        </div>
        <div className="flex items-center gap-2" title={`${xp.current}/${xp.needed} XP to next level`}>
          <Star size={16} className="text-amber-500 fill-amber-400" />
          <div className="hidden sm:block w-20 md:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${xp.pct}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{profile.totalXp} XP</span>
        </div>
        <Link href="/settings" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500" aria-label="Settings">
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
}
