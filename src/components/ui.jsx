import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

export function Icon({ name, size = 20, className = "", style = {}, label }) {
  return (
    <i
      className={`ti ti-${name} ${className}`}
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      style={{ fontSize: size, lineHeight: 1, ...style }}
    />
  );
}

export function CountUp({ value, duration = 900, format, className = "", style }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef();

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * eased;
      setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const shown = format ? format(display) : Math.round(display);
  return <span className={className} style={style}>{shown}</span>;
}

export function Ring({ value, max, size = 56, stroke = 6, track = "#efe9ff", color = "#7C3AED", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
      />
      {children && (
        <foreignObject x="0" y="0" width={size} height={size}>
          <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {children}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

export function burst(kind = "win") {
  const colors = kind === "level"
    ? ["#7C3AED", "#C6F432", "#5DE0C4", "#FF4D6D"]
    : ["#C6F432", "#5DE0C4", "#FFC53D"];
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors, scalar: 0.9, ticks: 160 });
}
