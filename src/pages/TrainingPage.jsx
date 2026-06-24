import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { getSplits, weeklyTarget, SPLIT_PALETTE, clamp } from "../lib/store.js";

export default function TrainingPage({ state, update, go, onMenu }) {
  const splits = getSplits(state);
  const wt = weeklyTarget(state);

  function setSplitLabel(id, label) { update((s) => { const sp = s.routine.splits.find((x) => x.id === id); if (sp) sp.label = label; return s; }); }
  function removeSplit(id) { update((s) => { if (s.routine.splits.length <= 1) return s; s.routine.splits = s.routine.splits.filter((x) => x.id !== id); return s; }); }
  function addSplit() { update((s) => { const color = SPLIT_PALETTE[s.routine.splits.length % SPLIT_PALETTE.length]; s.routine.splits.push({ id: "s" + Date.now(), label: "New split", color }); return s; }); }
  function setTarget(n) { update((s) => { s.routine.weeklyTarget = clamp(n, 1, 7); return s; }); }

  return (
    <div className="app">
      <h2 className="sr-only">The Dojo — your training routine and weekly target</h2>
      <PageHead go={go} onMenu={onMenu} title="The Dojo" sub="Your training setup" />

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginBottom: 18, color: "#fff", background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))", display: "flex", alignItems: "center", gap: 14 }}>
        <Icon name="karate" size={30} style={{ color: "#fff" }} />
        <div style={{ fontSize: 12.5, color: "#cabff0", lineHeight: 1.5 }}>
          Shape your training. Your splits and weekly target drive the gym ring, your streak, and your achievements.
        </div>
      </div>

      <div className="section-label">Weekly target</div>
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, color: "var(--text-2)" }}>Sessions per week</span>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 99, overflow: "hidden" }}>
          <button onClick={() => setTarget(wt - 1)} aria-label="Fewer" style={{ width: 38, height: 38, color: "var(--text-2)", fontSize: 19 }}>−</button>
          <span className="num" style={{ width: 32, textAlign: "center", fontSize: 16 }}>{wt}</span>
          <button onClick={() => setTarget(wt + 1)} aria-label="More" style={{ width: 38, height: 38, color: "var(--violet)", fontSize: 19 }}>+</button>
        </div>
      </div>

      <div className="section-label">Your splits</div>
      <div className="card">
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
