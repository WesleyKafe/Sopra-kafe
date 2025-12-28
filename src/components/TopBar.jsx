import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function TopBar({ subtitle, right }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <img src="/logo.jpg" alt="Sopra Fitas" />
          <div>
            <strong>Assopra Fitas</strong>
            <div className="muted2" style={{ fontSize: 12 }}>{subtitle ?? 'retro games • instant play'}</div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {right}

          {isAuthenticated ? (
            <>
              <button className="btn" onClick={() => navigate('/me')} title="Meu perfil">
                <User size={16} />
                {user?.username ?? 'Minha conta'}
              </button>
              {isAdmin ? (
                <button className="btn" onClick={() => navigate('/admin')} title="Admin">
                  <Shield size={16} />
                  Admin
                </button>
              ) : null}
              <button className="btn" onClick={() => { logout(); navigate('/'); }} title="Sair">
                <LogOut size={16} />
                Sair
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/login')} title="Entrar">
              <LogIn size={16} />
              Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
