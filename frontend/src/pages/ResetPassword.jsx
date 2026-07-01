import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/client';
import { LogoMark } from '../components/Logo';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, form.new_password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background: 'var(--bg)',
    }}>
      <div className="modal" style={{ maxWidth: 380, width:'100%', margin: 24 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 20 }}>
          <LogoMark size={28} />
          <span className="f15 w7 t1">Cartographe</span>
        </div>

        <h2 className="modal-title">Nouveau mot de passe</h2>

        {!token ? (
          <div className="alert alert-e">
            <span>⚠</span><span>Lien invalide ou manquant.</span>
          </div>
        ) : done ? (
          <div className="va">
            <div className="alert alert-s">
              <span>✓</span><span>Mot de passe réinitialisé avec succès !</span>
            </div>
            <button onClick={() => navigate('/login')} className="btn btn-p btn-fw" style={{ marginTop: 8 }}>
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="va">
            <p className="f13 t3" style={{ marginBottom: 4 }}>
              Choisissez un nouveau mot de passe pour votre compte.
            </p>

            <div className="fg">
              <label className="lbl">Nouveau mot de passe</label>
              <div className="inp-wrap">
                <input
                  className="inp"
                  name="new_password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={handle}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoFocus
                />
                <button type="button" className="inp-act" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="fg">
              <label className="lbl">Confirmer le mot de passe</label>
              <input
                className="inp"
                name="confirm"
                type={showPwd ? 'text' : 'password'}
                value={form.confirm}
                onChange={handle}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="alert alert-e" style={{ marginBottom: 0 }}>
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-p btn-fw">
              {loading ? <><span className="spin" /> Enregistrement…</> : 'Réinitialiser le mot de passe'}
            </button>

            <p className="f12 t3 tc">
              <button type="button" onClick={() => navigate('/login')}
                style={{ background:'none', border:'none', padding:0, cursor:'pointer', fontSize:'inherit', color:'var(--accent)' }}>
                Retour à la connexion
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
