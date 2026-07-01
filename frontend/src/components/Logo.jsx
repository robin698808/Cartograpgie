/**
 * Cartographe — Logo SVG
 * Réseau topologique IT : nœuds interconnectés = cartographie applicative
 */

/** Petit logo carré pour header / favicon */
export function LogoMark({ size = 34 }) {
  const id = `lg${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-label="Cartographe logo">
      <rect width="34" height="34" rx="9" fill={`url(#${id}a)`} />
      {/* Highlight */}
      <rect x="1" y="1" width="32" height="16" rx="8" fill={`url(#${id}b)`} />
      {/* Connexions */}
      <line x1="17" y1="9"  x2="9"  y2="22" stroke="rgba(255,255,255,0.38)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="17" y1="9"  x2="25" y2="22" stroke="rgba(255,255,255,0.38)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="9"  y1="22" x2="25" y2="22" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="17" y1="9"  x2="17" y2="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2.5" />
      {/* Nœud central — hub */}
      <circle cx="17" cy="9"  r="4"   fill="white" />
      <circle cx="17" cy="9"  r="2"   fill={`url(#${id}a)`} opacity="0.45" />
      {/* Nœuds secondaires */}
      <circle cx="9"  cy="22" r="2.8" fill="rgba(255,255,255,0.88)" />
      <circle cx="25" cy="22" r="2.8" fill="rgba(255,255,255,0.88)" />
      {/* Nœud feuille */}
      <circle cx="17" cy="26" r="2"   fill="rgba(255,255,255,0.55)" />
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="17" y1="1" x2="17" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.18" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Grand logo pour la page de login */
export function LogoMarkHero({ size = 64 }) {
  const id = `lgh${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill={`url(#${id}a)`} />
      <rect x="1" y="1" width="62" height="30" rx="17" fill={`url(#${id}b)`} />
      {/* Ombre portée interne */}
      <rect x="0" y="32" width="64" height="32" rx="17" fill="rgba(0,0,0,0.08)" />
      {/* Connexions — réseau */}
      <line x1="32" y1="16" x2="16" y2="38" stroke="rgba(255,255,255,0.40)" strokeWidth="2"   strokeLinecap="round" />
      <line x1="32" y1="16" x2="48" y2="38" stroke="rgba(255,255,255,0.40)" strokeWidth="2"   strokeLinecap="round" />
      <line x1="16" y1="38" x2="48" y2="38" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="32" y1="16" x2="32" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3.5" />
      <line x1="16" y1="38" x2="10" y2="50" stroke="rgba(255,255,255,0.2)"  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="48" y1="38" x2="54" y2="50" stroke="rgba(255,255,255,0.2)"  strokeWidth="1.4" strokeLinecap="round" />
      {/* Nœud hub */}
      <circle cx="32" cy="16" r="7"   fill="white" />
      <circle cx="32" cy="16" r="3.5" fill={`url(#${id}a)`} opacity="0.5" />
      {/* Nœuds secondaires */}
      <circle cx="16" cy="38" r="5.5" fill="rgba(255,255,255,0.92)" />
      <circle cx="48" cy="38" r="5.5" fill="rgba(255,255,255,0.92)" />
      {/* Nœuds tertiaires */}
      <circle cx="32" cy="50" r="3.5" fill="rgba(255,255,255,0.65)" />
      <circle cx="10" cy="50" r="2.5" fill="rgba(255,255,255,0.45)" />
      <circle cx="54" cy="50" r="2.5" fill="rgba(255,255,255,0.45)" />
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="32" y1="1" x2="32" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.22" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Pattern réseau décoratif — fond de la page login */
export function NetworkPattern({ width = 500, height = 500, className = '' }) {
  const nodes = [
    { cx: 80,  cy: 90  },
    { cx: 200, cy: 60  },
    { cx: 340, cy: 120 },
    { cx: 440, cy: 80  },
    { cx: 60,  cy: 220 },
    { cx: 160, cy: 200 },
    { cx: 280, cy: 240 },
    { cx: 400, cy: 200 },
    { cx: 100, cy: 350 },
    { cx: 240, cy: 380 },
    { cx: 370, cy: 340 },
    { cx: 460, cy: 310 },
    { cx: 50,  cy: 450 },
    { cx: 190, cy: 460 },
    { cx: 320, cy: 470 },
    { cx: 450, cy: 440 },
    { cx: 140, cy: 300 },
    { cx: 310, cy: 160 },
  ];

  const edges = [
    [0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],
    [4,8],[5,9],[6,10],[7,11],[8,9],[9,10],[10,11],[8,12],[9,13],
    [10,14],[11,15],[12,13],[13,14],[14,15],[1,17],[17,6],[5,16],
    [16,9],[2,17],[4,16],
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="#6366F1"
          strokeOpacity="0.12"
          strokeWidth="1.2"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={i < 3 ? 5 : i < 8 ? 3.5 : 2.5}
          fill="#6366F1"
          fillOpacity={i < 3 ? 0.25 : 0.14}
        />
      ))}
    </svg>
  );
}
