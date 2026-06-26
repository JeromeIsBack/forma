export function BoltLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="boltTile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B35C9" />
          <stop offset="1" stopColor="#1B1326" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#boltTile)" />
      <path d="M337.1 136L337.1 198.4L194.4 198.4L194.4 232L331 232L331 294.4L194.4 294.4L194.4 376L119.8 376L119.8 136Z" fill="#fff" />
      <polygon points="410,97 353,179 384,179 364,246 430,159 394,159 425,97" fill="#C6F432" />
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
