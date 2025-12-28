import { getPresence, savePresence, makeId } from './storage';

const CLIENT_ID_KEY = 'sopra_client_id_v1';

function getClientId() {
  // sessionStorage: unique per tab
  let id = sessionStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = makeId();
    sessionStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

const STALE_MS = 35 * 1000;

export function writePresence({ userId, pathname, gameId }) {
  const clientId = getClientId();
  const nowIso = new Date().toISOString();
  const now = Date.now();

  const current = getPresence();
  // drop stale entries
  const fresh = current.filter((p) => {
    const t = Date.parse(p.updatedAt);
    return !Number.isNaN(t) && now - t < STALE_MS;
  });

  const next = fresh.some((p) => p.clientId === clientId)
    ? fresh.map((p) =>
        p.clientId === clientId ? { ...p, userId: userId || null, pathname, gameId: gameId || null, updatedAt: nowIso } : p
      )
    : [{ clientId, userId: userId || null, pathname, gameId: gameId || null, updatedAt: nowIso }, ...fresh];

  savePresence(next);
  return next;
}

export function cleanupPresence() {
  const now = Date.now();
  const current = getPresence();
  const next = current.filter((p) => {
    const t = Date.parse(p.updatedAt);
    return !Number.isNaN(t) && now - t < STALE_MS;
  });
  if (next.length !== current.length) savePresence(next);
  return next;
}

export function getOnlinePresence() {
  return cleanupPresence();
}
