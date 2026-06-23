import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { proteinTarget, today } from "../lib/store.js";

const GOALS = [
  { id: "recomp", label: "Recomp" },
  { id: "cut", label: "Cut" },
  { id: "maintain", label: "Maintain" },
  { id: "bulk", label: "Bulk" },
];
const ACTIVITY = [
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "active", label: "Active" },
];

export default function ProfilePage({ state, update, go }) {
  const p = state.profile;
  const target = proteinTarget(p);

  function setField(key, value) {
    update((s) => { s.profile[key] = value; return s; });
  }
  function setWeight(value) {
    const kg = parseFloat(value);
    update((s) => {
      s.profile.weight = value === "" ? "" : kg;
      if (kg) {
        const log = s.weightLog.filter((w) => w.date !== today());
        log.push({ date: today(), kg });
        s.weightLog = log.sort((a, b) => a.date.localeCompare(b.date));
      }
      return s;
    });
  }

  return (
    <div className="app">
      <h2 className="sr-only">Your profile — stats that drive your targets across the app</h2>
      <PageHead go={go} title="Your profile" sub="Drives your targets everywhere" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Field label="Body weight (kg)">
          <input className="input" type="number" inputMode="decimal" value={p.weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="Height (cm)">
          <input className="input" type="number" inputMode="numeric" value={p.height} onChange={(e) => setField("height", parseFloat(e.target.value) || "")} />
        </Field>
        <Field label="Age">
          <input className="input" type="number" inputMode="numeric" value={p.age} onChange={(e) => setField("age", parseFloat(e.target.value) || "")} />
        </Field>
        <Field label="Sex">
          <div className="seg">
            {["Male", "Female"].map((s) => (
              <button key={s} className={`seg-opt ${p.sex === s ? "on" : ""}`} onClick={() => setField("sex", s)}>{s}</button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Goal" full>
        <div className="seg">
          {GOALS.map((g) => (
            <button key={g.id} className={`seg-opt ${p.goal === g.id ? "on" : ""}`} onClick={() => setField("goal", g.id)}>{g.label}</button>
          ))}
        </div>
      </Field>

      <Field label="Activity level" full>
        <div className="seg">
          {ACTIVITY.map((a) => (
            <button key={a.id} className={`seg-opt ${p.activity === a.id ? "on" : ""}`} onClick={() => setField("activity", a.id)}>{a.label}</button>
          ))}
        </div>
      </Field>

      <Field label={`Protein multiplier — ${p.multiplier.toFixed(1)} g/kg`} full>
        <input type="range" min="1.6" max="2.2" step="0.1" value={p.multiplier}
          onChange={(e) => setField("multiplier", parseFloat(e.target.value))} />
      </Field>

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginTop: 18, color: "#fff",
        background: "linear-gradient(140deg,#5b35c9,#15121d)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="num" style={{ fontSize: 32 }}>{target}g</div>
          <div style={{ fontSize: 12, color: "#cabff0", marginTop: 3 }}>daily protein target</div>
        </div>
        <div style={{ fontSize: 11, color: "#cabff0", textAlign: "right", maxWidth: 130, lineHeight: 1.45 }}>
          {p.weight || 0}kg × {p.multiplier.toFixed(1)} — updates as your weight changes
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-3)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
        These values flow into your Protein page, the dashboard rings, and your weight trend on Progress.
      </div>
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
