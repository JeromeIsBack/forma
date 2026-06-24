import { useState, useEffect, useCallback } from "react";

const KEY = "forma.v1";

export const DEFAULT_SPLITS = [
  { id: "push", label: "Push / core", color: "#7C3AED" },
  { id: "pull", label: "Pull / back", color: "#5DE0C4" },
  { id: "legs", label: "Legs / agility", color: "#FF6B2C" },
];
// Back-compat alias
export const SPLITS = DEFAULT_SPLITS;

export const SPLIT_PALETTE = ["#7C3AED", "#5DE0C4", "#FF6B2C", "#FF4D6D", "#FFC53D", "#3FA9F5"];

export const DEFAULT_SOURCES = [
  { id: "esn", name: "ESN Isoclear shake", avg: 25, unit: "scoop" },
  { id: "chicken", name: "Chicken breast", avg: 30, unit: "100g" },
  { id: "eggs", name: "Eggs", avg: 6, unit: "egg" },
  { id: "salmon", name: "Salmon", avg: 25, unit: "fillet" },
  { id: "fish", name: "White fish", avg: 22, unit: "fillet" },
  { id: "skyr", name: "Greek yogurt / skyr", avg: 18, unit: "pot" },
  { id: "cottage", name: "Cottage cheese", avg: 14, unit: "100g" },
  { id: "nuts", name: "Snack jar nut mix", avg: 15, unit: "portion" },
];

const DEFAULT_PROFILE = {
  weight: 94,
  height: 183,
  age: 32,
  sex: "Male",
  goal: "recomp",
  activity: "moderate",
  multiplier: 1.9,
};

const DEFAULT_ROUTINE = { weeklyTarget: 3, splits: DEFAULT_SPLITS };

const DEFAULT_STATE = {
  profile: DEFAULT_PROFILE,
  routine: DEFAULT_ROUTINE,
  sources: DEFAULT_SOURCES,
  protein: {},
  gym: {},
  weightLog: [{ date: isoDays(-56), kg: 95.2 }, { date: today(), kg: 94 }],
  xp: 0,
  lastCelebrated: {},
};

export function today() {
  return new Date().toISOString().slice(0, 10);
}
function isoDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
export function weekKey(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_STATE, ...parsed };
    // Backfill routine for users created before routines existed
    if (!merged.routine || !Array.isArray(merged.routine.splits) || merged.routine.splits.length === 0) {
      merged.routine = DEFAULT_ROUTINE;
    }
    if (typeof merged.routine.weeklyTarget !== "number") merged.routine.weeklyTarget = 3;
    return merged;
  } catch {
    return DEFAULT_STATE;
  }
}

// ---- Routine helpers ----
export function getSplits(state) {
  return state.routine && state.routine.splits && state.routine.splits.length
    ? state.routine.splits
    : DEFAULT_SPLITS;
}
export function weeklyTarget(state) {
  return state.routine && typeof state.routine.weeklyTarget === "number"
    ? state.routine.weeklyTarget
    : 3;
}

// ---- XP / levels ----
export const XP_PER_GYM = 50;
export const XP_PER_PROTEIN_HIT = 45;

export function levelFromXp(xp) {
  let level = 1;
  let need = 300;
  let acc = 0;
  while (xp >= acc + need) {
    acc += need;
    level += 1;
    need = Math.round(need * 1.25);
  }
  return { level, into: xp - acc, need, floor: acc };
}

export const LEVEL_NAMES = [
  "Rookie", "Warm-up", "Mover", "Grinder", "Strength seeker",
  "Iron-willed", "Relentless", "Beast mode", "Apex", "Legend",
];
export function levelName(level) {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

export function proteinTarget(profile) {
  return Math.round(profile.weight * profile.multiplier);
}

export function dayProtein(state, date) {
  const entry = state.protein[date];
  if (!entry) return 0;
  return Object.entries(entry).reduce((sum, [id, servings]) => {
    const src = state.sources.find((s) => s.id === id);
    return sum + (src ? src.avg * servings : 0);
  }, 0);
}

export function gymThisWeek(state, date = today()) {
  const wk = weekKey(date);
  return Object.keys(state.gym).filter((d) => weekKey(d) === wk).length;
}

export function gymStreak(state) {
  const target = weeklyTarget(state);
  const weeks = {};
  Object.keys(state.gym).forEach((d) => {
    const w = weekKey(d);
    weeks[w] = (weeks[w] || 0) + 1;
  });
  let streak = 0;
  let cursor = weekKey(today());
  // Current week only counts once the target is met; otherwise start from last week.
  if (!(weeks[cursor] >= target)) {
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 7);
    cursor = d.toISOString().slice(0, 10);
  }
  while (weeks[cursor] >= target) {
    streak += 1;
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 7);
    cursor = d.toISOString().slice(0, 10);
  }
  return streak;
}

// ---- Aggregate measures ----
export function totalGym(state) {
  return Object.keys(state.gym).length;
}
export function proteinHitDays(state) {
  const t = proteinTarget(state.profile);
  return Object.keys(state.protein).filter((d) => dayProtein(state, d) >= t).length;
}
export function loggedDays(state) {
  return new Set([...Object.keys(state.gym), ...Object.keys(state.protein)]).size;
}

// ---- Tiered achievements ----
export const TIERS = [
  { name: "Bronze", color: "#C77B3A" },
  { name: "Silver", color: "#9AA6B2" },
  { name: "Gold", color: "#E5A93B" },
  { name: "Platinum", color: "#5DE0C4" },
  { name: "Diamond", color: "#7C3AED" },
];

export const ACHIEVEMENTS = [
  { id: "iron", name: "Iron", icon: "barbell", unit: "sessions", thresholds: [10, 25, 50, 100, 200], measure: (s) => totalGym(s) },
  { id: "inferno", name: "Inferno", icon: "flame", unit: "week streak", thresholds: [2, 4, 8, 12, 24], measure: (s) => gymStreak(s) },
  { id: "fuelled", name: "Fuelled", icon: "bolt", unit: "target days", thresholds: [1, 7, 30, 75, 150], measure: (s) => proteinHitDays(s) },
  { id: "ascendant", name: "Ascendant", icon: "star", unit: "level", thresholds: [3, 5, 10, 15, 20], measure: (s) => levelFromXp(s.xp).level },
  { id: "relentless", name: "Relentless", icon: "calendar-check", unit: "days logged", thresholds: [7, 30, 90, 180, 365], measure: (s) => loggedDays(s) },
];

// Returns the tier state for one achievement: index 0 = locked, 1..5 = Bronze..Diamond
export function tierFor(ach, state) {
  const measure = ach.measure(state);
  let idx = 0;
  for (let i = 0; i < ach.thresholds.length; i++) {
    if (measure >= ach.thresholds[i]) idx = i + 1;
  }
  const atMax = idx >= ach.thresholds.length;
  const prev = idx > 0 ? ach.thresholds[idx - 1] : 0;
  const next = atMax ? null : ach.thresholds[idx];
  const tier = idx > 0 ? TIERS[idx - 1] : null;
  const nextTier = atMax ? null : TIERS[idx];
  const progress = atMax ? 1 : Math.min((measure - prev) / (next - prev), 1);
  return { measure, idx, atMax, prev, next, tier, nextTier, progress };
}

export function totalTierScore(state) {
  return ACHIEVEMENTS.reduce((sum, a) => sum + tierFor(a, state).idx, 0);
}

export function recomputeXp(state) {
  const gymXp = Object.keys(state.gym).length * XP_PER_GYM;
  const proteinXp = Object.keys(state.protein).filter(
    (d) => dayProtein(state, d) >= proteinTarget(state.profile)
  ).length * XP_PER_PROTEIN_HIT;
  return gymXp + proteinXp;
}

export function useStore() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const update = useCallback((fn) => {
    setState((prev) => {
      const next = fn(structuredClone(prev));
      next.xp = recomputeXp(next);
      return next;
    });
  }, []);

  return [state, update, setState];
}
