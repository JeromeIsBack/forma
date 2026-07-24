// Open Food Facts integration — keyless, CORS-enabled reads straight from the PWA.
// Barcode -> normalized product -> goal-aware scorecard -> portion protein.

const OFF_BASE = "https://world.openfoodfacts.org/api/v2/product/";
const FIELDS = [
  "product_name", "brands", "quantity", "serving_size", "serving_quantity",
  "nutriscore_grade", "nova_group", "nutriments", "image_front_small_url", "image_url",
].join(",");

function num(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

// Pull a clean, predictable shape out of OFF's sparse/messy nutriments object.
export function normalizeProduct(raw, code) {
  if (!raw) return null;
  const n = raw.nutriments || {};
  const per100 = {
    kcal: num(n["energy-kcal_100g"]) ?? (num(n["energy_100g"]) != null ? Math.round(num(n["energy_100g"]) / 4.184) : null),
    protein: num(n["proteins_100g"]),
    sugars: num(n["sugars_100g"]),
    satfat: num(n["saturated-fat_100g"]),
    salt: num(n["salt_100g"]),
    fibre: num(n["fiber_100g"]),
  };
  const perServing = {
    kcal: num(n["energy-kcal_serving"]) ?? (num(n["energy_serving"]) != null ? Math.round(num(n["energy_serving"]) / 4.184) : null),
    protein: num(n["proteins_serving"]),
  };
  return {
    code,
    name: (raw.product_name || "").trim() || "Unnamed product",
    brand: (raw.brands || "").split(",")[0].trim(),
    quantity: (raw.quantity || "").trim(),
    servingSize: (raw.serving_size || "").trim(),
    servingQty: num(raw.serving_quantity), // grams per serving, when known
    nutriscore: (raw.nutriscore_grade || "").toLowerCase(),
    nova: num(raw.nova_group),
    per100,
    perServing,
    image: raw.image_front_small_url || raw.image_url || null,
    hasNutrition: per100.protein != null || per100.kcal != null,
  };
}

export async function lookupBarcode(code) {
  const clean = String(code || "").replace(/\D/g, "");
  if (clean.length < 6) return { ok: false, reason: "invalid" };
  const url = `${OFF_BASE}${clean}.json?fields=${FIELDS}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { ok: false, reason: "network" };
    const data = await res.json();
    if (data.status === 0 || !data.product) return { ok: false, reason: "notfound", code: clean };
    const product = normalizeProduct(data.product, clean);
    if (!product.hasNutrition) return { ok: false, reason: "nonutrition", product };
    return { ok: true, product };
  } catch {
    return { ok: false, reason: "network" };
  }
}

// ---- Goal-aware scorecard ---------------------------------------------------
// Judges a product against the user's profile goal. Protein density (g protein
// per 100 kcal) is the backbone; sugar / saturated fat / processing modulate it,
// weighted differently per goal.

const GOAL_WEIGHTS = {
  //            proteinLead  sugarPenalty  satfatPenalty  caloriePenalty  novaPenalty
  recomp:   { protein: 1.0, sugar: 1.0, satfat: 1.0, calorie: 0.7, nova: 0.8 },
  cut:      { protein: 1.0, sugar: 1.3, satfat: 1.2, calorie: 1.0, nova: 0.9 },
  maintain: { protein: 0.9, sugar: 1.0, satfat: 1.0, calorie: 0.5, nova: 0.8 },
  bulk:     { protein: 1.0, sugar: 0.6, satfat: 0.7, calorie: 0.0, nova: 0.5 },
};

const GRADE_VERDICT = {
  recomp:   { A: "Great recomp pick", B: "Solid choice", C: "Okay in moderation", D: "Occasional", E: "Not for recomp" },
  cut:      { A: "Cut-friendly", B: "Works on a cut", C: "Watch the portion", D: "Occasional", E: "Skip on a cut" },
  maintain: { A: "Great everyday pick", B: "Solid choice", C: "Fine in moderation", D: "Occasional", E: "Treat only" },
  bulk:     { A: "Great bulking fuel", B: "Solid mass pick", C: "Fine in the mix", D: "Mostly empty cals", E: "Little to offer" },
};

// protein grams per 100 kcal -> 0..100 sub-score
function proteinDensityScore(protein, kcal) {
  if (!kcal || protein == null) return { density: null, score: 40 };
  const density = (protein / kcal) * 100; // g protein per 100 kcal
  // ~11 g/100kcal (e.g. chicken breast) is excellent; ~2 is poor.
  const score = Math.max(0, Math.min(100, ((density - 1.5) / (11 - 1.5)) * 100));
  return { density: Math.round(density * 10) / 10, score };
}

function gradeFromScore(s) {
  if (s >= 82) return "A";
  if (s >= 66) return "B";
  if (s >= 48) return "C";
  if (s >= 30) return "D";
  return "E";
}

export function scoreForGoal(product, profile) {
  const goal = (profile && profile.goal) || "recomp";
  const w = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.recomp;
  const p = product.per100 || {};
  const { density, score: pScore } = proteinDensityScore(p.protein, p.kcal);

  // penalties (each 0..~30 points off, scaled by goal weight)
  let penalty = 0;
  const reasons = [];

  if (density != null && density >= 7) reasons.push(`High protein density (${density} g / 100 kcal)`);
  else if (density != null && density < 3) reasons.push(`Low protein for the calories (${density} g / 100 kcal)`);

  if (p.sugars != null) {
    if (p.sugars >= 22) { penalty += 26 * w.sugar; reasons.push(`High sugar (${Math.round(p.sugars)} g/100 g)`); }
    else if (p.sugars >= 10) { penalty += 12 * w.sugar; }
    else if (p.sugars <= 3) { reasons.push("Low sugar"); }
  }
  if (p.satfat != null) {
    if (p.satfat >= 8) { penalty += 20 * w.satfat; reasons.push(`High saturated fat (${Math.round(p.satfat)} g/100 g)`); }
    else if (p.satfat >= 4) { penalty += 9 * w.satfat; }
  }
  if (p.kcal != null && w.calorie > 0) {
    if (p.kcal >= 450) { penalty += 18 * w.calorie; if (goal !== "bulk") reasons.push(`Calorie-dense (${Math.round(p.kcal)} kcal/100 g)`); }
    else if (p.kcal >= 300) { penalty += 8 * w.calorie; }
  }
  if (product.nova === 4) { penalty += 12 * w.nova; reasons.push("Ultra-processed (NOVA 4)"); }
  else if (product.nova === 1) { reasons.push("Minimally processed"); }

  const raw = pScore * (0.5 + 0.5 * w.protein) - penalty;
  const final = Math.max(0, Math.min(100, raw));
  const grade = gradeFromScore(final);
  const verdict = (GRADE_VERDICT[goal] || GRADE_VERDICT.recomp)[grade];

  return {
    goal,
    grade,
    verdict,
    density, // g protein / 100 kcal
    score: Math.round(final),
    reasons: reasons.slice(0, 3),
    nutriscore: product.nutriscore || null,
    nova: product.nova || null,
  };
}

// Protein contained in a given portion (grams of product).
export function portionProtein(product, grams) {
  const per100 = product.per100 && product.per100.protein;
  if (per100 == null || !grams) return 0;
  return Math.round((per100 * grams) / 100);
}

// Grams-per-serving best guess, for the "× serving" quick portion option.
export function servingGrams(product) {
  if (product.servingQty && product.servingQty > 0) return Math.round(product.servingQty);
  const m = (product.servingSize || "").match(/(\d+(?:\.\d+)?)\s*g/i);
  return m ? Math.round(parseFloat(m[1])) : null;
}
