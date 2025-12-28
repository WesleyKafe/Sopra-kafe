import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../auth/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setName(user?.name || '');
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user?.id]);

  const onSubmit = (e) => {
    e.preventDefault();
    setMsg(null);
    const res = updateProfile({ name, username, email });
    if (!res.ok) setMsg({ type: 'error', text: res.error || 'Não foi possível salvar.' });
    else setMsg({ type: 'success', text: 'Perfil atualizado com sucesso.' });
  };

  return (
    <div>
      <TopBar
        subtitle="perfil"
        right={
          <Link to="/me" className="btn">
            <ArrowLeft size={16} /> Voltar
          </Link>
        }
      />

      <div className="container" style={{ paddingTop: 26 }}>
        <div className="glass panel" style={{ padding: 18, maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="badge"><UserRound size={14} /> Dados do perfil</div>
          </div>

          <form onSubmit={onSubmit} className="form" style={{ display: 'grid', gap: 10 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Nome
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="muted" style={{ fontSize: 13 }}>
              Usuário
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>

            <label className="muted" style={{ fontSize: 13 }}>
              Email
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <button className="btn btn-primary" type="submit">Salvar</button>
              <Link className="btn" to="/me/security">Alterar senha</Link>
              <Link className="btn" to="/me/my-games">Meus jogos</Link>
              <Link className="btn" to="/me/import">Importar ROMs</Link>
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
