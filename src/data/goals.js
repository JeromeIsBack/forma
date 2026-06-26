// Goal-specific guidance. Each context (protein / training / pace) holds an
// ARRAY of tips that rotate hourly (and on manual tap), so the coaching feels
// fresh and varied. Pages can also pass a live "situational" note.

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
        { punch: "Anchor a protein source in every meal — eggs, dairy, meat, tofu, or a shake.",
          science: "Distributing protein across meals keeps muscle protein synthesis elevated through the day rather than spiking only once.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
        { punch: "A pre-sleep 30–40g dose like skyr or casein supports overnight recovery.",
          science: "Protein eaten before sleep is digested through the night and raises overnight muscle protein synthesis.",
          cite: "Snijders et al. (2015)", url: "" },
        { punch: "Total daily protein matters most — hit the number, timing is the fine-tuning.",
          science: "Daily protein total is the primary driver of muscle retention and growth; distribution and timing are secondary refinements.",
          cite: "Schoenfeld & Aragon (2018)", url: "" },
        { punch: "Lean protein keeps you full near maintenance calories — your recomp ally.",
          science: "Protein is the most satiating macronutrient, which helps hold calories near maintenance without excess hunger.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
      ],
      training: [
        { punch: "10–20 hard sets per muscle per week, each muscle trained twice.",
          science: "A dose-response meta-analysis found hypertrophy rises with weekly sets up to about 10–20, and twice-weekly frequency beats once.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Add a rep or a little load over time — progressive overload is the real driver.",
          science: "Muscle and strength gains track steadily increasing training stimulus over weeks, not any single workout.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Train close to failure — leave roughly 1–3 reps in reserve on hard sets.",
          science: "Sets taken near failure (low reps in reserve) maximise the hypertrophic stimulus per set.",
          cite: "Refalo et al. (2023)", url: "" },
        { punch: "Heavy or lighter loads both build muscle — what counts is hard effort.",
          science: "Loads from ~30% to 85% of max build similar muscle when sets are taken near failure; pick what you can push hard.",
          cite: "Schoenfeld et al. (2017)", url: SCHOEN },
        { punch: "Use a full range of motion — the stretched position especially pays off.",
          science: "Training through a full range, emphasising the lengthened position, tends to produce more growth than partial reps.",
          cite: "Schoenfeld & Grgic (2020)", url: "" },
        { punch: "Rest 2–3 min on big lifts so the next set keeps its quality.",
          science: "Longer rest between sets preserves volume-load and supports greater hypertrophy than very short rest.",
          cite: "Schoenfeld et al. (2016)", url: "" },
      ],
      pace: [
        { punch: "Stay within ~300 kcal of maintenance — recomp is a slow burn, not a crash cut.",
          science: "Recomposition works best near energy balance; trained lifters in deficits under ~500 kcal can lose fat while still adding a little muscle.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "It works best if you're newer, returning from a break, or have some fat to lose.",
          science: "Body recomposition is most pronounced in untrained, detrained, or higher-body-fat lifters; advanced lean lifters see less.",
          cite: "Recomposition research review", url: RATES },
        { punch: "Judge progress by a weekly weight average and monthly photos — not the daily scale.",
          science: "Because fat loss and muscle gain offset on the scale, photos and measurements reveal recomposition better than weight alone.",
          cite: "Body-composition monitoring", url: "" },
        { punch: "Be patient — visible recomp is measured in months, not weeks.",
          science: "Simultaneous fat loss and muscle gain is slow; meaningful change typically shows over 8–12+ weeks.",
          cite: "Murphy & Koehler (2021)", url: RATES },
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
        { punch: "Lean, high-volume foods (chicken, fish, skyr, egg whites) fill you up per calorie.",
          science: "High-protein, low-energy-density foods maximise fullness for the fewest calories, aiding deficit adherence.",
          cite: "Satiety research", url: "" },
        { punch: "Keep protein high every single day — rest days included. Muscle is defended daily.",
          science: "Adequate daily protein protects lean mass continuously through a deficit, not only on training days.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
        { punch: "A pre-sleep casein or dairy feeding helps protect muscle when calories are low.",
          science: "Protein before bed sustains overnight amino acid availability, supporting muscle retention in a deficit.",
          cite: "Snijders et al. (2015)", url: "" },
        { punch: "Hitting protein curbs cravings — it's your best hunger-management tool.",
          science: "Higher protein intake increases satiety and reduces appetite, easing diet adherence.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
      ],
      training: [
        { punch: "Keep your weights heavy — don't 'tone', maintain the stimulus.",
          science: "Resistance training with high protein during a deficit dramatically limits lean-mass loss; dropping load signals the body it can shed muscle.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "You can trim volume slightly, but never intensity.",
          science: "Maintaining heavy load preserves strength and muscle even when total sets are reduced to manage fatigue in a deficit.",
          cite: "Resistance-training-in-deficit research", url: RATES },
        { punch: "Aim to at least maintain your lifts — strength held is muscle held.",
          science: "Maintaining or progressing load in a deficit is a strong signal to retain muscle; strength loss often precedes muscle loss.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "Cut junk volume before working sets — manage fatigue, protect the hard stuff.",
          science: "Recovery is reduced in a deficit, so trimming low-value volume while keeping heavy work preserves the key stimulus.",
          cite: "Resistance-training-in-deficit research", url: RATES },
        { punch: "Sleep and step count matter more when dieting — they guard recovery and burn.",
          science: "In a deficit, adequate sleep protects lean mass and performance, while daily activity supports the energy gap.",
          cite: "Sleep & body-composition research", url: "" },
      ],
      pace: [
        { punch: "Lose 0.5–1% of bodyweight per week. Faster burns muscle, not just fat.",
          science: "A rate of 0.5–1%/week (≈a 500 kcal deficit) preserves lean mass; lean-mass loss climbs as the deficit grows.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "Keep the deficit near 500 kcal — bigger isn't better for keeping muscle.",
          science: "Beyond roughly a 500 kcal daily deficit, the share of weight lost as lean mass rises sharply.",
          cite: "Murphy & Koehler (2021)", url: RATES },
        { punch: "Plateau? Take a week at maintenance before pushing the deficit again.",
          science: "Periodic maintenance breaks can ease the strain of dieting without stalling long-term fat loss.",
          cite: "Byrne et al. (2018)", url: "" },
        { punch: "Leaner already? Slow the cut to ~0.5%/week to spare hard-won muscle.",
          science: "As you get leaner the body defends muscle less well, so a smaller deficit better protects lean mass.",
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
        { punch: "Keep protein steady even when 'just maintaining' — cheap insurance for muscle.",
          science: "Consistent ~1.6 g/kg reliably maintains fat-free mass in active people at maintenance calories.",
          cite: "Morton et al. (2018)", url: ISSN },
        { punch: "Spread protein across the day to keep recovery smooth between sessions.",
          science: "Even protein distribution supports ongoing muscle protein synthesis and recovery at maintenance.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
        { punch: "Maintenance is a great time to dial in food quality and habits.",
          science: "Without the demands of a surplus or deficit, maintenance phases are ideal for building sustainable nutrition habits.",
          cite: "Practical guidance", url: "" },
      ],
      training: [
        { punch: "10+ hard sets per muscle per week holds what you've built.",
          science: "At least ~10 weekly sets per muscle maximises growth; you can hold muscle on the lower end as long as intensity stays high.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Train each muscle about twice a week — frequency keeps the signal alive.",
          science: "Twice-weekly training maintains muscle efficiently compared with hitting a muscle only once per week.",
          cite: "Schoenfeld et al. (2016), frequency meta-analysis", url: SCHOEN },
        { punch: "You can hold muscle on surprisingly low volume if intensity stays high.",
          science: "Muscle is maintained with as little as roughly a third of growth-phase volume, provided training intensity stays high.",
          cite: "Maintenance-volume research", url: "" },
        { punch: "Keep progressing where you can — maintenance isn't the same as coasting.",
          science: "Small ongoing overload keeps the maintenance stimulus honest and prevents slow detraining.",
          cite: "Schoenfeld et al. (2017)", url: SCHOEN },
        { punch: "Auto-regulate: train hard when fresh, pull back when life is heavy.",
          science: "Adjusting effort to readiness sustains long-term consistency, which is what maintains physique over time.",
          cite: "Auto-regulation research", url: "" },
      ],
      pace: [
        { punch: "Eat at maintenance — aim for stable weight week to week.",
          science: "When weekly-average bodyweight holds steady, you're at maintenance energy intake.",
          cite: "Energy-balance principle", url: "" },
        { punch: "Judge it on a weekly average, not a single morning's scale reading.",
          science: "Daily weight swings with water, sodium and food volume; a 7-day average reveals the real trend.",
          cite: "Body-weight monitoring principle", url: "" },
        { punch: "Recheck maintenance calories every few weeks — they drift with weight and activity.",
          science: "Maintenance intake changes as bodyweight and activity shift, so periodic recalibration keeps you balanced.",
          cite: "Energy-balance principle", url: "" },
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
        { punch: "Don't let protein slip just because calories are high — keep ≥1.6 g/kg.",
          science: "Even in a surplus, sufficient protein is needed to bias gained weight toward muscle rather than fat.",
          cite: "Morton et al. (2018)", url: ISSN },
        { punch: "Fill remaining calories with carbs to power high-volume training.",
          science: "Carbohydrate supports glycogen and training output, letting you accumulate the volume that drives growth.",
          cite: "ISSN Position Stand (2017)", url: ISSN },
        { punch: "Protein first, then carbs and fats to reach your surplus — order your plate.",
          science: "Anchoring meals around protein ensures the muscle-building requirement is met before filler calories.",
          cite: "Practical guidance", url: "" },
      ],
      training: [
        { punch: "Push toward 15–20+ hard sets per muscle per week.",
          science: "Hypertrophy scales with weekly volume; a surplus gives the recovery headroom to actually use higher set counts.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Use the surplus to add volume, not just weight on the bar.",
          science: "More weekly sets drive more growth when recovery, fuelled by extra calories, can support them.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "A surplus is permission to add sets — chase weekly volume progressively.",
          science: "Extra calories improve recovery capacity, so a bulk is the time to push weekly set counts upward.",
          cite: "Schoenfeld, Ogborn & Krieger (2017)", url: SCHOEN },
        { punch: "Add reps and load over weeks — log it so progression is real, not vibes.",
          science: "Documented progressive overload is the clearest driver of growth; tracking ensures you actually add stimulus.",
          cite: "Schoenfeld et al. (2017)", url: SCHOEN },
        { punch: "Eat and sleep enough to actually recover the extra volume you're adding.",
          science: "Growth happens in recovery; the surplus only helps if sleep and total food support the added training.",
          cite: "Recovery research", url: "" },
      ],
      pace: [
        { punch: "Keep the surplus small: +5–10% calories, ~0.25–0.5 kg per month.",
          science: "A modest surplus (+5–10% over maintenance) maximises the muscle-to-fat ratio of new weight; bigger surpluses mostly add fat.",
          cite: "Helms et al. (2023); evidence-based bulking guidelines", url: BULK },
        { punch: "If the scale jumps fast, that's mostly fat — ease the surplus back.",
          science: "Gaining much faster than ~0.5 kg/month disproportionately adds fat that later has to be dieted off.",
          cite: "Helms et al. (2023)", url: BULK },
        { punch: "Newer lifters can push the upper surplus; seasoned lifters should go slower.",
          science: "Beginners gain muscle fast enough to use a slightly larger surplus; advanced lifters add fat more readily, so go lean.",
          cite: "Helms et al. (2023)", url: BULK },
        { punch: "Bulk in blocks: a few months up, then a short cut to reset body-fat.",
          science: "Alternating modest surplus blocks with brief cuts keeps body-fat in check while accumulating muscle over time.",
          cite: "Evidence-based bulking guidelines", url: BULK },
      ],
    },
  },
};

export function goalGuide(id) {
  return GOAL_GUIDE[id] || GOAL_GUIDE.recomp;
}

function dayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function hourIndex() { return Math.floor(Date.now() / 3600000); }

export function rotatingTip(goalId, context, offset = 0) {
  const g = goalGuide(goalId);
  const pool = (g.tips && g.tips[context]) || [];
  if (!pool.length) return null;
  return pool[((hourIndex() + offset) % pool.length + pool.length) % pool.length];
}
