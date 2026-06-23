import { motion } from "framer-motion";
import { Icon, Ring } from "../components/ui.jsx";
import { SPLITS, today, weekKey, gymThisWeek, gymStreak } from "../lib/store.js";

const ROTATION = ["push", "pull", "legs"];

export default function GymPage({ state, update, go, celebrate }) {
  const sessions = gymThisWeek(state);
  const streak = gymStreak(state);
  const todaySplit = state.gym[today()];

  const logged = Object.keys(state.gym).filter((d) => weekKey(d) === weekKey(today())).sort();
  const lastSplit = Object.keys(state.gym).sort().reverse().map((d) => state.gym[d])[0];
  const nextSplit = lastSplit ? ROTATION[(ROTATION.indexOf(lastSplit) + 1) % 3] : "push";

  function logSplit(id) {
    update((s) => {
      if (s.gym[today()] === id) delete s.gym[today()];
      else s.gym[today()] = id;
      return s;
    });
    if (state.gym[today()] !== id) celebrate("win", "Session logged · +50 XP");
  }

  return (
    <div className="app">
      <h2 className="sr-only">Gym tracker — log today's session and see your weekly progress</h2>
      <PageHead go={go} title="Gym" sub="3 sessions a week, every week" />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, background: "linear-gradient(145deg,#3A1D6E,#15121d)", border: "none", color: "#fff" }}>
        <Ring value={sessions} max={3} size={72} stroke={8} track="#2e2740" color="#C6F432">
          <div className="num" style={{ fontSize: 22, color: "#fff" }}>{sessions}<span style={{ fontSize: 13, color: "#8a7fb0" }}>/3</span></div>
        </Ring>
        <div>
          <div className="num" style={{ fontSize: 17 }}>{sessions >= 3 ? "Week complete" : `${3 - sessions} to go`}</div>
          <div style={{ fontSize: 12, color: "#b9aedc", marginTop: 4 }}>
            <Icon name="flame" size={13} style={{ color: "var(--orange)", verticalAlign: -2 }} /> {streak} week streak
          </div>
        </div>
      </div>

      <div className="section-label">{todaySplit ? "Logged today" : "Log today's session"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SPLITS.map((sp) => {
          const on = todaySplit === sp.id;
          const suggested = !todaySplit && sp.id === nextSplit;
          return (
            <motion.button key={sp.id} whileTap={{ scale: 0.97 }} onClick={() => logSplit(sp.id)}
              style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 16px", borderRadius: "var(--r-lg)",
                background: on ? sp.color : "var(--paper)", color: on ? "#fff" : "var(--text)",
                border: on ? "none" : "1px solid var(--line)", textAlign: "left", width: "100%" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: on ? "rgba(255,255,255,0.18)" : sp.color + "22",
                display: "flex", alignItems: "center", justifyContent: "center", color: on ? "#fff" : sp.color }}>
                <Icon name="barbell" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>{sp.label}</div>
                {suggested && <div style={{ fontSize: 11, color: "var(--violet)", marginTop: 2 }}>Next in your rotation</div>}
              </div>
              {on ? <Icon name="circle-check" size={22} /> : <Icon name="plus" size={20} style={{ color: "var(--text-3)" }} />}
            </motion.button>
          );
        })}
      </div>

      <div className="section-label">This week's sessions</div>
      <div className="card">
        {logged.length === 0 && <div style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", padding: "8px 0" }}>No sessions yet — log your first above.</div>}
        {logged.map((d) => {
          const sp = SPLITS.find((x) => x.id === state.gym[d]);
          return (
            <div key={d} className="row">
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long" })}</span>
              <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13, color: sp?.color }}>{sp?.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PageHead({ go, title, sub }) {
  return (
    <div className="page-head">
      <button className="back-btn" onClick={() => go("dashboard")} aria-label="Back to dashboard">
        <Icon name="chevron-left" size={19} />
      </button>
      <div>
        <div className="page-title">{title}</div>
        <div className="page-sub">{sub}</div>
      </div>
    </div>
  );
}
