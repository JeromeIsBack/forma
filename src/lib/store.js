import { useState, useEffect, useCallback } from "react";

const KEY = "forma.v1";

export const DEFAULT_SPLITS = [
  { id: "push", label: "Push / core", color: "#7C3AED" },
  { id: "pull", label: "Pull / back", color: "#5DE0C4" },
  { id: "legs", label: "Legs / agility", color: "#FF6B2C" },
];
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
  weight: 94, height: 183, age: 32, sex: "Male",
  goal: "recomp", activity: "moderate", multiplier: 1.9,
};
const DEFAULT_ROUTINE = { weeklyTarget: 3, splits: DEFAULT_SPLITS };

// ---- Local-date helpers (timezone-safe: never use toISOString for date keys) ----
function isoLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function today() {
  return isoLocal(new Date());
}
function isoDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return isoLocal(d);
}
export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoLocal(d);
}
export function weekKey(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return isoLocal(d);
}

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

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_STATE, ...parsed };
    if (!merged.routine || !Array.isArray(merged.routine.splits) || merged.routine.splits.length === 0) {
      merged.routine = DEFAULT_ROUTINE;
    }
    if (typeof merged.routine.weeklyTarget !== "number") merged.routine.weeklyTarget = 3;
    return merged;
  } catch {
    return DEFAULT_STATE;
  }
}

export function getSplits(state) {
  return state.routine && state.routine.splits && state.routine.splits.length
    ? state.routine.splits : DEFAULT_SPLITS;
}
export function weeklyTarget(state) {
  return state.routine && typeof state.routine.weeklyTarget === "number"
    ? state.routine.weeklyTarget : 3;
}

export const XP_PER_GYM = 50;
export const XP_PER_PROTEIN_HIT = 45;

export function levelFromXp(xp) {
  let level = 1, need = 300, acc = 0;
  while (xp >= acc + need) { acc += need; level += 1; need = Math.round(need * 1.25); }
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
  if (!(weeks[cursor] >= target)) cursor = addDays(cursor, -7);
  while (weeks[cursor] >= target) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

// ---- Aggregate measures ----
export function totalGym(state) { return Object.keys(state.gym).length; }
export function proteinHitDays(state) {
  const t = proteinTarget(state.profile);
  return Object.keys(state.protein).filter((d) => dayProtein(state, d) >= t).length;
}
export function loggedDays(state) {
  return new Set([...Object.keys(state.gym), ...Object.keys(state.protein)]).size;
}
export function maxDayProtein(state) {
  const days = Object.keys(state.protein);
  if (!days.length) return 0;
  return Math.round(Math.max(...days.map((d) => dayProtein(state, d))));
}
export function maxWeeklySplits(state) {
  const byWeek = {};
  Object.entries(state.gym).forEach(([d, split]) => {
    const w = weekKey(d);
    (byWeek[w] = byWeek[w] || new Set()).add(split);
  });
  let max = 0;
  Object.values(byWeek).forEach((set) => { if (set.size > max) max = set.size; });
  return max;
}

export function proteinStreak(state) {
  const t = proteinTarget(state.profile);
  const hit = (d) => state.protein[d] && dayProtein(state, d) >= t;
  let cursor = today();
  if (!hit(cursor)) cursor = addDays(cursor, -1);
  let s = 0;
  while (hit(cursor)) { s += 1; cursor = addDays(cursor, -1); }
  return s;
}
export function weekendSessions(state) {
  return Object.keys(state.gym).filter((d) => {
    const day = new Date(d + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }).length;
}
export function perfectDays(state) {
  const t = proteinTarget(state.profile);
  return Object.keys(state.gym).filter((d) => state.protein[d] && dayProtein(state, d) >= t).length;
}

// Smart (no-AI) suggestion: greedily compose a combo from the user's own
// sources to close today's remaining protein gap. Returns null if already hit.
export function suggestProtein(state, date = today()) {
  const target = proteinTarget(state.profile);
  const have = dayProtein(state, date);
  const gap = target - have;
  if (gap <= 0) return null;

  const sources = [...state.sources].filter((s) => s.avg > 0).sort((a, b) => b.avg - a.avg);
  if (!sources.length) return null;

  let remaining = gap;
  const picks = [];
  for (const src of sources) {
    if (remaining <= 5 || picks.length >= 3) break;
    let n = Math.min(Math.floor(remaining / src.avg), 3);
    if (n > 0) {
      picks.push({ id: src.id, name: src.name, servings: n, grams: n * src.avg });
      remaining -= n * src.avg;
    }
  }
  // Top up if still meaningfully short: prefer the smallest source that covers it
  if (remaining > 5) {
    const asc = [...sources].sort((a, b) => a.avg - b.avg);
    const fit = asc.find((s) => s.avg >= remaining) || sources[0];
    const existing = picks.find((p) => p.id === fit.id);
    if (existing) { existing.servings += 1; existing.grams += fit.avg; }
    else picks.push({ id: fit.id, name: fit.name, servings: 1, grams: fit.avg });
    remaining -= fit.avg;
  }

  const added = picks.reduce((s, p) => s + p.grams, 0);
  return { picks, added, gap, after: Math.round(have + added) };
}

// ---- Tiered, lore-themed achievements ----
export const TIERS = [
  { name: "Bronze", color: "#C77B3A" },
  { name: "Silver", color: "#9AA6B2" },
  { name: "Gold", color: "#E5A93B" },
  { name: "Platinum", color: "#5DE0C4" },
  { name: "Diamond", color: "#7C3AED" },
];

export const ACHIEVEMENTS = [
  {
    id: "jedi", name: "The Jedi Path", saga: "Star Wars", icon: "sword", unit: "sessions",
    thresholds: [10, 25, 50, 100, 200], measure: (s) => totalGym(s),
    lore: "Like a Padawan facing the Jedi Trials, mastery is earned only through relentless training.",
    how: "Rank up by logging gym sessions. Each tier demands more reps on the road to Jedi Master.",
  },
  {
    id: "fellowship", name: "The Long March", saga: "The Lord of the Rings", icon: "route", unit: "week streak",
    thresholds: [2, 4, 8, 12, 24], measure: (s) => gymStreak(s),
    lore: "The road to Mordor is walked one week at a time, and the Fellowship never turns back.",
    how: "Hit your weekly session target in consecutive weeks. Miss a week and the march resets to zero.",
  },
  {
    id: "lembas", name: "Lembas Bread", saga: "The Lord of the Rings", icon: "bread", unit: "target days",
    thresholds: [1, 7, 30, 75, 150], measure: (s) => proteinHitDays(s),
    lore: "Elvish waybread. One small bite can sustain a grown man through a full day of marching.",
    how: "Earn a notch every day you hit your protein target. More fuelled days climb the tiers.",
  },
  {
    id: "force", name: "The Force", saga: "Star Wars", icon: "sparkles", unit: "level",
    thresholds: [3, 5, 10, 15, 20], measure: (s) => levelFromXp(s.xp).level,
    lore: "The Force is strong with this one. Your power grows with everything you log.",
    how: "Gain XP and level up. Every session and every protein target feeds your power.",
  },
  {
    id: "there-back", name: "There and Back Again", saga: "The Hobbit", icon: "map-2", unit: "days logged",
    thresholds: [7, 30, 90, 180, 365], measure: (s) => loggedDays(s),
    lore: "Bilbo's unexpected journey began with a single step out the door, and never truly ended.",
    how: "Log anything on a day to mark it. A full year of logged days reaches the final tier.",
  },
  {
    id: "saiyan", name: "Over 9000", saga: "Dragon Ball Z", icon: "flame", unit: "g in a day",
    thresholds: [150, 180, 210, 240, 300], measure: (s) => maxDayProtein(s),
    lore: "Vegeta's scouter shattering at a power level beyond reason. It is OVER 9000.",
    how: "Set new highs for total protein in a single day. Stack your sources to break your record.",
  },
  {
    id: "avatar", name: "Master of All Forms", saga: "Avatar: The Last Airbender", icon: "yin-yang", unit: "splits / week",
    thresholds: [2, 3, 4, 5, 6], measure: (s) => maxWeeklySplits(s),
    lore: "Only the Avatar can master all the elements: water, earth, fire and air.",
    how: "Train different splits within a single week. Hit more unique splits in one week to rank up.",
  },
  {
    id: "worthy", name: "Worthy", saga: "Marvel", icon: "hammer", unit: "day protein streak",
    thresholds: [3, 7, 14, 30, 60], measure: (s) => proteinStreak(s),
    lore: "Whosoever proves worthy, hitting their protein day after day, shall hold the power of Mjolnir.",
    how: "Hit your protein target on consecutive days. Miss a day and the streak resets.",
  },
  {
    id: "witcher", name: "Toss a Coin", saga: "The Witcher", icon: "coin", unit: "weekend sessions",
    thresholds: [1, 5, 15, 30, 60], measure: (s) => weekendSessions(s),
    lore: "O Valley of Plenty. A Witcher takes every contract, weekends included.",
    how: "Train on Saturdays or Sundays. Every weekend session counts toward this contract.",
  },
  {
    id: "bazinga", name: "Bazinga!", saga: "The Big Bang Theory", icon: "atom", unit: "perfect days",
    thresholds: [1, 5, 15, 40, 100], measure: (s) => perfectDays(s),
    lore: "Sheldon's signature gotcha. A perfect day: trained AND fully fuelled.",
    how: "Log a gym session and hit your protein target on the same day.",
  },
];

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
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
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
