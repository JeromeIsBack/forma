import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { freshState, achievementBaselineNow } from "../lib/store.js";

export default function SettingsPage({ state, update, replace, go, onMenu, celebrate }) {
  function resetAchievements() {
    if (!window.confirm("Reset all achievements back to locked? Your sessions and protein history stay; only achievement ranks restart from now.")) return;
    update((s) => {
      s.achvBaseline = achievementBaselineNow(s);
      s.achvUnlocked = [];
      return s;
    });
    celebrate("win", "Achievements reset");
  }

  function resetAll() {
    if (!window.confirm("Start completely fresh? This wipes ALL data — sessions, protein, weight, XP and achievements. This cannot be undone.")) return;
    if (!window.confirm("Are you absolutely sure? Everything will be erased.")) return;
    replace(freshState());
    go("dashboard");
  }

  return (
    <div className="app">
      <h2 className="sr-only">Settings — manage your data and reset options</h2>
      <PageHead go={go} onMenu={onMenu} title="Settings" sub="Manage Forma & your data" />

      <div className="section-label">Your data</div>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="database" size={20} style={{ color: "#2c3a00" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
          Everything is stored privately on this device using your browser's IndexedDB. Nothing leaves your phone.
        </div>
      </div>

      <div className="section-label">Reset</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={resetAchievements} className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, width: "100%", textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="trophy" size={20} style={{ color: "var(--violet)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>Reset achievements</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>Restart all ranks from now. Keeps your logs.</div>
          </div>
          <Icon name="chevron-right" size={18} style={{ color: "var(--text-3)" }} />
        </button>

        <button onClick={resetAll} className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, width: "100%", textAlign: "left", borderColor: "var(--coral-soft)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--coral-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="trash" size={20} style={{ color: "var(--coral)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14, color: "var(--coral)" }}>Start fresh</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>Erase everything and begin from zero.</div>
          </div>
          <Icon name="chevron-right" size={18} style={{ color: "var(--text-3)" }} />
        </button>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 20 }}>
        Forma · more settings (themes, reminders) coming soon
      </div>
    </div>
  );
}
