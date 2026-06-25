import { useState } from "react";
import { motion } from "framer-motion";
import { Icon, Ring } from "../components/ui.jsx";
import { MenuButton } from "../components/NavDrawer.jsx";
import { GoalCoach } from "../components/GoalCoach.jsx";
import {
  getSplits, weeklyTarget, today, weekKey, gymThisWeek, gymStreak,
  exercisesForSplit, lastExerciseEntry, exerciseBest, workoutMetric, summarizeEntry,
} from "../lib/store.js";

const str = (v) => (v == null ? "" : String(v));

export default function GymPage({ state, update, go, onMenu, celebrate }) {
  const splits = getSplits(state);
  const target = weeklyTarget(state);
  const sessions = gymThisWeek(state);
  const streak = gymStreak(state);
  const todaySplit = state.gym[today()];
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
    const wasOn = state.gym[today()] === id;
    update((s) => {
      if (s.gym[today()] === id) { delete s.gym[today()]; if (s.workouts[today()]) delete s.workouts[today()]; }
      else s.gym[today()] = id;
      return s;
    });
    if (!wasOn) celebrate("win", "Session logged · +50 XP");
  }

  return (
    <div className="app">
      <h2 className="sr-only">Gym tracker — log today's session and what you did</h2>
      <PageHead go={go} onMenu={onMenu} title="Gym" sub={`${target} sessions a week, every week`} />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))", border: "none", color: "#fff" }}>
        <Ring value={sessions} max={target} size={72} stroke={8} track="#2e2740" color="#C6F432">
          <div className="num" style={{ fontSize: 22, color: "#fff" }}>{sessions}<span style={{ fontSize: 13, color: "#8a7fb0" }}>/{target}</span></div>
        </Ring>
        <div>
          <div className="num" style={{ fontSize: 17 }}>{sessions >= target ? "Week complete" : `${target - sessions} to go`}</div>
          <div style={{ fontSize: 12, color: "#b9aedc", marginTop: 4 }}>
            <Icon name="flame" size={13} style={{ color: "var(--orange)", verticalAlign: -2 }} /> {streak} week streak
          </div>
        </div>
      </div>

      <GoalCoach goal={state.profile.goal} context="training" note={gymNote} />

      <div className="section-label">{todaySplit ? "Logged today" : "Log today's session"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {splits.map((sp) => {
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

      {todaySplit && (
        <>
          <div className="section-label">What you did · optional</div>
          <WorkoutDetails key={todaySplit} state={state} update={update} splitId={todaySplit} go={go} celebrate={celebrate} />
        </>
      )}

      <div className="section-label">This week's sessions</div>
      <div className="card">
        {logged.length === 0 && <div style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", padding: "8px 0" }}>No sessions yet — log your first above.</div>}
        {logged.map((d) => {
          const sp = splits.find((x) => x.id === state.gym[d]);
          const w = state.workouts[d];
          const count = w && w.exercises ? Object.keys(w.exercises).length : 0;
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

function WorkoutDetails({ state, update, splitId, go, celebrate }) {
  const exercises = exercisesForSplit(state, splitId);
  const todayWk = state.workouts[today()];
  const [draft, setDraft] = useState(() => {
    const init = {};
    exercises.forEach((ex) => {
      const cur = todayWk && todayWk.exercises && todayWk.exercises[ex.id];
      init[ex.id] = cur
        ? { sets: str(cur.sets), reps: str(cur.reps), kg: str(cur.kg), secs: str(cur.secs) }
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
    const last = lastExerciseEntry(state, ex.id, today());
    if (!last) return;
    setDraft((d) => ({ ...d, [ex.id]: { sets: str(last.sets), reps: str(last.reps), kg: str(last.kg), secs: str(last.secs) } }));
  }
  function save() {
    const entries = {}; const prs = [];
    exercises.forEach((ex) => {
      const dr = draft[ex.id];
      const sets = parseInt(dr.sets) || 0;
      const reps = parseInt(dr.reps) || 0;
      const kg = parseFloat(dr.kg) || 0;
      const secs = parseInt(dr.secs) || 0;
      const has = sets > 0 && ((ex.type === "hold" && secs > 0) || (ex.type !== "hold" && reps > 0));
      if (!has) return;
      const e = { sets };
      if (ex.type === "hold") e.secs = secs;
      else { e.reps = reps; if (ex.type === "weighted") e.kg = kg; }
      entries[ex.id] = e;
      const prevBest = exerciseBest(state, ex.id, ex.type, today());
      if (prevBest > 0 && workoutMetric(ex.type, e) > prevBest) prs.push(ex.name);
    });
    update((s) => {
      if (Object.keys(entries).length === 0) { if (s.workouts[today()]) delete s.workouts[today()]; }
      else s.workouts[today()] = { splitId, exercises: entries };
      s.gym[today()] = splitId;
      return s;
    });
    if (prs.length) celebrate("level", prs.length === 1 ? `New PR — ${prs[0]}!` : `${prs.length} new PRs!`);
    else celebrate("win", "Workout saved");
  }

  return (
    <div className="card">
      {exercises.map((ex, i) => {
        const last = lastExerciseEntry(state, ex.id, today());
        const dr = draft[ex.id];
        return (
          <div key={ex.id} style={{ padding: "13px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 9 }}>
              <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5 }}>{ex.name}</span>
              {last
                ? <button onClick={() => copyLast(ex)} style={{ fontSize: 11, color: "var(--violet)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="rotate-2" size={12} /> last: {summarizeEntry(ex.type, last)}</button>
                : <span style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{ex.type}</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <MiniInput label="sets" value={dr.sets} onChange={(v) => setF(ex.id, "sets", v)} />
              {ex.type === "hold"
                ? <MiniInput label="secs" value={dr.secs} onChange={(v) => setF(ex.id, "secs", v)} />
                : <>
                    <MiniInput label="reps" value={dr.reps} onChange={(v) => setF(ex.id, "reps", v)} />
                    {ex.type === "weighted" && <MiniInput label="+kg" value={dr.kg} onChange={(v) => setF(ex.id, "kg", v)} />}
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
