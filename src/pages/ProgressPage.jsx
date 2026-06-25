import { useState } from "react";
import { Icon, Ring } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import {
  today, weekKey, addDays, dayProtein, proteinTarget, gymStreak,
  levelFromXp, levelName, weeklyTarget, getSplits,
  exercisePRs, exerciseHistory, exerciseHasData, summarizeEntry, metricLabel, fmtWeight,
} from "../lib/store.js";

function lastWeeks(n) {
  const out = [];
  let cursor = weekKey(today());
  for (let i = 0; i < n; i++) {
    out.unshift(cursor);
    cursor = addDays(cursor, -7);
  }
  return out;
}

export default function ProgressPage({ state, go, onMenu }) {
  const target = proteinTarget(state.profile);
  const streak = gymStreak(state);
  const wt = weeklyTarget(state);
  const { level } = levelFromXp(state.xp);
  const unit = state.settings.unit || "kg";

  const weeks = lastWeeks(4);
  const [dayDetail, setDayDetail] = useState(null);
  const heat = weeks.map((wk) =>
    Array.from({ length: 7 }).map((_, i) => {
      const iso = addDays(wk, i);
      const grams = dayProtein(state, iso);
      if (grams === 0) return 0;
      const ratio = grams / target;
      if (ratio >= 1) return 3;
      if (ratio >= 0.66) return 2;
      return 1;
    })
  );
  const heatColors = ["var(--cloud)", "#cecbf6", "#7f77dd", "#534ab7"];

  const sessions = Object.keys(state.gym).length;
  const proteinDays = Object.keys(state.protein);
  const avgProtein = proteinDays.length
    ? Math.round(proteinDays.reduce((s, d) => s + dayProtein(state, d), 0) / proteinDays.length)
    : 0;

  const wl = state.weightLog.slice(-8);
  const kgs = wl.map((w) => w.kg);
  const minKg = Math.min(...kgs), maxKg = Math.max(...kgs);
  const range = maxKg - minKg || 1;

  const allWeeks = lastWeeks(5);
  const hitWeeks = allWeeks.filter((wk) =>
    Object.keys(state.gym).filter((d) => weekKey(d) === wk).length >= wt).length;
  const consistency = Math.round((hitWeeks / allWeeks.length) * 100);

  return (
    <div className="app">
      <h2 className="sr-only">Progress — your streak, protein consistency, and weight trend</h2>
      <PageHead go={go} onMenu={onMenu} title="Progress" sub="Your momentum, visualised" />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
        <Ring value={consistency} max={100} size={92} stroke={9} track="var(--coral-soft)" color="var(--coral)">
          <div style={{ textAlign: "center" }}>
            <div className="num" style={{ fontSize: 22, color: "var(--coral)" }}>{streak}</div>
            <div style={{ fontSize: 9, color: "var(--coral)" }}>weeks</div>
          </div>
        </Ring>
        <div>
          <div className="num" style={{ fontSize: 28 }}>{consistency}%</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 3 }}>gym consistency, last 5 weeks</div>
          <div style={{ fontSize: 11, color: "var(--violet)", marginTop: 7, fontWeight: 600 }}>
            <Icon name="star" size={12} style={{ verticalAlign: -1 }} /> Level {level} · {levelName(level)}
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="shield-half-filled" size={22} style={{ color: "var(--violet)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 14 }}>
            {state.freezes || 0} streak freeze{(state.freezes || 0) === 1 ? "" : "s"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2, lineHeight: 1.4 }}>
            Auto-saves your streak if you miss a week. Earn one every 4 completed weeks (max 5).
          </div>
        </div>
      </div>

      <StrengthSection state={state} />

      <div className="section-label">Protein — hit / miss</div>
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {heat.map((week, wi) => (
            <div key={wi} style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-3)", width: 26 }}>W{wi + 1}</span>
              {week.map((lvl, di) => {
                const cellDate = addDays(weeks[wi], di);
                const future = cellDate > today();
                const active = dayDetail === cellDate;
                return (
                  <button key={di} onClick={() => !future && setDayDetail(active ? null : cellDate)} disabled={future}
                    aria-label={cellDate}
                    style={{ flex: 1, height: 19, borderRadius: 4, padding: 0,
                      background: future ? "transparent" : heatColors[lvl],
                      border: active ? "2px solid var(--violet)" : lvl === 0 ? "1px solid var(--line)" : "none",
                      opacity: future ? 0.3 : 1 }} />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, fontSize: 10, color: "var(--text-3)" }}>
          <span>Tap a day for details</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            under
            {[1, 2, 3].map((l) => <div key={l} style={{ width: 14, height: 10, borderRadius: 2, background: heatColors[l] }} />)}
            target
          </div>
        </div>
      </div>


      {dayDetail && (() => {
        const grams = Math.round(dayProtein(state, dayDetail));
        const entry = state.protein[dayDetail] || {};
        const rows = [];
        Object.entries(entry).forEach(([id, val]) => {
          if (id === "_custom") { if (val > 0) rows.push({ label: "One-off entry", sub: "manual", grams: Math.round(val) }); return; }
          const src = state.sources.find((x) => x.id === id);
          if (src) rows.push({ label: src.name, sub: val + "× " + src.avg + "g", grams: Math.round(src.avg * val) });
        });
        rows.sort((a, b) => b.grams - a.grams);
        const hit = grams >= target;
        const dl = new Date(dayDetail + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
        return (
          <div className="card" style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: rows.length ? 13 : 2 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>{dl}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 3 }}>
                  <span className="num" style={{ color: "var(--text)", fontSize: 14 }}>{grams}g</span> of {target}g
                  {grams > 0 && (hit ? " · target hit" : " · " + Math.round((grams / target) * 100) + "%")}
                </div>
              </div>
              <button onClick={() => setDayDetail(null)} aria-label="Close" style={{ width: 32, height: 32, marginRight: -6, color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={17} /></button>
            </div>
            {rows.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{r.label}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{r.sub}</span>
                    <span className="num" style={{ fontSize: 13, width: 50, textAlign: "right" }}>{r.grams}g</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>Nothing logged this day.</div>
            )}
          </div>
        );
      })()}

      <div className="section-label">Body weight trend</div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64 }}>
          {wl.map((w, i) => {
            const h = 30 + ((w.kg - minKg) / range) * 60;
            return <div key={i} style={{ flex: 1, height: `${h}%`, background: "linear-gradient(180deg,#7C3AED,#5DE0C4)", borderRadius: "3px 3px 0 0", opacity: 0.5 + (i / wl.length) * 0.5 }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 11, color: "var(--text-2)" }}>
          <span>{fmtWeight(kgs[0], unit)} earlier</span>
          <span style={{ color: "var(--violet)", fontWeight: 600 }}>{fmtWeight(kgs[kgs.length - 1], unit)} now</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 18 }}>
        <Stat value={sessions} label="sessions logged" />
        <Stat value={avgProtein + "g"} label="avg protein / day" />
      </div>

      <button onClick={() => go("achievements")} style={{ width: "100%", marginTop: 14, padding: 14, border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="trophy" size={16} style={{ color: "var(--violet)" }} /> View your achievements
      </button>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 14 }}>
      <div className="num" style={{ fontSize: 24 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function MiniBars({ data, height = 26 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ width: 6, height: `${Math.max(14, (v / max) * 100)}%`, background: "var(--violet)", borderRadius: "2px 2px 0 0", opacity: 0.4 + (i / data.length) * 0.6 }} />
      ))}
    </div>
  );
}

function StrengthSection({ state }) {
  const [open, setOpen] = useState(null);
  const unit = state.settings.unit || "kg";
  const withData = (state.exercises || []).filter((e) => exerciseHasData(state, e.id));
  const prs = exercisePRs(state).slice(0, 3);
  const splits = getSplits(state);

  if (withData.length === 0) {
    return (
      <>
        <div className="section-label">Strength progression</div>
        <div className="card" style={{ textAlign: "center", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
          Log what you did in the Gym tab and your per-exercise progress and PRs show up here.
        </div>
      </>
    );
  }

  const groups = splits.map((sp) => ({ sp, exs: withData.filter((e) => e.splitId === sp.id && !e.archived) })).filter((x) => x.exs.length);
  const archived = withData.filter((e) => e.archived);

  function Row(ex) {
    const hist = exerciseHistory(state, ex.id, ex.type);
    const metrics = hist.map((h) => h.metric);
    const best = Math.max(...metrics, 0);
    const isOpen = open === ex.id;
    const mx = Math.max(...metrics, 1);
    return (
      <div key={ex.id} style={{ borderTop: "1px solid var(--line)" }}>
        <button onClick={() => setOpen(isOpen ? null : ex.id)} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "11px 0", textAlign: "left" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 13.5 }}>{ex.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>best {metricLabel(ex.type, best, unit)} · {hist.length} session{hist.length === 1 ? "" : "s"}</div>
          </div>
          <MiniBars data={metrics.slice(-8)} />
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={16} style={{ color: "var(--text-3)" }} />
        </button>
        {isOpen && (
          <div style={{ padding: "2px 0 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 54, marginBottom: 10 }}>
              {hist.slice(-12).map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${Math.max(14, (h.metric / mx) * 100)}%`, background: "linear-gradient(180deg, var(--violet), #5DE0C4)", borderRadius: "3px 3px 0 0" }} />
              ))}
            </div>
            {hist.slice(-4).reverse().map((h) => (
              <div key={h.date} className="row">
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{new Date(h.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                <span style={{ fontSize: 12.5, fontFamily: "var(--display)", fontWeight: 500 }}>{summarizeEntry(ex.type, h.entry, unit)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {prs.length > 0 && (
        <>
          <div className="section-label">Recent PRs</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 4 }}>
            {prs.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", borderRadius: 99, background: "linear-gradient(135deg, var(--hero-1), var(--hero-2))", color: "#fff" }}>
                <Icon name="trophy" size={14} style={{ color: "#C6F432" }} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: "#cabff0" }}>{metricLabel(p.type, p.metric, unit)}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="section-label">Strength progression</div>
      <div className="card">
        {groups.map((g, gi) => (
          <div key={g.sp.id} style={{ marginTop: gi === 0 ? 0 : 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: g.sp.color, textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: 2 }}>{g.sp.label}</div>
            {g.exs.map(Row)}
          </div>
        ))}
        {archived.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: 2 }}>Archived</div>
            {archived.map(Row)}
          </div>
        )}
      </div>
    </>
  );
}