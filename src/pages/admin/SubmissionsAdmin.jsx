
import React, { useMemo, useState } from 'react';
import { getGames, saveGames } from '../../lib/storage';

export default function SubmissionsAdmin() {
  const [q, setQ] = useState('');

  const pendentes = useMemo(() => {
    return getGames()
      .filter((g) => (g.status ?? 'published') === 'pending')
      .filter((g) => (g.nome || '').toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [q]);

  const updateStatus = (id, status) => {
    const all = getGames();
    const next = all.map((g) => (g.id === id ? { ...g, status, reviewedAt: Date.now() } : g));
    saveGames(next);
    window.location.reload();
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="title" style={{ fontSize: 18 }}>Pendentes de aprovação</div>
      <div className="glass panel" style={{ padding: 14 }}>
          <h2>Aprovações (Jogos enviados para o público)</h2>
          <p className="muted">Aprovar publica o jogo na Home. Rejeitar mantém no usuário com status “rejeitado”.</p>

          <input
            className="input"
            placeholder="Buscar pendências..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ marginTop: 12 }}
          />

          <div className="gridCards" style={{ marginTop: 16 }}>
            {pendentes.length === 0 ? (
              <div className="muted">Nenhum jogo pendente.</div>
            ) : (
              pendentes.map((g) => (
                <div key={g.id} className="gameCard">
                  <div className="gameCover" style={{ backgroundImage: `url(${g.capa || ''})` }} />
                  <div className="gameBody">
                    <div className="rowBetween">
                      <div>
                        <div className="gameTitle">{g.nome}</div>
                        <div className="muted">
                          {g.console} • enviado por <b>{g.owner}</b>
                        </div>
                      </div>
                      <span className="badge">Pendente</span>
                    </div>

                    <div className="muted clamp2" style={{ marginTop: 8 }}>
                      {g.descricao}
                    </div>

                    <div className="rowBetween" style={{ marginTop: 12 }}>
                      <button className="btn primary" onClick={() => updateStatus(g.id, 'published')}>
                        Aprovar
                      </button>
                      <button className="btn danger" onClick={() => updateStatus(g.id, 'rejected')}>
                        Rejeitar
                      </button>
                    </div>

                    {g.wiki?.pageUrl && (
                      <a className="muted" href={g.wiki.pageUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10 }}>
                        Fonte: Wikipedia ({g.wiki.lang})
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );
}
