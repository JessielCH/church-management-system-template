'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getNotificationsAction, markNotificationAsReadAction } from '@/app/actions/notificationActions';

export default function TopHeader({ onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login' || pathname === '/change-password') return;
    
    async function fetchNotifications() {
      const res = await getNotificationsAction();
      if (res?.success) {
        setNotifications(res.notifications || []);
      }
    }
    
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(intervalId);
  }, [pathname]);

  if (pathname === '/login' || pathname === '/change-password') {
    return null;
  }

  const handleMarkAsRead = async (id) => {
    const res = await markNotificationAsReadAction(id);
    if (res?.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

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
      </div>

      <div className="header-actions" style={{ position: 'relative' }}>
        <button
          className="icon-button notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ width: '48px', height: '48px' }} // Make button bigger
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: notifications.length > 0 ? '#ea580c' : '#4b5563' }}>
            notifications
          </span>
          {notifications.length > 0 && (
            <span className="badge" style={{ backgroundColor: '#e64216', fontSize: '12px', padding: '4px 8px', top: '0', right: '0' }}>
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div style={{
            position: 'absolute',
            top: '55px',
            right: '0',
            width: '320px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid var(--borde)',
            zIndex: 100,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--borde)', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#1b1f3b' }}>Notificaciones</h3>
              <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#d1d5db', marginBottom: '8px' }}>notifications_off</span>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No tienes nuevas notificaciones.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ color: '#4338ca', backgroundColor: '#e0e7ff', padding: '8px', borderRadius: '50%' }}>
                      assignment
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#1f2937', lineHeight: '1.4' }}>{notif.message}</p>
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                      >
                        Marcar como leída
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
