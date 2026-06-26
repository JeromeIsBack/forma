import { motion, AnimatePresence } from "framer-motion";
import { Icon, Ring } from "./ui.jsx";
import { FormaWordmark } from "./BoltLogo.jsx";
import { levelFromXp, levelName } from "../lib/store.js";

// Colors are theme tokens, so the drawer re-tints when the theme changes.
const ITEMS = [
  { id: "profile", label: "Character", sub: "Stats, goal & measurements", icon: "user-bolt", color: "var(--violet)" },
  { id: "dojo", label: "The Dojo", sub: "Build splits & meal presets", icon: "karate", color: "var(--lime)" },
  { id: "history", label: "History", sub: "Your full training log", icon: "calendar-stats", color: "var(--mint)" },
  { id: "settings", label: "Settings", sub: "Themes, units & data", icon: "settings", color: "var(--accent)" },
];

const tint = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export function MenuButton({ onClick, dark }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      style={{
        width: 38, height: 38, flexShrink: 0,
        borderRadius: "var(--r-md)",
        background: dark ? "rgba(255,255,255,0.12)" : "var(--paper)",
        border: dark ? "none" : "1px solid var(--line)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: dark ? "#fff" : "var(--text)",
      }}
    >
      <Icon name="menu-2" size={20} />
    </button>
  );
}

export function NavDrawer({ open, onClose, go, current, state }) {
  const lv = state ? levelFromXp(state.xp || 0) : { level: 1, into: 0, need: 300 };
  const name = levelName(lv.level);
  const toNext = Math.max(0, lv.need - lv.into);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(10,8,16,0.6)", zIndex: 100, backdropFilter: "blur(3px)" }}
          />
          <motion.nav
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 101,
              width: "84%", maxWidth: 322,
              background: "linear-gradient(165deg, var(--hero-1) 0%, var(--hero-2) 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-22px 0 64px rgba(0,0,0,0.55)",
              padding: "calc(20px + env(safe-area-inset-top)) 16px 18px",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -90, right: -70, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${tint("var(--violet)", 55)}, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -70, left: -70, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${tint("var(--accent)", 22)}, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, position: "relative" }}>
              <FormaWordmark style={{ color: "#fff" }} />
              <button onClick={onClose} aria-label="Close menu"
                style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.85)" }}>
                <Icon name="x" size={19} />
              </button>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
              onClick={() => { go("profile"); onClose(); }}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, width: "100%", textAlign: "left", marginBottom: 18,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
              <Ring value={lv.into} max={lv.need} size={58} stroke={6} track="rgba(255,255,255,0.14)" color="var(--lime)">
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, color: "#fff" }}>{lv.level}</div>
              </Ring>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Level {lv.level}</div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, color: "#fff", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                <div style={{ fontSize: 11, color: "var(--lime)", marginTop: 3 }}>{toNext} XP to level {lv.level + 1}</div>
              </div>
              <Icon name="chevron-right" size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
            </motion.button>

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 9 }}>
              {ITEMS.map((it, i) => {
                const active = current === it.id;
                return (
                  <motion.button key={it.id}
                    initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, type: "spring", stiffness: 420, damping: 34 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { go(it.id); onClose(); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 13, padding: "12px 13px", borderRadius: 16, width: "100%", textAlign: "left",
                      background: active ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.045)",
                      border: active ? `1px solid ${it.color}` : "1px solid rgba(255,255,255,0.07)",
                      boxShadow: active ? `0 0 24px ${tint(it.color, 36)}` : "none",
                    }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tint(it.color, 20), border: `1px solid ${tint(it.color, 42)}` }}>
                      <Icon name={it.icon} size={19} style={{ color: it.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15, color: "#fff" }}>{it.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{it.sub}</div>
                    </div>
                    <Icon name={active ? "circle-check" : "chevron-right"} size={17} style={{ color: active ? it.color : "rgba(255,255,255,0.35)" }} />
                  </motion.button>
                );
              })}
            </div>

            <div style={{ position: "relative", marginTop: "auto", paddingTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.42)" }}>
              <Icon name="lock" size={12} /> Your data stays on this device
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
