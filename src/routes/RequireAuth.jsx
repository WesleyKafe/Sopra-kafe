import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RequireAuth({ children }) {
  const { booted, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!booted) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
