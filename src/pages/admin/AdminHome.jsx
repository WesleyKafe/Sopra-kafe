import React, { useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Gamepad2, LayoutDashboard, Megaphone, Users, ClipboardCheck } from 'lucide-react';
import TopBar from '../../components/TopBar';

function NavItem({ to, icon: Icon, label }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link to={to} className="adminNavItem" data-active={active}>
      <Icon size={16} /> {label}
    </Link>
  );
}

export default function AdminHome() {
  return (
    <div>
      <TopBar subtitle="admin" />
      <div className="container" style={{ paddingTop: 26 }}>
        <div className="adminLayout">
          <aside className="glass panel" style={{ padding: 14 }}>
            <div className="title" style={{ fontSize: 14, marginBottom: 10 }}>Painel</div>
            <div className="adminNav">
              <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/admin/submissions" icon={ClipboardCheck} label="Pendentes" />
              <NavItem to="/admin/games" icon={Gamepad2} label="Games" />
              <NavItem to="/admin/ads" icon={Megaphone} label="Ads" />
              <NavItem to="/admin/users" icon={Users} label="Usuários" />
            </div>
          </aside>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
