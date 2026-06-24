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
    <div className="card glass" style={{ padding: 0, overflow: "hidden", border: "none" }}>
      <div style={{ display: "flex" }}>
        <div style={{ width: 4, background: g.color, flexShrink: 0 }} />
        <div style={{ padding: "13px 15px", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <Icon name="target-arrow" size={14} style={{ color: g.color }} />
            <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", color: g.color, textTransform: "uppercase" }}>
              Game plan · {g.label}
            </span>
          </div>

          {note && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 10, padding: "9px 11px", borderRadius: "var(--r-md)", background: g.color + "14" }}>
              <Icon name="bolt" size={14} style={{ color: g.color, marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, lineHeight: 1.4, color: "var(--text)" }}>{note}</span>
            </div>
          )}

          <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14, lineHeight: 1.35, color: "var(--text)" }}>
            {tip.punch}
          </div>

          <button onClick={() => setOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
            <Icon name={open ? "chevron-up" : "chevron-down"} size={14} />
            {open ? "Hide the science" : "Why this works"}
          </button>

          {open && (
            <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.5, color: "var(--text-2)" }}>
              {tip.science}
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-3)" }}>
                {tip.url ? (
                  <a href={tip.url} target="_blank" rel="noreferrer" style={{ color: g.color, textDecoration: "none", borderBottom: `1px solid ${g.color}55` }}>
                    {tip.cite}
                  </a>
                ) : (
                  <span>{tip.cite}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
