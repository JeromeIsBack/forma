import { useState } from "react";
import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { SPLITS, dayProtein, proteinTarget } from "../lib/store.js";

export default function HistoryPage({ state, go }) {
  const [filter, setFilter] = useState("all");
  const target = proteinTarget(state.profile);

  const dates = Array.from(new Set([...Object.keys(state.gym), ...Object.keys(state.protein)]))
    .sort().reverse();

  const filtered = dates.filter((d) => {
    if (filter === "gym") return state.gym[d];
    if (filter === "protein") return state.protein[d];
    return true;
  });

  function exportCsv() {
    const rows = [["date", "gym_split", "protein_g", "target_g", "hit"]];
    dates.forEach((d) => {
      const g = Math.round(dayProtein(state, d));
      rows.push([d, state.gym[d] || "", g, target, g >= target ? "yes" : "no"]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "forma-history.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <h2 className="sr-only">History — your full log of sessions and protein days</h2>
      <PageHead go={go} title="History" sub="Every session, every day" />

      <div className="seg" style={{ marginBottom: 16 }}>
        {[["all", "All"], ["gym", "Gym"], ["protein", "Protein"]].map(([id, label]) => (
          <button key={id} className={`seg-opt ${filter === id ? "on" : ""}`} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13, padding: "26px 0" }}>
          Nothing logged yet. Your history fills in as you go.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {filtered.map((d) => {
          const sp = SPLITS.find((x) => x.id === state.gym[d]);
          const grams = Math.round(dayProtein(state, d));
          const hit = grams >= target;
          return (
            <div key={d} className="card" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13 }}>
                  {new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {sp && <span style={{ fontSize: 11, fontWeight: 600, color: sp.color, background: sp.color + "1a", padding: "3px 9px", borderRadius: 99 }}>{sp.label}</span>}
                  {grams > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: hit ? "var(--lime-deep)" : "var(--text-2)" }}>
                      {grams}g {hit && <Icon name="check" size={12} style={{ verticalAlign: -1 }} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dates.length > 0 && (
        <button onClick={exportCsv} style={{ width: "100%", marginTop: 16, padding: 13, border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="download" size={15} /> Export as CSV
        </button>
      )}
    </div>
  );
}
