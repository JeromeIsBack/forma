import { useState } from "react";
import { Icon } from "./ui.jsx";
import { goalGuide, rotatingTip } from "../data/goals.js";

// context: "protein" | "training" | "pace"
// note: optional situational string computed live from the user's progress
export function GoalCoach({ goal, context, note }) {
  const g = goalGuide(goal);
  const tip = rotatingTip(goal, context);
  const [open, setOpen] = useState(false);
  if (!tip) return null;

  return (
    <div className="card" style={{ padding: "15px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: g.color, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "var(--text-3)", textTransform: "uppercase" }}>
          Game plan · {g.label}
        </span>
      </div>

      <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14.5, lineHeight: 1.4, color: "var(--text)" }}>
        {tip.punch}
      </div>

      {note && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 10, fontSize: 12.5, lineHeight: 1.4, color: g.color, fontWeight: 500 }}>
          <Icon name="bolt" size={13} style={{ marginTop: 1, flexShrink: 0 }} />
          <span>{note}</span>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 11.5, fontWeight: 600, color: "var(--text-3)" }}>
        Why this works
        <Icon name={open ? "chevron-up" : "chevron-down"} size={13} />
      </button>

      {open && (
        <div style={{ marginTop: 10, paddingTop: 11, borderTop: "1px solid var(--line)", fontSize: 12.5, lineHeight: 1.55, color: "var(--text-2)" }}>
          {tip.science}
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-3)" }}>
            {tip.url ? (
              <a href={tip.url} target="_blank" rel="noreferrer" style={{ color: "var(--text-3)", textDecoration: "none", borderBottom: "1px solid var(--line-2)" }}>{tip.cite}</a>
            ) : (
              <span>{tip.cite}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
