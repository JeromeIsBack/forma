import { useState } from "react";
import { motion } from "framer-motion";
import { Icon, Ring } from "../components/ui.jsx";
import { MenuButton } from "../components/NavDrawer.jsx";
import { GoalCoach } from "../components/GoalCoach.jsx";
import { DateNav } from "../components/DateNav.jsx";
import {
  getSplits, weeklyTarget, today, weekKey, gymThisWeek, gymStreak,
  exercisesForSplit, lastExerciseEntry, exerciseBest, workoutMetric, summarizeEntry, suggestNext, toUnit, fromUnit, unitLabel,
} from "../lib/store.js";

const str = (v) => (v == null ? "" : String(v));

export default function GymPage({ state, update, go, onMenu, celebrate }) {
  const [date, setDate] = useState(today());
  const splits = getSplits(state);
  const target = weeklyTarget(state);
  const sessions = gymThisWeek(state);
  const streak = gymStreak(state);
  const todaySplit = state.gym[date];
  const rotation = splits.map((s) => s.id);

  const gymNote = sessions >= target
    ? "Week complete — extra sessions still earn XP and keep your streak alive."
    : sessions === target - 1
      ? "One more session locks in the week."
      : `${target - sessions} sessions to go to hit this week's goal.`;

  const logged = Object.keys(state.gym).filter((d) => weekKey(d) === weekKey(today())).sort();
  const lastSplit = Object.keys(state.gym).sort().reverse().map((d) => state.gym[d])[0];
  const nextSplit = lastSplit && rotation.includes(lastSplit)
    ? rotation[(rotation.indexOf(lastSplit) + 1) % rotation.length]
    : rotation[0];

  function logSplit(id) {
    const wasOn = state.gym[date] === id;
    update((s) => {
      if (s.gym[date] === id) { delete s.gym[date]; if (s.workouts[date]) delete s.workouts[date]; }
      else s.gym[date] = id;
      return s;
    });
    if (!wasOn) celebrate("win", "Session logged · +50 XP");
  }

  return (
    <div className="app">
      <h2 className="sr-only">Gym tracker — log today's session and what you did</h2>
      <PageHead go={go} onMenu={onMenu} title="Gym" sub={`${target} sessions a week, every week`} />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))", border: "none", color: "#fff" }}>
        <Ring value={sessions} max={target} size={72} stroke={8} track="rgba(255,255,255,0.14)" color="#C6F432">
          <div className="num" style={{ fontSize: 22, color: "#fff" }}>{sessions}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>/{target}</span></div>
        </Ring>
        <div>
          <div className="num" style={{ fontSize: 17 }}>{sessions >= target ? "Week complete" : `${target - sessions} to go`}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 4 }}>
            <Icon name="flame" size={13} style={{ color: "var(--orange)", verticalAlign: -2 }} /> {streak} week streak
          </div>
        </div>
      </div>

      {state.settings.showTips !== false && <GoalCoach goal={state.profile.goal} context="training" note={gymNote} />}

      <div style={{ marginTop: 18 }}><DateNav value={date} onChange={setDate} /></div>

      <div className="section-label">{todaySplit ? "Logged this day" : "Log a session"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {splits.map((sp) => {
          const on = todaySplit === sp.id;
          const suggested = !todaySplit && sp.id === nextSplit;
          return (
            <motion.button key={sp.id} whileTap={{ scale: 0.97 }} onClick={() => logSplit(sp.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: "var(--r-lg)",
                background: on ? sp.color : "var(--paper)", color: on ? "#fff" : "var(--text)",
                border: on ? "none" : "1px solid var(--line)", textAlign: "left", width: "100%" }}>
              <span style={{ width: 11, height: 11, borderRadius: 4, flexShrink: 0, background: on ? "rgba(255,255,255,0.92)" : sp.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>{sp.label}</div>
                {suggested && <div style={{ fontSize: 11, color: on ? "rgba(255,255,255,0.85)" : "var(--violet)", marginTop: 2 }}>Next up</div>}
              </div>
              {on ? <Icon name="circle-check" size={22} /> : <Icon name="plus" size={20} style={{ color: "var(--text-3)" }} />}
            </motion.button>
          );
        })}
      </div>

      {todaySplit && (
        <>
          <div className="section-label">What you did · optional</div>
          <WorkoutDetails key={date + todaySplit} state={state} update={update} splitId={todaySplit} date={date} go={go} celebrate={celebrate} />
        </>
      )}

      <div className="section-label">This week's sessions</div>
      <div className="card">
        {logged.length === 0 && <div style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", padding: "8px 0" }}>No sessions yet — log your first above.</div>}
        {logged.map((d) => {
          const sp = splits.find((x) => x.id === state.gym[d]);
          const w = state.workouts[d];
          const count = w && w.exercises && w.splitId === state.gym[d] ? Object.keys(w.exercises).length : 0;
          return (
            <div key={d} className="row">
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long" })}</span>
              <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13, color: sp?.color || "var(--text-2)" }}>
                {sp?.label || state.gym[d]}{count ? ` · ${count} logged` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutDetails({ state, update, splitId, date, go, celebrate }) {
  const exercises = exercisesForSplit(state, splitId);
  const unit = state.settings.unit || "kg";
  const todayWk = state.workouts[date];
  const [draft, setDraft] = useState(() => {
    const init = {};
    exercises.forEach((ex) => {
      const cur = todayWk && todayWk.exercises && todayWk.exercises[ex.id];
      init[ex.id] = cur
        ? { sets: str(cur.sets), reps: str(cur.reps), kg: cur.kg != null ? str(Math.round(toUnit(cur.kg, unit) * 2) / 2) : "", secs: str(cur.secs) }
        : { sets: "", reps: "", kg: "", secs: "" };
    });
    return init;
  });

  if (exercises.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.5 }}>
          No exercises in this split yet. Add them in The Dojo to start tracking sets, weights and PRs.
        </div>
        <button onClick={() => go("dojo")} style={{ padding: "10px 18px", borderRadius: "var(--r-md)", background: "var(--violet)", color: "#fff", fontFamily: "var(--display)", fontWeight: 600, fontSize: 13 }}>
          Open The Dojo
        </button>
      </div>
    );
  }

  function setF(exId, field, val) { setDraft((d) => ({ ...d, [exId]: { ...d[exId], [field]: val } })); }
  function copyLast(ex) {
    const last = lastExerciseEntry(state, ex.id, date);
    if (!last) return;
    setDraft((d) => ({ ...d, [ex.id]: { sets: str(last.sets), reps: str(last.reps), kg: last.kg != null ? str(Math.round(toUnit(last.kg, unit) * 2) / 2) : "", secs: str(last.secs) } }));
  }
  function save() {
    const entries = {}; const prs = [];
    exercises.forEach((ex) => {
      const dr = draft[ex.id];
      const sets = parseInt(dr.sets) || 0;
      const reps = parseInt(dr.reps) || 0;
      const kg = Math.round(fromUnit(parseFloat(dr.kg) || 0, unit) * 10) / 10;
      const secs = parseInt(dr.secs) || 0;
      const has = sets > 0 && ((ex.type === "hold" && secs > 0) || (ex.type !== "hold" && reps > 0));
      if (!has) return;
      const e = { sets };
      if (ex.type === "hold") e.secs = secs;
      else { e.reps = reps; if (ex.type === "weighted") e.kg = kg; }
      entries[ex.id] = e;
      const prevBest = exerciseBest(state, ex.id, ex.type, date);
      if (prevBest > 0 && workoutMetric(ex.type, e) > prevBest) prs.push(ex.name);
    });
    update((s) => {
      if (Object.keys(entries).length === 0) { if (s.workouts[date] && s.workouts[date].splitId === splitId) delete s.workouts[date]; }
      else s.workouts[date] = { splitId, exercises: entries };
      s.gym[date] = splitId;
      return s;
    });
    if (prs.length) celebrate("level", prs.length === 1 ? `New PR — ${prs[0]}!` : `${prs.length} new PRs!`);
    else celebrate("win", "Workout saved");
  }

  return (
    <div className="card">
      {exercises.map((ex, i) => {
        const last = lastExerciseEntry(state, ex.id, date);
        const dr = draft[ex.id];
        return (
          <div key={ex.id} style={{ padding: "13px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 9 }}>
              <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5 }}>{ex.name}</span>
              {last
                ? <button onClick={() => copyLast(ex)} style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 11, color: "var(--violet)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="rotate-2" size={12} /> last: {summarizeEntry(ex.type, last, unit)}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>{suggestNext(ex.type, last, unit)}</span>
                  </button>
                : <span style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{ex.type}</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <MiniInput label="sets" value={dr.sets} onChange={(v) => setF(ex.id, "sets", v)} />
              {ex.type === "hold"
                ? <MiniInput label="secs" value={dr.secs} onChange={(v) => setF(ex.id, "secs", v)} />
                : <>
                    <MiniInput label="reps" value={dr.reps} onChange={(v) => setF(ex.id, "reps", v)} />
                    {ex.type === "weighted" && <MiniInput label={`+${unitLabel(unit)}`} value={dr.kg} onChange={(v) => setF(ex.id, "kg", v)} />}
                  </>}
            </div>
          </div>
        );
      })}
      <button className="cta" onClick={save} style={{ marginTop: 14 }}>
        <Icon name="device-floppy" size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Save workout
      </button>
    </div>
  );
}

function MiniInput({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 10, color: "var(--text-3)", display: "block", marginBottom: 3, textAlign: "center" }}>{label}</label>
      <input className="input" type="number" inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ height: 42, textAlign: "center", fontFamily: "var(--display)", fontWeight: 500 }} placeholder="—" />
    </div>
  );
}

export function PageHead({ go, onMenu, title, sub }) {
  return (
    <div className="page-head">
      <button className="back-btn" onClick={() => go("dashboard")} aria-label="Back to dashboard">
        <Icon name="chevron-left" size={19} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="page-title">{title}</div>
        <div className="page-sub">{sub}</div>
      </div>
      {onMenu && <MenuButton onClick={onMenu} />}
    </div>
  );
}
