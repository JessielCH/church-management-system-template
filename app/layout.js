import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';

export const metadata = {
  title: 'Church Management System',
  description: 'Administrative and Management Platform for Churches',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <TopHeader />
            <div className="content-area">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
