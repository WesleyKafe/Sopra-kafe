import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ensureSeed, getSession, getUsers, saveSession, saveUsers, makeId } from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [booted, setBooted] = useState(false);
  const [usersRev, setUsersRev] = useState(0);

  useEffect(() => {
    ensureSeed();
    setSession(getSession());
    setBooted(true);
  }, []);

  const user = useMemo(() => {
    if (!session?.userId) return null;
    return getUsers().find((u) => u.id === session.userId) ?? null;
  }, [session, usersRev]);

  const value = useMemo(() => {
    const login = ({ emailOrUsername, password }) => {
      const users = getUsers();
      const found = users.find(
        (u) =>
          (u.email?.toLowerCase() === String(emailOrUsername).toLowerCase() ||
            u.username?.toLowerCase() === String(emailOrUsername).toLowerCase()) &&
          u.password === password
      );
      if (!found) {
        return { ok: false, error: 'Usuário ou senha inválidos.' };
      }
      const next = { userId: found.id, createdAt: new Date().toISOString() };
      saveSession(next);
      setSession(next);
      setUsersRev((r) => r + 1);
      return { ok: true };
    };

    const register = ({ name, username, email, password }) => {
      const users = getUsers();
      const emailTaken = users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
      const userTaken = users.some((u) => u.username?.toLowerCase() === username.toLowerCase());
      if (emailTaken) return { ok: false, error: 'Esse email já está em uso.' };
      if (userTaken) return { ok: false, error: 'Esse usuário já está em uso.' };

      const newUser = {
        id: makeId(),
        name,
        username,
        email,
        password,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      saveUsers([newUser, ...users]);

      const next = { userId: newUser.id, createdAt: new Date().toISOString() };
      saveSession(next);
      setSession(next);
      setUsersRev((r) => r + 1);
      return { ok: true };
    };

    const updateProfile = ({ name, username, email }) => {
      if (!user?.id) return { ok: false, error: 'Sessão inválida.' };
      const users = getUsers();
      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedUser = String(username).trim().toLowerCase();

      const emailTaken = users.some((u) => u.id !== user.id && u.email?.toLowerCase() === normalizedEmail);
      const userTaken = users.some((u) => u.id !== user.id && u.username?.toLowerCase() === normalizedUser);
      if (emailTaken) return { ok: false, error: 'Esse email já está em uso.' };
      if (userTaken) return { ok: false, error: 'Esse usuário já está em uso.' };

      const nextUsers = users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              name: String(name).trim(),
              username: String(username).trim(),
              email: String(email).trim(),
              updatedAt: new Date().toISOString(),
            }
          : u
      );
      saveUsers(nextUsers);
      setUsersRev((r) => r + 1);
      return { ok: true };
    };

    const changePassword = ({ currentPassword, newPassword }) => {
      if (!user?.id) return { ok: false, error: 'Sessão inválida.' };
      if (String(newPassword).length < 6) return { ok: false, error: 'A nova senha precisa ter no mínimo 6 caracteres.' };

      const users = getUsers();
      const me = users.find((u) => u.id === user.id);
      if (!me) return { ok: false, error: 'Usuário não encontrado.' };
      if (me.password !== currentPassword) return { ok: false, error: 'Senha atual incorreta.' };

      const nextUsers = users.map((u) => (u.id === user.id ? { ...u, password: newPassword, updatedAt: new Date().toISOString() } : u));
      saveUsers(nextUsers);
      setUsersRev((r) => r + 1);
      return { ok: true };
    };

    const logout = () => {
      saveSession(null);
      setSession(null);
    };

    return {
      booted,
      session,
      user,
      isAuthenticated: Boolean(session?.userId),
      isAdmin: user?.role === 'admin',
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    };
  }, [booted, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
