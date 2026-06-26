import { useState } from "react";
import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { QuickAddSource } from "../components/QuickAddSource.jsx";
import { getSplits, weeklyTarget, SPLIT_PALETTE, clamp, EXERCISE_TYPES, EXERCISE_LIBRARY, exercisesForSplit, exerciseHasData, presetContents, uid } from "../lib/store.js";

export default function TrainingPage({ state, update, go, onMenu }) {
  const splits = getSplits(state);
  const wt = weeklyTarget(state);
  const [exDraft, setExDraft] = useState({});
  const [removingId, setRemovingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const archived = (state.exercises || []).filter((e) => e.archived);

  function setSplitLabel(id, label) { update((s) => { const sp = s.routine.splits.find((x) => x.id === id); if (sp) sp.label = label; return s; }); }
  function removeSplit(id) { update((s) => { if (s.routine.splits.length <= 1) return s; s.routine.splits = s.routine.splits.filter((x) => x.id !== id); s.exercises = (s.exercises || []).filter((e) => e.splitId !== id); return s; }); }
  function addSplit() { update((s) => { const color = SPLIT_PALETTE[s.routine.splits.length % SPLIT_PALETTE.length]; s.routine.splits.push({ id: uid("s"), label: "New split", color }); return s; }); }
  function setTarget(n) { update((s) => { s.routine.weeklyTarget = clamp(n, 1, 7); return s; }); }

  function exFields(id) { return exDraft[id] || { name: "", type: "reps" }; }
  function setEx(id, patch) { setExDraft((d) => ({ ...d, [id]: { ...exFields(id), ...patch } })); }
  function addExercise(splitId) {
    const f = exFields(splitId);
    if (!f.name.trim()) return;
    update((s) => { if (!s.exercises) s.exercises = []; s.exercises.push({ id: uid("ex"), name: f.name.trim(), type: f.type, splitId }); return s; });
    setExDraft((d) => ({ ...d, [splitId]: { name: "", type: f.type } }));
  }
  function addLibraryExercise(splitId, item) {
    update((s) => { if (!s.exercises) s.exercises = []; s.exercises.push({ id: uid("ex"), name: item.name, type: item.type, splitId }); return s; });
    setExDraft((d) => ({ ...d, [splitId]: { name: "", type: item.type } }));
  }
  function renameExercise(id, name) { update((s) => { const e = s.exercises.find((x) => x.id === id); if (e) e.name = name; return s; }); }
  function setExerciseType(id, type) { update((s) => { const e = s.exercises.find((x) => x.id === id); if (e && !exerciseHasData(s, id)) e.type = type; return s; }); }
  function archiveExercise(id) { update((s) => { const e = s.exercises.find((x) => x.id === id); if (e) e.archived = true; return s; }); setRemovingId(null); }
  function restoreExercise(id) { update((s) => { const e = s.exercises.find((x) => x.id === id); if (e) e.archived = false; return s; }); }
  function deleteExercise(id) { update((s) => { s.exercises = (s.exercises || []).filter((x) => x.id !== id); Object.values(s.workouts || {}).forEach((w) => { if (w.exercises) delete w.exercises[id]; }); return s; }); setRemovingId(null); }
  const splitLabel = (id) => (splits.find((x) => x.id === id) || {}).label || "—";

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
          const q = f.name.trim().toLowerCase();
          const have = new Set(exs.map((e) => e.name.toLowerCase()));
          const matches = q ? EXERCISE_LIBRARY.filter((it) => it.name.toLowerCase().includes(q) && !have.has(it.name.toLowerCase())).slice(0, 6) : [];
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
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 11 }}>
                  {exs.map((ex) => {
                    const locked = exerciseHasData(state, ex.id);
                    const removing = removingId === ex.id;
                    const editing = editingId === ex.id;
                    return (
                      <div key={ex.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: editing ? "8px 10px" : "0 6px 0 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {editing ? (
                            <>
                              <input className="input" value={ex.name} onChange={(e) => renameExercise(ex.id, e.target.value)} style={{ height: 36, fontSize: 13, flex: 1 }} autoFocus />
                              {locked ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "var(--violet)", background: "var(--violet-soft)", padding: "5px 9px", borderRadius: 99, textTransform: "uppercase", flexShrink: 0 }}>
                                  <Icon name="lock" size={10} /> {ex.type}
                                </span>
                              ) : (
                                <select className="input" value={ex.type} onChange={(e) => setExerciseType(ex.id, e.target.value)} style={{ height: 36, fontSize: 12, width: 92, flexShrink: 0 }}>
                                  {EXERCISE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                              )}
                              <button onClick={() => setEditingId(null)} aria-label="Done" style={{ width: 34, height: 34, flexShrink: 0, color: "var(--violet)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={18} /></button>
                            </>
                          ) : (
                            <>
                              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, padding: "11px 0" }}>{ex.name}</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "var(--violet)", background: "var(--violet-soft)", padding: "3px 9px", borderRadius: 99, textTransform: "uppercase", flexShrink: 0 }}>
                                {locked && <Icon name="lock" size={9} />}{ex.type}
                              </span>
                              <button onClick={() => { setEditingId(ex.id); setRemovingId(null); }} aria-label="Edit exercise" style={{ width: 34, height: 34, flexShrink: 0, color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="pencil" size={15} /></button>
                              <button onClick={() => { setRemovingId(removing ? null : ex.id); setEditingId(null); }} aria-label="Remove exercise" style={{ width: 32, height: 32, flexShrink: 0, color: removing ? "var(--text-2)" : "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={removing ? "x" : "trash"} size={15} /></button>
                            </>
                          )}
                        </div>
                        {editing && locked && (
                          <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 7, paddingLeft: 2, lineHeight: 1.4 }}>
                            Type is locked — you've already logged sets for this exercise. Rename is still fine.
                          </div>
                        )}
                        {removing && (
                          <div style={{ display: "flex", gap: 8, padding: "0 6px 9px" }}>
                            <button onClick={() => archiveExercise(ex.id)} style={{ flex: 1, padding: "9px 0", borderRadius: "var(--r-md)", border: "1px solid var(--line-2)", color: "var(--text)", fontSize: 12, fontWeight: 600 }}>Archive · keep history</button>
                            <button onClick={() => deleteExercise(ex.id)} style={{ flex: 1, padding: "9px 0", borderRadius: "var(--r-md)", background: "var(--coral-soft)", color: "var(--coral)", fontSize: 12, fontWeight: 600 }}>Delete forever</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" placeholder="Search or type an exercise…" value={f.name} onChange={(e) => setEx(sp.id, { name: e.target.value })} style={{ height: 42, fontSize: 13.5 }} />
                <select className="input" value={f.type} onChange={(e) => setEx(sp.id, { type: e.target.value })} style={{ height: 42, fontSize: 13, width: 100, flexShrink: 0 }}>
                  {EXERCISE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button onClick={() => addExercise(sp.id)} aria-label="Add exercise" style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--violet)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="plus" size={18} />
                </button>
              </div>

              {matches.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {matches.map((it) => (
                    <button key={it.name} onClick={() => addLibraryExercise(sp.id, it)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: "var(--r-md)", textAlign: "left", width: "100%" }}>
                      <Icon name="plus" size={15} style={{ color: "var(--violet)" }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{it.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase" }}>{it.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <button onClick={addSplit} style={{ width: "100%", padding: 12, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="plus" size={15} /> Add a split
        </button>
      </div>

      {archived.length > 0 && (
        <>
          <div className="section-label">Archived exercises</div>
          <div className="card">
            {archived.map((ex, i) => (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>{splitLabel(ex.splitId)} · {ex.type} · history kept</div>
                </div>
                <button onClick={() => restoreExercise(ex.id)} style={{ padding: "7px 13px", borderRadius: "var(--r-md)", border: "1px solid var(--line-2)", color: "var(--violet)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Restore</button>
                <button onClick={() => deleteExercise(ex.id)} aria-label="Delete permanently" style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="trash" size={15} /></button>
              </div>
            ))}
          </div>
        </>
      )}

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
    update((s) => { if (!s.presets) s.presets = []; s.presets.push({ id: uid("pr"), name: name.trim(), items, customG: 0 }); return s; });
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
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 230 }}>{(itemsTotal(pr.items || {}) + (pr.customG || 0))}g · {presetContents(state, pr).join(" · ") || "empty"}</div>
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

        {q && (
          <div style={{ marginBottom: 12 }}>
            <QuickAddSource query={search} update={update} onAdded={(id) => { bump(id, 1); setSearch(""); }} />
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
