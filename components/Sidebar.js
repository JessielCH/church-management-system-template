'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/authActions';

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/change-password') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Membresía', href: '/membresia', icon: 'group' },
    { name: 'Evangelismo', href: '/evangelismo', icon: 'campaign' },
    { name: 'Consolidación', href: '/consolidacion', icon: 'diversity_3' },
    { name: 'Agenda', href: '/agenda', icon: 'event' },
    { name: 'Multimedia', href: '/multimedia', icon: 'video_settings' },
    { name: 'Reportes', href: '/reportes', icon: 'monitoring' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image src="/images/logo.svg" alt="Church Logo" width={36} height={36} style={{ borderRadius: '8px', flexShrink: 0 }} />
          {!isCollapsed && <h2>Church Admin</h2>}
        </div>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button className="icon-button mobile-close-btn" onClick={onCloseMobile} style={{ color: '#ffffff' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              title={isCollapsed ? item.name : ''}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link
          href="/configuracion"
          className="nav-item"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
          }}
          title={isCollapsed ? 'Configuración' : ''}
        >
          <span className="material-symbols-outlined">settings</span>
          {!isCollapsed && <span>Configuración</span>}
        </Link>

        {!isCollapsed && (
          <div className="user-profile" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar">P</div>
              <div className="user-info">
                <strong>Pastor / Usuario</strong>
                <span>Gestión Activa</span>
              </div>
            </div>
            <button
              onClick={() => logoutAction()}
              title="Cerrar Sesión"
              className="action-btn"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
