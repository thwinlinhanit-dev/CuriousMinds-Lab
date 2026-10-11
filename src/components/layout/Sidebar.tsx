"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, Sparkles, Map, Globe, Trophy, FolderOpen, BookMarked, Settings, FlaskConical, Atom, Dna, Calculator, Music, Palette, Code, BookOpen } from "lucide-react";

const mainNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore All", icon: Sparkles },
  { href: "/paths", label: "Learning Paths", icon: Map },
];

const subjects = [
  { href: "/learn/physics", label: "Physics", emoji: "⚡" },
  { href: "/learn/chemistry", label: "Chemistry", emoji: "🧪" },
  { href: "/learn/biology", label: "Biology", emoji: "🧬" },
  { href: "/learn/earthspace", label: "Earth & Space", emoji: "🌍" },
  { href: "/learn/math", label: "Math", emoji: "🔢" },
  { href: "/learn/music", label: "Music", emoji: "🎵" },
  { href: "/learn/art", label: "Art & Design", emoji: "🎨" },
  { href: "/learn/cs", label: "Comp. Science", emoji: "💻" },
  { href: "/learn/language", label: "Language", emoji: "📝" },
];

const bottomNav = [
  { href: "/projects", label: "My Projects", icon: FolderOpen },
  { href: "/journal", label: "Journal", icon: BookMarked },
  { href: "/vocabulary", label: "Words", icon: BookOpen },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/parent", label: "Parent", icon: Settings },
];

export function Sidebar({ currentPath }: { currentPath: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("hidden md:flex flex-col bg-white border-r border-slate-200 transition-all h-full overflow-y-auto", collapsed ? "w-16" : "w-60")}>
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            <span className="font-display font-extrabold text-lg leading-tight">CuriousMinds<br /><span className="text-blue-600">Lab</span></span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Toggle sidebar">
          {collapsed ? "→" : "←"}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {mainNav.map((n) => (
          <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium", currentPath === n.href ? "bg-blue-100 text-blue-800" : "hover:bg-slate-100 text-slate-700")}>
            <n.icon size={18} />{!collapsed && n.label}
          </Link>
        ))}
        {!collapsed && <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Subjects</p>}
        {subjects.map((s) => (
          <Link key={s.href} href={s.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium", currentPath.startsWith(s.href) ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-700")}>
            <span className="text-lg w-5 text-center">{s.emoji}</span>{!collapsed && s.label}
          </Link>
        ))}
        {!collapsed && <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">My Space</p>}
        {bottomNav.map((n) => (
          <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium", currentPath.startsWith(n.href) ? "bg-amber-100 text-amber-800" : "hover:bg-slate-100 text-slate-700")}>
            <n.icon size={18} />{!collapsed && n.label}
          </Link>
        ))}
      </nav>
      {/* Mobile bottom nav */}
      <div className="md:hidden" />
    </aside>
  );
}

export function MobileNav({ currentPath }: { currentPath: string }) {
  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Sparkles },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/vocabulary", label: "Words", icon: BookOpen },
    { href: "/achievements", label: "Awards", icon: Trophy },
    { href: "/parent", label: "Parent", icon: Settings },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-40">
      {items.map((n) => (
        <Link key={n.href} href={n.href} className={cn("flex flex-col items-center text-[11px] font-medium px-2", currentPath === n.href ? "text-blue-600" : "text-slate-500")}>
          <n.icon size={20} />{n.label}
        </Link>
      ))}
    </nav>
  );
}
