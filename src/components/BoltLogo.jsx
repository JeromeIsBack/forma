export function BoltLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="boltTile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B35C9" />
          <stop offset="1" stopColor="#1B1326" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="28" fill="url(#boltTile)" />
      <rect x="35" y="28" width="11" height="45" rx="2" fill="#fff" />
      <rect x="35" y="28" width="31" height="11" rx="2" fill="#fff" />
      <rect x="35" y="45" width="23" height="10" rx="2" fill="#fff" />
      <polygon points="80,19 69,35 75,35 71,48 84,31 77,31 83,19" fill="#C6F432" />
    </svg>
  );
}

export function FormaWordmark({ fontSize, style }) {
  return (
    <span className="logo" style={{ ...(fontSize ? { fontSize } : {}), display: "inline-flex", alignItems: "baseline", ...style }}>
      FORMA
      <svg viewBox="0 0 20 28" aria-hidden="true" style={{ height: "0.66em", width: "0.42em", marginLeft: "0.07em", alignSelf: "center" }}>
        <polygon points="13,1 2,16 9,16 5,27 18,10 10,10 15,1" fill="#C6F432" />
      </svg>
    </span>
  );
}
