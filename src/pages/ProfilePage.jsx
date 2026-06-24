import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import {
  proteinTarget, recommendedMultiplier, effectiveMultiplier,
  today, getSplits, weeklyTarget, SPLIT_PALETTE,
} from "../lib/store.js";

const GOALS = [
  { id: "recomp", label: "Recomp" }, { id: "cut", label: "Cut" },
  { id: "maintain", label: "Maintain" }, { id: "bulk", label: "Bulk" },
];
const ACTIVITY = [
  { id: "light", label: "Light" }, { id: "moderate", label: "Moderate" }, { id: "active", label: "Active" },
];

export default function ProfilePage({ state, update, go, onMenu }) {
  const p = state.profile;
  const target = proteinTarget(p);
  const effMult = effectiveMultiplier(p);
  const recMult = recommendedMultiplier(p);
  const splits = getSplits(state);
  const wt = weeklyTarget(state);
  const auto = p.autoProtein !== false;

  function setField(key, value) { update((s) => { s.profile[key] = value; return s; }); }
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
  function setAuto(on) {
    update((s) => {
      s.profile.autoProtein = on;
      if (!on) s.profile.multiplier = effectiveMultiplier(s.profile);
      return s;
    });
  }

  function setSplitLabel(id, label) { update((s) => { const sp = s.routine.splits.find((x) => x.id === id); if (sp) sp.label = label; return s; }); }
  function removeSplit(id) { update((s) => { if (s.routine.splits.length <= 1) return s; s.routine.splits = s.routine.splits.filter((x) => x.id !== id); return s; }); }
  function addSplit() { update((s) => { const color = SPLIT_PALETTE[s.routine.splits.length % SPLIT_PALETTE.length]; s.routine.splits.push({ id: "s" + Date.now(), label: "New split", color }); return s; }); }
  function setTarget(n) { update((s) => { s.routine.weeklyTarget = Math.min(7, Math.max(1, n)); return s; }); }

  return (
    <div className="app">
      <h2 className="sr-only">Character — build your athlete; your stats drive every target</h2>
      <PageHead go={go} onMenu={onMenu} title="Character" sub="Build your athlete" />

      <Field label="Name" full>
        <input className="input" placeholder="Your name or alias" value={p.name || ""} onChange={(e) => setField("name", e.target.value)} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Field label="Body weight (kg)"><input className="input" type="number" inputMode="decimal" value={p.weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label="Height (cm)"><input className="input" type="number" inputMode="numeric" value={p.height} onChange={(e) => setField("height", parseFloat(e.target.value) || "")} /></Field>
        <Field label="Age"><input className="input" type="number" inputMode="numeric" value={p.age} onChange={(e) => setField("age", parseFloat(e.target.value) || "")} /></Field>
        <Field label="Sex">
          <div className="seg">{["Male", "Female"].map((s) => (<button key={s} className={`seg-opt ${p.sex === s ? "on" : ""}`} onClick={() => setField("sex", s)}>{s}</button>))}</div>
        </Field>
      </div>

      <Field label="Goal" full>
        <div className="seg">{GOALS.map((g) => (<button key={g.id} className={`seg-opt ${p.goal === g.id ? "on" : ""}`} onClick={() => setField("goal", g.id)}>{g.label}</button>))}</div>
      </Field>
      <Field label="Activity level" full>
        <div className="seg">{ACTIVITY.map((a) => (<button key={a.id} className={`seg-opt ${p.activity === a.id ? "on" : ""}`} onClick={() => setField("activity", a.id)}>{a.label}</button>))}</div>
      </Field>

      <Field label="Protein target" full>
        <div className="seg" style={{ marginBottom: 12 }}>
          <button className={`seg-opt ${auto ? "on" : ""}`} onClick={() => setAuto(true)}>Auto from stats</button>
          <button className={`seg-opt ${!auto ? "on" : ""}`} onClick={() => setAuto(false)}>Custom</button>
        </div>
        {!auto && (
          <div style={{ marginBottom: 6 }}>
            <input type="range" min="1.4" max="3.1" step="0.1" value={p.multiplier} onChange={(e) => setField("multiplier", parseFloat(e.target.value))} />
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 7 }}>{p.multiplier.toFixed(1)} g per kg</div>
          </div>
        )}
      </Field>

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginTop: 2, color: "#fff",
        background: "linear-gradient(140deg,#5b35c9,#15121d)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="num" style={{ fontSize: 32 }}>{target}g</div>
          <div style={{ fontSize: 12, color: "#cabff0", marginTop: 3 }}>daily protein target</div>
        </div>
        <div style={{ fontSize: 11, color: "#cabff0", textAlign: "right", maxWidth: 140, lineHeight: 1.45 }}>
          {p.weight || 0}kg × {effMult.toFixed(1)} g/kg
          {auto && <div style={{ marginTop: 4 }}>tuned by your goal, activity, age &amp; build</div>}
        </div>
      </div>

      <div className="section-label">Training routine</div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--text-2)" }}>Sessions per week</span>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 99, overflow: "hidden" }}>
            <button onClick={() => setTarget(wt - 1)} aria-label="Fewer" style={{ width: 34, height: 34, color: "var(--text-2)", fontSize: 18 }}>−</button>
            <span className="num" style={{ width: 30, textAlign: "center", fontSize: 15 }}>{wt}</span>
            <button onClick={() => setTarget(wt + 1)} aria-label="More" style={{ width: 34, height: 34, color: "var(--violet)", fontSize: 18 }}>+</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {splits.map((sp) => (
            <div key={sp.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: sp.color, flexShrink: 0 }} />
              <input className="input" value={sp.label} onChange={(e) => setSplitLabel(sp.id, e.target.value)} style={{ height: 42, fontSize: 14 }} />
              <button onClick={() => removeSplit(sp.id)} aria-label="Remove split" disabled={splits.length <= 1}
                style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: splits.length <= 1 ? "var(--text-3)" : "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", opacity: splits.length <= 1 ? 0.4 : 1 }}>
                <Icon name="trash" size={17} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addSplit} style={{ width: "100%", marginTop: 12, padding: 12, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="plus" size={15} /> Add a split
        </button>
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
