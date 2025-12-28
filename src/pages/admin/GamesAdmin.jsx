import React, { useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { getGames, saveGames, makeId } from '../../lib/storage';

const empty = () => ({
  id: makeId(),
  nome: 'Novo jogo',
  title: 'Novo jogo',
  console: 'SNES',
  ano: '',
  fabricante: '',
  capa: '',
  descricao: '',
  url: '',
  core: 'snes',
  status: 'draft',
  featured: false,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function statusLabel(status) {
  const s = status ?? 'published';
  if (s === 'published') return 'Publicado';
  if (s === 'pending') return 'Pendente aprovação';
  if (s === 'private') return 'Privado';
  if (s === 'rejected') return 'Rejeitado';
  return 'Rascunho';
}

export default function GamesAdmin() {
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  const games = useMemo(() => getGames(), [tick]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => (g.nome || g.title || '').toLowerCase().includes(q) || (g.console || '').toLowerCase().includes(q));
  }, [games, query]);

  const selected = games.find((g) => g.id === selectedId) ?? null;

  const setField = (key, value) => {
    const next = games.map((g) => (g.id === selectedId ? { ...g, [key]: value, nome: key === 'title' ? value : g.nome, updatedAt: new Date().toISOString() } : g));
    saveGames(next);
    setTick((t) => t + 1);
  };

  const create = () => {
    const g = empty();
    saveGames([g, ...games]);
    setSelectedId(g.id);
    setTick((t) => t + 1);
  };

  const remove = () => {
    if (!selectedId) return;
    const next = games.filter((g) => g.id !== selectedId);
    saveGames(next);
    setSelectedId(null);
    setTick((t) => t + 1);
  };

  return (
    <div className="adminTwoCol">
      <div className="glass panel" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div className="title" style={{ fontSize: 14 }}>Games</div>
          <button className="btn" onClick={create}><Plus size={16} /> Novo</button>
        </div>

        <input className="input input-pill" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="buscar..." />

        <div className="adminList" style={{ marginTop: 12 }}>
          {filtered.map((g) => (
            <button
              key={g.id}
              className="adminListItem"
              data-active={g.id === selectedId}
              onClick={() => setSelectedId(g.id)}
            >
              <div style={{ minWidth: 0 }}>
                <div className="title" style={{ fontSize: 13, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.nome || g.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {g.console} • {statusLabel(g.status)}
                </div>
              </div>
              {g.featured ? <span className="badge">Destaque</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="glass panel" style={{ padding: 14 }}>
        {selected ? (
          <div className="form">
            <div className="title" style={{ fontSize: 14, marginBottom: 10 }}>Editar</div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <label className="field">
                <span className="fieldLabel">Título</span>
                <input className="input input-pill" value={selected.title ?? selected.nome ?? ''} onChange={(e) => setField('title', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">Console</span>
                <input className="input input-pill" value={selected.console ?? ''} onChange={(e) => setField('console', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">Capa (URL)</span>
                <input className="input input-pill" value={selected.capa ?? ''} onChange={(e) => setField('capa', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">Core (EmulatorJS)</span>
                <input className="input input-pill" value={selected.core ?? ''} onChange={(e) => setField('core', e.target.value)} placeholder="snes, n64, gba..." />
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span className="fieldLabel">ROM URL (public/...)</span>
                <input className="input input-pill" value={selected.url ?? ''} onChange={(e) => setField('url', e.target.value)} placeholder="/mario64.z64" />
              </label>
              <label className="field">
                <span className="fieldLabel">Ano</span>
                <input className="input input-pill" value={selected.ano ?? ''} onChange={(e) => setField('ano', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">Fabricante</span>
                <input className="input input-pill" value={selected.fabricante ?? ''} onChange={(e) => setField('fabricante', e.target.value)} />
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span className="fieldLabel">Descrição</span>
                <textarea className="input input-area" rows={4} value={selected.descricao ?? ''} onChange={(e) => setField('descricao', e.target.value)} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              <button className="btn" onClick={() => setField('status', (selected.status ?? 'published') === 'published' ? 'draft' : 'published')}>
                <Save size={16} /> {(selected.status ?? 'published') === 'published' ? 'Mover p/ rascunho' : 'Publicar'}
              </button>
              <button className="btn" onClick={() => setField('featured', !selected.featured)}>
                <Save size={16} /> {selected.featured ? 'Remover destaque' : 'Marcar destaque'}
              </button>
              <button className="btn" onClick={remove}>
                <Trash2 size={16} /> Excluir
              </button>
            </div>

            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              ID: <code>{selected.id}</code>
            </div>
          </div>
        ) : (
          <div className="muted" style={{ fontSize: 13 }}>Selecione um game na lista para editar.</div>
        )}
      </div>
    </div>
  );
}
