import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./ui.jsx";
import { FormaWordmark } from "./BoltLogo.jsx";

const ITEMS = [
  { id: "profile", label: "Character", icon: "user-bolt" },
  { id: "dojo", label: "The Dojo", icon: "karate" },
  { id: "history", label: "History", icon: "calendar-stats" },
  { id: "settings", label: "Settings", icon: "settings" },
];

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

export function NavDrawer({ open, onClose, go, current }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(13,10,20,0.55)", zIndex: 100, backdropFilter: "blur(2px)" }}
          />
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 101,
              width: "78%", maxWidth: 300,
              background: "var(--cloud)", borderLeft: "1px solid var(--line)",
              padding: "calc(20px + env(safe-area-inset-top)) 18px 24px",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <FormaWordmark />
              <button onClick={onClose} aria-label="Close menu"
                style={{ width: 36, height: 36, borderRadius: "var(--r-md)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
                <Icon name="x" size={19} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {ITEMS.map((it) => {
                const active = current === it.id;
                return (
                  <button key={it.id} onClick={() => { go(it.id); onClose(); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 13,
                      padding: "13px 14px", borderRadius: "var(--r-md)", width: "100%", textAlign: "left",
                      background: active ? "var(--violet)" : "transparent",
                      color: active ? "#fff" : "var(--text)",
                    }}>
                    <Icon name={it.icon} size={20} style={{ color: active ? "#fff" : "var(--violet)" }} />
                    <span style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 15 }}>{it.label}</span>
                    {active && <Icon name="check" size={16} style={{ marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "auto", fontSize: 11, color: "var(--text-3)", textAlign: "center" }}>
              Forma · your data stays on this device
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
