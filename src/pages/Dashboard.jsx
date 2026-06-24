import { motion } from "framer-motion";
import { CountUp, Ring, Icon } from "../components/ui.jsx";
import { MenuButton } from "../components/NavDrawer.jsx";
import {
  today, weekKey, addDays, dayProtein, gymThisWeek, gymStreak,
  proteinTarget, levelFromXp, levelName, weeklyTarget,
  ACHIEVEMENTS, tierFor,
} from "../lib/store.js";

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
});

function weekDays(state) {
  const wk = weekKey(today());
  const out = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(wk, i);
    out.push({
      letter: ["M", "T", "W", "T", "F", "S", "S"][i],
      iso,
      gym: !!state.gym[iso],
      isToday: iso === today(),
    });
  }
  return out;
}

export default function Dashboard({ state, go, onMenu }) {
  const target = proteinTarget(state.profile);
  const protein = Math.round(dayProtein(state, today()));
  const wt = weeklyTarget(state);
  const sessions = gymThisWeek(state);
  const streak = gymStreak(state);
  const { level, into, need } = levelFromXp(state.xp);
  const xpPct = Math.round((into / need) * 100);
  const days = weekDays(state);
  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  const proteinHit = protein >= target;

  return (
    <div className="app">
      <h2 className="sr-only">Forma dashboard with your level, today's protein, gym sessions and streak</h2>

      <motion.div className="topbar" {...fade(0)}>
        <div className="logo">FORMA<span className="dot">.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="daypill">{dateLabel}</div>
          <MenuButton onClick={onMenu} />
        </div>
      </motion.div>

      <motion.div {...fade(1)}
        style={{ borderRadius: "var(--r-xl)", padding: 22, marginBottom: 14, color: "#fff",
          background: "linear-gradient(145deg, #3A1D6E 0%, #15121d 72%)", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--violet)", padding: "6px 13px", borderRadius: 99, fontFamily: "var(--display)", fontWeight: 500, fontSize: 12 }}>
            <Icon name="bolt" size={14} /> LVL {level} · {levelName(level)}
          </div>
          <div style={{ fontSize: 12, color: "#b9aedc" }}>{state.xp.toLocaleString()} XP</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <CountUp value={protein} className="num"
            style={{ fontSize: 54, background: "linear-gradient(95deg,#C6F432,#5DE0C4)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }} />
          <span className="num" style={{ fontSize: 20, color: "#8a7fb0", paddingBottom: 4 }}>/{target}g</span>
        </div>
        <div style={{ fontSize: 12.5, color: "#b9aedc", marginTop: 6 }}>
          {proteinHit ? "protein crushed today" : `${target - protein}g protein to go`}
        </div>

        <div style={{ height: 8, background: "#2e2740", borderRadius: 99, marginTop: 16, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#C6F432,#5DE0C4)" }} />
        </div>
        <div style={{ fontSize: 11, color: "#8a7fb0", marginTop: 6 }}>{need - into} XP to level {level + 1}</div>
      </motion.div>

      <motion.div {...fade(2)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
        <Tile onClick={() => go("gym")} bg="var(--violet)" icon="barbell" label="Gym"
          big={`${sessions}/${wt}`} hint="this week" />
        <Tile onClick={() => go("progress")} bg="var(--coral)" icon="flame" label="Streak"
          big={String(streak)} hint={streak === 1 ? "week alive" : "weeks alive"} />
      </motion.div>

      <motion.button {...fade(3)} onClick={() => go("protein")}
        style={{ width: "100%", textAlign: "left", marginBottom: 14 }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Ring value={protein} max={target} size={58} stroke={7} track="#efe9ff" color="#7C3AED" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 15 }}>Protein</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>Tap to log today's sources</div>
          </div>
          <Icon name="chevron-right" size={18} style={{ color: "var(--text-3)" }} />
        </div>
      </motion.button>

      <motion.div {...fade(4)} className="card" style={{ marginBottom: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>This week</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {days.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{d.letter}</span>
              <div style={{ width: 32, height: 32, borderRadius: 10,
                background: d.gym ? "var(--violet)" : "var(--cloud)",
                border: d.isToday ? "2px solid var(--violet)" : "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                {d.gym && <Icon name="check" size={15} />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button {...fade(5)} onClick={() => go("achievements")} style={{ width: "100%", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 2px 12px" }}>
          <div className="eyebrow">Achievements</div>
          <span style={{ fontSize: 11, color: "var(--violet)", fontWeight: 600 }}>View all <Icon name="chevron-right" size={11} style={{ verticalAlign: -1 }} /></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {ACHIEVEMENTS.map((ach) => {
            const t = tierFor(ach, state);
            const locked = t.idx === 0;
            const color = locked ? "var(--text-3)" : t.tier.color;
            return (
              <div key={ach.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, position: "relative",
                  background: locked ? "var(--cloud)" : color + "22",
                  border: locked ? "1px solid var(--line)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", color }}>
                  <Icon name={locked ? "lock" : ach.icon} size={21} />
                  {!locked && (
                    <span style={{ position: "absolute", bottom: -4, right: -4, background: color, color: "#fff",
                      fontFamily: "var(--display)", fontWeight: 600, fontSize: 9, width: 18, height: 18, borderRadius: 99,
                      display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--cloud)" }}>
                      {t.idx}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: "var(--text-2)", textAlign: "center", lineHeight: 1.2 }}>{ach.name}</span>
              </div>
            );
          })}
        </div>
      </motion.button>
    </div>
  );
}

function Tile({ onClick, bg, icon, label, big, hint }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", borderRadius: "var(--r-lg)", padding: 16, color: "#fff", background: bg, position: "relative" }}>
      <Icon name={icon} size={20} style={{ position: "absolute", top: 14, right: 14, opacity: 0.9 }} />
      <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.92 }}>{label}</div>
      <div className="num" style={{ fontSize: 30, marginTop: 10 }}>{big}</div>
      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{hint}</div>
    </button>
  );
}
