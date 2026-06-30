import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLatestSnapshot, saveSnapshot, getProjects } from '../api/client';
import { useAuth } from '../api/AuthContext';

export default function Canvas() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [presence, setPresence] = useState([]);
  const wsRef = useRef(null);
  const autoSaveRef = useRef(null);

  const snapshotRef = useRef(null);

  // Charger le projet + snapshot initial
  useEffect(() => {
    const load = async () => {
      const projects = await getProjects();
      const proj = projects.data.find((p) => p.id === parseInt(projectId));
      setProject(proj);

      try {
        const snap = await getLatestSnapshot(projectId);
        snapshotRef.current = snap.data;
      } catch {
        // Pas de snapshot = canvas vierge, OK
      }
    };
    load();
  }, [projectId]);

  // WebSocket collaboration
  useEffect(() => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8000/ws/${projectId}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'presence_init' || msg.type === 'user_joined' || msg.type === 'user_left') {
        setPresence(msg.presence || []);
      }
      // Relayer les mises à jour canvas à l'iframe
      if (['apps_update', 'flows_update', 'dom_colors_update'].includes(msg.type)) {
        iframeRef.current?.contentWindow.postMessage(msg, '*');
      }
    };

    ws.onerror = () => console.log('WS non disponible (normal en dev sans HTTPS)');

    return () => ws.close();
  }, [projectId]);

  // Écouter les messages de l'iframe (modifications canvas + CANVAS_READY)
  useEffect(() => {
    const handler = (e) => {
      if (!e.data?.type) return;
      const { type, payload } = e.data;

      // Canvas signale qu'il est prêt → on envoie le snapshot
      if (type === 'CANVAS_READY') {
        if (snapshotRef.current) {
          iframeRef.current?.contentWindow.postMessage({
            type: 'LOAD_SNAPSHOT',
            payload: snapshotRef.current,
          }, '*');
        }
        return;
      }

      // Canvas nous envoie son état → on le relaie via WS
      if (type === 'CANVAS_UPDATE' && wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: payload.updateType, payload }));
      }
      // Canvas demande une sauvegarde manuelle
      if (type === 'SAVE_REQUEST') {
        handleSave(payload);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      iframeRef.current?.contentWindow.postMessage({ type: 'REQUEST_STATE' }, '*');
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, []);

  const handleSave = async (state) => {
    if (!state) return;
    setSaving(true);
    try {
      await saveSnapshot(projectId, {
        apps: state.apps || [],
        flows: state.flows || [],
        dom_colors: state.domColors || {},
        label: 'Auto-save',
      });
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  };

  const manualSave = () => {
    iframeRef.current?.contentWindow.postMessage({ type: 'REQUEST_STATE' }, '*');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#08080F' }}>
      {/* Barre de contexte projet */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px',
        borderBottom: '1px solid #1A1A30', background: '#0A0A18', flexShrink: 0,
        zIndex: 10,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'transparent', border: '1px solid #2A2A44', borderRadius: 8,
          color: '#9090B8', padding: '5px 12px', fontSize: 12, cursor: 'pointer',
        }}>← Projets</button>

        <span style={{ color: '#6B6B9A', fontSize: 13 }}>|</span>
        <span style={{ color: '#EEEEF8', fontSize: 14, fontWeight: 600 }}>
          {project?.nom || 'Chargement...'}
        </span>

        {/* Présence */}
        {presence.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            {presence.filter((p) => p.user_id !== user?.id).map((p) => (
              <div key={p.user_id} style={{
                background: '#6366F1', borderRadius: 20, padding: '3px 10px',
                fontSize: 11, color: '#fff', fontWeight: 600,
              }}>👤 {p.nom}</div>
            ))}
          </div>
        )}

        {/* Sauvegarde */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastSaved && (
            <span style={{ color: '#4A4A6A', fontSize: 11 }}>
              ✓ Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={manualSave} disabled={saving} style={{
            background: saving ? '#2A2A44' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            border: 'none', borderRadius: 8, color: '#fff',
            padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Canvas iframe — charge ton HTML standalone existant */}
      <iframe
        ref={iframeRef}
        src="/canvas/cartographe.html"
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Canvas cartographique"
      />
    </div>
  );
}
