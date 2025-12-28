import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? '/';

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const canSubmit = useMemo(() => emailOrUsername.trim() && password.trim(), [emailOrUsername, password]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login({ emailOrUsername, password });
    if (!res.ok) return setError(res.error);
    navigate(from);
  };

  return (
    <div>
      <TopBar subtitle="entrar" />
      <div className="container" style={{ paddingTop: 26 }}>
        <div className="authGrid">
          <div className="glass panel" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 24, marginBottom: 6 }}>Bem-vindo(a) de volta</div>
            <div className="muted" style={{ marginBottom: 14 }}>
              Entre para salvar favoritos, ver seu histórico e acompanhar seus amigos.
            </div>

            <form onSubmit={onSubmit} className="form">
              <label className="field">
                <span className="fieldLabel"><Mail size={14} /> Email ou usuário</span>
                <input className="input input-pill" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="ex: admin@soprafitas.com" />
              </label>

              <label className="field">
                <span className="fieldLabel"><Lock size={14} /> Senha</span>
                <input type="password" className="input input-pill" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </label>

              {error ? <div className="alert">{error}</div> : null}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={!canSubmit}>
                <User size={16} /> Entrar
              </button>

              <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                Não tem conta? <Link to="/register">Criar agora</Link>
              </div>

              <div className="muted" style={{ fontSize: 12, marginTop: 14 }}>
                <strong>Demos:</strong> admin / admin123  •  convidado / 123456
              </div>
            </form>
          </div>

          <div className="glass panel" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>O que você ganha com a conta</div>
            <ul className="bullets">
              <li>⭐ Favoritos sincronizados</li>
              <li>🕹️ Histórico de jogos jogados</li>
              <li>👥 Amigos e atividade</li>
              <li>🛠️ Acesso ao Admin (para quem for admin)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
