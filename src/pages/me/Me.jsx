import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, History, Users, UserRound, Shield, UploadCloud, FolderOpen } from 'lucide-react';
import TopBar from '../../components/TopBar';
import RequireAuth from '../../routes/RequireAuth';
import { useAuth } from '../../auth/AuthContext';
import { getGames } from '../../lib/storage';
import { getUserFavorites, getUserPlays, getUserFriends } from '../../lib/userData';

function MeInner() {
  const { user } = useAuth();
  const games = useMemo(() => getGames().filter((g) => g.status !== 'draft'), []);
  const favs = useMemo(() => getUserFavorites(user.id), [user.id]);
  const plays = useMemo(() => getUserPlays(user.id), [user.id]);
  const friends = useMemo(() => getUserFriends(user.id), [user.id]);

  const lastPlayed = plays[0]?.gameId;
  const lastGame = lastPlayed ? games.find((g) => g.id === lastPlayed) : null;

  return (
    <div>
      <TopBar subtitle="minha conta" />
      <div className="container" style={{ paddingTop: 26 }}>
        <div className="profileHeader glass panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div className="avatar">{(user.name || user.username || 'U').slice(0, 1).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div className="title" style={{ fontSize: 22, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div className="muted">@{user.username} • {user.email}</div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="muted2">Favoritos</div>
              <div className="title" style={{ fontSize: 18 }}>{favs.length}</div>
            </div>
            <div className="stat">
              <div className="muted2">Jogos jogados</div>
              <div className="title" style={{ fontSize: 18 }}>{plays.length}</div>
            </div>
            <div className="stat">
              <div className="muted2">Amigos</div>
              <div className="title" style={{ fontSize: 18 }}>{friends.length}</div>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', marginTop: 18 }}>
          <Link to="/me/my-games" className="glass panel navCard">
            <div className="navIcon"><FolderOpen size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Meus jogos</div>
              <div className="muted" style={{ fontSize: 13 }}>Privados, pendentes e aprovados.</div>
            </div>
          </Link>

          <Link to="/me/import" className="glass panel navCard">
            <div className="navIcon"><UploadCloud size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Importar ROMs</div>
              <div className="muted" style={{ fontSize: 13 }}>Suba sua pasta e jogue no navegador.</div>
            </div>
          </Link>

          <Link to="/me/profile" className="glass panel navCard">
            <div className="navIcon"><UserRound size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Meu perfil</div>
              <div className="muted" style={{ fontSize: 13 }}>Nome, usuário e email.</div>
            </div>
          </Link>

          <Link to="/me/favorites" className="glass panel navCard">
            <div className="navIcon"><Heart size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Favoritos</div>
              <div className="muted" style={{ fontSize: 13 }}>Seus jogos salvos.</div>
            </div>
          </Link>

          <Link to="/me/history" className="glass panel navCard">
            <div className="navIcon"><History size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Histórico</div>
              <div className="muted" style={{ fontSize: 13 }}>Últimos jogos que você abriu.</div>
            </div>
          </Link>

          <Link to="/me/friends" className="glass panel navCard">
            <div className="navIcon"><Users size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Amigos</div>
              <div className="muted" style={{ fontSize: 13 }}>Conecte e acompanhe.</div>
            </div>
          </Link>

          <Link to="/me/security" className="glass panel navCard">
            <div className="navIcon"><Shield size={18} /></div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Segurança</div>
              <div className="muted" style={{ fontSize: 13 }}>Alterar senha.</div>
            </div>
          </Link>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', marginTop: 18 }}>
          <div className="glass panel" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Continuar jogando</div>
            {lastGame ? (
              <Link to={`/jogar/${lastGame.id}`} className="continueCard">
                <img src={lastGame.capa} alt={lastGame.nome} />
                <div style={{ minWidth: 0 }}>
                  <div className="title" style={{ fontSize: 14, marginBottom: 6 }}>{lastGame.nome}</div>
                  <span className="badge">{lastGame.console}</span>
                </div>
                <div className="muted2">Abrir</div>
              </Link>
            ) : (
              <div className="muted" style={{ fontSize: 13 }}>Você ainda não jogou nenhum jogo. Vá para a Home e escolha um clássico 🙂</div>
            )}
          </div>

          <div className="glass panel" style={{ padding: 18 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Atalhos</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <Link to="/" className="btn" style={{ justifyContent: 'center' }}>Ver biblioteca</Link>
              <Link to="/me/my-games" className="btn" style={{ justifyContent: 'center' }}>Meus jogos</Link>
              <Link to="/me/import" className="btn" style={{ justifyContent: 'center' }}>Importar ROMs</Link>
              <Link to="/me/favorites" className="btn" style={{ justifyContent: 'center' }}>Meus favoritos</Link>
              <Link to="/me/friends" className="btn" style={{ justifyContent: 'center' }}>Gerenciar amigos</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Me() {
  return (
    <RequireAuth>
      <MeInner />
    </RequireAuth>
  );
}
