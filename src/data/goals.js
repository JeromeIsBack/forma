// Research-backed, goal-specific guidance shown across the app.
// Each goal carries a recommended protein multiplier and punchy + science tips
// for three contexts: protein, training, pace. Sources are cited inline.

export const GOAL_GUIDE = {
  recomp: {
    label: "Recomp",
    color: "#7C3AED",
    proteinMult: 2.0,
    plan: "Build muscle and shed fat at the same time — eat near maintenance, keep protein high, train hard.",
    tips: {
      protein: {
        punch: "Hit 2.0–2.2 g/kg. Protein is what lets you gain muscle while losing fat.",
        science:
          "Daily protein of roughly 1.6–2.2 g/kg maximises fat-free mass gains; the upper end best protects muscle during the slight deficit a recomp runs on.",
        cite: "ISSN Position Stand (2017); Morton et al. meta-analysis (2018)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/",
      },
      training: {
        punch: "10–20 hard sets per muscle per week, each muscle hit twice.",
        science:
          "A dose-response meta-analysis found hypertrophy keeps rising with weekly sets up to about 10–20, and training each muscle 2×/week beats once.",
        cite: "Schoenfeld, Ogborn & Krieger (2017)",
        url: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
      },
      pace: {
        punch: "Stay within ~300 kcal of maintenance — recomp is a slow burn, not a crash cut.",
        science:
          "Recomposition works best near energy balance; trained lifters in deficits under ~500 kcal can lose fat while still adding a little muscle.",
        cite: "Murphy & Koehler (2021)",
        url: "https://www.precisionnutrition.com/rates-of-fat-loss-and-muscle-gain",
      },
    },
  },
  cut: {
    label: "Cut",
    color: "#FF4D6D",
    proteinMult: 2.4,
    plan: "Strip fat while holding muscle — moderate deficit, very high protein, keep lifting heavy.",
    tips: {
      protein: {
        punch: "Push protein to 2.3–3.1 g/kg. The deficit is when muscle is most at risk.",
        science:
          "During calorie restriction, higher protein (2.3–3.1 g/kg) maximises retention of lean body mass in resistance-trained people.",
        cite: "ISSN Position Stand (2017)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/",
      },
      training: {
        punch: "Keep your weights heavy and volume up — don't 'tone', maintain the stimulus.",
        science:
          "Resistance training with high protein during a deficit dramatically limits lean-mass loss; dropping load tells the body it can shed muscle.",
        cite: "Murphy & Koehler (2021)",
        url: "https://www.precisionnutrition.com/rates-of-fat-loss-and-muscle-gain",
      },
      pace: {
        punch: "Lose 0.5–1% of bodyweight per week. Faster burns muscle, not just fat.",
        science:
          "A rate of 0.5–1%/week (≈a 500 kcal deficit) preserves lean mass; lean-mass loss climbs as the deficit grows beyond that.",
        cite: "Murphy & Koehler (2021)",
        url: "https://www.precisionnutrition.com/rates-of-fat-loss-and-muscle-gain",
      },
    },
  },
  maintain: {
    label: "Maintain",
    color: "#5DE0C4",
    proteinMult: 1.6,
    plan: "Hold your physique and strength — eat at maintenance, keep protein and volume steady.",
    tips: {
      protein: {
        punch: "~1.6 g/kg covers maintenance with room to spare.",
        science:
          "1.4–2.0 g/kg maintains muscle in active people; ~1.6 g/kg is roughly the point of diminishing returns for fat-free mass.",
        cite: "ISSN Position Stand (2017); Morton et al. (2018)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/",
      },
      training: {
        punch: "10+ hard sets per muscle per week holds what you've built.",
        science:
          "At least ~10 weekly sets per muscle maximises growth; you can maintain on the lower end of that as long as intensity stays high.",
        cite: "Schoenfeld, Ogborn & Krieger (2017)",
        url: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
      },
      pace: {
        punch: "Eat at maintenance — aim for stable weight week to week.",
        science:
          "Bodyweight holding steady over a 1–2 week average is the simplest signal you're at maintenance energy intake.",
        cite: "General energy-balance principle",
        url: "",
      },
    },
  },
  bulk: {
    label: "Bulk",
    color: "#FFC53D",
    proteinMult: 1.8,
    plan: "Add muscle with minimal fat — small surplus, high protein, push your training volume.",
    tips: {
      protein: {
        punch: "1.6–2.2 g/kg turns the surplus into muscle, not just fat.",
        science:
          "In resistance-trained people, ≥1.6–2.2 g/kg drives greater fat-free mass; more protein beyond that adds little when calories and training suffice.",
        cite: "ISSN Position Stand (2017); Morton et al. (2018)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/",
      },
      training: {
        punch: "Push toward the top of the range — 15–20+ hard sets per muscle per week.",
        science:
          "Hypertrophy scales with weekly volume; a surplus gives you the recovery headroom to actually use higher set counts.",
        cite: "Schoenfeld, Ogborn & Krieger (2017)",
        url: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
      },
      pace: {
        punch: "Keep the surplus small: +5–10% calories, ~0.25–0.5 kg per month.",
        science:
          "A modest surplus (+5–10% over maintenance) maximises the muscle-to-fat ratio of new weight; bigger surpluses mostly add fat.",
        cite: "Helms et al. (2023); evidence-based bulking guidelines",
        url: "https://www.thebodybuildingdietitians.com/blog/how-fast-should-you-bulk-or-cut-evidence-based-guidelines",
      },
    },
  },
};

export function goalGuide(id) {
  return GOAL_GUIDE[id] || GOAL_GUIDE.recomp;
}
