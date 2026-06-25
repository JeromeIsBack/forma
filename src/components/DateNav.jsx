import { Icon } from "./ui.jsx";
import { today, addDays } from "../lib/store.js";

export function DateNav({ value, onChange }) {
  const max = today();
  const isToday = value === max;
  const label = isToday ? "Today" : new Date(value + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
      <button onClick={() => onChange(addDays(value, -1))} aria-label="Previous day"
        style={{ width: 38, height: 38, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="chevron-left" size={18} />
      </button>

      <label style={{ position: "relative", flex: 1, maxWidth: 220 }}>
        <div style={{ height: 38, borderRadius: "var(--r-md)", border: "1px solid var(--line)", background: isToday ? "var(--paper)" : "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5, color: isToday ? "var(--text)" : "var(--violet)" }}>
          <Icon name="calendar" size={15} /> {label}
        </div>
        <input type="date" value={value} max={max} onChange={(e) => e.target.value && onChange(e.target.value)}
          style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", border: "none" }} aria-label="Pick a date" />
      </label>

      <button onClick={() => onChange(addDays(value, 1))} disabled={isToday} aria-label="Next day"
        style={{ width: 38, height: 38, borderRadius: "var(--r-md)", border: "1px solid var(--line)", color: isToday ? "var(--text-3)" : "var(--text-2)", opacity: isToday ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="chevron-right" size={18} />
      </button>

      {!isToday && (
        <button onClick={() => onChange(max)} style={{ height: 38, padding: "0 13px", borderRadius: "var(--r-md)", background: "var(--violet)", color: "#fff", fontFamily: "var(--display)", fontWeight: 600, fontSize: 12.5, flexShrink: 0 }}>Today</button>
      )}
    </div>
  );
}
