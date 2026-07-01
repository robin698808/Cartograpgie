import { useState, useRef } from 'react';
import { updateMyProfile } from '../api/client';
import { useAuth } from '../api/AuthContext';

export default function ProfileModal({ onClose }) {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Resize to max 256px via canvas
      const img = new Image();
      img.onload = () => {
        const maxSize = 256;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setForm(f => ({ ...f, avatar: canvas.toDataURL('image/jpeg', 0.82) }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.new_password && form.new_password !== form.confirm_password) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    const payload = {
      nom:    form.nom    || undefined,
      prenom: form.prenom || undefined,
      email:  form.email  || undefined,
      phone:  form.phone  || undefined,
      avatar: form.avatar || undefined,
    };
    if (form.new_password) {
      payload.current_password = form.current_password;
      payload.new_password     = form.new_password;
    }

    setSaving(true);
    try {
      const res = await updateMyProfile(payload);
      setUser(res.data);
      setSuccess('Profil mis à jour avec succès');
      setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  function initials(nom) {
    if (!nom) return '?';
    return nom.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Mon profil</h2>
          <button onClick={onClose} className="btn btn-s btn-xs" style={{ fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom: 20, gap: 10 }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              width: 72, height: 72, borderRadius: '50%', cursor: 'pointer',
              background: form.avatar ? 'transparent' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: '#fff',
              overflow: 'hidden', border: '2px solid var(--border)',
              position: 'relative',
            }}
            title="Changer la photo"
          >
            {form.avatar
              ? <img src={form.avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : initials(form.nom)
            }
            <div style={{
              position:'absolute', inset:0, background:'rgba(0,0,0,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              opacity: 0, transition:'opacity 0.15s',
              fontSize: 18,
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >📷</div>
          </div>
          <button type="button" onClick={() => fileRef.current.click()} className="btn btn-s btn-xs">
            Changer la photo
          </button>
          {form.avatar && (
            <button type="button" onClick={() => setForm(f => ({ ...f, avatar: '' }))} className="btn btn-s btn-xs" style={{ color:'var(--red)' }}>
              Supprimer
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatar} />
        </div>

        <form onSubmit={submit} className="va">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label className="lbl">Nom</label>
              <input className="inp" name="nom" value={form.nom} onChange={handle} placeholder="Dupont" required />
            </div>
            <div className="fg">
              <label className="lbl">Prénom</label>
              <input className="inp" name="prenom" value={form.prenom} onChange={handle} placeholder="Jean" />
            </div>
          </div>

          <div className="fg">
            <label className="lbl">Email</label>
            <input className="inp" name="email" type="email" value={form.email} onChange={handle} required />
          </div>

          <div className="fg">
            <label className="lbl">Téléphone</label>
            <input className="inp" name="phone" type="tel" value={form.phone} onChange={handle} placeholder="+33 6 00 00 00 00" />
          </div>

          <hr className="divider" style={{ margin: '4px 0' }} />
          <p className="f12 t3" style={{ marginBottom: 4 }}>Changer le mot de passe <span className="t4">(laisser vide pour ne pas modifier)</span></p>

          <div className="fg">
            <label className="lbl">Mot de passe actuel</label>
            <input className="inp" name="current_password" type="password" value={form.current_password} onChange={handle} placeholder="••••••••" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label className="lbl">Nouveau mot de passe</label>
              <input className="inp" name="new_password" type="password" value={form.new_password} onChange={handle} placeholder="••••••••" />
            </div>
            <div className="fg">
              <label className="lbl">Confirmer</label>
              <input className="inp" name="confirm_password" type="password" value={form.confirm_password} onChange={handle} placeholder="••••••••" />
            </div>
          </div>

          {error && (
            <div className="alert alert-e" style={{ marginBottom: 0 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-s" style={{ marginBottom: 0 }}>
              <span>✓</span><span>{success}</span>
            </div>
          )}

          <div className="modal-row" style={{ marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-s" style={{ flex: 1 }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn btn-p" style={{ flex: 2 }}>
              {saving ? <><span className="spin" /> Enregistrement…</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
