import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const profile = sqliteTable("profile", {
  id: text("id").primaryKey().$defaultFn(() => "default-child"),
  name: text("name").notNull().default("Explorer"),
  age: integer("age").default(8),
  avatarEmoji: text("avatar_emoji").default("🧑‍🚀"),
  avatarColor: text("avatar_color").default("#3b82f6"),
  preferredDifficulty: text("preferred_difficulty").default("auto"),
  theme: text("theme").default("light"),
  soundEnabled: integer("sound_enabled", { mode: "boolean" }).default(true),
  musicEnabled: integer("music_enabled", { mode: "boolean" }).default(true),
  animationsEnabled: integer("animations_enabled", { mode: "boolean" }).default(true),
  fontSize: text("font_size").default("normal"),
  dailyGoalMinutes: integer("daily_goal_minutes").default(30),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  totalXp: integer("total_xp").default(0),
  currentLevel: integer("current_level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: text("last_active_date"),
});

export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
  totalModules: integer("total_modules").default(0),
});

export const modules = sqliteTable("modules", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id").notNull().references(() => subjects.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  icon: text("icon").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
  ageMin: integer("age_min").default(5),
  ageMax: integer("age_max").default(14),
  estimatedMinutes: integer("estimated_minutes").default(15),
  sortOrder: integer("sort_order").notNull(),
  simulationType: text("simulation_type").notNull(),
  defaultConfig: text("default_config").notNull(),
  learningObjectives: text("learning_objectives").notNull(),
  vocabularyWords: text("vocabulary_words"),
  funFacts: text("fun_facts"),
  tryAtHome: text("try_at_home"),
  prerequisites: text("prerequisites"),
  tags: text("tags"),
  isUnlocked: integer("is_unlocked", { mode: "boolean" }).default(true),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  instructions: text("instructions").notNull(),
  config: text("config").notNull(),
  hints: text("hints"),
  sortOrder: integer("sort_order").notNull(),
  xpReward: integer("xp_reward").default(10),
  difficulty: integer("difficulty").default(1),
});

export const moduleProgress = sqliteTable("module_progress", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => modules.id),
  status: text("status").notNull().default("not_started"),
  bestScore: real("best_score").default(0),
  totalTimeSeconds: integer("total_time_seconds").default(0),
  timesOpened: integer("times_opened").default(0),
  lastOpenedAt: text("last_opened_at"),
  completedAt: text("completed_at"),
  currentDifficulty: integer("current_difficulty").default(1),
  notes: text("notes"),
});

export const activityProgress = sqliteTable("activity_progress", {
  id: text("id").primaryKey(),
  activityId: text("activity_id").notNull().references(() => activities.id),
  moduleId: text("module_id").notNull().references(() => modules.id),
  status: text("status").notNull().default("not_started"),
  score: real("score"),
  attempts: integer("attempts").default(0),
  bestScore: real("best_score").default(0),
  totalTimeSeconds: integer("total_time_seconds").default(0),
  completedAt: text("completed_at"),
  responseData: text("response_data"),
});

export const dailyActivity = sqliteTable("daily_activity", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  totalMinutes: integer("total_minutes").default(0),
  activitiesCompleted: integer("activities_completed").default(0),
  xpEarned: integer("xp_earned").default(0),
  subjectsVisited: text("subjects_visited"),
  modulesVisited: text("modules_visited"),
  streakMaintained: integer("streak_maintained", { mode: "boolean" }).default(false),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  criteria: text("criteria").notNull(),
  xpBonus: integer("xp_bonus").default(50),
  rarity: text("rarity").default("common"),
  isSecret: integer("is_secret", { mode: "boolean" }).default(false),
});

export const earnedAchievements = sqliteTable("earned_achievements", {
  id: text("id").primaryKey(),
  achievementId: text("achievement_id").notNull().references(() => achievements.id),
  earnedAt: text("earned_at").notNull(),
  seen: integer("seen", { mode: "boolean" }).default(false),
});

export const savedProjects = sqliteTable("saved_projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  moduleId: text("module_id").references(() => modules.id),
  subjectId: text("subject_id").references(() => subjects.id),
  type: text("type").notNull(),
  data: text("data").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  moduleId: text("module_id").references(() => modules.id),
  tags: text("tags"),
  mood: text("mood"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const dailyChallenges = sqliteTable("daily_challenges", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subjectId: text("subject_id").references(() => subjects.id),
  moduleId: text("module_id").references(() => modules.id),
  challengeConfig: text("challenge_config").notNull(),
  xpReward: integer("xp_reward").default(25),
  completed: integer("completed", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
});

export const vocabulary = sqliteTable("vocabulary", {  id: text("id").primaryKey(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  example: text("example"),
  subject: text("subject").notNull(),
  moduleId: text("module_id").references(() => modules.id),
  pronunciation: text("pronunciation"),
  imageUrl: text("image_url"),
  mastery: integer("mastery").default(0),
  nextReviewDate: text("next_review_date"),
  timesReviewed: integer("times_reviewed").default(0),
  addedAt: text("added_at").notNull(),
});

export const projectProgress = sqliteTable("project_progress", {
  id: text("id").primaryKey(),
  checkedSteps: text("checked_steps").notNull().default("[]"),
  status: text("status").notNull().default("in_progress"),
  completedAt: text("completed_at"),
  updatedAt: text("updated_at").notNull(),
});

export type Profile = typeof profile.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Module = typeof modules.$inferSelect;
