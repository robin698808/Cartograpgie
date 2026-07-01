// ─── Colour helpers ──────────────────────────────────────────────────────────

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// Build a full theme object from a single accent hex colour
export function buildThemeFromAccent(accent) {
  const [h, s, l] = hexToHsl(accent);
  const [r, g, b] = hexToRgb(accent);
  const t1Hex = hslToHex(h, Math.min(s, 65), 15);
  const [tr, tg, tb] = hexToRgb(t1Hex);
  return {
    accent,
    accentH:    hslToHex(h, s, Math.max(l - 10, 18)),
    accentLight:hslToHex(h, s, Math.min(l + 12, 78)),
    accentPale: hslToHex(h, Math.min(s, 55), 95),
    accentGlow: `rgba(${r},${g},${b},0.16)`,
    accentGrad: `linear-gradient(135deg,${accent} 0%,${hslToHex((h + 28) % 360, s, l)} 100%)`,
    bg:         hslToHex(h, Math.min(s, 35), 97),
    surface2:   hslToHex(h, 15, 99),
    surface3:   hslToHex(h, Math.min(s, 45), 93),
    border:     hslToHex(h, Math.min(s, 55), 89),
    borderMd:   hslToHex(h, Math.min(s, 65), 82),
    borderStr:  hslToHex(h, Math.min(s, 75), 74),
    t1:         t1Hex,
    t2:         hslToHex(h, Math.min(s, 45), 28),
    overlay:    `rgba(${tr},${tg},${tb},0.55)`,
  };
}

// ─── Predefined themes ────────────────────────────────────────────────────────

export const THEMES = [
  {
    id: 'indigo',
    name: 'Indigo',
    swatch: '#6366F1',
    ...buildThemeFromAccent('#6366F1'),
    // Override to match original design exactly
    accentGrad: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)',
    bg: '#F5F3FF', surface2: '#FAFAFF', surface3: '#F0EFFE',
    border: '#E0E7FF', borderMd: '#C7D2FE', borderStr: '#A5B4FC',
    t1: '#1E1B4B', t2: '#3D3A6E', overlay: 'rgba(30,27,75,0.55)',
  },
  {
    id: 'blue',
    name: 'Bleu corporate',
    swatch: '#2563EB',
    ...buildThemeFromAccent('#2563EB'),
    accentGrad: 'linear-gradient(135deg,#2563EB 0%,#3B82F6 100%)',
  },
  {
    id: 'teal',
    name: 'Teal',
    swatch: '#0891B2',
    ...buildThemeFromAccent('#0891B2'),
    accentGrad: 'linear-gradient(135deg,#0891B2 0%,#06B6D4 100%)',
  },
  {
    id: 'green',
    name: 'Vert',
    swatch: '#059669',
    ...buildThemeFromAccent('#059669'),
    accentGrad: 'linear-gradient(135deg,#059669 0%,#10B981 100%)',
  },
  {
    id: 'orange',
    name: 'Orange',
    swatch: '#EA580C',
    ...buildThemeFromAccent('#EA580C'),
    accentGrad: 'linear-gradient(135deg,#EA580C 0%,#F97316 100%)',
  },
  {
    id: 'rose',
    name: 'Rose',
    swatch: '#DB2777',
    ...buildThemeFromAccent('#DB2777'),
    accentGrad: 'linear-gradient(135deg,#DB2777 0%,#EC4899 100%)',
  },
  {
    id: 'violet',
    name: 'Violet',
    swatch: '#7C3AED',
    ...buildThemeFromAccent('#7C3AED'),
    accentGrad: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 100%)',
  },
  {
    id: 'slate',
    name: 'Gris neutre',
    swatch: '#475569',
    ...buildThemeFromAccent('#475569'),
    accentGrad: 'linear-gradient(135deg,#475569 0%,#64748B 100%)',
  },
];

// ─── Apply / persist ──────────────────────────────────────────────────────────

export function applyTheme(themeOrAccent) {
  let t;
  if (typeof themeOrAccent === 'string') {
    // Custom hex accent
    t = buildThemeFromAccent(themeOrAccent);
    localStorage.setItem('carto_theme', JSON.stringify({ custom: themeOrAccent }));
  } else {
    t = themeOrAccent;
    localStorage.setItem('carto_theme', JSON.stringify({ id: t.id }));
  }

  const root = document.documentElement;
  root.style.setProperty('--accent',       t.accent);
  root.style.setProperty('--accent-h',     t.accentH);
  root.style.setProperty('--accent-light', t.accentLight);
  root.style.setProperty('--accent-pale',  t.accentPale);
  root.style.setProperty('--accent-glow',  t.accentGlow);
  root.style.setProperty('--accent-grad',  t.accentGrad);
  root.style.setProperty('--bg',           t.bg);
  root.style.setProperty('--surface-2',    t.surface2);
  root.style.setProperty('--surface-3',    t.surface3);
  root.style.setProperty('--border',       t.border);
  root.style.setProperty('--border-md',    t.borderMd);
  root.style.setProperty('--border-str',   t.borderStr);
  root.style.setProperty('--t1',           t.t1);
  root.style.setProperty('--t2',           t.t2);
  root.style.setProperty('--overlay',      t.overlay);
}

export function loadSavedTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem('carto_theme') || 'null');
    if (!saved) return;
    if (saved.custom) {
      applyTheme(saved.custom);
    } else if (saved.id) {
      const t = THEMES.find(t => t.id === saved.id);
      if (t) applyTheme(t);
    }
  } catch {}
}
