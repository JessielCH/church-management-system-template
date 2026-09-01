'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopHeader({ onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/change-password') {
    return null;
  }

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {/* Toggle Sidebar Button */}
        <button
          className="icon-button sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title="Desplegar / Minimizar Menú"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Buscar miembros, ministerios, eventos..."
          />
        </div>
      </div>

      <div className="header-actions">
        <button
          className="icon-button notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="badge">0</span>
        </button>
      </div>
    </header>
  );
}
