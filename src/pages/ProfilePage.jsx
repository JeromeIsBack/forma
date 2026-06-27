import { Icon, Ring } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { MeasurementsSection } from "../components/MeasurementsSection.jsx";
import { NumberField } from "../components/NumberField.jsx";
import { proteinTarget, recommendedMultiplier, effectiveMultiplier, today, clamp, toUnit, fromUnit, unitLabel, fmtWeight, levelFromXp, levelName } from "../lib/store.js";

const EARN = [
  { icon: "barbell", label: "Log a gym session", xp: "+50" },
  { icon: "meat", label: "Hit your protein target", xp: "+45" },
  { icon: "trophy", label: "Set a personal record", xp: "+20" },
  { icon: "calendar-check", label: "Hit your weekly target", xp: "+100" },
  { icon: "flame", label: "Streak milestones (4\u201324 wks)", xp: "+150\u20131000" },
  { icon: "ruler-2", label: "Log a measurement check-in", xp: "+30" },
  { icon: "scale", label: "Log your body weight", xp: "+10" },
  { icon: "medal", label: "Rank up an achievement tier", xp: "+50\u2013400" },
];

const GOALS = [{ id: "recomp", label: "Recomp" }, { id: "cut", label: "Cut" }, { id: "maintain", label: "Maintain" }, { id: "bulk", label: "Bulk" }];
const ACTIVITY = [{ id: "light", label: "Light" }, { id: "moderate", label: "Moderate" }, { id: "active", label: "Active" }];

export default function ProfilePage({ state, update, go, onMenu, celebrate }) {
  const lv = levelFromXp(state.xp || 0);
  const tierName = levelName(lv.level);
  const p = state.profile;
  const target = proteinTarget(p);
  const effMult = effectiveMultiplier(p);
  const auto = p.autoProtein !== false;
  const unit = state.settings.unit || "kg";

  function setField(key, value) { update((s) => { s.profile[key] = value; return s; }); }
  function commitWeight(kg) {
    update((s) => {
      s.profile.weight = kg;
      const log = s.weightLog.filter((w) => w.date !== today());
      log.push({ date: today(), kg });
      s.weightLog = log.sort((a, b) => a.date.localeCompare(b.date));
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

      <div className="section-label">Progression</div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 13 }}>
          <Ring value={lv.into} max={lv.need} size={56} stroke={6} track="var(--violet-soft)" color="var(--violet)">
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{lv.level}</div>
          </Ring>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", fontWeight: 700 }}>Level {lv.level}</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, color: "var(--text)", marginTop: 1 }}>{tierName}</div>
            <div style={{ fontSize: 11.5, color: "var(--violet)", marginTop: 2 }}>{(state.xp || 0).toLocaleString()} XP · {lv.need - lv.into} to level {lv.level + 1}</div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Ways to earn XP</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {EARN.map((e) => (
              <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={e.icon} size={15} style={{ color: "var(--violet)" }} />
                </div>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{e.label}</span>
                <span className="num" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--violet)" }}>{e.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-label">Body stats</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <NumberField key={unit} label={`Body weight (${unitLabel(unit)})`} value={p.weight === "" ? "" : Math.round(toUnit(p.weight, unit) * 2) / 2} min={Math.round(toUnit(30, unit))} max={Math.round(toUnit(300, unit))} unit={` ${unitLabel(unit)}`} onCommit={(n) => commitWeight(Math.round(fromUnit(n, unit) * 10) / 10)} />
        <NumberField label="Height (cm)" value={p.height} min={100} max={250} unit=" cm" onCommit={(n) => setField("height", n)} />
        <NumberField label="Age" value={p.age} min={10} max={100} onCommit={(n) => setField("age", n)} />
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
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>daily protein target</div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "right", maxWidth: 140, lineHeight: 1.45 }}>
          {fmtWeight(p.weight, unit)} · {effMult.toFixed(1)} g/kg
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
