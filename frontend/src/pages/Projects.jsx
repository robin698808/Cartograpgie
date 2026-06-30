import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api/client';
import { useAuth } from '../api/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ nom: '', description: '', visibility: 'private' });
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProject(newProject);
      setShowCreate(false);
      setNewProject({ nom: '', description: '', visibility: 'private' });
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer le projet "${nom}" ?`)) return;
    await deleteProject(id);
    load();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080F', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1A1A30', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🗺️</div>
          <span style={{ color: '#EEEEF8', fontWeight: 700, fontSize: 18 }}>Cartographe</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#6B6B9A', fontSize: 13 }}>
            👤 {user?.nom} {user?.role === 'admin' && <span style={{ color: '#818CF8', fontSize: 11 }}>ADMIN</span>}
          </span>
          <button onClick={logout} style={{
            background: 'transparent', border: '1px solid #2A2A44', borderRadius: 8,
            color: '#9090B8', padding: '6px 14px', fontSize: 13, cursor: 'pointer',
          }}>Déconnexion</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h2 style={{ color: '#EEEEF8', fontSize: 24, fontWeight: 700, margin: 0 }}>Mes projets</h2>
            <p style={{ color: '#6B6B9A', fontSize: 13, marginTop: 4 }}>
              {projects.length} projet{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none',
            borderRadius: 10, color: '#fff', padding: '10px 20px', fontWeight: 600,
            fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>+ Nouveau projet</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6B6B9A', padding: 80 }}>Chargement...</div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80, border: '2px dashed #1E1E3A',
            borderRadius: 16, color: '#6B6B9A',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Aucun projet pour l'instant</p>
            <p style={{ fontSize: 13 }}>Créez votre premier projet de cartographie applicative</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={() => navigate(`/canvas/${p.id}`)} onDelete={() => handleDelete(p.id, p.nom)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal création */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            background: '#0F0F1E', border: '1px solid #1E1E3A', borderRadius: 16,
            padding: 32, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#EEEEF8', marginBottom: 24, fontSize: 18, fontWeight: 700 }}>
              Nouveau projet
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nom du projet *</label>
                <input value={newProject.nom} onChange={(e) => setNewProject({ ...newProject, nom: e.target.value })}
                  placeholder="Ex: SI Groupe 2025" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Contexte de la mission..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Visibilité</label>
                <select value={newProject.visibility}
                  onChange={(e) => setNewProject({ ...newProject, visibility: e.target.value })}
                  style={inputStyle}>
                  <option value="private">Privé</option>
                  <option value="team">Équipe</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #2A2A44',
                  background: 'transparent', color: '#9090B8', cursor: 'pointer',
                }}>Annuler</button>
                <button type="submit" disabled={creating} style={{
                  flex: 2, padding: '10px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff', fontWeight: 600, cursor: 'pointer',
                }}>{creating ? 'Création...' : 'Créer le projet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen, onDelete }) {
  const statusColors = { private: '#6B6B9A', team: '#818CF8' };
  const ago = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 86400000);
    return d === 0 ? "aujourd'hui" : d === 1 ? 'hier' : `il y a ${d}j`;
  };

  return (
    <div onClick={onOpen} style={{
      background: '#0F0F1E', border: '1px solid #1A1A30', borderRadius: 14,
      padding: 24, cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A1A30'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h3 style={{ color: '#EEEEF8', fontSize: 16, fontWeight: 700, margin: 0, flex: 1 }}>{project.nom}</h3>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{
          background: 'transparent', border: 'none', color: '#4A4A6A', cursor: 'pointer',
          fontSize: 16, padding: 4, marginLeft: 8,
        }} title="Supprimer">🗑</button>
      </div>
      {project.description && (
        <p style={{ color: '#6B6B9A', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
          {project.description}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#4A4A6A' }}>
        <span>👤 {project.member_count} membre{project.member_count !== 1 ? 's' : ''}</span>
        <span>💾 {project.snapshot_count} version{project.snapshot_count !== 1 ? 's' : ''}</span>
        <span style={{ marginLeft: 'auto', color: statusColors[project.visibility] }}>
          {project.visibility === 'team' ? '👥 Équipe' : '🔒 Privé'}
        </span>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: '#3A3A5A' }}>
        Modifié {ago(project.updated_at)} · par {project.owner?.nom}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', color: '#9090B8', fontSize: 12, fontWeight: 600,
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E1E3A',
  background: '#0A0A1A', color: '#EEEEF8', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
