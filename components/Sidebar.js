'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction, getSession } from '@/app/actions/authActions';

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    async function loadUser() {
      const session = await getSession();
      if (session) {
        const rawName = session.name || session.username || '';
        const clean = (rawName && !rawName.includes('Mendoza') && !rawName.includes('Ana María') && !rawName.includes('Coordinador'))
          ? rawName
          : (session.username || 'pastor1');
        setUserName(clean);
        setUserRole(session.role);
      }
    }
    loadUser();
  }, []);

  if (pathname === '/login' || pathname === '/change-password') {
    return null;
  }

  const isPastoralAgendaAllowed = ['PASTOR', 'COORDINADOR', 'SECRETARIA', 'ADMIN'].includes(userRole);
  const isMultimediaOnly = userRole === 'MULTIMEDIA' || userRole === 'MULTIMEDIA_LEADER' || userRole === 'LEADER' || userName.includes('multimedia');

  const navItems = [];

  // General modules NOT for Multimedia operators and NOT for IT Admin
  if (!isMultimediaOnly && userRole !== 'ADMIN') {
    navItems.push({ name: 'Dashboard', href: '/', icon: 'dashboard' });
    navItems.push({ name: 'Membresía', href: '/membresia', icon: 'group' });
    navItems.push({ name: 'Evangelismo', href: '/evangelismo', icon: 'campaign' });
    navItems.push({ name: 'Consolidación', href: '/consolidacion', icon: 'diversity_3' });
    if (isPastoralAgendaAllowed) {
      navItems.push({ name: 'Agenda Pastoral (Personal)', href: '/agenda', icon: 'event' });
    }
  }

  // Admin Module
  if (userRole === 'ADMIN') {
    navItems.push({ name: 'Gestión de Usuarios', href: '/usuarios', icon: 'manage_accounts' });
  }

  // Multimedia and Calendar Modules (Visible to Multimedia operators and others, NOT for IT Admin)
  if (userRole !== 'ADMIN') {
    navItems.push({ name: 'Multimedia', href: '/multimedia', icon: 'video_settings' });
    navItems.push({ name: 'Calendario Eventos IEBB', href: '/calendario', icon: 'calendar_month' });
  }

  // Reportes NOT for Multimedia operators and NOT for IT Admin
  if (!isMultimediaOnly && userRole !== 'ADMIN') {
    navItems.push({ name: 'Reportes', href: '/reportes', icon: 'monitoring' });
  }

  const displayName = userName || 'pastor1';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/images/LOGOIEBB.png"
            alt="IEBB Logo"
            width={38}
            height={38}
            style={{ objectFit: 'contain', flexShrink: 0 }}
          />

          {!isCollapsed && (
            <div>
              <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: '700', lineHeight: 1.2, color: 'var(--texto-oscuro, #1b1f3b)' }}>
                {displayName}
              </h2>
              <span style={{ fontSize: '0.65rem', color: '#e64216', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginTop: '2px' }}>
                IEBB ESPERANZA EN DIOS
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button className="icon-button mobile-close-btn" onClick={onCloseMobile} style={{ color: '#1b1f3b' }}>
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
          <div className="user-profile" style={{ justifyContent: 'space-between', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar" style={{ backgroundColor: '#1b1f3b', color: '#ffffff' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <strong style={{ color: '#1b1f3b' }}>{displayName}</strong>
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>IEBB Esperanza</span>
              </div>
            </div>
            <button
              onClick={() => logoutAction()}
              title="Cerrar Sesión"
              className="action-btn"
              style={{ color: '#e64216', borderColor: '#e5e7eb' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
