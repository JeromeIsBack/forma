import { Icon, Ring } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import {
  today, weekKey, addDays, dayProtein, proteinTarget, gymStreak,
  levelFromXp, levelName, weeklyTarget,
} from "../lib/store.js";

function lastWeeks(n) {
  const out = [];
  let cursor = weekKey(today());
  for (let i = 0; i < n; i++) {
    out.unshift(cursor);
    cursor = addDays(cursor, -7);
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
      const iso = addDays(wk, i);
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
      <h2 className="sr-only">Progress — your streak, protein consistency, and weight trend</h2>
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

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="shield-half-filled" size={22} style={{ color: "var(--violet)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 14 }}>
            {state.freezes || 0} streak freeze{(state.freezes || 0) === 1 ? "" : "s"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2, lineHeight: 1.4 }}>
            Auto-saves your streak if you miss a week. Earn one every 4 completed weeks (max 5).
          </div>
        </div>
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

      <button onClick={() => go("achievements")} style={{ width: "100%", marginTop: 14, padding: 14, border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="trophy" size={16} style={{ color: "var(--violet)" }} /> View your achievements
      </button>
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
