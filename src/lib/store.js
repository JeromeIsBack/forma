import { useState, useEffect, useCallback, useRef } from "react";
import { idbGet, idbSet } from "./idb.js";

export const DEFAULT_SPLITS = [
  { id: "push", label: "Push / core", color: "#7C3AED" },
  { id: "pull", label: "Pull / back", color: "#5DE0C4" },
  { id: "legs", label: "Legs / agility", color: "#FF6B2C" },
];
export const SPLITS = DEFAULT_SPLITS;
export const SPLIT_PALETTE = ["#7C3AED", "#5DE0C4", "#FF6B2C", "#FF4D6D", "#FFC53D", "#3FA9F5"];

export const SOURCE_TYPES = ["Meat", "Fish", "Dairy", "Eggs", "Plant", "Supplement", "Snack", "Grain", "Other"];

export const DEFAULT_SOURCES = [
  { id: "esn", name: "ESN Isoclear shake", avg: 25, unit: "scoop", type: "Supplement" },
  { id: "whey", name: "Whey protein", avg: 24, unit: "scoop", type: "Supplement" },
  { id: "casein", name: "Casein protein", avg: 23, unit: "scoop", type: "Supplement" },
  { id: "chicken", name: "Chicken breast", avg: 30, unit: "100g", type: "Meat" },
  { id: "turkey", name: "Turkey breast", avg: 29, unit: "100g", type: "Meat" },
  { id: "beef", name: "Lean beef mince", avg: 26, unit: "100g", type: "Meat" },
  { id: "pork", name: "Pork loin", avg: 27, unit: "100g", type: "Meat" },
  { id: "ham", name: "Ham (deli)", avg: 18, unit: "2 slices", type: "Meat" },
  { id: "salmon", name: "Salmon", avg: 25, unit: "fillet", type: "Fish" },
  { id: "fish", name: "White fish (cod)", avg: 22, unit: "fillet", type: "Fish" },
  { id: "tuna", name: "Tuna (canned)", avg: 25, unit: "can", type: "Fish" },
  { id: "shrimp", name: "Shrimp", avg: 24, unit: "100g", type: "Fish" },
  { id: "eggs", name: "Eggs", avg: 6, unit: "egg", type: "Eggs" },
  { id: "eggwhite", name: "Egg whites", avg: 4, unit: "white", type: "Eggs" },
  { id: "skyr", name: "Greek yogurt / skyr", avg: 18, unit: "pot", type: "Dairy" },
  { id: "cottage", name: "Cottage cheese", avg: 14, unit: "100g", type: "Dairy" },
  { id: "quark", name: "Quark", avg: 12, unit: "100g", type: "Dairy" },
  { id: "milk", name: "Milk", avg: 8, unit: "glass", type: "Dairy" },
  { id: "cheese", name: "Cheddar cheese", avg: 7, unit: "slice", type: "Dairy" },
  { id: "tofu", name: "Tofu", avg: 16, unit: "100g", type: "Plant" },
  { id: "tempeh", name: "Tempeh", avg: 19, unit: "100g", type: "Plant" },
  { id: "edamame", name: "Edamame", avg: 11, unit: "100g", type: "Plant" },
  { id: "lentils", name: "Lentils (cooked)", avg: 9, unit: "100g", type: "Plant" },
  { id: "chickpeas", name: "Chickpeas (cooked)", avg: 9, unit: "100g", type: "Plant" },
  { id: "beans", name: "Black beans (cooked)", avg: 9, unit: "100g", type: "Plant" },
  { id: "hummus", name: "Hummus", avg: 5, unit: "100g", type: "Plant" },
  { id: "pb", name: "Peanut butter", avg: 7, unit: "2 tbsp", type: "Snack" },
  { id: "nuts", name: "Snack jar nut mix", avg: 15, unit: "portion", type: "Snack" },
  { id: "almonds", name: "Almonds", avg: 6, unit: "30g", type: "Snack" },
  { id: "bar", name: "Protein bar", avg: 20, unit: "bar", type: "Snack" },
  { id: "oats", name: "Oats", avg: 5, unit: "40g", type: "Grain" },
  { id: "bread", name: "Wholemeal bread", avg: 4, unit: "slice", type: "Grain" },
  { id: "quinoa", name: "Quinoa (cooked)", avg: 4, unit: "100g", type: "Grain" },
];

const DEFAULT_PROFILE = {
  name: "", weight: 80, height: 180, age: 30, sex: "Male",
  goal: "recomp", activity: "moderate", multiplier: 2.0, autoProtein: true,
};
const DEFAULT_ROUTINE = { weeklyTarget: 3, splits: DEFAULT_SPLITS };

function isoLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function today() { return isoLocal(new Date()); }
export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoLocal(d);
}
export function weekKey(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return isoLocal(d);
}

export function freshState() {
  return {
    profile: { ...DEFAULT_PROFILE },
    routine: { weeklyTarget: 3, splits: DEFAULT_SPLITS.map((s) => ({ ...s })) },
    sources: DEFAULT_SOURCES.map((s) => ({ ...s })),
    protein: {},
    gym: {},
    weightLog: [{ date: today(), kg: DEFAULT_PROFILE.weight }],
    xp: 0,
    achvBaseline: {},
    achvUnlocked: [],
  };
}

function mergeDefaults(saved) {
  const base = freshState();
  const merged = { ...base, ...saved };
  merged.profile = { ...base.profile, ...(saved.profile || {}) };
  merged.routine = saved.routine && Array.isArray(saved.routine.splits) && saved.routine.splits.length
    ? saved.routine : base.routine;
  merged.sources = Array.isArray(saved.sources) && saved.sources.length
    ? saved.sources.map((s) => ({ type: "Other", ...s })) : base.sources;
  merged.achvBaseline = saved.achvBaseline || {};
  merged.achvUnlocked = saved.achvUnlocked || [];
  if (!Array.isArray(merged.weightLog) || !merged.weightLog.length) {
    merged.weightLog = [{ date: today(), kg: merged.profile.weight || 80 }];
  }
  return merged;
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

// ---- Protein target driven by ALL profile factors ----
export function recommendedMultiplier(p) {
  const base = { recomp: 2.0, cut: 2.4, maintain: 1.6, bulk: 1.8 }[p.goal] ?? 1.8;
  let m = base;
  m += { light: -0.1, moderate: 0, active: 0.15 }[p.activity] ?? 0;
  const age = Number(p.age) || 30;
  if (age >= 50) m += 0.2; else if (age >= 40) m += 0.1; else if (age >= 30) m += 0.05;
  const h = (Number(p.height) || 180) / 100;
  const w = Number(p.weight) || 80;
  const bmi = w / (h * h);
  if (bmi >= 30) m -= 0.2; else if (bmi >= 27) m -= 0.1; else if (bmi < 20) m += 0.1;
  if (p.sex === "Female") m -= 0.05;
  return Math.round(Math.max(1.4, Math.min(3.1, m)) * 10) / 10;
}
export function effectiveMultiplier(profile) {
  return profile.autoProtein === false ? profile.multiplier : recommendedMultiplier(profile);
}
export function proteinTarget(profile) {
  return Math.round((Number(profile.weight) || 0) * effectiveMultiplier(profile));
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
  Object.keys(state.gym).forEach((d) => { const w = weekKey(d); weeks[w] = (weeks[w] || 0) + 1; });
  let streak = 0;
  let cursor = weekKey(today());
  if (!(weeks[cursor] >= target)) cursor = addDays(cursor, -7);
  while (weeks[cursor] >= target) { streak += 1; cursor = addDays(cursor, -7); }
  return streak;
}

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
    if (n > 0) { picks.push({ id: src.id, name: src.name, servings: n, grams: n * src.avg }); remaining -= n * src.avg; }
  }
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

// ---- Tiered, lore-themed achievements (with reset baseline) ----
export const TIERS = [
  { name: "Bronze", color: "#C77B3A" },
  { name: "Silver", color: "#9AA6B2" },
  { name: "Gold", color: "#E5A93B" },
  { name: "Platinum", color: "#39D0FF" },
  { name: "Diamond", color: "#B98BFF" },
];

export const ACHIEVEMENTS = [
  { id: "jedi", name: "The Jedi Path", saga: "Star Wars", icon: "sword", unit: "sessions",
    thresholds: [10, 25, 50, 100, 200], measure: (s) => totalGym(s),
    lore: "Like a Padawan facing the Jedi Trials, mastery is earned only through relentless training.",
    how: "Rank up by logging gym sessions. Each tier demands more reps on the road to Jedi Master." },
  { id: "fellowship", name: "The Long March", saga: "The Lord of the Rings", icon: "route", unit: "week streak",
    thresholds: [2, 4, 8, 12, 24], measure: (s) => gymStreak(s),
    lore: "The road to Mordor is walked one week at a time, and the Fellowship never turns back.",
    how: "Hit your weekly session target in consecutive weeks. Miss a week and the march resets." },
  { id: "lembas", name: "Lembas Bread", saga: "The Lord of the Rings", icon: "bread", unit: "target days",
    thresholds: [1, 7, 30, 75, 150], measure: (s) => proteinHitDays(s),
    lore: "Elvish waybread. One small bite can sustain a grown man through a full day of marching.",
    how: "Earn a notch every day you hit your protein target. More fuelled days climb the tiers." },
  { id: "force", name: "The Force", saga: "Star Wars", icon: "sparkles", unit: "level",
    thresholds: [3, 5, 10, 15, 20], measure: (s) => levelFromXp(s.xp).level,
    lore: "The Force is strong with this one. Your power grows with everything you log.",
    how: "Gain XP and level up. Every session and every protein target feeds your power." },
  { id: "there-back", name: "There and Back Again", saga: "The Hobbit", icon: "map-2", unit: "days logged",
    thresholds: [7, 30, 90, 180, 365], measure: (s) => loggedDays(s),
    lore: "Bilbo's unexpected journey began with a single step out the door, and never truly ended.",
    how: "Log anything on a day to mark it. A full year of logged days reaches the final tier." },
  { id: "saiyan", name: "Over 9000", saga: "Dragon Ball Z", icon: "flame", unit: "g in a day",
    thresholds: [150, 180, 210, 240, 300], measure: (s) => maxDayProtein(s),
    lore: "Vegeta's scouter shattering at a power level beyond reason. It is OVER 9000.",
    how: "Set new highs for total protein in a single day. Stack your sources to break your record." },
  { id: "avatar", name: "Master of All Forms", saga: "Avatar: The Last Airbender", icon: "yin-yang", unit: "splits / week",
    thresholds: [2, 3, 4, 5, 6], measure: (s) => maxWeeklySplits(s),
    lore: "Only the Avatar can master all the elements: water, earth, fire and air.",
    how: "Train different splits within a single week. Hit more unique splits in one week to rank up." },
  { id: "worthy", name: "Worthy", saga: "Marvel", icon: "hammer", unit: "day protein streak",
    thresholds: [3, 7, 14, 30, 60], measure: (s) => proteinStreak(s),
    lore: "Whosoever proves worthy, hitting their protein day after day, shall hold the power of Mjolnir.",
    how: "Hit your protein target on consecutive days. Miss a day and the streak resets." },
  { id: "witcher", name: "Toss a Coin", saga: "The Witcher", icon: "coin", unit: "weekend sessions",
    thresholds: [1, 5, 15, 30, 60], measure: (s) => weekendSessions(s),
    lore: "O Valley of Plenty. A Witcher takes every contract, weekends included.",
    how: "Train on Saturdays or Sundays. Every weekend session counts toward this contract." },
  { id: "bazinga", name: "Bazinga!", saga: "The Big Bang Theory", icon: "atom", unit: "perfect days",
    thresholds: [1, 5, 15, 40, 100], measure: (s) => perfectDays(s),
    lore: "Sheldon's signature gotcha. A perfect day: trained AND fully fuelled.",
    how: "Log a gym session and hit your protein target on the same day." },
];

export function tierFor(ach, state) {
  const raw = ach.measure(state);
  const base = (state.achvBaseline && state.achvBaseline[ach.id]) || 0;
  const measure = Math.max(0, raw - base);
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
export function achievementBaselineNow(state) {
  const b = {};
  ACHIEVEMENTS.forEach((a) => { b[a.id] = a.measure(state); });
  return b;
}

export function recomputeXp(state) {
  const gymXp = Object.keys(state.gym).length * XP_PER_GYM;
  const proteinXp = Object.keys(state.protein).filter(
    (d) => dayProtein(state, d) >= proteinTarget(state.profile)
  ).length * XP_PER_PROTEIN_HIT;
  return gymXp + proteinXp;
}

function maintainUnlocks(next) {
  const unlockedNow = ACHIEVEMENTS.filter((a) => tierFor(a, next).idx > 0).map((a) => a.id);
  const prev = next.achvUnlocked || [];
  next.achvUnlocked = [
    ...prev.filter((id) => unlockedNow.includes(id)),
    ...unlockedNow.filter((id) => !prev.includes(id)),
  ];
}

export function useStore() {
  const [state, setState] = useState(null);
  const ready = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { localStorage.removeItem("forma.v1"); } catch {}
      let init;
      try {
        const saved = await idbGet("state");
        init = saved ? mergeDefaults(saved) : freshState();
      } catch { init = freshState(); }
      if (alive) { setState(init); ready.current = true; }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (state && ready.current) idbSet("state", state).catch(() => {});
  }, [state]);

  const update = useCallback((fn) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = fn(structuredClone(prev));
      next.xp = recomputeXp(next);
      maintainUnlocks(next);
      return next;
    });
  }, []);

  const replace = useCallback((newState) => {
    setState(newState);
    idbSet("state", newState).catch(() => {});
  }, []);

  return [state, update, replace];
}
