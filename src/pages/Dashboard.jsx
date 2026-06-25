import { motion } from "framer-motion";
import { CountUp, Ring, Icon } from "../components/ui.jsx";
import { MenuButton } from "../components/NavDrawer.jsx";
import { FormaWordmark } from "../components/BoltLogo.jsx";
import {
  today, weekKey, addDays, dayProtein, gymThisWeek, gymStreak,
  proteinTarget, levelFromXp, levelName, weeklyTarget, ACHIEVEMENTS, tierFor, measurementDue,
} from "../lib/store.js";

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
});

function weekDays(state) {
  const wk = weekKey(today());
  const out = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(wk, i);
    out.push({ letter: ["M", "T", "W", "T", "F", "S", "S"][i], iso, gym: !!state.gym[iso], isToday: iso === today() });
  }
  return out;
}

function recentThree(state) {
  const recent = (state.achvUnlocked || []).slice(-3).reverse().map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean);
  if (recent.length < 3) {
    const have = new Set(recent.map((a) => a.id));
    const locked = ACHIEVEMENTS.filter((a) => !have.has(a.id)).map((a) => ({ a, t: tierFor(a, state) })).sort((x, y) => y.t.progress - x.t.progress);
    for (const { a } of locked) { if (recent.length >= 3) break; recent.push(a); }
  }
  return recent.slice(0, 3);
}

export default function Dashboard({ state, go, onMenu }) {
  const p = state.profile;
  const target = proteinTarget(p);
  const protein = Math.round(dayProtein(state, today()));
  const wt = weeklyTarget(state);
  const sessions = gymThisWeek(state);
  const streak = gymStreak(state);
  const { level, into, need } = levelFromXp(state.xp);
  const xpPct = Math.round((into / need) * 100);
  const days = weekDays(state);
  const medals = recentThree(state);
  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();

  return (
    <div className="app">
      <h2 className="sr-only">Forma dashboard</h2>

      <motion.div className="topbar sticky-head" {...fade(0)}>
        <FormaWordmark />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="daypill">{dateLabel}</div>
          <MenuButton onClick={onMenu} />
        </div>
      </motion.div>

      {p.name ? (
        <motion.div {...fade(1)} style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 17, marginBottom: 14 }}>
          Hey, {p.name}
        </motion.div>
      ) : null}

      {measurementDue(state) && (
        <motion.button onClick={() => go("profile")} {...fade(1)} style={{ width: "100%", textAlign: "left", marginBottom: 14 }}>
          <div className="card glass" style={{ display: "flex", alignItems: "center", gap: 11, border: "none" }}>
            <Icon name="ruler-2" size={18} style={{ color: "var(--violet)", flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12.5, color: "var(--text)" }}>Monthly check-in — time to log your measurements.</div>
            <Icon name="chevron-right" size={16} style={{ color: "var(--text-3)" }} />
          </div>
        </motion.button>
      )}

      <motion.div {...fade(2)}
        style={{ borderRadius: "var(--r-xl)", padding: 22, marginBottom: 14, color: "#fff",
          background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--violet)", padding: "6px 13px", borderRadius: 99, fontFamily: "var(--display)", fontWeight: 500, fontSize: 12 }}>
            <Icon name="bolt" size={14} /> LVL {level} · {levelName(level)}
          </div>
          <div style={{ fontSize: 12, color: "#b9aedc" }}>{state.xp.toLocaleString()} XP</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <CountUp value={protein} className="num" style={{ fontSize: 52, background: "linear-gradient(95deg,#C6F432,#5DE0C4)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }} />
          <span className="num" style={{ fontSize: 20, color: "#8a7fb0", paddingBottom: 4 }}>/{target}g</span>
        </div>
        <div style={{ fontSize: 12.5, color: "#b9aedc", marginTop: 6 }}>{protein >= target ? "protein crushed today" : `${target - protein}g protein to go`}</div>
        <div style={{ height: 8, background: "#2e2740", borderRadius: 99, marginTop: 16, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#C6F432,#5DE0C4)" }} />
        </div>
        <div style={{ fontSize: 11, color: "#8a7fb0", marginTop: 6 }}>{need - into} XP to level {level + 1}</div>
      </motion.div>

      <motion.div {...fade(3)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
        <Tile onClick={() => go("gym")} bg="var(--violet)" icon="barbell" label="Gym" big={`${sessions}/${wt}`} hint="this week" />
        <Tile onClick={() => go("progress")} bg="var(--coral)" icon="flame" label="Streak" big={String(streak)} hint={streak === 1 ? "week alive" : "weeks alive"} badge={state.freezes > 0 ? state.freezes : null} />
      </motion.div>

      <motion.div {...fade(4)} className="card" style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>This week</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {days.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{d.letter}</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: d.gym ? "var(--violet)" : "var(--cloud)", border: d.isToday ? "2px solid var(--violet)" : "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                {d.gym && <Icon name="check" size={15} />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button {...fade(5)} onClick={() => go("achievements")} style={{ width: "100%", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 2px 12px" }}>
          <div className="eyebrow">Recent achievements</div>
          <span style={{ fontSize: 11, color: "var(--violet)", fontWeight: 600 }}>View all <Icon name="chevron-right" size={11} style={{ verticalAlign: -1 }} /></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 11 }}>
          {medals.map((ach) => <Medal key={ach.id} ach={ach} t={tierFor(ach, state)} />)}
        </div>
      </motion.button>
    </div>
  );
}

function Medal({ ach, t }) {
  const locked = t.idx === 0;
  const color = locked ? "#9a93a8" : t.tier.color;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <div style={{ width: 62, height: 62, borderRadius: 18, position: "relative", overflow: "hidden",
        background: locked ? "var(--cloud)" : `linear-gradient(145deg, ${color}, ${color}aa)`,
        boxShadow: locked ? "none" : `0 6px 18px ${color}66, inset 0 1px 0 rgba(255,255,255,0.45)`,
        border: locked ? "1px solid var(--line)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center", color: locked ? "var(--text-3)" : "#fff" }}>
        <div style={{ position: "absolute", top: -10, left: -10, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.22)", filter: "blur(2px)" }} />
        <Icon name={locked ? "lock" : ach.icon} size={27} />
        {!locked && (
          <span style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.28)", color: "#fff", fontFamily: "var(--display)", fontWeight: 600, fontSize: 9, width: 17, height: 17, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.idx}</span>
        )}
      </div>
      <span style={{ fontSize: 9.5, color: "var(--text-2)", textAlign: "center", lineHeight: 1.2 }}>{ach.name}</span>
    </div>
  );
}

function Tile({ onClick, bg, icon, label, big, hint, badge }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", borderRadius: "var(--r-lg)", padding: 16, color: "#fff", background: bg, position: "relative" }}>
      <Icon name={icon} size={20} style={{ position: "absolute", top: 14, right: 14, opacity: 0.9 }} />
      <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.92 }}>{label}</div>
      <div className="num" style={{ fontSize: 30, marginTop: 10 }}>{big}</div>
      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{hint}</div>
      {badge != null && (
        <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.22)", padding: "3px 8px", borderRadius: 99 }}>
          <Icon name="shield-half-filled" size={12} />
          <span className="num" style={{ fontSize: 12 }}>{badge}</span>
        </div>
      )}
    </button>
  );
}
