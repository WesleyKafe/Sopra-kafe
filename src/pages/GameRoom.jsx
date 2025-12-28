import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Emulator from '../components/Emulator';
import TopBar from '../components/TopBar';
import AdSlot from '../components/AdSlot';
import {
  Calendar,
  Gamepad,
  Info,
  ArrowRight,
  Download,
  Upload,
  RotateCcw,
  Maximize,
  ArrowLeft,
  Heart,
} from 'lucide-react';
import { getGames } from '../lib/storage';
import { useAuth } from '../auth/AuthContext';
import { getRom } from '../lib/romStore';
import { isFavorited, recordPlay, toggleFavorite } from '../lib/userData';

const GUEST_FAVS_KEY = 'sopra_guest_favs_v1';

const GameRoom = () => {
  const { gameId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [romObjectUrl, setRomObjectUrl] = useState(null);
  const [guestFavs, setGuestFavs] = useState(() => {
    const salvos = localStorage.getItem(GUEST_FAVS_KEY);
    return salvos ? JSON.parse(salvos) : [];
  });

  const games = useMemo(() => getGames(), []);
  const jogoAtual = useMemo(() => games.find((g) => g.id === gameId) ?? null, [games, gameId]);

  useEffect(() => {
    let revoke = null;
    async function loadRom() {
      try {
        if (!jogoAtual?.url?.startsWith('rom://')) {
          setRomObjectUrl(null);
          return;
        }
        const path = jogoAtual.url.replace('rom://', '');
        const rec = await getRom(path);
        if (!rec?.blob) {
          setRomObjectUrl(null);
          return;
        }
        const obj = URL.createObjectURL(rec.blob);
        revoke = obj;
        setRomObjectUrl(obj);
      } catch {
        setRomObjectUrl(null);
      }
    }
    loadRom();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [jogoAtual?.url]);

  
  const podeVer =
    !!jogoAtual &&
    ((jogoAtual.status ?? 'published') === 'published' ||
      (isAuthenticated && (user?.role === 'admin' || user?.username === jogoAtual.owner)));

useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameId]);

  useEffect(() => {
    if (isAuthenticated && user?.id && gameId) {
      recordPlay(user.id, gameId);
    }
  }, [isAuthenticated, user?.id, gameId]);

  useEffect(() => {
    localStorage.setItem(GUEST_FAVS_KEY, JSON.stringify(guestFavs));
  }, [guestFavs]);

  const isFav = (id) => {
    if (isAuthenticated) return isFavorited(user.id, id);
    return guestFavs.includes(id);
  };

  const toggleFav = () => {
    if (!jogoAtual) return;
    if (isAuthenticated) toggleFavorite(user.id, jogoAtual.id);
    else setGuestFavs((prev) => (prev.includes(jogoAtual.id) ? prev.filter((x) => x !== jogoAtual.id) : [...prev, jogoAtual.id]));
  };

  const salvarJogo = () => { if (window.EJS_player) window.EJS_player.saveState(); };
  const carregarJogo = () => { if (window.EJS_player) window.EJS_player.loadState(); };
  const reiniciarJogo = () => { if (window.EJS_player) window.EJS_player.restart(); };
  const telaCheia = () => {
    if (window.EJS_player) { try { window.EJS_player.maximize(); } catch (e) { } }
    const elem = document.getElementById('tela-do-jogo');
    if (elem) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    }
  };

  const relacionados = useMemo(() => {
    return games.filter((j) => j.id !== gameId).slice(0, 2);
  }, [gameId, games]);

  return (
    <div>
      <TopBar
        subtitle={jogoAtual ? `jogando: ${jogoAtual.nome || jogoAtual.title}` : 'jogo'}
        right={
          <Link to="/" className="btn" aria-label="Voltar">
            <ArrowLeft size={16} />
            Voltar
          </Link>
        }
      />

      <div className="container">
        <div className="gameLayout">
          <aside className="adBox" style={{ display: isMobile ? 'none' : 'block' }}>
            <AdSlot placement="game-room-side" />
          </aside>

          <main>
            {jogoAtual ? (
              <>
                <div className="gameRoomHeader" style={{ marginBottom: 12 }}>
                  <div className="badge">{jogoAtual.console}</div>
                  <button className="btn" onClick={toggleFav} title={isFav(jogoAtual.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                    <Heart size={16} fill={isFav(jogoAtual.id) ? '#ff4d4d' : 'none'} color={isFav(jogoAtual.id) ? '#ff4d4d' : 'white'} />
                    {isFav(jogoAtual.id) ? 'Favorito' : 'Favoritar'}
                  </button>
                </div>

                <div id="tela-do-jogo" className="playerFrame" style={{ aspectRatio: '4/3' }}>
                  <Emulator gameUrl={romObjectUrl || jogoAtual.url} core={jogoAtual.core} />
                </div>

                <div className="playerActions">
                  <button className="btn" onClick={salvarJogo}>
                    <Download size={16} />
                    Salvar
                  </button>
                  <button className="btn" onClick={carregarJogo}>
                    <Upload size={16} />
                    Carregar
                  </button>
                  <button className="btn" onClick={reiniciarJogo}>
                    <RotateCcw size={16} />
                    Reiniciar
                  </button>
                  <button className="btn btn-primary" onClick={telaCheia}>
                    <Maximize size={16} />
                    Tela cheia
                  </button>
                </div>

                <section className="glass panel" style={{ marginTop: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h1 className="title" style={{ fontSize: 22, marginBottom: 6 }}>
                        {jogoAtual.nome || jogoAtual.title}
                      </h1>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {jogoAtual.ano ? (
                          <span className="badge">
                            <Calendar size={14} /> {jogoAtual.ano}
                          </span>
                        ) : null}
                        {jogoAtual.fabricante ? (
                          <span className="badge">
                            <Gamepad size={14} /> {jogoAtual.fabricante}
                          </span>
                        ) : null}
                        {jogoAtual.console ? <span className="badge">{jogoAtual.console}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
                      gap: 16,
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      <div className="badge" style={{ marginBottom: 10 }}>
                        <Info size={14} /> Sobre
                      </div>
                      <p className="muted" style={{ lineHeight: 1.7 }}>
                        {jogoAtual.descricao}
                      </p>
                    </div>

                    {!isMobile && (
                      <div className="glass" style={{ padding: 14, borderRadius: 14 }}>
                        <div className="title" style={{ fontSize: 14, marginBottom: 10 }}>
                          Comandos (PC)
                        </div>
                        <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span className="muted">Mover</span>
                            <strong>Setas</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span className="muted">Ação</span>
                            <strong>Z, X, A, S</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <span className="muted">Start/Select</span>
                            <strong>Enter / Shift</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div className="title" style={{ fontSize: 16 }}>Veja também</div>
                    <ArrowRight size={16} style={{ opacity: 0.8 }} />
                  </div>
                  <div className="relatedGrid">
                    {relacionados.map((jogo) => (
                      <Link key={jogo.id} to={`/jogar/${jogo.id}`} style={{ textDecoration: 'none' }}>
                        <div className="relatedItem">
                          <img src={jogo.capa} alt={jogo.nome || jogo.title} loading="lazy" />
                          <div style={{ minWidth: 0 }}>
                            <div className="card-title" style={{ fontSize: 13, marginBottom: 6 }} title={jogo.nome || jogo.title}>
                              {jogo.nome || jogo.title}
                            </div>
                            <span className="badge">{jogo.console}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div className="glass" style={{ padding: 22, textAlign: 'center' }}>
                <div className="title" style={{ fontSize: 18, marginBottom: 6 }}>Jogo não encontrado</div>
                <p className="muted" style={{ marginBottom: 14 }}>
                  Esse ID não existe na biblioteca.
                </p>
                <Link to="/" className="btn btn-primary">Voltar para a Home</Link>
              </div>
            )}
          </main>

          <aside className="adBox" style={{ display: isMobile ? 'none' : 'block' }}>
            <AdSlot placement="game-room-side" />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
