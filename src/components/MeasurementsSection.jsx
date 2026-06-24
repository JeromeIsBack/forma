import { useState } from "react";
import { Icon } from "./ui.jsx";
import { MEASUREMENT_METRICS, lastMeasurement, measurementDue, today, daysBetween, clamp } from "../lib/store.js";

const RANGE = { bodyfat: [2, 60], default: [1, 300] };

export function MeasurementsSection({ state, update, celebrate }) {
  const metrics = MEASUREMENT_METRICS;
  const entries = state.measurements || [];
  const last = lastMeasurement(state);
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const due = measurementDue(state);

  const [draft, setDraft] = useState(() => {
    const d = {};
    metrics.forEach((m) => { d[m.id] = last && last.values[m.id] != null ? String(last.values[m.id]) : ""; });
    return d;
  });

  function save() {
    const values = {};
    metrics.forEach((m) => {
      if (draft[m.id] === "" || draft[m.id] == null) return;
      const [min, max] = RANGE[m.id] || RANGE.default;
      const v = parseFloat(draft[m.id]);
      if (!isNaN(v)) values[m.id] = clamp(v, min, max);
    });
    if (!Object.keys(values).length) return;
    update((s) => {
      const arr = (s.measurements || []).filter((e) => e.date !== today());
      arr.push({ date: today(), values });
      arr.sort((a, b) => a.date.localeCompare(b.date));
      s.measurements = arr;
      if (s.settings) s.settings.dismissed = { ...(s.settings.dismissed || {}), measure: today() };
      return s;
    });
    setDraft((d) => { const nd = { ...d }; metrics.forEach((m) => { if (values[m.id] != null) nd[m.id] = String(values[m.id]); }); return nd; });
    if (celebrate) celebrate("win", "Measurements saved");
  }

  return (
    <>
      {due && (
        <div className="card glass" style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 4, marginBottom: 4, border: "none" }}>
          <Icon name="ruler-2" size={20} style={{ color: "var(--violet)", flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.4 }}>
            Monthly check-in{last ? ` (${daysBetween(last.date, today())} days)` : ""} — time for fresh measurements.
          </div>
        </div>
      )}

      {last && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {metrics.filter((m) => last.values[m.id] != null).map((m) => {
            const cur = last.values[m.id];
            const before = prev && prev.values[m.id] != null ? prev.values[m.id] : null;
            const delta = before != null ? Math.round((cur - before) * 10) / 10 : null;
            const down = delta != null && delta < 0;
            return (
              <div key={m.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 13 }}>
                <div style={{ fontSize: 11, color: "var(--text-2)" }}>{m.label}</div>
                <div className="num" style={{ fontSize: 22, marginTop: 3 }}>{cur}<span style={{ fontSize: 12, color: "var(--text-3)" }}>{m.unit}</span></div>
                {delta != null && delta !== 0 && (
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: down ? "var(--lime-deep)" : "var(--coral)" }}>
                    <Icon name={down ? "arrow-down-right" : "arrow-up-right"} size={12} style={{ verticalAlign: -1 }} /> {Math.abs(delta)}{m.unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="field-label" style={{ marginBottom: 11 }}>{last ? "Update measurements" : "Set your baseline"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {metrics.map((m) => {
            const [min, max] = RANGE[m.id] || RANGE.default;
            return (
              <div key={m.id}>
                <label className="field-label">{m.label} ({m.unit})</label>
                <input className="input" type="number" inputMode="decimal" min={min} max={max} value={draft[m.id]}
                  onChange={(e) => setDraft({ ...draft, [m.id]: e.target.value })} placeholder="—" />
              </div>
            );
          })}
        </div>
        <button className="cta" onClick={save} style={{ marginTop: 14 }}>
          <Icon name="device-floppy" size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Save measurement
        </button>
      </div>

      {entries.length > 1 && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>History</div>
          {entries.slice().reverse().slice(0, 6).map((e) => (
            <div key={e.date} className="row">
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{new Date(e.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}</span>
              <span style={{ fontSize: 12.5, color: "var(--text)", fontFamily: "var(--display)", fontWeight: 500 }}>
                {metrics.filter((m) => e.values[m.id] != null).slice(0, 3).map((m) => `${m.label[0]}:${e.values[m.id]}`).join("  ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
