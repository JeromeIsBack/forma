import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { MeasurementsSection } from "../components/MeasurementsSection.jsx";
import { proteinTarget, recommendedMultiplier, effectiveMultiplier, today, clamp } from "../lib/store.js";

const GOALS = [{ id: "recomp", label: "Recomp" }, { id: "cut", label: "Cut" }, { id: "maintain", label: "Maintain" }, { id: "bulk", label: "Bulk" }];
const ACTIVITY = [{ id: "light", label: "Light" }, { id: "moderate", label: "Moderate" }, { id: "active", label: "Active" }];

export default function ProfilePage({ state, update, go, onMenu, celebrate }) {
  const p = state.profile;
  const target = proteinTarget(p);
  const effMult = effectiveMultiplier(p);
  const auto = p.autoProtein !== false;

  function setField(key, value) { update((s) => { s.profile[key] = value; return s; }); }
  function setNum(key, value, min, max) {
    update((s) => { s.profile[key] = value === "" ? "" : clamp(value, min, max); return s; });
  }
  function setWeight(value) {
    update((s) => {
      const kg = value === "" ? "" : clamp(value, 30, 300);
      s.profile.weight = kg;
      if (kg) {
        const log = s.weightLog.filter((w) => w.date !== today());
        log.push({ date: today(), kg });
        s.weightLog = log.sort((a, b) => a.date.localeCompare(b.date));
      }
      return s;
    });
  }
  function setAuto(on) {
    update((s) => { s.profile.autoProtein = on; if (!on) s.profile.multiplier = effectiveMultiplier(s.profile); return s; });
  }

  return (
    <div className="app">
      <h2 className="sr-only">Character — your identity, body and nutrition target</h2>
      <PageHead go={go} onMenu={onMenu} title="Character" sub="You, your body & your target" />

      <Field label="Name" full>
        <input className="input" placeholder="Your name or alias" maxLength={24} value={p.name || ""} onChange={(e) => setField("name", e.target.value)} />
      </Field>

      <div className="section-label">Body stats</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Field label="Body weight (kg)"><input className="input" type="number" inputMode="decimal" min={30} max={300} value={p.weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label="Height (cm)"><input className="input" type="number" inputMode="numeric" min={100} max={250} value={p.height} onChange={(e) => setNum("height", e.target.value, 100, 250)} /></Field>
        <Field label="Age"><input className="input" type="number" inputMode="numeric" min={10} max={100} value={p.age} onChange={(e) => setNum("age", e.target.value, 10, 100)} /></Field>
        <Field label="Sex"><div className="seg">{["Male", "Female"].map((s) => (<button key={s} className={`seg-opt ${p.sex === s ? "on" : ""}`} onClick={() => setField("sex", s)}>{s}</button>))}</div></Field>
      </div>

      <Field label="Goal" full><div className="seg">{GOALS.map((g) => (<button key={g.id} className={`seg-opt ${p.goal === g.id ? "on" : ""}`} onClick={() => setField("goal", g.id)}>{g.label}</button>))}</div></Field>
      <Field label="Activity level" full><div className="seg">{ACTIVITY.map((a) => (<button key={a.id} className={`seg-opt ${p.activity === a.id ? "on" : ""}`} onClick={() => setField("activity", a.id)}>{a.label}</button>))}</div></Field>

      <Field label="Protein target" full>
        <div className="seg" style={{ marginBottom: 12 }}>
          <button className={`seg-opt ${auto ? "on" : ""}`} onClick={() => setAuto(true)}>Auto from stats</button>
          <button className={`seg-opt ${!auto ? "on" : ""}`} onClick={() => setAuto(false)}>Custom</button>
        </div>
        {!auto && (
          <div style={{ marginBottom: 6 }}>
            <input type="range" min="1.4" max="3.1" step="0.1" value={p.multiplier} onChange={(e) => setField("multiplier", parseFloat(e.target.value))} />
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 7 }}>{Number(p.multiplier).toFixed(1)} g per kg</div>
          </div>
        )}
      </Field>

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginTop: 2, color: "#fff", background: "linear-gradient(140deg, var(--hero-1), var(--hero-2))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="num" style={{ fontSize: 32 }}>{target}g</div>
          <div style={{ fontSize: 12, color: "#cabff0", marginTop: 3 }}>daily protein target</div>
        </div>
        <div style={{ fontSize: 11, color: "#cabff0", textAlign: "right", maxWidth: 140, lineHeight: 1.45 }}>
          {p.weight || 0}kg × {effMult.toFixed(1)} g/kg
          {auto && <div style={{ marginTop: 4 }}>tuned by goal, training, age &amp; build</div>}
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-3)", margin: "8px 4px 0", lineHeight: 1.5 }}>
        Estimate based on sports-nutrition ranges (≈1.6–3.1 g/kg by goal). General guidance, not medical advice.
      </div>

      <div className="section-label">Measurements</div>
      <MeasurementsSection state={state} update={update} celebrate={celebrate} />
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ marginBottom: full ? 14 : 0, gridColumn: full ? "1 / -1" : "auto" }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
