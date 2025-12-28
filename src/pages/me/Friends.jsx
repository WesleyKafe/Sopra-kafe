import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Send, UserPlus, X } from 'lucide-react';
import TopBar from '../../components/TopBar';
import RequireAuth from '../../routes/RequireAuth';
import { useAuth } from '../../auth/AuthContext';
import { getUsers } from '../../lib/storage';
import { areFriends, getIncomingRequests, getOutgoingRequests, getUserFriends, removeFriend, respondFriendRequest, sendFriendRequest } from '../../lib/userData';

function Inner() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [tick, setTick] = useState(0);

  const users = useMemo(() => getUsers(), []);
  const friends = useMemo(() => getUserFriends(user.id), [user.id, tick]);
  const incoming = useMemo(() => getIncomingRequests(user.id), [user.id, tick]);
  const outgoing = useMemo(() => getOutgoingRequests(user.id), [user.id, tick]);

  const friendUsers = friends
    .map((f) => users.find((u) => u.id === f.friendId))
    .filter(Boolean);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users
      .filter((u) => u.id !== user.id)
      .filter((u) => (u.username || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, users, user.id]);

  const send = (toUserId) => {
    setMsg('');
    const res = sendFriendRequest(user.id, toUserId);
    if (!res.ok) setMsg(res.error);
    else setMsg('Solicitação enviada!');
    setTick((t) => t + 1);
  };

  const respond = (id, action) => {
    setMsg('');
    const res = respondFriendRequest(id, action);
    if (!res.ok) setMsg(res.error);
    else setMsg(action === 'accept' ? 'Amizade adicionada!' : 'Solicitação recusada.');
    setTick((t) => t + 1);
  };

  return (
    <div>
      <TopBar subtitle="amigos" right={<Link to="/me" className="btn">Voltar</Link>} />
      <div className="container" style={{ paddingTop: 26 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="glass panel" style={{ padding: 14 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Encontrar pessoas</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input className="input input-pill" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="buscar por nome ou @usuario" />
              <div className="badge"><Send size={14} /> Buscar</div>
            </div>

            {msg ? <div className="alert" style={{ marginTop: 10 }}>{msg}</div> : null}

            <div className="list" style={{ marginTop: 12 }}>
              {results.length ? results.map((u) => {
                const isFriend = areFriends(user.id, u.id);
                const hasOutgoing = outgoing.some((r) => r.toUserId === u.id);
                return (
                  <div key={u.id} className="listRow" style={{ cursor: 'default' }}>
                    <div className="avatar avatar-sm">{(u.name || u.username).slice(0, 1).toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="title" style={{ fontSize: 13, marginBottom: 2 }}>{u.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>@{u.username}</div>
                    </div>
                    {isFriend ? (
                      <span className="badge">Amigo</span>
                    ) : (
                      <button className="btn" disabled={hasOutgoing} onClick={() => send(u.id)}>
                        <UserPlus size={16} /> {hasOutgoing ? 'Pendente' : 'Adicionar'}
                      </button>
                    )}
                  </div>
                );
              }) : (
                <div className="muted" style={{ fontSize: 13, padding: 10 }}>Digite algo para buscar.</div>
              )}
            </div>
          </div>

          <div className="glass panel" style={{ padding: 14 }}>
            <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Solicitações</div>
            {incoming.length ? (
              <div className="list">
                {incoming.map((r) => {
                  const from = users.find((u) => u.id === r.fromUserId);
                  if (!from) return null;
                  return (
                    <div key={r.id} className="listRow" style={{ cursor: 'default' }}>
                      <div className="avatar avatar-sm">{(from.name || from.username).slice(0, 1).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="title" style={{ fontSize: 13, marginBottom: 2 }}>{from.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>@{from.username}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={() => respond(r.id, 'accept')} title="Aceitar"><Check size={16} /></button>
                        <button className="btn" onClick={() => respond(r.id, 'decline')} title="Recusar"><X size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 13 }}>Sem solicitações pendentes.</div>
            )}

            {outgoing.length ? (
              <div style={{ marginTop: 14 }}>
                <div className="title" style={{ fontSize: 13, marginBottom: 8 }}>Enviadas</div>
                <div className="list">
                  {outgoing.map((r) => {
                    const to = users.find((u) => u.id === r.toUserId);
                    if (!to) return null;
                    return (
                      <div key={r.id} className="listRow" style={{ cursor: 'default' }}>
                        <div className="avatar avatar-sm">{(to.name || to.username).slice(0, 1).toUpperCase()}</div>
                        <div style={{ minWidth: 0 }}>
                          <div className="title" style={{ fontSize: 13, marginBottom: 2 }}>{to.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>@{to.username}</div>
                        </div>
                        <span className="badge">Pendente</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass panel" style={{ padding: 14, marginTop: 18 }}>
          <div className="title" style={{ fontSize: 16, marginBottom: 10 }}>Seus amigos</div>
          {friendUsers.length ? (
            <div className="list">
              {friendUsers.map((u) => (
                <div key={u.id} className="listRow" style={{ cursor: 'default' }}>
                  <div className="avatar avatar-sm">{(u.name || u.username).slice(0, 1).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="title" style={{ fontSize: 13, marginBottom: 2 }}>{u.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>@{u.username}</div>
                  </div>
                  <button className="btn" onClick={() => { removeFriend(user.id, u.id); setTick((t) => t + 1); }}>
                    <X size={16} /> Remover
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 13 }}>Você ainda não adicionou ninguém.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Friends() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}
