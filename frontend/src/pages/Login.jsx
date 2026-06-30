import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, getMe } from '../api/client';
import { useAuth } from '../api/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', nom: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ email: form.email, password: form.password, nom: form.nom });
      }
      const res = await login(form.email, form.password);
      localStorage.setItem('token', res.data.access_token);
      const me = await getMe();
      setUser(me.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#08080F', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: '#0F0F1E', border: '1px solid #1E1E3A', borderRadius: 16,
        padding: '40px', width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12,
          }}>🗺️</div>
          <h1 style={{ color: '#EEEEF8', fontSize: 22, fontWeight: 700, margin: 0 }}>Cartographe</h1>
          <p style={{ color: '#6B6B9A', fontSize: 13, marginTop: 4 }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte'}
          </p>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nom complet</label>
              <input name="nom" value={form.nom} onChange={handle} placeholder="Jean Dupont"
                required style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              placeholder="vous@entreprise.com" required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Mot de passe</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="••••••••" required style={inputStyle} />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#6B6B9A', fontSize: 13 }}>
          {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: '#818CF8', cursor: 'pointer', fontWeight: 600 }}>
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </span>
        </p>
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
  boxSizing: 'border-box',
};
