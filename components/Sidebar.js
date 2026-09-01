'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction, getSession } from '@/app/actions/authActions';

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadUser() {
      const session = await getSession();
      if (session) {
        setUserName(session.name || session.username || 'Usuario');
      }
    }
    loadUser();
  }, []);

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
          {/* White Badge Container to make LOGOIEBB.png pop out sharply */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '4px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/LOGOIEBB.png"
              alt="IEBB Logo"
              width={34}
              height={34}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {!isCollapsed && (
            <div>
              {/* White text for user's name */}
              <h2 style={{ fontSize: '1rem', margin: 0, color: '#ffffff', fontWeight: '700', lineHeight: 1.2 }}>
                {userName || 'pastor1'}
              </h2>
              {/* Gold subtitle for IEBB ESPERANZA EN DIOS */}
              <span style={{ fontSize: '0.66rem', color: '#f6c981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginTop: '2px' }}>
                IEBB ESPERANZA EN DIOS
              </span>
            </div>
          )}
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
              <div className="avatar">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <strong>{userName || 'Usuario'}</strong>
                <span>IEBB Esperanza</span>
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
