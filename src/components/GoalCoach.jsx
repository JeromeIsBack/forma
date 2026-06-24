import { useState } from "react";
import { Icon } from "./ui.jsx";
import { goalGuide } from "../data/goals.js";

// context: "protein" | "training" | "pace"
export function GoalCoach({ goal, context, onChangeGoal }) {
  const g = goalGuide(goal);
  const tip = g.tips[context];
  const [open, setOpen] = useState(false);
  if (!tip) return null;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: "none",
        background: "var(--paper)",
        boxShadow: "0 1px 0 var(--line)",
      }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ width: 4, background: g.color, flexShrink: 0 }} />
        <div style={{ padding: "13px 15px", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <Icon name="target-arrow" size={14} style={{ color: g.color }} />
            <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", color: g.color, textTransform: "uppercase" }}>
              Game plan · {g.label}
            </span>
          </div>

          <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14, lineHeight: 1.35, color: "var(--text)" }}>
            {tip.punch}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}
          >
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
