import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { writePresence } from '../lib/presence';
import { trackEvent } from '../lib/analytics';

export default function PresenceTracker() {
  const loc = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const pathname = loc.pathname || '/';
    const gameId = pathname.startsWith('/jogar/') ? pathname.split('/')[2] : null;

    // initial write
    writePresence({ userId: isAuthenticated ? user?.id : null, pathname, gameId });

    // track page view events (lightweight)
    if (gameId) {
      trackEvent('game_view', { gameId, userId: isAuthenticated ? user?.id : null });
    } else {
      trackEvent('page_view', { pathname, userId: isAuthenticated ? user?.id : null });
    }

    const timer = setInterval(() => {
      writePresence({ userId: isAuthenticated ? user?.id : null, pathname, gameId });
    }, 10000);

    return () => clearInterval(timer);
  }, [loc.pathname, isAuthenticated, user?.id]);

  return null;
}
