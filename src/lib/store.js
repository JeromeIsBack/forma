import { useState, useEffect, useCallback } from "react";

const KEY = "forma.v1";

export const SPLITS = [
  { id: "push", label: "Push / core", color: "#7C3AED" },
  { id: "pull", label: "Pull / back", color: "#5DE0C4" },
  { id: "legs", label: "Legs / agility", color: "#FF6B2C" },
];

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

const DEFAULT_STATE = {
  profile: DEFAULT_PROFILE,
  sources: DEFAULT_SOURCES,
  protein: {},
  gym: {},
  weightLog: [{ date: isoDays(-56), kg: 95.2 }, { date: today(), kg: 94 }],
  xp: 0,
  badges: [],
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
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

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
  const weeks = {};
  Object.keys(state.gym).forEach((d) => {
    const w = weekKey(d);
    weeks[w] = (weeks[w] || 0) + 1;
  });
  let streak = 0;
  let cursor = weekKey(today());
  while (weeks[cursor] >= 3) {
    streak += 1;
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 7);
    cursor = d.toISOString().slice(0, 10);
  }
  return streak;
}

export const BADGES = [
  { id: "first-week", name: "First week", icon: "calendar-check", test: (s) => Object.keys(s.gym).length >= 3 },
  { id: "sessions-15", name: "15 sessions", icon: "barbell", test: (s) => Object.keys(s.gym).length >= 15 },
  { id: "protein-pb", name: "Protein PB", icon: "bolt", test: (s) => Object.keys(s.protein).some((d) => dayProtein(s, d) >= proteinTarget(s.profile)) },
  { id: "streak-10", name: "10 wk streak", icon: "flame", test: (s) => gymStreak(s) >= 10 },
  { id: "lvl-5", name: "Level 5", icon: "star", test: (s) => levelFromXp(s.xp).level >= 5 },
  { id: "consistent", name: "Consistency", icon: "checks", test: (s) => Object.keys(s.protein).filter((d) => dayProtein(s, d) >= proteinTarget(s.profile)).length >= 7 },
];

export function recomputeXp(state) {
  const gymXp = Object.keys(state.gym).length * XP_PER_GYM;
  const proteinXp = Object.keys(state.protein).filter(
    (d) => dayProtein(state, d) >= proteinTarget(state.profile)
  ).length * XP_PER_PROTEIN_HIT;
  return gymXp + proteinXp;
}

export function earnedBadges(state) {
  return BADGES.filter((b) => b.test(state)).map((b) => b.id);
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
      next.badges = earnedBadges(next);
      return next;
    });
  }, []);

  return [state, update, setState];
}
