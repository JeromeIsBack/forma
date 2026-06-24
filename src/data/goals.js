// Goal-specific guidance. Each context (protein / training / pace) holds an
// ARRAY of tips that rotate day to day, so the coaching feels fresh and varied.
// Pages can also pass a live "situational" note computed from current progress.

const ISSN = "https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/";
const SCHOEN = "https://pubmed.ncbi.nlm.nih.gov/27433992/";
const RATES = "https://www.precisionnutrition.com/rates-of-fat-loss-and-muscle-gain";
const BULK = "https://www.thebodybuildingdietitians.com/blog/how-fast-should-you-bulk-or-cut-evidence-based-guidelines";

export const GOAL_GUIDE = {
  recomp: {
    label: "Recomp", color: "#7C3AED", proteinMult: 2.0,
    plan: "Build muscle and shed fat at the same time — eat near maintenance, keep protein high, train hard.",
    tips: {
      protein: [
        { punch: "Hit 2.0–2.2 g/kg. Protein is what lets you gain muscle while losing fat.",
          science: "Roughly 1.6–2.2 g/kg maximises fat-free mass; the upper end best protects muscle through the slight deficit a recomp runs on.",
          cite: "ISSN Position Stand (2017); Morton et al. (2018)", url: ISSN },
        { punch: "Spread it across 3–4 meals of 30–40g to keep muscle-building topped up.",
          science: "Per-meal doses of about 0.25–0.4 g/kg repeatedly trigger muscle protein synthesis better than one or two large hits.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
      ],
      training: [
        { punch: "10–20 hard sets per muscle per week, each muscle trained twice.",
          science: "A dose-response meta-analysis found hypertrophy rises with weekly sets up to about 10–20, and twice-weekly frequency beats once.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Add a rep or a little load over time — progressive overload is the real driver.",
          science: "Muscle and strength gains track steadily increasing training stimulus over weeks, not any single workout.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
      ],
      pace: [
        { punch: "Stay within ~300 kcal of maintenance — recomp is a slow burn, not a crash cut.",
          science: "Recomposition works best near energy balance; trained lifters in deficits under ~500 kcal can lose fat while still adding a little muscle.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "It works best if you're newer, returning from a break, or have some fat to lose.",
          science: "Body recomposition is most pronounced in untrained, detrained, or higher-body-fat lifters; advanced lean lifters see less.",
          cite: "Recomposition research review", url: RATES },
      ],
    },
  },
  cut: {
    label: "Cut", color: "#FF4D6D", proteinMult: 2.4,
    plan: "Strip fat while holding muscle — moderate deficit, very high protein, keep lifting heavy.",
    tips: {
      protein: [
        { punch: "Push protein to 2.3–3.1 g/kg. The deficit is when muscle is most at risk.",
          science: "During calorie restriction, higher protein (2.3–3.1 g/kg) maximises retention of lean body mass in trained people.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
        { punch: "Make protein your highest macro — it also blunts hunger and protects adherence.",
          science: "High protein in a deficit both preserves lean mass and increases satiety, which makes the diet easier to stick to.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
      ],
      training: [
        { punch: "Keep your weights heavy — don't 'tone', maintain the stimulus.",
          science: "Resistance training with high protein during a deficit dramatically limits lean-mass loss; dropping load signals the body it can shed muscle.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "You can trim volume slightly, but never intensity.",
          science: "Maintaining heavy load preserves strength and muscle even when total sets are reduced to manage fatigue in a deficit.",
          cite: "Resistance-training-in-deficit research", url: RATES },
      ],
      pace: [
        { punch: "Lose 0.5–1% of bodyweight per week. Faster burns muscle, not just fat.",
          science: "A rate of 0.5–1%/week (≈a 500 kcal deficit) preserves lean mass; lean-mass loss climbs as the deficit grows.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "Keep the deficit near 500 kcal — bigger isn't better for keeping muscle.",
          science: "Beyond roughly a 500 kcal daily deficit, the share of weight lost as lean mass rises sharply.",
          cite: "Murphy & Koehler (2021)", url: RATES },
      ],
    },
  },
  maintain: {
    label: "Maintain", color: "#5DE0C4", proteinMult: 1.6,
    plan: "Hold your physique and strength — eat at maintenance, keep protein and volume steady.",
    tips: {
      protein: [
        { punch: "~1.6 g/kg covers maintenance with room to spare.",
          science: "1.4–2.0 g/kg maintains muscle in active people; ~1.6 g/kg is roughly the point of diminishing returns for fat-free mass.",
          cite: "ISSN Position Stand (2017); Morton et al. (2018)", url: ISSN },
        { punch: "Don't drift below ~1.4 g/kg or muscle slowly erodes.",
          science: "Intakes under about 1.4 g/kg in active people gradually reduce lean mass even at maintenance calories.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
      ],
      training: [
        { punch: "10+ hard sets per muscle per week holds what you've built.",
          science: "At least ~10 weekly sets per muscle maximises growth; you can hold muscle on the lower end as long as intensity stays high.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Train each muscle about twice a week — frequency keeps the signal alive.",
          science: "Twice-weekly training maintains muscle efficiently compared with hitting a muscle only once per week.",
          cite: "Schoenfeld et al. (2016), frequency meta-analysis", url: SCHOEN },
      ],
      pace: [
        { punch: "Eat at maintenance — aim for stable weight week to week.",
          science: "When weekly-average bodyweight holds steady, you're at maintenance energy intake.",
          cite: "Energy-balance principle", url: "" },
        { punch: "Judge it on a weekly average, not a single morning's scale reading.",
          science: "Daily weight swings with water, sodium and food volume; a 7-day average reveals the real trend.",
          cite: "Body-weight monitoring principle", url: "" },
      ],
    },
  },
  bulk: {
    label: "Bulk", color: "#FFC53D", proteinMult: 1.8,
    plan: "Add muscle with minimal fat — small surplus, high protein, push your training volume.",
    tips: {
      protein: [
        { punch: "1.6–2.2 g/kg turns the surplus into muscle, not just fat.",
          science: "In trained people, ≥1.6–2.2 g/kg drives greater fat-free mass; more beyond that adds little when calories and training suffice.",
          cite: "ISSN Position Stand (2017); Morton et al. (2018)", url: ISSN },
        { punch: "Past ~2.2 g/kg, spend the extra calories on carbs to fuel training.",
          science: "Protein shows diminishing returns above ~1.6–2.2 g/kg; carbohydrate better supports the higher training volumes a bulk allows.",
          cite: "Morton et al. (2018)", url: ISSN },
      ],
      training: [
        { punch: "Push toward 15–20+ hard sets per muscle per week.",
          science: "Hypertrophy scales with weekly volume; a surplus gives the recovery headroom to actually use higher set counts.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Use the surplus to add volume, not just weight on the bar.",
          science: "More weekly sets drive more growth when recovery, fuelled by extra calories, can support them.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
      ],
      pace: [
        { punch: "Keep the surplus small: +5–10% calories, ~0.25–0.5 kg per month.",
          science: "A modest surplus (+5–10% over maintenance) maximises the muscle-to-fat ratio of new weight; bigger surpluses mostly add fat.",
          cite: "Helms et al. (2023); evidence-based bulking guidelines", url: BULK },
        { punch: "If the scale jumps fast, that's mostly fat — ease the surplus back.",
          science: "Gaining much faster than ~0.5 kg/month disproportionately adds fat that later has to be dieted off.",
          cite: "Helms et al. (2023)", url: BULK },
      ],
    },
  },
};

export function goalGuide(id) {
  return GOAL_GUIDE[id] || GOAL_GUIDE.recomp;
}

// Deterministic day index so the rotating tip changes daily but stays stable within a day.
function dayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

// Returns one rotating tip for a goal + context.
export function rotatingTip(goalId, context) {
  const g = goalGuide(goalId);
  const pool = (g.tips && g.tips[context]) || [];
  if (!pool.length) return null;
  return pool[dayIndex() % pool.length];
}
