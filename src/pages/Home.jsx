import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Gamepad2, Heart, Dices, Layers } from 'lucide-react';
import TopBar from '../components/TopBar';
import AdSlot from '../components/AdSlot';
import { useAuth } from '../auth/AuthContext';
import { getGames } from '../lib/storage';
import { isFavorited, toggleFavorite } from '../lib/userData';

const GUEST_FAVS_KEY = 'sopra_guest_favs_v1';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [busca, setBusca] = useState('');
  const [filtroConsole, setFiltroConsole] = useState('Todos');

  const [guestFavs, setGuestFavs] = useState(() => {
    const salvos = localStorage.getItem(GUEST_FAVS_KEY);
    return salvos ? JSON.parse(salvos) : [];
  });

  useEffect(() => {
    localStorage.setItem(GUEST_FAVS_KEY, JSON.stringify(guestFavs));
  }, [guestFavs]);

  const jogos = useMemo(() => {
    const all = getGames();
    return all.filter((g) => (g.status ?? 'published') === 'published');
  }, []);

  const toggleFav = (id) => {
    if (isAuthenticated) {
      toggleFavorite(user.id, id);
    } else {
      setGuestFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
  };

  const isFav = (id) => {
    if (isAuthenticated) return isFavorited(user.id, id);
    return guestFavs.includes(id);
  };

  const jogarAleatorio = () => {
    if (jogos.length === 0) return;
    const indiceAleatorio = Math.floor(Math.random() * jogos.length);
    const jogoSorteado = jogos[indiceAleatorio];
    navigate(`/jogar/${jogoSorteado.id}`);
  };

  const categorias = [
    'Todos',
    '❤️ Favoritos',
    ...Array.from(new Set(jogos.map((j) => j.console))).filter(Boolean),
  ];

  const jogosFiltrados = useMemo(() => {
    return jogos.filter((jogo) => {
      const bateBusca = (jogo.nome || jogo.title || '').toLowerCase().includes(busca.toLowerCase());
      let bateCategoria = true;
      if (filtroConsole === '❤️ Favoritos') {
        bateCategoria = isFav(jogo.id);
      } else if (filtroConsole !== 'Todos') {
        bateCategoria = jogo.console === filtroConsole;
      }
      return bateBusca && bateCategoria;
    });
  }, [busca, filtroConsole, jogos, isAuthenticated, guestFavs]);

  return (
    <div>
      <TopBar
        subtitle="retro games • instant play"
        right={
          <>
            <button className="btn" onClick={() => setFiltroConsole('❤️ Favoritos')} title="Favoritos">
              <Heart size={16} />
              Favoritos
            </button>
            <button className="btn btn-primary" onClick={jogarAleatorio} title="Estou com sorte!">
              <Dices size={16} />
              Aleatório
            </button>
          </>
        }
      />

      <div className="container">
        <section className="hero">
          <h1 className="title">Escolha um clássico e jogue agora.</h1>
          <p className="muted">
            Busque, filtre por console e salve seus favoritos. {isAuthenticated ? 'Tudo fica salvo na sua conta.' : 'Entre para sincronizar favoritos e histórico.'}
          </p>

          <div className="searchRow">
            <div className="searchWrap">
              <Search size={18} className="searchIcon" />
              <input
                className="input hasIcon"
                type="text"
                placeholder="Busque por jogo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="badge" title="Total de jogos">
              <Layers size={14} />
              <span>
                Biblioteca: <strong>{jogos.length}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                className="chip"
                data-active={filtroConsole === cat}
                onClick={() => setFiltroConsole(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <AdSlot placement="home-inline" compact />

        <section className="grid grid-cards" style={{ marginTop: 14 }}>
          {jogosFiltrados.length > 0 ? (
            jogosFiltrados.map((jogo) => (
              <div key={jogo.id} className="card">
                <div className="card-media">
                  <img src={jogo.capa} alt={jogo.nome || jogo.title} loading="lazy" />
                </div>

                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="card-title" title={jogo.nome || jogo.title}>{jogo.nome || jogo.title}</div>
                      <div className="badge" style={{ marginBottom: 10 }}>{jogo.console}</div>
                    </div>

                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFav(jogo.id);
                      }}
                      title={isFav(jogo.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart
                        size={18}
                        color={isFav(jogo.id) ? '#ff4d4d' : 'white'}
                        fill={isFav(jogo.id) ? '#ff4d4d' : 'none'}
                      />
                    </button>
                  </div>

                  <Link to={`/jogar/${jogo.id}`} aria-label={`Jogar ${jogo.nome || jogo.title}`}>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <Gamepad2 size={16} />
                      Jogar
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="glass" style={{ padding: 26, textAlign: 'center' }}>
              <Gamepad2 size={52} style={{ opacity: 0.55, marginBottom: 10 }} />
              <div className="title" style={{ fontSize: 18, marginBottom: 6 }}>Nada por aqui…</div>
              <p className="muted" style={{ marginBottom: 14 }}>
                {filtroConsole === '❤️ Favoritos'
                  ? 'Você ainda não favoritou nenhum jogo.'
                  : `Ainda não temos jogos de ${filtroConsole}.`}
              </p>
              {filtroConsole !== 'Todos' && (
                <button className="btn" onClick={() => setFiltroConsole('Todos')}>Ver todos</button>
              )}
            </div>
          )}
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="badge">
              <Layers size={14} />
              <span>
                <strong>{jogos.length}</strong> jogos prontos para jogar
              </span>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              © 2025 Sopra Fitas • Desenvolvido por <strong>Mariana Xavier</strong>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
