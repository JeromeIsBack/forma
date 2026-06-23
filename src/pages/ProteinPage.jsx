import { useState } from "react";
import { motion } from "framer-motion";
import { Icon, CountUp } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { today, dayProtein, proteinTarget } from "../lib/store.js";

export default function ProteinPage({ state, update, go, celebrate }) {
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvg, setDraftAvg] = useState("");
  const [draftUnit, setDraftUnit] = useState("");

  const target = proteinTarget(state.profile);
  const total = Math.round(dayProtein(state, today()));
  const pct = Math.min((total / target) * 100, 100);
  const entry = state.protein[today()] || {};

  function setServings(id, servings) {
    const v = Math.max(0, Math.round(servings * 2) / 2);
    update((s) => {
      if (!s.protein[today()]) s.protein[today()] = {};
      const before = dayProtein(s, today()) >= target;
      if (v === 0) delete s.protein[today()][id];
      else s.protein[today()][id] = v;
      if (Object.keys(s.protein[today()]).length === 0) delete s.protein[today()];
      const after = dayProtein(s, today()) >= target;
      if (!before && after) s._hit = true;
      return s;
    });
    setTimeout(() => {
      const t = dayProtein(state, today());
    }, 0);
  }

  function bump(id, delta) {
    const current = entry[id] || 0;
    const next = current + delta;
    const wasUnder = total < target;
    setServings(id, next);
    const projected = Math.round(dayProtein({ ...state, protein: { ...state.protein, [today()]: { ...entry, [id]: Math.max(0, current + delta) } } }, today()));
    if (wasUnder && projected >= target) celebrate("win", "Protein target hit · +45 XP");
  }

  function addSource() {
    const avg = parseFloat(draftAvg);
    if (!draftName.trim() || !avg) return;
    const id = "c" + Date.now();
    update((s) => {
      s.sources.push({ id, name: draftName.trim(), avg: Math.round(avg), unit: draftUnit.trim() || "serving" });
      return s;
    });
    setDraftName(""); setDraftAvg(""); setDraftUnit(""); setAdding(false);
  }

  return (
    <div className="app">
      <h2 className="sr-only">Protein tracker — log your main sources to reach today's target</h2>
      <PageHead go={go} title="Protein" sub={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} />

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginBottom: 18, color: "#fff", background: "linear-gradient(140deg,#5b35c9,#3A1D6E)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <div><CountUp value={total} className="num" style={{ fontSize: 34 }} /><span className="num" style={{ fontSize: 16, color: "#cabff0" }}>g</span></div>
          <div style={{ fontSize: 13, color: "#cabff0" }}>of {target}g</div>
        </div>
        <div style={{ height: 9, background: "#2e2740", borderRadius: 99, overflow: "hidden" }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 99, background: total >= target ? "linear-gradient(90deg,#C6F432,#5DE0C4)" : "#b9aedc" }} />
        </div>
        <div style={{ fontSize: 11.5, color: "#cabff0", marginTop: 9 }}>
          {total >= target ? "Target reached — strong day." : `${target - total}g to go`}
        </div>
      </div>

      <div className="section-label">Your sources</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {state.sources.map((src) => {
          const servings = entry[src.id] || 0;
          const grams = Math.round(src.avg * servings);
          return (
            <div key={src.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", opacity: servings ? 1 : 0.62 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5 }}>{src.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>avg {src.avg}g · per {src.unit}</div>
              </div>
              <div className="num" style={{ fontSize: 14, color: servings ? "var(--violet)" : "var(--text-3)", minWidth: 38, textAlign: "right" }}>{grams}g</div>
              <Stepper value={servings} onMinus={() => bump(src.id, -0.5)} onPlus={() => bump(src.id, 0.5)} />
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="field-label">New source</div>
          <input className="input" placeholder="e.g. Tofu" value={draftName} onChange={(e) => setDraftName(e.target.value)} style={{ marginBottom: 9 }} />
          <div style={{ display: "flex", gap: 9, marginBottom: 11 }}>
            <input className="input" type="number" inputMode="numeric" placeholder="protein g" value={draftAvg} onChange={(e) => setDraftAvg(e.target.value)} />
            <input className="input" placeholder="per (unit)" value={draftUnit} onChange={(e) => setDraftUnit(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="cta lime" onClick={addSource} style={{ boxShadow: "none" }}>Save source</button>
            <button onClick={() => setAdding(false)} style={{ padding: "0 18px", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", color: "var(--text-2)" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: "100%", marginTop: 12, padding: 13, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="plus" size={15} /> Add a new source
        </button>
      )}
    </div>
  );
}

function Stepper({ value, onMinus, onPlus }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
      <button onClick={onMinus} aria-label="Remove serving" style={{ width: 32, height: 32, color: "var(--text-2)", fontSize: 17 }}>−</button>
      <span className="num" style={{ width: 28, textAlign: "center", fontSize: 13 }}>{value % 1 === 0 ? value : value.toFixed(1)}</span>
      <button onClick={onPlus} aria-label="Add serving" style={{ width: 32, height: 32, color: "var(--violet)", fontSize: 17 }}>+</button>
    </div>
  );
}
