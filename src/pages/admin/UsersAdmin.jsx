import React, { useMemo, useState } from 'react';
import { Search, UserRound, Shield, Trash2, KeyRound } from 'lucide-react';
import { getUsers, saveUsers } from '../../lib/storage';

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

export default function UsersAdmin() {
  const [query, setQuery] = useState('');
  const [rev, setRev] = useState(0);
  const users = useMemo(() => [...getUsers()].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')), [rev]);

  const filtered = users.filter((u) => {
    const q = normalize(query);
    if (!q) return true;
    return (
      normalize(u.name).includes(q) ||
      normalize(u.username).includes(q) ||
      normalize(u.email).includes(q) ||
      normalize(u.role).includes(q)
    );
  });

  const updateUser = (id, patch) => {
    const next = users.map((u) => (u.id === id ? { ...u, ...patch, updatedAt: new Date().toISOString() } : u));
    saveUsers(next);
    setRev((r) => r + 1);
  };

  const removeUser = (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (target.username === 'admin') {
      alert('Você não pode remover o usuário admin.');
      return;
    }
    if (!confirm(`Remover usuário ${target.username}?`)) return;
    const next = users.filter((u) => u.id !== id);
    saveUsers(next);
    setRev((r) => r + 1);
  };

  const resetPassword = (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextPass = prompt('Nova senha (mínimo 6 caracteres):', '123456');
    if (!nextPass) return;
    if (String(nextPass).length < 6) {
      alert('Senha muito curta.');
      return;
    }
    updateUser(id, { password: nextPass });
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="title" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <UserRound size={18} /> Usuários
      </div>

      <div className="glass panel" style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
            <input
              className="input hasIcon"
              placeholder="Buscar por nome, usuário, email ou role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="badge">Total: {filtered.length}</div>
        </div>
      </div>

      <div className="glass panel" style={{ padding: 14, overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Senha (demo)</th>
              <th>Role</th>
              <th style={{ width: 220 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <input
                    className="input input-pill"
                    value={u.name || ''}
                    onChange={(e) => updateUser(u.id, { name: e.target.value })}
                  />
                </td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <code style={{ opacity: 0.9 }}>{u.password}</code>
                </td>
                <td>
                  <select
                    className="input input-pill"
                    value={u.role || 'user'}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    disabled={u.username === 'admin'}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn" onClick={() => resetPassword(u.id)} title="Resetar senha">
                      <KeyRound size={16} /> Senha
                    </button>
                    <button className="btn" onClick={() => updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })} disabled={u.username === 'admin'}>
                      <Shield size={16} /> Role
                    </button>
                    <button className="btn" onClick={() => removeUser(u.id)} disabled={u.username === 'admin'}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="muted" style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6 }}>
          Observação: este painel é uma <strong>demo</strong>. Senhas estão em texto puro apenas para desenvolvimento/localStorage.
        </div>
      </div>
    </div>
  );
}
