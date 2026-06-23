import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, levelFromXp } from "./lib/store.js";
import { burst, Icon } from "./components/ui.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GymPage from "./pages/GymPage.jsx";
import ProteinPage from "./pages/ProteinPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

export default function App() {
  const [state, update] = useStore();
  const [view, setView] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const prevLevel = useRef(levelFromXp(state.xp).level);
  const toastTimer = useRef();

  function showToast(kind, text) {
    clearTimeout(toastTimer.current);
    setToast({ kind, text });
    if (kind === "win" || kind === "level") burst(kind === "level" ? "level" : "win");
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const lvl = levelFromXp(state.xp).level;
    if (lvl > prevLevel.current) {
      showToast("level", `Level up — you're now level ${lvl}`);
    }
    prevLevel.current = lvl;
  }, [state.xp]);

  const go = (v) => setView(v);
  const pages = {
    dashboard: <Dashboard state={state} go={go} />,
    gym: <GymPage state={state} update={update} go={go} celebrate={showToast} />,
    protein: <ProteinPage state={state} update={update} go={go} celebrate={showToast} />,
    profile: <ProfilePage state={state} update={update} go={go} />,
    progress: <ProgressPage state={state} go={go} />,
    history: <HistoryPage state={state} go={go} />,
  };

  const isHub = view === "dashboard";

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={view}
          initial={{ opacity: 0, x: isHub ? -14 : 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isHub ? 14 : -14 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
          {pages[view]}
        </motion.div>
      </AnimatePresence>

      {isHub && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ position: "fixed", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", pointerEvents: "none", paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}>
          <div style={{ display: "flex", gap: 8, background: "var(--ink)", padding: 7, borderRadius: 99, boxShadow: "var(--shadow)", pointerEvents: "auto" }}>
            <Hub icon="layout-dashboard" active onClick={() => go("dashboard")} label="Home" />
            <Hub icon="user" onClick={() => go("profile")} label="Profile" />
            <Hub icon="calendar-stats" onClick={() => go("history")} label="History" />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div className={`toast ${toast.kind}`}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}>
            <Icon name={toast.kind === "level" ? "arrow-big-up-lines" : "circle-check"} size={18} />
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hub({ icon, active, onClick, label }) {
  return (
    <button onClick={onClick} aria-label={label}
      style={{ width: 46, height: 46, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "var(--violet)" : "transparent", color: active ? "#fff" : "#8a7fb0" }}>
      <Icon name={icon} size={21} />
    </button>
  );
}
