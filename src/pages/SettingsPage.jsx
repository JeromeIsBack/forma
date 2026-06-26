import { useState } from "react";
import { Icon } from "../components/ui.jsx";
import { PageHead } from "./GymPage.jsx";
import { freshState, achievementBaselineNow, THEMES } from "../lib/store.js";
import { requestPermission, permissionStatus, showNotification } from "../lib/notify.js";

export default function SettingsPage({ state, update, replace, go, onMenu, celebrate }) {
  const [perm, setPerm] = useState(permissionStatus());
  const unit = state.settings.unit || "kg";
  function setUnit(u) { update((s) => { s.settings.unit = u; return s; }); }

  function setTheme(id) { update((s) => { s.theme = id; return s; }); }

  async function toggleNotifications() {
    const on = !state.settings.notifications;
    if (on) {
      const result = await requestPermission();
      setPerm(result);
      if (result !== "granted") {
        update((s) => { s.settings.notifications = false; return s; });
        return;
      }
      showNotification("Notifications on", "Forma will remind you to measure and stay on track.", "welcome");
    }
    update((s) => { s.settings.notifications = on; return s; });
  }

  function resetAchievements() {
    if (!window.confirm("Reset all achievements back to locked? Your sessions and protein history stay; only achievement ranks restart from now.")) return;
    update((s) => { s.achvBaseline = achievementBaselineNow(s); s.achvUnlocked = []; return s; });
    celebrate("win", "Achievements reset");
  }
  function resetAll() {
    if (!window.confirm("Start completely fresh? This wipes ALL data. This cannot be undone.")) return;
    if (!window.confirm("Are you absolutely sure? Everything will be erased.")) return;
    replace(freshState());
    go("dashboard");
  }

  const notifOn = state.settings.notifications;
  const tipsOn = state.settings.showTips !== false;
  function toggleTips() { update((s) => { const on = s.settings.showTips !== false; s.settings.showTips = !on; return s; }); }

  return (
    <div className="app">
      <h2 className="sr-only">Settings — themes, notifications, and data</h2>
      <PageHead go={go} onMenu={onMenu} title="Settings" sub="Make Forma yours" />

      <div className="section-label">Theme</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {THEMES.map((t) => {
          const on = state.theme === t.id;
          return (
            <button key={t.id} onClick={() => setTheme(t.id)}
              style={{ padding: 12, borderRadius: "var(--r-md)", border: on ? `2px solid ${t.primary}` : "1px solid var(--line)", background: "var(--paper)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: t.primary, boxShadow: `0 3px 10px ${t.primary}66` }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: on ? t.primary : "var(--text-2)" }}>{t.name}</span>
            </button>
          );
        })}
      </div>

      <div className="section-label">Units</div>
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, color: "var(--text-2)" }}>Weight unit</span>
        <div className="seg" style={{ width: 150 }}>
          <button className={`seg-opt ${unit === "kg" ? "on" : ""}`} onClick={() => setUnit("kg")}>kg</button>
          <button className={`seg-opt ${unit === "lbs" ? "on" : ""}`} onClick={() => setUnit("lbs")}>lbs</button>
        </div>
      </div>

      <div className="section-label">Notifications</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button onClick={toggleNotifications} style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, width: "100%", textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="bell" size={20} style={{ color: "var(--violet)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>Reminders & alerts</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>Monthly measurement nudge and check-ins.</div>
          </div>
          <div style={{ width: 46, height: 28, borderRadius: 99, background: notifOn ? "var(--violet)" : "var(--line-2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: notifOn ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </button>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)", margin: "8px 2px 0", lineHeight: 1.5 }}>
        {perm === "denied"
          ? "Notifications are blocked in your browser settings — enable them there first."
          : "Reminders fire when you open Forma and a check-in is due. Always-on scheduled push (when the app is closed) needs a server and isn't enabled yet."}
      </div>

      <div className="section-label">Coaching</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button onClick={toggleTips} style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, width: "100%", textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="bulb" size={20} style={{ color: "var(--violet)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>Game plan tips</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>Show coaching tips on the Gym and Protein pages.</div>
          </div>
          <div style={{ width: 46, height: 28, borderRadius: 99, background: tipsOn ? "var(--violet)" : "var(--line-2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: tipsOn ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </button>
      </div>

      <div className="section-label">Your data</div>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--lime)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="database" size={20} style={{ color: "#2c3a00" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
          Everything is stored privately on this device (IndexedDB). Nothing leaves your phone.
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

      <div style={{ height: 10 }} />
    </div>
  );
}
