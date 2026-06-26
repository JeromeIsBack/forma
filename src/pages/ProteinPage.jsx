import { useState } from "react";
import { motion } from "framer-motion";
import { Icon, CountUp } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { GoalCoach } from "../components/GoalCoach.jsx";
import { today, addDays, dayProtein, proteinTarget, suggestProtein, SOURCE_TYPES, clamp, presetContents, uid } from "../lib/store.js";
import { DateNav } from "../components/DateNav.jsx";
import { QuickAddSource } from "../components/QuickAddSource.jsx";

export default function ProteinPage({ state, update, go, onMenu, celebrate }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", avg: "", unit: "", type: "Meat" });
  const [customG, setCustomG] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [date, setDate] = useState(today());

  const target = proteinTarget(state.profile);
  const total = Math.round(dayProtein(state, date));
  const pct = Math.min((total / target) * 100, 100);
  const entry = state.protein[date] || {};
  const presets = state.presets || [];
  const hasToday = Object.keys(entry).length > 0;

  const typesPresent = ["All", ...SOURCE_TYPES.filter((t) => state.sources.some((s) => s.type === t))];
  const q = search.trim().toLowerCase();
  const filtered = state.sources.filter((s) =>
    (typeFilter === "All" || s.type === typeFilter) && (!q || s.name.toLowerCase().includes(q))
  );

  function setServings(id, servings) {
    const v = Math.max(0, Math.round(servings * 2) / 2);
    update((s) => {
      if (!s.protein[date]) s.protein[date] = {};
      if (v === 0) delete s.protein[date][id]; else s.protein[date][id] = v;
      if (Object.keys(s.protein[date]).length === 0) delete s.protein[date];
      return s;
    });
  }
  function bump(id, delta) {
    const current = entry[id] || 0;
    const wasUnder = total < target;
    setServings(id, current + delta);
    const projected = Math.round(dayProtein({ ...state, protein: { ...state.protein, [date]: { ...entry, [id]: Math.max(0, current + delta) } } }, date));
    if (wasUnder && projected >= target) celebrate("win", "Protein target hit · +45 XP");
  }
  function addSuggestion(picks) {
    const wasUnder = total < target;
    update((s) => { if (!s.protein[date]) s.protein[date] = {}; picks.forEach((p) => { s.protein[date][p.id] = (s.protein[date][p.id] || 0) + p.servings; }); return s; });
    celebrate("win", wasUnder ? "Gap closed · sources added" : "Sources added");
  }
  const customNow = entry._custom || 0;
  function addCustom() {
    if (customG === "" || isNaN(parseFloat(customG))) return;
    const g = clamp(parseFloat(customG), 1, 300);
    const wasUnder = total < target;
    update((s) => { if (!s.protein[date]) s.protein[date] = {}; s.protein[date]._custom = (s.protein[date]._custom || 0) + g; return s; });
    setCustomG("");
    if (wasUnder && total + g >= target) celebrate("win", "Protein target hit · +45 XP");
  }
  function clearCustom() {
    update((s) => { if (s.protein[date]) { delete s.protein[date]._custom; if (Object.keys(s.protein[date]).length === 0) delete s.protein[date]; } return s; });
  }
  function presetTotal(pr) {
    let t = pr.customG || 0;
    Object.entries(pr.items || {}).forEach(([id, serv]) => { const src = state.sources.find((x) => x.id === id); if (src) t += src.avg * serv; });
    return Math.round(t);
  }
  function logPreset(pr) {
    const wasUnder = total < target;
    const added = presetTotal(pr);
    update((s) => {
      if (!s.protein[date]) s.protein[date] = {};
      Object.entries(pr.items || {}).forEach(([id, serv]) => { s.protein[date][id] = (s.protein[date][id] || 0) + serv; });
      if (pr.customG) s.protein[date]._custom = (s.protein[date]._custom || 0) + pr.customG;
      return s;
    });
    celebrate("win", wasUnder && total + added >= target ? "Target hit · " + pr.name : pr.name + " logged");
  }
  function savePreset() {
    if (!hasToday || !presetName.trim()) return;
    const items = {}; let customG = 0;
    Object.entries(entry).forEach(([id, v]) => { if (id === "_custom") customG = v; else items[id] = v; });
    if (!Object.keys(items).length && !customG) return;
    update((s) => { if (!s.presets) s.presets = []; s.presets.push({ id: uid("pr"), name: presetName.trim(), items, customG }); return s; });
    setPresetName(""); setSavingPreset(false);
  }
  function deletePreset(id) { update((s) => { s.presets = (s.presets || []).filter((p) => p.id !== id); return s; }); }
  function updateSource(id, field, value) {
    update((s) => { const src = s.sources.find((x) => x.id === id); if (src) { if (field === "avg") src.avg = clamp(Math.round(parseFloat(value) || 0), 0, 300); else src[field] = value; } return s; });
  }
  function removeSource(id) {
    update((s) => { s.sources = s.sources.filter((x) => x.id !== id); if (s.protein[date]) delete s.protein[date][id]; return s; });
  }
  function addSource() {
    const avg = parseFloat(draft.avg);
    if (!draft.name.trim() || !avg) return;
    update((s) => { s.sources.push({ id: uid("c"), name: draft.name.trim(), avg: clamp(Math.round(avg), 1, 300), unit: draft.unit.trim() || "serving", type: draft.type }); return s; });
    setDraft({ name: "", avg: "", unit: "", type: "Meat" }); setAdding(false);
  }

  return (
    <div className="app">
      <h2 className="sr-only">Protein tracker — log your sources for any day</h2>
      <PageHead go={go} onMenu={onMenu} title="Protein" sub={date === today() ? "Today" : new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} />

      <DateNav value={date} onChange={setDate} />

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginBottom: 18, color: "#fff", background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <div><CountUp value={total} className="num" style={{ fontSize: 34 }} /><span className="num" style={{ fontSize: 16, color: "#cabff0" }}>g</span></div>
          <div style={{ fontSize: 13, color: "#cabff0" }}>of {target}g</div>
        </div>
        <div style={{ height: 9, background: "#2e2740", borderRadius: 99, overflow: "hidden" }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 99, background: total >= target ? "linear-gradient(90deg,#C6F432,#5DE0C4)" : "#b9aedc" }} />
        </div>
        <div style={{ fontSize: 11.5, color: "#cabff0", marginTop: 9 }}>{total >= target ? "Target reached — strong day." : `${target - total}g to go`}</div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <GoalCoach goal={state.profile.goal} context="protein"
          note={total >= target ? "Target smashed. A pre-sleep skyr or casein serving aids overnight recovery." : `${target - total}g to go — a whey scoop is ~25g, 100g chicken ~30g.`} />
      </div>

      {(() => {
        const sug = suggestProtein(state, date);
        if (!sug || !sug.picks.length) return null;
        return (
          <div className="card glass" style={{ marginBottom: 4, padding: "14px 15px", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <Icon name="bulb" size={15} style={{ color: "var(--lime-deep)" }} />
              <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", color: "var(--lime-deep)", textTransform: "uppercase" }}>Close the gap · {sug.gap}g to go</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {sug.picks.map((p) => (<span key={p.id} style={{ fontSize: 12.5, color: "var(--text)", background: "var(--cloud)", border: "1px solid var(--line)", padding: "5px 10px", borderRadius: 99 }}>{p.servings % 1 === 0 ? p.servings : p.servings.toFixed(1)}× {p.name}</span>))}
            </div>
            <button onClick={() => addSuggestion(sug.picks)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: 12, borderRadius: "var(--r-md)", background: "var(--lime)", color: "#2c3a00", fontFamily: "var(--display)", fontWeight: 600, fontSize: 13.5 }}>
              <Icon name="plus" size={16} /> Add to today (≈{sug.after}g)
            </button>
          </div>
        );
      })()}

      <div className="section-label">One-off entry · this day</div>
      <div className="card">
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 9, lineHeight: 1.4 }}>Ate something without a clear source? Add the grams just for this day.</div>
        <div style={{ display: "flex", gap: 9 }}>
          <input className="input" type="number" inputMode="numeric" min={1} max={300} placeholder="e.g. 24" value={customG} onChange={(e) => setCustomG(e.target.value)} />
          <button onClick={addCustom} style={{ padding: "0 20px", flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--violet)", color: "#fff", fontFamily: "var(--display)", fontWeight: 600, fontSize: 14 }}>Add</button>
        </div>
        {customNow > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11, padding: "9px 12px", background: "var(--violet-soft)", borderRadius: "var(--r-md)" }}>
            <span style={{ fontSize: 12.5, color: "var(--text)" }}><b>{customNow}g</b> one-off added today</span>
            <button onClick={clearCustom} aria-label="Clear one-off" style={{ color: "var(--text-2)", display: "flex" }}><Icon name="x" size={16} /></button>
          </div>
        )}
      </div>

      {presets.length > 0 && (
        <>
          <div className="section-label">Meal presets · one-tap</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 4 }}>
            {presets.map((pr) => {
              const contents = presetContents(state, pr).join(" · ");
              return (
                <button key={pr.id} onClick={() => logPreset(pr)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "9px 15px", borderRadius: 16, background: "var(--violet)", color: "#fff", fontFamily: "var(--display)", maxWidth: "100%" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13 }}>
                    <Icon name="bolt" size={14} /> {pr.name}
                    <span style={{ fontSize: 11, opacity: 0.8 }}>{presetTotal(pr)}g</span>
                  </span>
                  {contents && <span style={{ fontSize: 10.5, opacity: 0.72, fontFamily: "var(--sans)", fontWeight: 500, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contents}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 2px 12px" }}>
        <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 12, letterSpacing: "0.04em", color: "var(--text-2)" }}>Your sources</span>
        <button onClick={() => setEditing((e) => !e)} style={{ fontSize: 12, fontWeight: 600, color: editing ? "var(--violet)" : "var(--text-2)", display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name={editing ? "check" : "pencil"} size={14} /> {editing ? "Done" : "Edit"}
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <Icon name="search" size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
        <input className="input" placeholder="Search sources…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 38, height: 44, fontSize: 14 }} />
      </div>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {typesPresent.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ flexShrink: 0, padding: "6px 13px", borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              background: typeFilter === t ? "var(--violet)" : "var(--paper)", color: typeFilter === t ? "#fff" : "var(--text-2)", border: typeFilter === t ? "none" : "1px solid var(--line)" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {filtered.length === 0 && <div style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", padding: "10px 0" }}>No sources match.</div>}
        {filtered.map((src) => {
          const servings = entry[src.id] || 0;
          const grams = Math.round(src.avg * servings);
          if (editing) {
            return (
              <div key={src.id} className="card" style={{ padding: "11px 13px" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 8 }}>
                  <input className="input" value={src.name} onChange={(e) => updateSource(src.id, "name", e.target.value)} style={{ height: 40, fontSize: 13.5 }} />
                  <button onClick={() => removeSource(src.id)} aria-label="Remove source" style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="trash" size={16} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 9 }}>
                  <input className="input" type="number" inputMode="numeric" value={src.avg} onChange={(e) => updateSource(src.id, "avg", e.target.value)} style={{ height: 40, fontSize: 13.5 }} placeholder="g" />
                  <input className="input" value={src.unit} onChange={(e) => updateSource(src.id, "unit", e.target.value)} style={{ height: 40, fontSize: 13.5 }} placeholder="unit" />
                  <select className="input" value={src.type || "Other"} onChange={(e) => updateSource(src.id, "type", e.target.value)} style={{ height: 40, fontSize: 13.5, flexShrink: 0, width: 110 }}>
                    {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            );
          }
          return (
            <div key={src.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", opacity: servings ? 1 : 0.62 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5 }}>{src.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>avg {src.avg}g · per {src.unit} · {src.type}</div>
              </div>
              <div className="num" style={{ fontSize: 14, color: servings ? "var(--violet)" : "var(--text-3)", minWidth: 38, textAlign: "right" }}>{grams}g</div>
              <Stepper value={servings} onMinus={() => bump(src.id, -0.5)} onPlus={() => bump(src.id, 0.5)} />
            </div>
          );
        })}
        {q && !editing && (
          <QuickAddSource query={search} update={update} onAdded={(newId) => { update((s) => { if (!s.protein[date]) s.protein[date] = {}; s.protein[date][newId] = (s.protein[date][newId] || 0) + 1; return s; }); setSearch(""); }} />
        )}
      </div>

      {adding ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="field-label">New source</div>
          <input className="input" placeholder="e.g. Seitan" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={{ marginBottom: 9 }} />
          <div style={{ display: "flex", gap: 9, marginBottom: 9 }}>
            <input className="input" type="number" inputMode="numeric" placeholder="protein g" value={draft.avg} onChange={(e) => setDraft({ ...draft, avg: e.target.value })} />
            <input className="input" placeholder="per (unit)" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
          </div>
          <select className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} style={{ marginBottom: 11 }}>
            {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
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
