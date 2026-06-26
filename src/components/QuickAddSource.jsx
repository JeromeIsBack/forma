import { useState } from "react";
import { Icon } from "./ui.jsx";
import { SOURCE_TYPES, clamp, uid } from "../lib/store.js";

// Inline "add a brand-new protein source" that saves into the overall source list,
// usable from any source search. onAdded(id) fires after it's saved so the caller
// can immediately log it / add it to a preset.
export function QuickAddSource({ query, update, onAdded }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ name: "", avg: "", unit: "serving", type: "Other" });

  function start() { setD({ name: (query || "").trim(), avg: "", unit: "serving", type: "Other" }); setOpen(true); }
  function save() {
    const avg = parseFloat(d.avg);
    if (!d.name.trim() || !avg) return;
    const id = uid("c");
    update((s) => { if (!s.sources) s.sources = []; s.sources.push({ id, name: d.name.trim(), avg: clamp(Math.round(avg), 1, 300), unit: d.unit.trim() || "serving", type: d.type }); return s; });
    setOpen(false); setD({ name: "", avg: "", unit: "serving", type: "Other" });
    if (onAdded) onAdded(id);
  }

  if (!open) {
    return (
      <button onClick={start} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", textAlign: "left", width: "100%", color: "var(--violet)" }}>
        <Icon name="plus" size={15} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Add {(query || "").trim() ? `“${query.trim()}”` : "a new source"} to your list</span>
      </button>
    );
  }

  return (
    <div className="card" style={{ border: "1px solid var(--line-2)" }}>
      <div className="field-label" style={{ marginBottom: 9 }}>New source · saved to your list</div>
      <input className="input" placeholder="Name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} style={{ marginBottom: 9 }} autoFocus />
      <div style={{ display: "flex", gap: 9, marginBottom: 9 }}>
        <input className="input" type="number" inputMode="numeric" placeholder="protein g" value={d.avg} onChange={(e) => setD({ ...d, avg: e.target.value })} />
        <input className="input" placeholder="per (unit)" value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} />
      </div>
      <select className="input" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })} style={{ marginBottom: 11 }}>
        {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <div style={{ display: "flex", gap: 9 }}>
        <button className="cta lime" onClick={save} style={{ boxShadow: "none" }}>Save & use</button>
        <button onClick={() => setOpen(false)} style={{ padding: "0 18px", border: "1px solid var(--line-2)", borderRadius: "var(--r-lg)", color: "var(--text-2)" }}>Cancel</button>
      </div>
    </div>
  );
}
