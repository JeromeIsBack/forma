import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { ACHIEVEMENTS, TIERS, tierFor } from "../lib/store.js";

export default function AchievementsPage({ state, go, onMenu }) {
  const ranked = ACHIEVEMENTS.map((a) => ({ ach: a, t: tierFor(a, state) }));
  const unlocked = ranked.filter((r) => r.t.idx > 0).length;
  const totalRanks = ranked.reduce((s, r) => s + r.t.idx, 0);
  const maxRanks = ACHIEVEMENTS.length * TIERS.length;

  return (
    <div className="app">
      <h2 className="sr-only">Achievements — geeky milestones to unlock</h2>
      <PageHead go={go} onMenu={onMenu} title="Achievements" sub="Earn your legend, one rank at a time" />

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginBottom: 18, color: "#fff",
        background: "linear-gradient(145deg, var(--hero-1), var(--hero-2))", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(198,244,50,0.18), transparent 70%)" }} />
        <div>
          <div className="num" style={{ fontSize: 30 }}>{unlocked}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>/{ACHIEVEMENTS.length}</span></div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>quests unlocked</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 30, background: "linear-gradient(95deg,#C6F432,#5DE0C4)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{totalRanks}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", WebkitTextFillColor: "rgba(255,255,255,0.5)" }}>/{maxRanks}</span></div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>total ranks earned</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ranked.map(({ ach, t }) => {
          const locked = t.idx === 0;
          const color = locked ? "#9a93a8" : t.tier.color;
          return (
            <div key={ach.id} className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
              {!locked && <div style={{ position: "absolute", top: -40, left: -30, width: 110, height: 110, borderRadius: "50%", background: `radial-gradient(circle, ${color}22, transparent 70%)` }} />}
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>
                <div style={{ width: 56, height: 56, borderRadius: 17, flexShrink: 0, position: "relative", overflow: "hidden",
                  background: locked ? "var(--cloud)" : `linear-gradient(145deg, ${color}, ${color}aa)`,
                  boxShadow: locked ? "none" : `0 7px 20px ${color}66, inset 0 1px 0 rgba(255,255,255,0.5)`,
                  border: locked ? "1px solid var(--line)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", color: locked ? "var(--text-3)" : "#fff" }}>
                  <div style={{ position: "absolute", top: -8, left: -8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.25)", filter: "blur(2px)" }} />
                  <Icon name={locked ? "lock" : ach.icon} size={26} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15.5 }}>{ach.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: locked ? "var(--text-3)" : "#fff", background: locked ? "var(--cloud)" : color, padding: "2px 9px", borderRadius: 99 }}>{locked ? "LOCKED" : t.tier.name.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--violet)", fontWeight: 600, marginTop: 3 }}>{ach.saga}</div>
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: 12, fontStyle: "italic" }}>{ach.lore}</div>
              <div style={{ display: "flex", gap: 7, marginTop: 11, alignItems: "flex-start" }}>
                <Icon name="info-circle" size={14} style={{ color: "var(--text-3)", marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{ach.how}</div>
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {TIERS.map((tier, i) => {
                  const reached = i < t.idx;
                  return (
                    <div key={tier.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: 7, borderRadius: 99, background: reached ? tier.color : "var(--cloud)", border: reached ? "none" : "1px solid var(--line)", boxShadow: reached ? `0 2px 8px ${tier.color}55` : "none" }} />
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: reached ? tier.color : "var(--text-3)" }}>{tier.name}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 11.5, color: "var(--text-2)" }}>
                {t.atMax ? (
                  <span style={{ color: t.tier.color, fontWeight: 700 }}><Icon name="crown" size={13} style={{ verticalAlign: -2 }} /> Maxed out — Diamond earned</span>
                ) : (
                  <>
                    <span><b style={{ color: "var(--text)" }}>{t.measure}</b> / {t.next} {ach.unit}</span>
                    <span style={{ color }}>{Math.round(t.progress * 100)}% to {t.nextTier.name}</span>
                  </>
                )}
              </div>
              {!t.atMax && (
                <div style={{ height: 7, background: "var(--cloud)", borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.progress * 100}%`, background: locked ? "var(--text-3)" : `linear-gradient(90deg, ${color}, ${color}bb)`, borderRadius: 99, transition: "width 0.6s ease" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
