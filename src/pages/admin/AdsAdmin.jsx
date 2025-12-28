import React, { useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { getAds, saveAds, makeId } from '../../lib/storage';

const empty = () => ({
  id: makeId(),
  title: 'Novo anúncio',
  imageUrl: '',
  linkUrl: '#',
  ctaText: 'Saiba mais',
  placement: 'game-room-side',
  active: true,
  startDate: '',
  endDate: '',
  frequency: 'always',
  targetingConsoles: [],
  createdAt: new Date().toISOString(),
});

export default function AdsAdmin() {
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  const ads = useMemo(() => getAds(), [tick]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ads;
    return ads.filter((a) => (a.title || '').toLowerCase().includes(q) || (a.placement || '').toLowerCase().includes(q));
  }, [ads, query]);

  const selected = ads.find((a) => a.id === selectedId) ?? null;

  const setField = (key, value) => {
    const next = ads.map((a) => (a.id === selectedId ? { ...a, [key]: value } : a));
    saveAds(next);
    setTick((t) => t + 1);
  };

  const create = () => {
    const a = empty();
    saveAds([a, ...ads]);
    setSelectedId(a.id);
    setTick((t) => t + 1);
  };

  const remove = () => {
    if (!selectedId) return;
    const next = ads.filter((a) => a.id !== selectedId);
    saveAds(next);
    setSelectedId(null);
    setTick((t) => t + 1);
  };

  return (
    <div className="adminTwoCol">
      <div className="glass panel" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div className="title" style={{ fontSize: 14 }}>Ads</div>
          <button className="btn" onClick={create}><Plus size={16} /> Novo</button>
        </div>

        <input className="input input-pill" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="buscar..." />

        <div className="adminList" style={{ marginTop: 12 }}>
          {filtered.map((a) => (
            <button
              key={a.id}
              className="adminListItem"
              data-active={a.id === selectedId}
              onClick={() => setSelectedId(a.id)}
            >
              <div style={{ minWidth: 0 }}>
                <div className="title" style={{ fontSize: 13, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>{a.placement} • {a.active ? 'Ativo' : 'Pausado'}</div>
              </div>
              {a.active ? <span className="badge">ON</span> : <span className="badge">OFF</span>}
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
                <input className="input input-pill" value={selected.title ?? ''} onChange={(e) => setField('title', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">Placement</span>
                <select className="input input-pill" value={selected.placement ?? ''} onChange={(e) => setField('placement', e.target.value)}>
                  <option value="home-inline">home-inline</option>
                  <option value="game-room-side">game-room-side</option>
                </select>
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span className="fieldLabel">Imagem (URL)</span>
                <input className="input input-pill" value={selected.imageUrl ?? ''} onChange={(e) => setField('imageUrl', e.target.value)} placeholder="https://..." />
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span className="fieldLabel">Link</span>
                <input className="input input-pill" value={selected.linkUrl ?? ''} onChange={(e) => setField('linkUrl', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">CTA</span>
                <input className="input input-pill" value={selected.ctaText ?? ''} onChange={(e) => setField('ctaText', e.target.value)} />
              </label>
              <label className="field">
                <span className="fieldLabel">Ativo</span>
                <select className="input input-pill" value={selected.active ? 'true' : 'false'} onChange={(e) => setField('active', e.target.value === 'true')}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              <button className="btn" onClick={() => setField('active', !selected.active)}>
                <Save size={16} /> {selected.active ? 'Pausar' : 'Ativar'}
              </button>
              <button className="btn" onClick={remove}>
                <Trash2 size={16} /> Excluir
              </button>
            </div>

            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              Dica: se não tiver imagem, vai aparecer um card simples com título e CTA.
            </div>
          </div>
        ) : (
          <div className="muted" style={{ fontSize: 13 }}>Selecione um anúncio na lista para editar.</div>
        )}
      </div>
    </div>
  );
}
