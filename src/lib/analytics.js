import { getEvents, saveEvents, makeId } from './storage';

/**
 * Demo analytics using localStorage.
 * In production, this should be server-side.
 */
export function trackEvent(type, payload = {}) {
  const events = getEvents();
  const next = [
    {
      id: makeId(),
      type,
      payload,
      createdAt: new Date().toISOString(),
    },
    ...events,
  ];
  // keep last 10k events to avoid unbounded growth
  saveEvents(next.slice(0, 10000));
  return next;
}

export function getTopGamesByPeriod({ games, period }) {
  // period: 'day' | 'week' | 'month'
  const now = Date.now();
  const ms =
    period === 'day'
      ? 24 * 60 * 60 * 1000
      : period === 'week'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
  const since = now - ms;

  const events = getEvents();
  const counts = new Map();
  for (const e of events) {
    if (e.type !== 'game_view') continue;
    const t = Date.parse(e.createdAt);
    if (Number.isNaN(t) || t < since) continue;
    const gameId = e.payload?.gameId;
    if (!gameId) continue;
    counts.set(gameId, (counts.get(gameId) ?? 0) + 1);
  }

  const rows = [...counts.entries()]
    .map(([gameId, views]) => {
      const g = games.find((x) => x.id === gameId);
      return {
        gameId,
        views,
        title: g?.nome || g?.title || 'Jogo',
        console: g?.console || '',
        cover: g?.capa || '',
      };
    })
    .sort((a, b) => b.views - a.views);

  return rows;
}
