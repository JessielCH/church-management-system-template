'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  // Do not render TopHeader on Login or Change Password pages
  if (pathname === '/login' || pathname === '/change-password') {
    return null;
  }

  return (
    <header className="top-header">
      <div className="search-bar">
        <span className="material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder="Buscar miembros, ministerios, eventos..."
        />
      </div>

      <div className="header-actions">
        <button
          className="icon-button notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="badge">3</span>
        </button>

        <div className="dropdown-container">
          <button
            className="primary-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', marginLeft: '-4px' }}
            >
              expand_more
            </span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu active">
              <a href="#" className="dropdown-item">
                <span className="material-symbols-outlined">person_add</span> Añadir Miembro
              </a>
              <a href="#" className="dropdown-item">
                <span className="material-symbols-outlined">campaign</span> Nuevo Contacto
              </a>
              <a href="#" className="dropdown-item">
                <span className="material-symbols-outlined">handshake</span> Asignar Discipulador
              </a>
              <a href="#" className="dropdown-item">
                <span className="material-symbols-outlined">event</span> Nuevo Evento
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
