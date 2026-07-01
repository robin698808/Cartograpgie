import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject, updateProject } from '../api/client';
import { useAuth } from '../api/AuthContext';
import { LogoMark } from '../components/Logo';
import ProfileModal from '../components/ProfileModal';
import ThemePicker from '../components/ThemePicker';
import ProjectAppearancePicker, { getIconComponent } from '../components/ProjectAppearancePicker';
import { Settings2, Users, Trash2, FolderOpen, Share2, Save, UserCheck } from 'lucide-react';

function initials(nom) {
  if (!nom) return '?';
  return nom.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function timeAgo(date) {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return 'hier';
  return `il y a ${d}j`;
}

const DEFAULT_FORM = { nom: '', description: '', visibility: 'private', color: '#6366F1', icon: 'Network', logo: null };

export default function Projects() {
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState(DEFAULT_FORM);
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');
  const [editProject, setEditProject] = useState(null); // project being colour/icon edited
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await getProjects(); setProjects(res.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setShowCreate(false); setEditProject(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateError('');
    try {
      await createProject(form);
      setShowCreate(false);
      setForm(DEFAULT_FORM);
      load();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Erreur lors de la création';
      setCreateError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setCreating(false); }
  };

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer "${nom}" ? Cette action est irréversible.`)) return;
    await deleteProject(id);
    load();
  };

  const handleAppearanceSave = async () => {
    if (!editProject) return;
    await updateProject(editProject.id, { color: editProject.color, icon: editProject.icon, logo: editProject.logo ?? null });
    setEditProject(null);
    load();
  };

  const totalVersions = projects.reduce((s, p) => s + (p.snapshot_count || 0), 0);
  const totalMembers  = projects.reduce((s, p) => s + (p.member_count  || 0), 0);
  const teamProjects  = projects.filter(p => p.visibility === 'team').length;

  return (
    <div className="page va">

      {/* ── Header ── */}
      <header className="header">
        <div className="brand">
          <LogoMark size={34} />
          <span className="brand-name">Cartographe</span>
        </div>

        <div className="row g3">
          <ThemePicker />
          {user?.role === 'admin' && (
            <>
              <span className="badge badge-ad caps">Admin</span>
              <button onClick={() => navigate('/admin/users')} className="btn btn-s btn-sm">
                🛡️ Utilisateurs
              </button>
            </>
          )}
          <div className="row g2" onClick={() => setShowProfile(true)}
            style={{ cursor: 'pointer' }} title="Modifier mon profil">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border)' }} />
              : <div className="av av-sm">{initials(user?.nom)}</div>
            }
            <span className="f13 t2 w5">{user?.prenom ? `${user.prenom} ${user.nom}` : user?.nom}</span>
          </div>
          <button onClick={logout} className="btn btn-s btn-sm">Déconnexion</button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="container">

        <div className="row jcb ais" style={{ marginBottom: 24, gap: 16 }}>
          <div>
            <h1 className="f28 w8 t1 ls-tight" style={{ marginBottom: 4 }}>Mes projets</h1>
            <p className="f13 t3">
              {loading ? 'Chargement…' : `${projects.length} projet${projects.length !== 1 ? 's' : ''} de cartographie`}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn btn-p">
            + Nouveau projet
          </button>
        </div>

        {/* Stats bar */}
        {!loading && projects.length > 0 && (
          <div className="stat-bar">
            <StatItem
              icon={<FolderOpen size={18} strokeWidth={1.7} />}
              gradient="linear-gradient(135deg,#6366F1,#818CF8)"
              glow="rgba(99,102,241,0.18)"
              value={projects.length}
              label="Projets actifs"
            />
            <div className="stat-sep" />
            <StatItem
              icon={<Share2 size={18} strokeWidth={1.7} />}
              gradient="linear-gradient(135deg,#0891B2,#22D3EE)"
              glow="rgba(8,145,178,0.18)"
              value={teamProjects}
              label="Projets partagés"
            />
            <div className="stat-sep" />
            <StatItem
              icon={<Save size={18} strokeWidth={1.7} />}
              gradient="linear-gradient(135deg,#059669,#34D399)"
              glow="rgba(5,150,105,0.18)"
              value={totalVersions}
              label="Versions sauvegardées"
            />
            <div className="stat-sep" />
            <StatItem
              icon={<UserCheck size={18} strokeWidth={1.7} />}
              gradient="linear-gradient(135deg,#D97706,#FCD34D)"
              glow="rgba(217,119,6,0.18)"
              value={totalMembers}
              label="Membres au total"
            />
          </div>
        )}

        {/* Grid */}
        {loading ? <SkeletonGrid /> : projects.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="pg">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => navigate(`/canvas/${p.id}`)}
                onAdmin={() => navigate(`/projects/${p.id}/admin`)}
                onDelete={() => handleDelete(p.id, p.nom)}
                onEditAppearance={() => setEditProject({ ...p })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal profil ── */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* ── Modal apparence projet ── */}
      {editProject && (
        <div className="overlay" onClick={() => setEditProject(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Apparence du projet</h2>
              <button onClick={() => setEditProject(null)} className="btn btn-s btn-xs" style={{ fontSize:16, lineHeight:1 }}>✕</button>
            </div>

            {/* Preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 'var(--r4)',
              background: `${editProject.color}12`,
              border: `1.5px solid ${editProject.color}40`,
              marginBottom: 20,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r3)', background: `${editProject.color}20`, border: `1px solid ${editProject.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {editProject.logo
                  ? <img src={editProject.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                  : (() => { const Icon = getIconComponent(editProject.icon); return <Icon size={20} color={editProject.color} strokeWidth={1.6} />; })()
                }
              </div>
              <span className="f15 w7 t1">{editProject.nom}</span>
            </div>

            <ProjectAppearancePicker
              color={editProject.color}
              icon={editProject.icon}
              logo={editProject.logo}
              onChange={({ color, icon, logo }) => setEditProject(p => ({ ...p, color, icon, logo }))}
            />

            <div className="modal-row" style={{ marginTop: 20 }}>
              <button onClick={() => setEditProject(null)} className="btn btn-s" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAppearanceSave} className="btn btn-p" style={{ flex: 2 }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal création ── */}
      {showCreate && (
        <div className="overlay" onClick={() => { setShowCreate(false); setCreateError(''); }}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nouveau projet</h2>

            <form onSubmit={handleCreate}>
              {/* Preview */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--r4)',
                background: `${form.color}12`, border: `1.5px solid ${form.color}40`,
                marginBottom: 16,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r3)', background: `${form.color}20`, border: `1px solid ${form.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {form.logo
                    ? <img src={form.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                    : (() => { const Icon = getIconComponent(form.icon); return <Icon size={18} color={form.color} strokeWidth={1.6} />; })()
                  }
                </div>
                <span className="f14 w6 t1">{form.nom || 'Nom du projet'}</span>
              </div>

              <div className="fg">
                <label className="lbl">Nom du projet *</label>
                <input className="inp" value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex : SI Groupe 2025" required autoFocus />
              </div>
              <div className="fg">
                <label className="lbl">Description</label>
                <textarea className="inp" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Contexte de la mission, périmètre couvert…" rows={2} />
              </div>
              <div className="fg">
                <label className="lbl">Visibilité</label>
                <select className="inp" value={form.visibility}
                  onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                  <option value="private">🔒 Privé — accessible uniquement par vous</option>
                  <option value="team">👥 Équipe — partagé avec les membres invités</option>
                </select>
              </div>

              <hr className="divider" style={{ margin: '4px 0 12px' }} />

              <ProjectAppearancePicker
                color={form.color}
                icon={form.icon}
                logo={form.logo}
                onChange={({ color, icon, logo }) => setForm(f => ({ ...f, color, icon, logo }))}
              />

              {createError && (
                <div className="alert alert-e" style={{ marginTop: 12, marginBottom: 0 }}>⚠️ {createError}</div>
              )}

              <div className="modal-row" style={{ marginTop: 16 }}>
                <button type="button" onClick={() => { setShowCreate(false); setCreateError(''); }}
                  className="btn btn-s" style={{ flex: 1 }}>Annuler</button>
                <button type="submit" disabled={creating} className="btn btn-p" style={{ flex: 2 }}>
                  {creating ? <><span className="spin" /> Création…</> : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Project Card ─────────────────────────────────────────────────── */
function ProjectCard({ project, onOpen, onDelete, onAdmin, onEditAppearance }) {
  const color   = project.color  || '#6366F1';
  const Icon    = getIconComponent(project.icon);
  const isTeam  = project.visibility === 'team';

  return (
    <div
      className="card card-hover"
      onClick={onOpen}
      style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Coloured header strip */}
      <div style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
        borderBottom: `2px solid ${color}30`,
        padding: '14px 16px 12px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
      }}>
        {/* Icon/logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--r4)', flexShrink: 0,
            background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}30`, overflow: 'hidden',
          }}>
            {project.logo
              ? <img src={project.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
              : <Icon size={20} color={color} strokeWidth={1.7} />
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 className="f14 w7 t1 trunc">{project.nom}</h3>
            <div className="row g1" style={{ marginTop: 3 }}>
              {isTeam
                ? <span className="badge badge-a" style={{ fontSize: 10 }}>Équipe</span>
                : <span className="badge badge-m" style={{ fontSize: 10 }}>Privé</span>
              }
              {project.snapshot_count > 0 && (
                <span className="badge badge-s" style={{ fontSize: 10 }}>
                  {project.snapshot_count}v
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="row g1" onClick={e => e.stopPropagation()} style={{ flexShrink: 0, marginTop: 2 }}>
          <button
            onClick={onEditAppearance}
            title="Couleur & icône"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 'var(--r2)', color: 'var(--t4)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = color}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t4)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
          </button>
          <button onClick={onAdmin} title="Membres"
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:'var(--r2)', color:'var(--t4)', display:'flex', alignItems:'center', transition:'color 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t4)'}>
            <Users size={14} />
          </button>
          <button onClick={onDelete} title="Supprimer"
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:'var(--r2)', color:'var(--t4)', display:'flex', alignItems:'center', transition:'color 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t4)'}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px 0', flex: 1 }}>
        {project.description ? (
          <p className="f13 t3 clamp2" style={{ lineHeight: 1.6 }}>{project.description}</p>
        ) : (
          <p className="f12 t4" style={{ fontStyle: 'italic' }}>Aucune description</p>
        )}
      </div>

      {/* Footer */}
      <div className="pc-footer" style={{ padding: '10px 16px', marginTop: 'auto' }}>
        <span className="f12 t3" style={{ display:'flex', alignItems:'center', gap:4 }}>
          <Users size={11} color="var(--t4)" /> {project.member_count} membre{project.member_count !== 1 ? 's' : ''}
        </span>
        <span className="mla row g2">
          <span className="f11 t4">Modifié {timeAgo(project.updated_at)}</span>
          {project.owner?.nom && (
            <div className="av av-xs" title={project.owner.nom}>{initials(project.owner.nom)}</div>
          )}
        </span>
      </div>
    </div>
  );
}

/* ── Stat item ────────────────────────────────────────────────────── */
function StatItem({ icon, gradient, glow, value, label }) {
  return (
    <div className="stat-item">
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r4)', flexShrink: 0,
        background: gradient,
        boxShadow: `0 4px 12px ${glow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
      }}>
        {icon}
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="pg">
      {[1,2,3,4].map(i => (
        <div key={i} className="card col g3" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px 12px', borderBottom:'2px solid var(--border)' }}>
            <div className="row g2">
              <div className="skel" style={{ width:38, height:38, borderRadius:'var(--r4)', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div className="skel" style={{ height:14, width:'60%', marginBottom:6 }} />
                <div className="skel" style={{ height:16, width:50 }} />
              </div>
            </div>
          </div>
          <div style={{ padding:'12px 16px' }}>
            <div className="skel" style={{ height:13, width:'100%', marginBottom:6 }} />
            <div className="skel" style={{ height:13, width:'75%' }} />
          </div>
          <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)' }}>
            <div className="row g2">
              <div className="skel" style={{ height:12, width:80 }} />
              <div className="skel" style={{ height:12, width:60, marginLeft:'auto' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────── */
function EmptyState({ onCreate }) {
  return (
    <div className="empty">
      <span className="empty-ico">🗺️</span>
      <p className="f16 w7 t1" style={{ marginBottom: 8 }}>Aucun projet pour l'instant</p>
      <p className="f13 t3" style={{ marginBottom: 24 }}>Créez votre premier projet de cartographie applicative IT</p>
      <button onClick={onCreate} className="btn btn-p btn-lg">+ Créer un projet</button>
    </div>
  );
}
