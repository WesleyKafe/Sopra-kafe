import { getFavorites, saveFavorites, getPlays, savePlays, getFriends, saveFriends, getFriendRequests, saveFriendRequests, makeId } from './storage';

export function toggleFavorite(userId, gameId) {
  const favs = getFavorites();
  const existing = favs.find((f) => f.userId === userId && f.gameId === gameId);
  let next;
  if (existing) next = favs.filter((f) => !(f.userId === userId && f.gameId === gameId));
  else next = [...favs, { id: makeId(), userId, gameId, createdAt: new Date().toISOString() }];
  saveFavorites(next);
  return next;
}

export function isFavorited(userId, gameId) {
  const favs = getFavorites();
  return favs.some((f) => f.userId === userId && f.gameId === gameId);
}

export function getUserFavorites(userId) {
  return getFavorites().filter((f) => f.userId === userId).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export function recordPlay(userId, gameId) {
  const plays = getPlays();
  const next = [...plays, { id: makeId(), userId, gameId, playedAt: new Date().toISOString() }];
  savePlays(next);
  return next;
}

export function getUserPlays(userId) {
  return getPlays().filter((p) => p.userId === userId).sort((a, b) => (b.playedAt ?? '').localeCompare(a.playedAt ?? ''));
}

export function getUserFriends(userId) {
  return getFriends().filter((f) => f.userId === userId);
}

export function areFriends(userId, otherId) {
  const friends = getFriends();
  return friends.some((f) => f.userId === userId && f.friendId === otherId);
}

export function sendFriendRequest(fromUserId, toUserId) {
  if (fromUserId === toUserId) return { ok: false, error: 'Você não pode adicionar você mesmo.' };
  if (areFriends(fromUserId, toUserId)) return { ok: false, error: 'Vocês já são amigos.' };

  const reqs = getFriendRequests();
  const already = reqs.find((r) => r.fromUserId === fromUserId && r.toUserId === toUserId && r.status === 'pending');
  if (already) return { ok: false, error: 'Solicitação já enviada.' };

  const next = [...reqs, { id: makeId(), fromUserId, toUserId, status: 'pending', createdAt: new Date().toISOString() }];
  saveFriendRequests(next);
  return { ok: true };
}

export function respondFriendRequest(requestId, action) {
  const reqs = getFriendRequests();
  const req = reqs.find((r) => r.id === requestId);
  if (!req) return { ok: false, error: 'Solicitação não encontrada.' };

  const status = action === 'accept' ? 'accepted' : 'declined';
  const nextReqs = reqs.map((r) => (r.id === requestId ? { ...r, status } : r));
  saveFriendRequests(nextReqs);

  if (status === 'accepted') {
    const friends = getFriends();
    const nextFriends = [...friends];
    // create mutual links
    if (!nextFriends.some((f) => f.userId === req.fromUserId && f.friendId === req.toUserId)) {
      nextFriends.push({ id: makeId(), userId: req.fromUserId, friendId: req.toUserId, createdAt: new Date().toISOString() });
    }
    if (!nextFriends.some((f) => f.userId === req.toUserId && f.friendId === req.fromUserId)) {
      nextFriends.push({ id: makeId(), userId: req.toUserId, friendId: req.fromUserId, createdAt: new Date().toISOString() });
    }
    saveFriends(nextFriends);
  }

  return { ok: true };
}

export function removeFriend(userId, friendId) {
  const friends = getFriends();
  const next = friends.filter((f) => !((f.userId === userId && f.friendId === friendId) || (f.userId === friendId && f.friendId === userId)));
  saveFriends(next);
  return next;
}

export function getIncomingRequests(userId) {
  return getFriendRequests().filter((r) => r.toUserId === userId && r.status === 'pending').sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export function getOutgoingRequests(userId) {
  return getFriendRequests().filter((r) => r.fromUserId === userId && r.status === 'pending').sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}
