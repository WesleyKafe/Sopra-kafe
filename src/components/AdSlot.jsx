import React, { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { getAds } from '../lib/storage';

function pickOne(arr) {
  if (!arr.length) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

export default function AdSlot({ placement, compact }) {
  const ad = useMemo(() => {
    const now = new Date();
    const all = getAds();
    const active = all.filter((a) => a.active && (a.placement === placement));
    const inWindow = active.filter((a) => {
      const s = a.startDate ? new Date(a.startDate) : null;
      const e = a.endDate ? new Date(a.endDate) : null;
      if (s && now < s) return false;
      if (e && now > e) return false;
      return true;
    });
    return pickOne(inWindow);
  }, [placement]);

  if (!ad) {
    return (
      <div className={compact ? 'adCard adCompact' : 'adCard'}>
        <div className="muted2" style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Publicidade</div>
        <div className="muted" style={{ fontSize: 12 }}>Nenhum anúncio configurado para <code>{placement}</code>.</div>
      </div>
    );
  }

  return (
    <a href={ad.linkUrl || '#'} target="_blank" rel="noreferrer" className={compact ? 'adCard adCompact' : 'adCard'}>
      <div className="muted2" style={{ fontWeight: 800, fontSize: 12, marginBottom: 8 }}>Publicidade</div>
      {ad.imageUrl ? (
        <img src={ad.imageUrl} alt={ad.title} className="adImage" />
      ) : (
        <div className="adImagePlaceholder">
          <div className="title" style={{ fontSize: 14 }}>{ad.title}</div>
          <div className="muted" style={{ fontSize: 12 }}>{ad.ctaText}</div>
        </div>
      )}
      <div className="adFooter">
        <div className="title" style={{ fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</div>
        <div className="adCta"><ExternalLink size={14} /> {ad.ctaText || 'Abrir'}</div>
      </div>
    </a>
  );
}
