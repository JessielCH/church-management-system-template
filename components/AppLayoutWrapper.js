'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { usePathname } from 'next/navigation';

export default function AppLayoutWrapper({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/change-password';

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div className="sidebar-backdrop-overlay" onClick={closeMobileSidebar} />
      )}

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobileSidebar}
      />

      <div className="main-content-wrapper">
        <TopHeader onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
        <main className="main-content">
          <div className="content-area">{children}</div>
        </main>
      </div>
    </div>
  );
}
