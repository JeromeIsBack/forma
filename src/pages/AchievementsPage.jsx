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
      <h2 className="sr-only">Achievements — geeky milestones to unlock, with how to earn each</h2>
      <PageHead go={go} onMenu={onMenu} title="Achievements" sub="Earn your legend, one rank at a time" />

      <div style={{ borderRadius: "var(--r-lg)", padding: 18, marginBottom: 18, color: "#fff",
        background: "linear-gradient(145deg,#3A1D6E,#15121d)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="num" style={{ fontSize: 30 }}>{unlocked}<span style={{ fontSize: 16, color: "#8a7fb0" }}>/{ACHIEVEMENTS.length}</span></div>
          <div style={{ fontSize: 12, color: "#b9aedc", marginTop: 3 }}>quests unlocked</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 30, background: "linear-gradient(95deg,#C6F432,#5DE0C4)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{totalRanks}<span style={{ fontSize: 16, color: "#8a7fb0", WebkitTextFillColor: "#8a7fb0" }}>/{maxRanks}</span></div>
          <div style={{ fontSize: 12, color: "#b9aedc", marginTop: 3 }}>total ranks earned</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ranked.map(({ ach, t }) => {
          const locked = t.idx === 0;
          const color = locked ? "var(--text-3)" : t.tier.color;
          return (
            <div key={ach.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: locked ? "var(--cloud)" : color + "22",
                  border: locked ? "1px solid var(--line)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", color }}>
                  <Icon name={locked ? "lock" : ach.icon} size={23} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 15 }}>{ach.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color, background: locked ? "var(--cloud)" : color + "1f", padding: "2px 9px", borderRadius: 99 }}>
                      {locked ? "Locked" : t.tier.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--violet)", fontWeight: 600, marginTop: 3 }}>{ach.saga}</div>
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: 12, fontStyle: "italic" }}>
                {ach.lore}
              </div>

              <div style={{ display: "flex", gap: 7, marginTop: 11, alignItems: "flex-start" }}>
                <Icon name="info-circle" size={14} style={{ color: "var(--text-3)", marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{ach.how}</div>
              </div>

              {/* Tier pips */}
              <div style={{ display: "flex", gap: 6, marginTop: 13 }}>
                {TIERS.map((tier, i) => {
                  const reached = i < t.idx;
                  return (
                    <div key={tier.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: 6, borderRadius: 99, background: reached ? tier.color : "var(--cloud)", border: reached ? "none" : "1px solid var(--line)" }} />
                      <span style={{ fontSize: 8.5, fontWeight: 600, color: reached ? tier.color : "var(--text-3)" }}>{tier.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress to next */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 11.5, color: "var(--text-2)" }}>
                {t.atMax ? (
                  <span style={{ color: t.tier.color, fontWeight: 600 }}>
                    <Icon name="crown" size={13} style={{ verticalAlign: -2 }} /> Maxed out — Diamond earned
                  </span>
                ) : (
                  <>
                    <span><b style={{ color: "var(--text)" }}>{t.measure}</b> / {t.next} {ach.unit}</span>
                    <span style={{ color }}>{Math.round(t.progress * 100)}% to {t.nextTier.name}</span>
                  </>
                )}
              </div>
              {!t.atMax && (
                <div style={{ height: 6, background: "var(--cloud)", borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.progress * 100}%`, background: locked ? "var(--text-3)" : color, borderRadius: 99, transition: "width 0.6s ease" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
