import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';
import { LogoMarkHero } from '../components/Logo';
import { Network, Building2, BarChart3, Users, ArrowRight, Zap, ShieldCheck, Globe } from 'lucide-react';

/* ── Nœuds du réseau animé ── */
const NODES = [
  { x: 12, y: 18, r: 3.5, delay: 0 },
  { x: 35, y: 8,  r: 5,   delay: 0.4 },
  { x: 58, y: 22, r: 3,   delay: 0.8 },
  { x: 80, y: 12, r: 4,   delay: 0.2 },
  { x: 92, y: 35, r: 2.5, delay: 1.1 },
  { x: 75, y: 55, r: 4.5, delay: 0.6 },
  { x: 88, y: 72, r: 3,   delay: 1.3 },
  { x: 65, y: 85, r: 5,   delay: 0.3 },
  { x: 42, y: 78, r: 3.5, delay: 0.9 },
  { x: 20, y: 88, r: 2.5, delay: 1.5 },
  { x: 8,  y: 65, r: 4,   delay: 0.7 },
  { x: 22, y: 45, r: 3,   delay: 1.2 },
  { x: 48, y: 50, r: 6,   delay: 0   },
  { x: 35, y: 65, r: 2.5, delay: 0.5 },
  { x: 62, y: 42, r: 3,   delay: 1.0 },
  { x: 50, y: 28, r: 2,   delay: 0.6 },
];

const EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],
  [10,11],[11,0],[12,1],[12,5],[12,8],[12,11],[12,14],[12,15],
  [1,15],[2,14],[14,5],[15,11],[13,8],[13,12],[10,13],
];

const SIGNAL_EDGES = [0, 5, 9];

/* ── Réseau SVG animé ── */
function AnimatedNetwork() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="homeNodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
      </defs>
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x} y1={NODES[a].y}
          x2={NODES[b].x} y2={NODES[b].y}
          stroke="#818CF8"
          strokeWidth="0.3"
          strokeOpacity="0.6"
        >
          <animate
            attributeName="strokeOpacity"
            values="0.2;0.8;0.2"
            dur={(3 + (i % 4)) + 's'}
            begin={((i * 0.25) % 2) + 's'}
            repeatCount="indefinite"
          />
        </line>
      ))}
      {NODES.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r * 3} fill="url(#homeNodeGlow)" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0.4;0"
              dur={(2.5 + (i % 3)) + 's'}
              begin={n.delay + 's'}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={n.x} cy={n.y} r={n.r} fill="#818CF8">
            <animate
              attributeName="r"
              values={n.r + ';' + (n.r * 1.4) + ';' + n.r}
              dur={(2 + (i % 3) * 0.7) + 's'}
              begin={n.delay + 's'}
              repeatCount="indefinite"
            />
            <animate
              attributeName="fillOpacity"
              values="0.5;1;0.5"
              dur={(2 + (i % 3) * 0.7) + 's'}
              begin={n.delay + 's'}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
      {SIGNAL_EDGES.map((edgeIdx, k) => {
        const a = NODES[EDGES[edgeIdx][0]];
        const b = NODES[EDGES[edgeIdx][1]];
        return (
          <circle key={k} r="0.7" fill="#C7D2FE">
            <animateMotion
              dur={(3 + k * 1.5) + 's'}
              begin={(k * 1.2) + 's'}
              repeatCount="indefinite"
              path={'M ' + a.x + ' ' + a.y + ' L ' + b.x + ' ' + b.y}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.1;0.9;1"
              dur={(3 + k * 1.5) + 's'}
              begin={(k * 1.2) + 's'}
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
    </svg>
  );
}

/* ── Effet machine à écrire ── */
function Typewriter({ texts, speed = 55 }) {
  const [textIdx, setTextIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const current = texts[textIdx];
    let timer;
    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed);
      } else {
        timer = setTimeout(() => setPhase('pause'), 1600);
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => setPhase('erasing'), 800);
    } else {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), speed * 0.6);
      } else {
        setTextIdx((textIdx + 1) % texts.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [displayed, phase, textIdx, texts, speed]);

  return (
    <span>
      {displayed}
      <span style={{
        display: 'inline-block', width: 2, height: '1em',
        background: 'var(--accent-light)', marginLeft: 2,
        verticalAlign: 'text-bottom',
        animation: 'homeCursor 1s step-end infinite',
      }} />
    </span>
  );
}

const FEATURES = [
  { Icon: Network,     grad: 'linear-gradient(135deg,#60a5fa,#3b82f6)', label: 'Canvas applicatif',         desc: 'Drag & drop, flux, domaines' },
  { Icon: Building2,   grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', label: 'Vue Urbanisme SI',           desc: 'Zones, couches, cartographie' },
  { Icon: BarChart3,   grad: 'linear-gradient(135deg,#34d399,#059669)', label: 'Décisions & KPIs',          desc: 'Keep / sunset / migrate' },
  { Icon: Users,       grad: 'linear-gradient(135deg,#fbbf24,#d97706)', label: 'Collaboration temps réel',  desc: 'Multi-users, WebSocket' },
  { Icon: ShieldCheck, grad: 'linear-gradient(135deg,#f87171,#dc2626)', label: 'Sécurité & Rôles',          desc: 'RBAC, audit, accès fin' },
  { Icon: Globe,       grad: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', label: 'Export & Partage',          desc: 'PNG, PPTX, lien public' },
];

function FeatureCard({ Icon, grad, label, desc, animDelay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.06)',
        border: '1px solid ' + (hovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'),
        borderRadius: 12, padding: '16px 18px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
        backdropFilter: 'blur(8px)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        cursor: 'default',
        animation: 'homeIn 0.5s ' + animDelay + 's both ease',
      }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: grad, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      }}>
        <Icon size={18} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function StatCounter({ target, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40;
        const step = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          setCount(Math.round(current));
          if (current >= target) clearInterval(timer);
        }, 1400 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}

const TYPEWRITER_TEXTS = [
  'Cartographiez votre SI en temps réel',
  'Visualisez vos flux applicatifs',
  'Pilotez vos décisions métier',
  'Collaborez sans friction',
];

/* ═══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  /* Rediriger si déjà connecté */
  useEffect(() => {
    if (!loading && user) navigate('/projects', { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  };

  if (loading) return null;

  const parallaxX = (mousePos.x - 0.5) * 24;
  const parallaxY = (mousePos.y - 0.5) * 16;

  return (
    <div onMouseMove={handleMouseMove} style={{
      minHeight: '100vh',
      background: 'linear-gradient(155deg, #1E1B4B 0%, #312E81 30%, #1E1B4B 60%, #0F0F2E 100%)',
      fontFamily: 'var(--font)',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* ── Keyframes injectés ── */}
      <style>{[
        '@keyframes homeCursor { 0%,100%{opacity:1} 50%{opacity:0} }',
        '@keyframes homeIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }',
        '@keyframes homeLogoIn { from{opacity:0;transform:scale(0.7) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }',
        '@keyframes homePulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.55),0 8px 40px rgba(99,102,241,0.35)} 50%{box-shadow:0 0 0 18px rgba(99,102,241,0),0 8px 40px rgba(99,102,241,0.5)} }',
        '@keyframes homeOrb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.08)} }',
        '@keyframes homeOrb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,25px) scale(0.95)} }',
        '@keyframes homeOrb3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(15px,-30px)} 66%{transform:translate(-25px,10px)} }',
        '@keyframes homeBadge { from{opacity:0;transform:scale(0.85) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }',
        '.home-btn-p:hover{transform:translateY(-2px)!important;box-shadow:0 8px 32px rgba(99,102,241,0.5)!important}',
        '.home-btn-p:active{transform:scale(0.975)!important}',
        '.home-btn-g:hover{background:rgba(255,255,255,0.12)!important;border-color:rgba(255,255,255,0.35)!important}',
      ].join('')}</style>

      {/* ── Orbes décoratifs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          top: '-120px', left: '-100px', animation: 'homeOrb1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          top: '30%', right: '-80px', animation: 'homeOrb2 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)',
          bottom: '10%', left: '20%', animation: 'homeOrb3 15s ease-in-out infinite',
        }} />
      </div>

      {/* ── Réseau avec parallaxe ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        transform: 'translate(' + parallaxX + 'px, ' + parallaxY + 'px)',
        transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <AnimatedNetwork />
      </div>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(30,27,75,0.65)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMarkHero size={34} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>
            Cartographe
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="home-btn-g" onClick={() => navigate('/login')} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 8, padding: '7px 18px', color: 'rgba(255,255,255,0.85)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>Se connecter</button>
          <button className="home-btn-p" onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            border: 'none', borderRadius: 8, padding: '7px 18px',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}>Commencer →</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: 'calc(100vh - 61px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px 80px', textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: 999, padding: '5px 14px', marginBottom: 32,
          opacity: visible ? 1 : 0,
          animation: visible ? 'homeBadge 0.5s 0.1s both ease' : 'none',
        }}>
          <Zap size={12} color="#818CF8" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Cartographie applicative · Temps réel
          </span>
        </div>

        {/* Logo + glow pulse */}
        <div style={{
          marginBottom: 28, opacity: visible ? 1 : 0,
          animation: visible ? 'homeLogoIn 0.7s 0.15s both cubic-bezier(0.16,1,0.3,1)' : 'none',
        }}>
          <div style={{
            display: 'inline-block', borderRadius: 24, padding: 6,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
            animation: 'homePulse 3s ease-in-out infinite',
          }}>
            <LogoMarkHero size={96} />
          </div>
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 900,
          lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 14,
          background: 'linear-gradient(135deg, #fff 0%, #C7D2FE 40%, #A5B4FC 70%, #818CF8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          opacity: visible ? 1 : 0,
          animation: visible ? 'homeIn 0.6s 0.3s both ease' : 'none',
        }}>Cartographe</h1>

        {/* Typewriter */}
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 22px)', color: 'rgba(255,255,255,0.65)',
          fontWeight: 500, maxWidth: 560, lineHeight: 1.5, marginBottom: 44, minHeight: '2em',
          opacity: visible ? 1 : 0,
          animation: visible ? 'homeIn 0.6s 0.45s both ease' : 'none',
        }}>
          <Typewriter texts={TYPEWRITER_TEXTS} />
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          animation: visible ? 'homeIn 0.6s 0.6s both ease' : 'none',
        }}>
          <button className="home-btn-p" onClick={() => navigate('/login')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            border: 'none', borderRadius: 10, padding: '14px 30px',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: '0 6px 28px rgba(99,102,241,0.42)', transition: 'all 0.22s',
          }}>
            Ouvrir mon espace <ArrowRight size={16} />
          </button>
          <button className="home-btn-g" onClick={() => navigate('/login')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: 10, padding: '14px 28px',
            color: 'rgba(255,255,255,0.88)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.22s',
          }}>
            Créer un compte
          </button>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 28,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4,
          animation: visible ? 'homeIn 0.6s 1.2s both ease' : 'none',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Découvrir</span>
          <div style={{ width: 1.5, height: 28, background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.04)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '36px 24px',
      }}>
        <div style={{
          maxWidth: 800, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 24, alignItems: 'center',
        }}>
          <StatCounter target={42}  suffix="+"  label="Projets créés" />
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)', margin: 'auto' }} />
          <StatCounter target={8}   suffix=""   label="Utilisateurs actifs" />
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)', margin: 'auto' }} />
          <StatCounter target={100} suffix="ms" label="Latence WebSocket" />
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)', margin: 'auto' }} />
          <StatCounter target={99}  suffix="%"  label="Uptime" />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1040, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
            color: '#fff', letterSpacing: '-0.035em', marginBottom: 12,
          }}>Tout ce qu'il vous faut</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto' }}>
            Une plateforme complète pour cartographier, collaborer et décider sur votre patrimoine applicatif.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} animDelay={0.1 + i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        padding: '64px 24px 80px',
        background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.08))',
      }}>
        <div style={{
          display: 'inline-block', marginBottom: 28,
          animation: 'homePulse 3s 1s ease-in-out infinite',
          borderRadius: 20, padding: 4, background: 'rgba(99,102,241,0.2)',
        }}>
          <LogoMarkHero size={64} />
        </div>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800,
          color: '#fff', letterSpacing: '-0.03em', marginBottom: 10,
        }}>Prêt à cartographier votre SI ?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
          Rejoignez l'espace collaboratif en quelques secondes.
        </p>
        <button className="home-btn-p" onClick={() => navigate('/login')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          border: 'none', borderRadius: 12, padding: '16px 36px',
          color: '#fff', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 36px rgba(99,102,241,0.45)', transition: 'all 0.22s',
        }}>
          Accéder à Cartographe <ArrowRight size={18} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoMarkHero size={22} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Cartographe</span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          Cartographie applicative · Urbanisme SI · Collaboration
        </span>
      </footer>
    </div>
  );
}
