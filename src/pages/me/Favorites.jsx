import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import TopBar from '../../components/TopBar';
import RequireAuth from '../../routes/RequireAuth';
import { useAuth } from '../../auth/AuthContext';
import { getGames } from '../../lib/storage';
import { getUserFavorites, toggleFavorite } from '../../lib/userData';

function Inner() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const games = useMemo(() => getGames().filter((g) => g.status !== 'draft'), []);
  const favRecords = useMemo(() => getUserFavorites(user.id), [user.id, tick]);
  const favGames = favRecords
    .map((f) => games.find((g) => g.id === f.gameId))
    .filter(Boolean);

  return (
    <div>
      <TopBar subtitle="favoritos" right={<Link to="/me" className="btn">Voltar</Link>} />
      <div className="container" style={{ paddingTop: 26 }}>
        {favGames.length ? (
          <section className="grid grid-cards">
            {favGames.map((jogo) => (
              <div key={jogo.id} className="card">
                <div className="card-media">
                  <img src={jogo.capa} alt={jogo.nome} loading="lazy" />
                </div>
                <div className="card-body">
                  <div className="card-title" title={jogo.nome}>{jogo.nome}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span className="badge">{jogo.console}</span>
                    <button
                      className="icon-btn"
                      title="Remover"
                      onClick={() => {
                        toggleFavorite(user.id, jogo.id);
                        setTick((t) => t + 1);
                      }}
                    >
                      <HeartOff size={18} />
                    </button>
                  </div>
                  <Link to={`/jogar/${jogo.id}`}>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                      Jogar
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className="glass" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 6 }}>Sem favoritos ainda</div>
            <div className="muted" style={{ fontSize: 13 }}>Volte para a Home e clique no coração em qualquer jogo.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Favorites() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}
