import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, levelFromXp, totalTierScore, measurementDue, today, reconcileFreezes } from "./lib/store.js";
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
import TrainingPage from "./pages/TrainingPage.jsx";
import { registerSW, showNotification } from "./lib/notify.js";
import { FormaWordmark } from "./components/BoltLogo.jsx";

export default function App() {
  const [state, update, replace] = useStore();
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const prevLevel = useRef(null);
  const prevTierScore = useRef(null);
  const toastTimer = useRef();
  const reminded = useRef(false);
  const freezeChecked = useRef(false);
  const navStack = useRef([]);
  const touchRef = useRef(null);
  const [booted, setBooted] = useState(false);
  useEffect(() => { const id = setTimeout(() => setBooted(true), 1000); return () => clearTimeout(id); }, []);

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

  useEffect(() => { registerSW(); }, []);

  useEffect(() => {
    if (!state || freezeChecked.current) return;
    freezeChecked.current = true;
    const probe = structuredClone(state);
    const used = reconcileFreezes(probe);
    update((s) => { reconcileFreezes(s); return s; });
    if (used > 0) showToast("level", used === 1 ? "Streak freeze used — streak saved!" : `${used} streak freezes used`);
  }, [state]);

  useEffect(() => {
    if (state && state.theme) document.documentElement.setAttribute("data-theme", state.theme);
  }, [state && state.theme]);

  useEffect(() => {
    if (!state || reminded.current) return;
    reminded.current = true;
    if (state.settings && state.settings.notifications && measurementDue(state) && state.settings.lastNotified !== today()) {
      showNotification("Forma — monthly check-in", "Time for your body measurements.", "measure").then((ok) => {
        if (ok) update((s) => { s.settings.lastNotified = today(); return s; });
      });
    }
  }, [state]);

  const go = (v) => { if (v !== view) { navStack.current.push(view); setView(v); } };
  const back = () => {
    const st = navStack.current;
    if (st.length) setView(st.pop());
    else if (view !== "dashboard") setView("dashboard");
  };
  function onTouchStart(e) { if (menuOpen) return; const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() }; }
  function onTouchEnd(e) {
    const st = touchRef.current; touchRef.current = null;
    if (!st) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - st.x, dy = t.clientY - st.y, dt = Date.now() - st.time;
    // left-edge swipe to the right => go back to the previous page
    if (st.x <= 36 && dx > 70 && Math.abs(dy) < 50 && dt < 600) back();
  }
  const onMenu = () => setMenuOpen(true);

  const pages = {
    dashboard: <Dashboard state={state} go={go} onMenu={onMenu} />,
    gym: <GymPage state={state} update={update} go={go} onMenu={onMenu} celebrate={showToast} />,
    protein: <ProteinPage state={state} update={update} go={go} onMenu={onMenu} celebrate={showToast} />,
    profile: <ProfilePage state={state} update={update} go={go} onMenu={onMenu} celebrate={showToast} />,
    progress: <ProgressPage state={state} go={go} onMenu={onMenu} />,
    history: <HistoryPage state={state} go={go} onMenu={onMenu} />,
    achievements: <AchievementsPage state={state} go={go} onMenu={onMenu} />,
    settings: <SettingsPage state={state} update={update} replace={replace} go={go} onMenu={onMenu} celebrate={showToast} />,
    dojo: <TrainingPage state={state} update={update} go={go} onMenu={onMenu} />,
  };

  const isHub = view === "dashboard";
  const ready = booted && !!state;

  return (
    <>
      {state && (<>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence mode="wait">
        <motion.div key={view}
          initial={{ opacity: 0, x: isHub ? -14 : 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isHub ? 14 : -14 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
          {pages[view]}
        </motion.div>
      </AnimatePresence>
      </div>

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
      </>)}

      <AnimatePresence>
        {!ready && (
          <motion.div key="boot"
            initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, background: "var(--cloud)" }}>
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <FormaWordmark fontSize={34} />
            </motion.div>
            <div style={{ width: 130, height: 3, borderRadius: 99, overflow: "hidden", background: "var(--line)" }}>
              <motion.div initial={{ x: "-130%" }} animate={{ x: "130%" }} transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                style={{ width: "60%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg, transparent, var(--violet), transparent)" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
