'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/authActions';

export default function Sidebar() {
  const pathname = usePathname();

  // Do not render Sidebar on Login or Change Password pages
  if (pathname === '/login' || pathname === '/change-password') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Membresía', href: '/membresia', icon: 'group' },
    { name: 'Evangelismo', href: '/evangelismo', icon: 'campaign' },
    { name: 'Consolidación', href: '/consolidacion', icon: 'diversity_3' },
    { name: 'Agenda', href: '/agenda', icon: 'event' },
    { name: 'Reportes', href: '/reportes', icon: 'monitoring' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Image src="/images/logo.svg" alt="Church Logo" width={40} height={40} style={{ borderRadius: '8px' }} />
        <h2>Church Admin</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/configuracion" className="nav-item">
          <span className="material-symbols-outlined">settings</span>
          <span>Configuración</span>
        </Link>
        <div className="user-profile" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar">P</div>
            <div className="user-info">
              <strong>Pastor Admin</strong>
              <span>Pastor / Admin</span>
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
      </div>
    </aside>
  );
}
