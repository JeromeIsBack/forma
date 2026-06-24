import { Icon } from "./ui.jsx";

const TABS = [
  { id: "dashboard", label: "Home", icon: "home" },
  { id: "gym", label: "Gym", icon: "barbell" },
  { id: "protein", label: "Protein", icon: "meat" },
  { id: "progress", label: "Progress", icon: "chart-line" },
  { id: "achievements", label: "Awards", icon: "trophy" },
];

export function BottomNav({ current, go }) {
  return (
    <nav className="bottomnav" aria-label="Primary">
      {TABS.map((t) => {
        const on = current === t.id;
        return (
          <button key={t.id} className={`navtab ${on ? "on" : ""}`} onClick={() => go(t.id)} aria-label={t.label} aria-current={on ? "page" : undefined}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
