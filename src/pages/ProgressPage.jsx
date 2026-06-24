import { Icon, Ring } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import {
  today, weekKey, dayProtein, proteinTarget, gymStreak, levelFromXp, levelName,
  weeklyTarget, ACHIEVEMENTS, tierFor,
} from "../lib/store.js";

function lastWeeks(n) {
  const out = [];
  let cursor = weekKey(today());
  for (let i = 0; i < n; i++) {
    out.unshift(cursor);
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 7);
    cursor = d.toISOString().slice(0, 10);
  }
  return out;
}

export default function ProgressPage({ state, go, onMenu }) {
  const target = proteinTarget(state.profile);
  const streak = gymStreak(state);
  const wt = weeklyTarget(state);
  const { level } = levelFromXp(state.xp);

  const weeks = lastWeeks(4);
  const heat = weeks.map((wk) =>
    Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(wk + "T00:00:00");
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const grams = dayProtein(state, iso);
      if (grams === 0) return 0;
      const ratio = grams / target;
      if (ratio >= 1) return 3;
      if (ratio >= 0.66) return 2;
      return 1;
    })
  );
  const heatColors = ["var(--cloud)", "#cecbf6", "#7f77dd", "#534ab7"];

  const sessions = Object.keys(state.gym).length;
  const proteinDays = Object.keys(state.protein);
  const avgProtein = proteinDays.length
    ? Math.round(proteinDays.reduce((s, d) => s + dayProtein(state, d), 0) / proteinDays.length)
    : 0;

  const wl = state.weightLog.slice(-8);
  const kgs = wl.map((w) => w.kg);
  const minKg = Math.min(...kgs), maxKg = Math.max(...kgs);
  const range = maxKg - minKg || 1;

  const allWeeks = lastWeeks(5);
  const hitWeeks = allWeeks.filter((wk) =>
    Object.keys(state.gym).filter((d) => weekKey(d) === wk).length >= wt).length;
  const consistency = Math.round((hitWeeks / allWeeks.length) * 100);

  return (
    <div className="app">
      <h2 className="sr-only">Progress — your streak, achievements, protein consistency, and weight trend</h2>
      <PageHead go={go} onMenu={onMenu} title="Progress" sub="Your momentum, visualised" />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
        <Ring value={consistency} max={100} size={92} stroke={9} track="var(--coral-soft)" color="var(--coral)">
          <div style={{ textAlign: "center" }}>
            <div className="num" style={{ fontSize: 22, color: "var(--coral)" }}>{streak}</div>
            <div style={{ fontSize: 9, color: "var(--coral)" }}>weeks</div>
          </div>
        </Ring>
        <div>
          <div className="num" style={{ fontSize: 28 }}>{consistency}%</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>gym consistency, last 5 weeks</div>
          <div style={{ fontSize: 11, color: "var(--violet)", marginTop: 7, fontWeight: 600 }}>
            <Icon name="star" size={12} style={{ verticalAlign: -1 }} /> Level {level} · {levelName(level)}
          </div>
        </div>
      </div>

      <div className="section-label">Achievements</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {ACHIEVEMENTS.map((ach) => {
          const t = tierFor(ach, state);
          const locked = t.idx === 0;
          const color = locked ? "var(--text-3)" : t.tier.color;
          const tierName = locked ? "Locked" : t.tier.name;
          const goalText = t.atMax ? "Maxed out" : `${t.measure}/${t.next} ${ach.unit}`;
          return (
            <div key={ach.id} className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: locked ? "var(--cloud)" : color + "22",
                border: locked ? "1px solid var(--line)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", color }}>
                <Icon name={locked ? "lock" : ach.icon} size={21} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>{ach.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color, background: locked ? "var(--cloud)" : color + "1f", padding: "2px 8px", borderRadius: 99 }}>{tierName}</span>
                </div>
                <div style={{ height: 6, background: "var(--cloud)", borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.progress * 100}%`, background: locked ? "var(--text-3)" : color, borderRadius: 99, transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-2)", textAlign: "right", minWidth: 58, flexShrink: 0 }}>{goalText}</div>
            </div>
          );
        })}
      </div>

      <div className="section-label">Protein — hit / miss</div>
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {heat.map((week, wi) => (
            <div key={wi} style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-3)", width: 26 }}>W{wi + 1}</span>
              {week.map((lvl, di) => (
                <div key={di} style={{ flex: 1, height: 19, borderRadius: 4, background: heatColors[lvl],
                  border: lvl === 0 ? "1px solid var(--line)" : "none" }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 9, fontSize: 10, color: "var(--text-3)" }}>
          under
          {[1, 2, 3].map((l) => <div key={l} style={{ width: 14, height: 10, borderRadius: 2, background: heatColors[l] }} />)}
          target
        </div>
      </div>

      <div className="section-label">Body weight trend</div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64 }}>
          {wl.map((w, i) => {
            const h = 30 + ((w.kg - minKg) / range) * 60;
            return <div key={i} style={{ flex: 1, height: `${h}%`, background: "linear-gradient(180deg,#7C3AED,#5DE0C4)", borderRadius: "3px 3px 0 0", opacity: 0.5 + (i / wl.length) * 0.5 }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 11, color: "var(--text-2)" }}>
          <span>{kgs[0]}kg earlier</span>
          <span style={{ color: "var(--violet)", fontWeight: 600 }}>{kgs[kgs.length - 1]}kg now</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 18 }}>
        <Stat value={sessions} label="sessions logged" />
        <Stat value={avgProtein + "g"} label="avg protein / day" />
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 14 }}>
      <div className="num" style={{ fontSize: 24 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{label}</div>
    </div>
  );
}
