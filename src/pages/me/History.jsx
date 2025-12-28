import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import TopBar from '../../components/TopBar';
import RequireAuth from '../../routes/RequireAuth';
import { useAuth } from '../../auth/AuthContext';
import { getGames } from '../../lib/storage';
import { getUserPlays } from '../../lib/userData';

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

function Inner() {
  const { user } = useAuth();
  const games = useMemo(() => getGames().filter((g) => g.status !== 'draft'), []);
  const plays = useMemo(() => getUserPlays(user.id).slice(0, 50), [user.id]);

  return (
    <div>
      <TopBar subtitle="histórico" right={<Link to="/me" className="btn">Voltar</Link>} />
      <div className="container" style={{ paddingTop: 26 }}>
        {plays.length ? (
          <div className="glass panel" style={{ padding: 14 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Últimos jogos abertos</div>
            <div className="list">
              {plays.map((p) => {
                const g = games.find((x) => x.id === p.gameId);
                if (!g) return null;
                return (
                  <Link key={p.id} to={`/jogar/${g.id}`} className="listRow">
                    <img src={g.capa} alt={g.nome} />
                    <div style={{ minWidth: 0 }}>
                      <div className="title" style={{ fontSize: 13, marginBottom: 4 }}>{g.nome}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge">{g.console}</span>
                        <span className="badge"><Clock size={14} /> {formatWhen(p.playedAt)}</span>
                      </div>
                    </div>
                    <div className="muted2">Abrir</div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="glass" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 6 }}>Sem histórico</div>
            <div className="muted" style={{ fontSize: 13 }}>Abra qualquer jogo e ele vai aparecer aqui.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function History() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}
