import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, levelFromXp, totalTierScore } from "./lib/store.js";
import { burst, Icon } from "./components/ui.jsx";
import { NavDrawer } from "./components/NavDrawer.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GymPage from "./pages/GymPage.jsx";
import ProteinPage from "./pages/ProteinPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import AchievementsPage from "./pages/AchievementsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
  const [state, update, replace] = useStore();
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const prevLevel = useRef(null);
  const prevTierScore = useRef(null);
  const toastTimer = useRef();

  function showToast(kind, text) {
    clearTimeout(toastTimer.current);
    setToast({ kind, text });
    if (kind === "win" || kind === "level") burst(kind === "level" ? "level" : "win");
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    if (!state) return;
    const lvl = levelFromXp(state.xp).level;
    if (prevLevel.current !== null && lvl > prevLevel.current) showToast("level", `Level up — you're now level ${lvl}`);
    prevLevel.current = lvl;
  }, [state && state.xp]);

  useEffect(() => {
    if (!state) return;
    const score = totalTierScore(state);
    if (prevTierScore.current !== null && score > prevTierScore.current) showToast("level", "Achievement ranked up!");
    prevTierScore.current = score;
  }, [state]);

  if (!state) {
    return (
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="logo" style={{ fontSize: 30, opacity: 0.6 }}>FORMA<span className="dot">.</span></div>
      </div>
    );
  }

  const go = (v) => setView(v);
  const onMenu = () => setMenuOpen(true);

  const pages = {
    dashboard: <Dashboard state={state} go={go} onMenu={onMenu} />,
    gym: <GymPage state={state} update={update} go={go} onMenu={onMenu} celebrate={showToast} />,
    protein: <ProteinPage state={state} update={update} go={go} onMenu={onMenu} celebrate={showToast} />,
    profile: <ProfilePage state={state} update={update} go={go} onMenu={onMenu} />,
    progress: <ProgressPage state={state} go={go} onMenu={onMenu} />,
    history: <HistoryPage state={state} go={go} onMenu={onMenu} />,
    achievements: <AchievementsPage state={state} go={go} onMenu={onMenu} />,
    settings: <SettingsPage state={state} update={update} replace={replace} go={go} onMenu={onMenu} celebrate={showToast} />,
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

      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} go={go} current={view} />
      <BottomNav current={view} go={go} />

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
