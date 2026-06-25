import { useState } from "react";
import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { getSplits, weeklyTarget, SPLIT_PALETTE, clamp, EXERCISE_TYPES, exercisesForSplit } from "../lib/store.js";

export default function TrainingPage({ state, update, go, onMenu }) {
  const splits = getSplits(state);
  const wt = weeklyTarget(state);
  const [exDraft, setExDraft] = useState({});

  function setSplitLabel(id, label) { update((s) => { const sp = s.routine.splits.find((x) => x.id === id); if (sp) sp.label = label; return s; }); }
  function removeSplit(id) { update((s) => { if (s.routine.splits.length <= 1) return s; s.routine.splits = s.routine.splits.filter((x) => x.id !== id); s.exercises = (s.exercises || []).filter((e) => e.splitId !== id); return s; }); }
  function addSplit() { update((s) => { const color = SPLIT_PALETTE[s.routine.splits.length % SPLIT_PALETTE.length]; s.routine.splits.push({ id: "s" + Date.now(), label: "New split", color }); return s; }); }
  function setTarget(n) { update((s) => { s.routine.weeklyTarget = clamp(n, 1, 7); return s; }); }

  function exFields(id) { return exDraft[id] || { name: "", type: "reps" }; }
  function setEx(id, patch) { setExDraft((d) => ({ ...d, [id]: { ...exFields(id), ...patch } })); }
  function addExercise(splitId) {
    const f = exFields(splitId);
    if (!f.name.trim()) return;
    update((s) => { if (!s.exercises) s.exercises = []; s.exercises.push({ id: "ex" + Date.now(), name: f.name.trim(), type: f.type, splitId }); return s; });
    setExDraft((d) => ({ ...d, [splitId]: { name: "", type: f.type } }));
  }
  function removeExercise(id) { update((s) => { s.exercises = (s.exercises || []).filter((e) => e.id !== id); return s; }); }

  return (
    <div className="app">
      <h2 className="sr-only">The Dojo — build your training program and meal presets</h2>
      <PageHead go={go} onMenu={onMenu} title="The Dojo" sub="Build your program & presets" />

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginBottom: 18, color: "#fff", background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))", display: "flex", alignItems: "center", gap: 14 }}>
        <Icon name="karate" size={30} style={{ color: "#fff" }} />
        <div style={{ fontSize: 12.5, color: "#cabff0", lineHeight: 1.5 }}>
          Your build hub. Set up the exercises in each split and your go-to meal presets — then log them fast from the Gym and Protein tabs.
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

      <div className="section-label">Splits & exercises</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {splits.map((sp) => {
          const exs = exercisesForSplit(state, sp.id);
          const f = exFields(sp.id);
          return (
            <div key={sp.id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: sp.color, flexShrink: 0 }} />
                <input className="input" value={sp.label} onChange={(e) => setSplitLabel(sp.id, e.target.value)} style={{ height: 40, fontSize: 14, fontWeight: 500 }} />
                <button onClick={() => removeSplit(sp.id)} aria-label="Remove split" disabled={splits.length <= 1}
                  style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: splits.length <= 1 ? "var(--text-3)" : "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", opacity: splits.length <= 1 ? 0.4 : 1 }}>
                  <Icon name="trash" size={16} />
                </button>
              </div>

              {exs.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 11 }}>
                  {exs.map((ex) => (
                    <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", background: "var(--cloud)", borderRadius: "var(--r-md)" }}>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{ex.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--violet)", background: "var(--violet-soft)", padding: "2px 8px", borderRadius: 99, textTransform: "uppercase" }}>{ex.type}</span>
                      <button onClick={() => removeExercise(ex.id)} aria-label="Remove exercise" style={{ color: "var(--text-3)", display: "flex" }}><Icon name="x" size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" placeholder="Add exercise…" value={f.name} onChange={(e) => setEx(sp.id, { name: e.target.value })} style={{ height: 42, fontSize: 13.5 }} />
                <select className="input" value={f.type} onChange={(e) => setEx(sp.id, { type: e.target.value })} style={{ height: 42, fontSize: 13, width: 104, flexShrink: 0 }}>
                  {EXERCISE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button onClick={() => addExercise(sp.id)} aria-label="Add exercise" style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--violet)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="plus" size={18} />
                </button>
              </div>
            </div>
          );
        })}
        <button onClick={addSplit} style={{ width: "100%", padding: 12, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="plus" size={15} /> Add a split
        </button>
      </div>

      <PresetBuilder state={state} update={update} />
    </div>
  );
}

function PresetBuilder({ state, update }) {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState({});
  const presets = state.presets || [];

  const q = search.trim().toLowerCase();
  const matches = q ? state.sources.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6) : [];
  function bump(id, d) { setItems((it) => { const v = Math.max(0, Math.round(((it[id] || 0) + d) * 2) / 2); const next = { ...it }; if (v === 0) delete next[id]; else next[id] = v; return next; }); }
  function itemsTotal(obj) { let t = 0; Object.entries(obj).forEach(([id, serv]) => { const src = state.sources.find((x) => x.id === id); if (src) t += src.avg * serv; }); return Math.round(t); }
  function save() {
    if (!name.trim() || Object.keys(items).length === 0) return;
    update((s) => { if (!s.presets) s.presets = []; s.presets.push({ id: "pr" + Date.now(), name: name.trim(), items, customG: 0 }); return s; });
    setName(""); setSearch(""); setItems({});
  }
  function del(id) { update((s) => { s.presets = (s.presets || []).filter((p) => p.id !== id); return s; }); }

  const draftIds = Object.keys(items);

  return (
    <>
      <div className="section-label">Meal presets</div>
      {presets.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          {presets.map((pr, i) => (
            <div key={pr.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5 }}>{pr.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>{itemsTotal(pr.items || {}) + (pr.customG || 0)}g · {Object.keys(pr.items || {}).length} sources</div>
              </div>
              <button onClick={() => del(pr.id)} aria-label="Delete preset" style={{ width: 34, height: 34, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="field-label" style={{ marginBottom: 9 }}>Build a preset</div>
        <input className="input" placeholder="Preset name (e.g. Breakfast)" value={name} maxLength={28} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 9 }} />

        {draftIds.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
            {draftIds.map((id) => {
              const src = state.sources.find((x) => x.id === id);
              if (!src) return null;
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--violet-soft)", borderRadius: 99, padding: "5px 6px 5px 11px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{items[id]}× {src.name}</span>
                  <button onClick={() => bump(id, -0.5)} style={{ color: "var(--violet)", display: "flex" }}><Icon name="circle-minus" size={16} /></button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ position: "relative", marginBottom: draftIds.length || matches.length ? 10 : 12 }}>
          <Icon name="search" size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input className="input" placeholder="Search your sources to add…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, height: 44 }} />
        </div>

        {matches.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {matches.map((src) => (
              <button key={src.id} onClick={() => bump(src.id, 1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: "var(--r-md)", textAlign: "left", width: "100%" }}>
                <Icon name="plus" size={15} style={{ color: "var(--violet)" }} />
                <span style={{ flex: 1, fontSize: 13 }}>{src.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-2)" }}>{src.avg}g · {src.type}</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={save} disabled={!name.trim() || draftIds.length === 0}
          className="cta" style={{ opacity: !name.trim() || draftIds.length === 0 ? 0.45 : 1 }}>
          Save preset{draftIds.length ? ` · ${itemsTotal(items)}g` : ""}
        </button>
      </div>
    </>
  );
}
