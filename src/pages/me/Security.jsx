import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../auth/AuthContext';

export default function Security() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword !== confirm) {
      setMsg({ type: 'error', text: 'A confirmação não confere.' });
      return;
    }
    const res = changePassword({ currentPassword, newPassword });
    if (!res.ok) setMsg({ type: 'error', text: res.error || 'Não foi possível alterar.' });
    else {
      setMsg({ type: 'success', text: 'Senha alterada com sucesso.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    }
  };

  return (
    <div>
      <TopBar
        subtitle="segurança"
        right={
          <Link to="/me" className="btn">
            <ArrowLeft size={16} /> Voltar
          </Link>
        }
      />

      <div className="container" style={{ paddingTop: 26 }}>
        <div className="glass panel" style={{ padding: 18, maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="badge"><Shield size={14} /> Alterar senha</div>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Senha atual
              <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </label>

            <label className="muted" style={{ fontSize: 13 }}>
              Nova senha
              <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </label>

            <label className="muted" style={{ fontSize: 13 }}>
              Confirmar nova senha
              <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <button className="btn btn-primary" type="submit">Alterar</button>
              <Link className="btn" to="/me/profile">Editar perfil</Link>
            </div>

            {msg ? (
              <div className={msg.type === 'error' ? 'toast error' : 'toast success'}>{msg.text}</div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
