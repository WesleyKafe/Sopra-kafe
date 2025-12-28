
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../auth/AuthContext';
import { getGames, saveGames } from '../../lib/storage';

const STATUS_LABEL = {
  private: 'Privado',
  pending: 'Aguardando aprovação',
  published: 'Público',
  rejected: 'Rejeitado',
};

export default function MyGames() {
  const { user, isAuthenticated } = useAuth();
  const [q, setQ] = useState('');

  const jogos = useMemo(() => {
    if (!isAuthenticated) return [];
    const all = getGames();
    return all
      .filter((g) => g.owner === user.username)
      .filter((g) => (g.nome || '').toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [isAuthenticated, user?.username, q]);

  const remover = (id) => {
    const all = getGames();
    const next = all.filter((g) => g.id !== id);
    saveGames(next);
    window.location.reload();
  };

  return (
    <div className="appShell">
      <TopBar />
      <div className="container">
        <div className="card">
          <div className="rowBetween">
            <h2>Meus Jogos</h2>
            <Link className="btn primary" to="/me/import">
              Importar ROMs
            </Link>
          </div>

          <input
            className="input"
            placeholder="Buscar nos seus jogos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ marginTop: 12 }}
          />

          <div className="gridCards" style={{ marginTop: 16 }}>
            {jogos.length === 0 ? (
              <div className="muted">Você ainda não importou jogos. Clique em “Importar ROMs”.</div>
            ) : (
              jogos.map((j) => (
                <div key={j.id} className="gameCard">
                  <div className="gameCover" style={{ backgroundImage: `url(${j.capa || ''})` }} />
                  <div className="gameBody">
                    <div className="rowBetween">
                      <div>
                        <div className="gameTitle">{j.nome}</div>
                        <div className="muted">{j.console}</div>
                      </div>
                      <span className="badge">{STATUS_LABEL[j.status] || j.status}</span>
                    </div>

                    <div className="muted clamp2" style={{ marginTop: 8 }}>
                      {j.descricao}
                    </div>

                    <div className="rowBetween" style={{ marginTop: 12 }}>
                      <Link className="btn" to={`/jogar/${j.id}`}>
                        Jogar
                      </Link>
                      <button className="btn danger" onClick={() => remover(j.id)}>
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
