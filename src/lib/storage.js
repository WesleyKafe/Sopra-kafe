import { gamesList as seedGames } from '../data/games';

const KEYS = {
  users: 'sopra_users_v1',
  session: 'sopra_session_v1',
  games: 'sopra_games_v1',
  ads: 'sopra_ads_v1',
  plays: 'sopra_plays_v1',
  events: 'sopra_events_v1',
  presence: 'sopra_presence_v1',
  favorites: 'sopra_favorites_v1',
  friendRequests: 'sopra_friend_requests_v1',
  friends: 'sopra_friends_v1',
};

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function read(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  return safeParse(raw, fallback);
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid() {
  // good enough for client-side ids
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureSeed() {
  // users
  const users = read(KEYS.users, null);
  if (!users) {
    const adminId = uuid();
    const demoId = uuid();
    write(KEYS.users, [
      {
        id: adminId,
        name: 'Admin',
        username: 'admin',
        email: 'admin@soprafitas.com',
        // NOTE: demo only; do NOT store plain passwords in real apps
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: demoId,
        name: 'Convidado',
        username: 'convidado',
        email: 'convidado@soprafitas.com',
        password: '123456',
        role: 'user',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // ensure default accounts always exist (in case user already had older storage)
  const existingUsers = read(KEYS.users, []);
  const hasAdmin = existingUsers.some((u) => u.username === 'admin');
  const hasGuest = existingUsers.some((u) => u.username === 'convidado');
  if (!hasAdmin || !hasGuest) {
    const next = [...existingUsers];
    if (!hasAdmin) {
      next.unshift({
        id: uuid(),
        name: 'Admin',
        username: 'admin',
        email: 'admin@soprafitas.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
    if (!hasGuest) {
      next.push({
        id: uuid(),
        name: 'Convidado',
        username: 'convidado',
        email: 'convidado@soprafitas.com',
        password: '123456',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    }
    write(KEYS.users, next);
  }

  // games
  const games = read(KEYS.games, null);
  if (!games) {
    const seeded = seedGames.map((g) => ({
      ...g,
      title: g.nome,
      status: 'published',
      featured: false,
      tags: [],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));
    write(KEYS.games, seeded);
  }

  // ads
  const ads = read(KEYS.ads, null);
  if (!ads) {
    write(KEYS.ads, [
      {
        id: uuid(),
        title: 'Anuncie aqui',
        imageUrl: '',
        linkUrl: '#',
        ctaText: 'Saiba mais',
        placement: 'home-inline',
        active: true,
        startDate: '',
        endDate: '',
        frequency: 'always',
        targetingConsoles: [],
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // other collections
  for (const k of [KEYS.plays, KEYS.events, KEYS.presence, KEYS.favorites, KEYS.friendRequests, KEYS.friends]) {
    const v = read(k, null);
    if (!v) write(k, []);
  }
}

export function getUsers() {
  return read(KEYS.users, []);
}

export function saveUsers(users) {
  write(KEYS.users, users);
}

export function getSession() {
  return read(KEYS.session, null);
}

export function saveSession(session) {
  if (!session) localStorage.removeItem(KEYS.session);
  else write(KEYS.session, session);
}

export function getGames() {
  return read(KEYS.games, []);
}

export function saveGames(games) {
  write(KEYS.games, games);
}

export function getAds() {
  return read(KEYS.ads, []);
}

export function saveAds(ads) {
  write(KEYS.ads, ads);
}

export function getFavorites() {
  return read(KEYS.favorites, []);
}

export function saveFavorites(favs) {
  write(KEYS.favorites, favs);
}

export function getPlays() {
  return read(KEYS.plays, []);
}

export function savePlays(plays) {
  write(KEYS.plays, plays);
}

export function getEvents() {
  return read(KEYS.events, []);
}

export function saveEvents(events) {
  write(KEYS.events, events);
}

export function getPresence() {
  return read(KEYS.presence, []);
}

export function savePresence(presence) {
  write(KEYS.presence, presence);
}

export function getFriendRequests() {
  return read(KEYS.friendRequests, []);
}

export function saveFriendRequests(reqs) {
  write(KEYS.friendRequests, reqs);
}

export function getFriends() {
  return read(KEYS.friends, []);
}

export function saveFriends(friends) {
  write(KEYS.friends, friends);
}

export function makeId() {
  return uuid();
}

export const StorageKeys = KEYS;
