"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, MobileNav } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AchievementNotification } from "@/components/gamification/AchievementNotification";
import { PathStopCelebration } from "@/components/home/PathStopCelebration";
import { useAppStore } from "@/stores/appStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { initialize, initialized } = useAppStore();

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized, initialize]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPath={pathname} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">{children}</main>
      </div>
      <MobileNav currentPath={pathname} />
      <AchievementNotification />
      <PathStopCelebration />
    </div>
  );
}
