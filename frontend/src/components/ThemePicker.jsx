import { useState, useEffect, useRef } from 'react';
import { THEMES, applyTheme, buildThemeFromAccent } from '../utils/themes';

export default function ThemePicker() {
  const [open, setOpen]         = useState(false);
  const [activeId, setActiveId] = useState('indigo');
  const [custom, setCustom]     = useState('#6366F1');
  const panelRef = useRef();

  // Detect current theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('carto_theme') || 'null');
      if (saved?.id)     setActiveId(saved.id);
      if (saved?.custom) { setActiveId('custom'); setCustom(saved.custom); }
    } catch {}
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectTheme = (theme) => {
    setActiveId(theme.id);
    applyTheme(theme);
  };

  const applyCustom = () => {
    setActiveId('custom');
    applyTheme(custom);
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-s btn-sm"
        title="Personnaliser les couleurs"
        style={{ fontSize: 16, padding: '4px 8px', lineHeight: 1 }}
      >
        🎨
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r5)', boxShadow: 'var(--s4)',
          padding: '16px', width: 240, zIndex: 200,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Thème de couleurs
          </p>

          {/* Predefined palette swatches */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme)}
                title={theme.name}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                  borderRadius: 'var(--r3)',
                  outline: activeId === theme.id ? `2px solid ${theme.accent}` : '2px solid transparent',
                  outlineOffset: 1,
                  transition: 'outline 0.12s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: theme.accentGrad,
                  boxShadow: activeId === theme.id ? `0 0 0 3px ${theme.accentPale}` : 'none',
                  transition: 'box-shadow 0.12s',
                }} />
                <span style={{ fontSize: 9, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.2 }}>
                  {theme.name}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 12 }} />

          {/* Custom colour */}
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Couleur personnalisée
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              style={{
                width: 36, height: 36, border: '1px solid var(--border)',
                borderRadius: 'var(--r3)', cursor: 'pointer', padding: 2,
                background: 'var(--surface)',
              }}
            />
            <input
              type="text"
              value={custom}
              onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setCustom(e.target.value); }}
              maxLength={7}
              className="inp"
              style={{ flex: 1, fontSize: 12, padding: '6px 8px', fontFamily: 'monospace' }}
              placeholder="#6366F1"
            />
            <button
              onClick={applyCustom}
              className="btn btn-p"
              style={{ fontSize: 11, padding: '6px 10px', whiteSpace: 'nowrap' }}
            >
              Appliquer
            </button>
          </div>

          {/* Preview band */}
          <div style={{
            marginTop: 12, height: 6, borderRadius: 'var(--rFull)',
            background: activeId === 'custom'
              ? buildThemeFromAccent(custom).accentGrad
              : (THEMES.find(t => t.id === activeId)?.accentGrad || 'var(--accent-grad)'),
          }} />
        </div>
      )}
    </div>
  );
}
