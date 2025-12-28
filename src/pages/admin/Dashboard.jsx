import React, { useMemo } from 'react';
import { BarChart3, Gamepad2, Megaphone, Users, Activity } from 'lucide-react';
import { getAds, getGames, getUsers } from '../../lib/storage';
import { getOnlinePresence } from '../../lib/presence';
import { getTopGamesByPeriod } from '../../lib/analytics';

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="glass panel metric" style={{ padding: 14 }}>
      <div className="metricIcon"><Icon size={18} /></div>
      <div>
        <div className="muted2" style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
        <div className="title" style={{ fontSize: 22 }}>{value}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const games = useMemo(() => getGames(), []);
  const ads = useMemo(() => getAds(), []);
  const users = useMemo(() => getUsers(), []);
  const online = useMemo(() => getOnlinePresence(), []);

  const published = games.filter((g) => (g.status ?? 'published') === 'published').length;
  const drafts = games.filter((g) => (g.status ?? 'published') === 'draft').length;
  const pending = games.filter((g) => (g.status ?? 'published') === 'pending').length;
  const activeAds = ads.filter((a) => a.active).length;
  const topDay = useMemo(() => getTopGamesByPeriod({ games, period: 'day' }).slice(0, 5), [games]);
  const topWeek = useMemo(() => getTopGamesByPeriod({ games, period: 'week' }).slice(0, 5), [games]);
  const topMonth = useMemo(() => getTopGamesByPeriod({ games, period: 'month' }).slice(0, 5), [games]);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="title" style={{ fontSize: 18 }}>Dashboard</div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <Metric icon={Gamepad2} label="Jogos publicados" value={published} />
        <Metric icon={BarChart3} label="Pendente aprovação" value={pending} />
        <Metric icon={BarChart3} label="Rascunhos" value={drafts} />
        <Metric icon={Megaphone} label="Ads ativos" value={activeAds} />
        <Metric icon={Users} label="Usuários" value={users.length} />
        <Metric icon={Activity} label="Online agora" value={online.length} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.1fr 0.9fr', gap: 18 }}>
        <div className="glass panel" style={{ padding: 14 }}>
          <div className="title" style={{ fontSize: 14, marginBottom: 8 }}>Usuários online (demo)</div>
          {online.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>Ninguém online no momento.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {online.slice(0, 12).map((p) => (
                <div key={p.clientId} className="glass" style={{ padding: 10, borderRadius: 12, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="title" style={{ fontSize: 13, marginBottom: 2 }}>
                      {p.userId ? (users.find((u) => u.id === p.userId)?.username || 'usuário') : 'visitante'}
                    </div>
                    <div className="muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.pathname}{p.gameId ? ` • jogando: ${games.find((g) => g.id === p.gameId)?.nome || 'game'}` : ''}
                    </div>
                  </div>
                  <div className="badge">ativo</div>
                </div>
              ))}
            </div>
          )}
          <div className="muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
            Funciona como presença por <strong>localStorage</strong>. Em produção, isso deve ser servidor/WebSocket.
          </div>
        </div>

        <div className="glass panel" style={{ padding: 14 }}>
          <div className="title" style={{ fontSize: 14, marginBottom: 8 }}>Ranking (acessos)</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <RankingBlock title="Hoje" rows={topDay} />
            <RankingBlock title="7 dias" rows={topWeek} />
            <RankingBlock title="30 dias" rows={topMonth} />
          </div>
        </div>
      </div>

      <div className="glass panel" style={{ padding: 14 }}>
        <div className="title" style={{ fontSize: 14, marginBottom: 8 }}>Notas rápidas</div>
        <ul className="bullets">
          <li>Este Admin é uma demo (dados ficam no seu navegador via localStorage).</li>
          <li>Se quiser multiusuário e deploy real, o ideal é conectar Supabase/Firebase.</li>
        </ul>
      </div>
    </div>
  );
}

function RankingBlock({ title, rows }) {
  return (
    <div className="glass" style={{ padding: 12, borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="badge">{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>{rows.reduce((a, r) => a + r.views, 0)} views</div>
      </div>
      {rows.length === 0 ? (
        <div className="muted" style={{ fontSize: 12 }}>Sem dados ainda.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((r) => (
            <div key={r.gameId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div className="title" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>{r.console}</div>
              </div>
              <div className="badge">{r.views}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
