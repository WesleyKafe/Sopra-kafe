import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Lock, Mail, User } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../auth/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => name.trim() && username.trim() && email.trim() && password.trim().length >= 4, [name, username, email, password]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = register({ name: name.trim(), username: username.trim(), email: email.trim(), password });
    if (!res.ok) return setError(res.error);
    navigate('/me');
  };

  return (
    <div>
      <TopBar subtitle="criar conta" />
      <div className="container" style={{ paddingTop: 26 }}>
        <div className="authGrid">
          <div className="glass panel" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 24, marginBottom: 6 }}>Criar conta</div>
            <div className="muted" style={{ marginBottom: 14 }}>
              Leva 1 minuto. Depois você já consegue favoritar e salvar seu histórico.
            </div>

            <form onSubmit={onSubmit} className="form">
              <label className="field">
                <span className="fieldLabel"><User size={14} /> Nome</span>
                <input className="input input-pill" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
              </label>

              <label className="field">
                <span className="fieldLabel"><AtSign size={14} /> Usuário</span>
                <input className="input input-pill" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex: mariana" />
              </label>

              <label className="field">
                <span className="fieldLabel"><Mail size={14} /> Email</span>
                <input className="input input-pill" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
              </label>

              <label className="field">
                <span className="fieldLabel"><Lock size={14} /> Senha</span>
                <input type="password" className="input input-pill" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 4 caracteres" />
              </label>

              {error ? <div className="alert">{error}</div> : null}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={!canSubmit}>
                <User size={16} /> Criar e entrar
              </button>

              <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>
                Já tem conta? <Link to="/login">Entrar</Link>
              </div>
            </form>
          </div>

          <div className="glass panel" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Dicas</div>
            <ul className="bullets">
              <li>Escolha um usuário único (vai aparecer na lista de amigos).</li>
              <li>Senha fica salva só no seu navegador (demo). Em produção, use backend.</li>
              <li>Quer Admin? use a conta demo: <strong>admin</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
