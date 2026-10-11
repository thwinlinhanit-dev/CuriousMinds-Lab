import { create } from "zustand";

export interface ProfileState {
  id: string; name: string; age: number; avatarEmoji: string; avatarColor: string;
  preferredDifficulty: string; theme: string; soundEnabled: boolean; musicEnabled: boolean;
  animationsEnabled: boolean; fontSize: string; dailyGoalMinutes: number;
  totalXp: number; currentLevel: number; currentStreak: number; longestStreak: number;
}

interface AppState {
  initialized: boolean;
  profile: ProfileState;
  moduleProgress: Record<string, { status: string; bestScore: number; totalTimeSeconds: number; timesOpened: number }>;
  earnedIds: string[];
  pendingAchievements: Array<{ id: string; name: string; icon: string }>;
  initialize: () => Promise<void>;
  setProfile: (p: Partial<ProfileState>) => void;
  saveProfile: (p: Partial<ProfileState>) => Promise<void>;
  recordProgress: (moduleId: string, opts?: { timeSpentSeconds?: number; score?: number; status?: string }) => Promise<void>;
  dismissAchievement: (id: string) => void;
}

const defaultProfile: ProfileState = {
  id: "default-child", name: "Explorer", age: 8, avatarEmoji: "🧑‍🚀", avatarColor: "#3b82f6",
  preferredDifficulty: "auto", theme: "light", soundEnabled: true, musicEnabled: true,
  animationsEnabled: true, fontSize: "normal", dailyGoalMinutes: 30,
  totalXp: 0, currentLevel: 1, currentStreak: 0, longestStreak: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  initialized: false,
  profile: defaultProfile,
  moduleProgress: {},
  earnedIds: [],
  pendingAchievements: [],

  initialize: async () => {
    try {
      await fetch("/api/seed", { method: "POST" }).catch(() => null);
      const [profRes, progRes] = await Promise.all([
        fetch("/api/profile").then((r) => r.json()).catch(() => null),
        fetch("/api/progress").then((r) => r.json()).catch(() => null),
      ]);
      const patch: Partial<AppState> = { initialized: true } as any;
      if (profRes && !profRes.error) {
        (patch as any).profile = {
          ...defaultProfile,
          ...profRes,
          soundEnabled: profRes.soundEnabled ?? profRes.sound_enabled ?? true,
          musicEnabled: profRes.musicEnabled ?? profRes.music_enabled ?? true,
          animationsEnabled: profRes.animationsEnabled ?? profRes.animations_enabled ?? true,
          avatarEmoji: profRes.avatarEmoji ?? profRes.avatar_emoji ?? "🧑‍🚀",
          avatarColor: profRes.avatarColor ?? profRes.avatar_color ?? "#3b82f6",
          totalXp: profRes.totalXp ?? profRes.total_xp ?? 0,
          currentLevel: profRes.currentLevel ?? profRes.current_level ?? 1,
          currentStreak: profRes.currentStreak ?? profRes.current_streak ?? 0,
          longestStreak: profRes.longestStreak ?? profRes.longest_streak ?? 0,
          dailyGoalMinutes: profRes.dailyGoalMinutes ?? profRes.daily_goal_minutes ?? 30,
          preferredDifficulty: profRes.preferredDifficulty ?? profRes.preferred_difficulty ?? "auto",
        };
      }
      if (progRes) {
        const mp: AppState["moduleProgress"] = {};
        for (const p of progRes.moduleProgress ?? []) {
          mp[p.moduleId ?? p.module_id] = {
            status: p.status, bestScore: p.bestScore ?? p.best_score ?? 0,
            totalTimeSeconds: p.totalTimeSeconds ?? p.total_time_seconds ?? 0,
            timesOpened: p.timesOpened ?? p.times_opened ?? 0,
          };
        }
        (patch as any).moduleProgress = mp;
        (patch as any).earnedIds = (progRes.achievements ?? []).map((e: any) => e.achievementId ?? e.achievement_id);
      }
      set(patch);
      const theme = (patch as any).profile?.theme ?? "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch {
      set({ initialized: true });
    }
  },

  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

  saveProfile: async (p) => {
    set((s) => ({ profile: { ...s.profile, ...p } }));
    try {
      const res = await fetch("/api/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p),
      }).then((r) => r.json());
      if (res && !res.error) get().setProfile(res);
    } catch {}
  },

  recordProgress: async (moduleId, opts = {}) => {
    try {
      const res = await fetch("/api/progress", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, ...opts }),
      }).then((r) => r.json());
      if (res?.totalXp != null) {
        set((s) => ({ profile: { ...s.profile, totalXp: res.totalXp } }));
      }
      if (res?.newAchievements?.length) {
        set((s) => ({
          pendingAchievements: [...s.pendingAchievements, ...res.newAchievements],
          earnedIds: [...s.earnedIds, ...res.newAchievements.map((a: any) => a.id)],
        }));
      }
      if (opts.status) {
        set((s) => ({
          moduleProgress: { ...s.moduleProgress, [moduleId]: { status: opts.status!, bestScore: opts.score ?? 0, totalTimeSeconds: opts.timeSpentSeconds ?? 0, timesOpened: 1 } },
        }));
      }
    } catch {}
  },

  dismissAchievement: (id) =>
    set((s) => ({ pendingAchievements: s.pendingAchievements.filter((a) => a.id !== id) })),
}));
