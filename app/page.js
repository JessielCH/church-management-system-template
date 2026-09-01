import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from './actions/authActions';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    const totalMembers = await prisma.member.count();
    const baptizedCount = await prisma.member.count({ where: { baptismStatus: 'BAPTIZED' } });
    const pendingCount = await prisma.member.count({ where: { status: 'PENDING' } });
    const followUpCount = await prisma.followUp.count();

    const followUps = await prisma.followUp.findMany({
      take: 5,
      include: { member: true, consolidator: true },
      orderBy: { createdAt: 'desc' },
    });

    const upcomingEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { date: 'asc' },
    });

    const verses = await prisma.verse.findMany();

    return {
      totalMembers,
      baptizedCount,
      pendingCount,
      followUpCount,
      followUps,
      upcomingEvents,
      verses,
    };
  } catch (err) {
    console.warn('Dashboard DB query error:', err.message);
    return {
      totalMembers: 0,
      baptizedCount: 0,
      pendingCount: 0,
      followUpCount: 0,
      followUps: [],
      upcomingEvents: [],
      verses: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const session = await getSession();

  // Dynamic time-based greeting
  const currentHour = new Date().getHours();
  let timeGreeting = '¡Buenos días';
  let timeIcon = 'wb_twilight';

  if (currentHour >= 12 && currentHour < 19) {
    timeGreeting = '¡Buenas tardes';
    timeIcon = 'wb_sunny';
  } else if (currentHour >= 19 || currentHour < 5) {
    timeGreeting = '¡Buenas noches';
    timeIcon = 'bedtime';
  }

  const rawName = session?.name || session?.username || 'pastor1';
  const usernameDisplay = (rawName && !rawName.includes('Mendoza') && !rawName.includes('Ana María') && !rawName.includes('Coordinador'))
    ? rawName
    : (session?.username || 'pastor1');

  // Fetch daily scripture verse from database
  let dailyVerse = {
    text: '«Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo en el Señor no es en vano.»',
    reference: '1 Corintios 15:58',
  };

  if (data.verses && data.verses.length > 0) {
    dailyVerse = data.verses[Math.floor(Math.random() * data.verses.length)];
  }

  return (
    <div className="main-content">
      {/* Welcome Banner with Dynamic Time Greeting */}
      <div className="welcome-section flex-between">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined text-vivid" style={{ fontSize: '32px' }}>{timeIcon}</span>
            {timeGreeting}, {usernameDisplay}!
          </h1>
          <p className="subtitle">Resumen en tiempo real — IEBB Esperanza en Dios.</p>
        </div>

        <div className="date-display">
          <span className="material-symbols-outlined">calendar_today</span>
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Encouraging Biblical Verse Card Banner (Stored in Supabase DB) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b1f3b 0%, #2e3567 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          marginBottom: '32px',
          boxShadow: '0 10px 20px rgba(27, 31, 59, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 145, 46, 0.2)',
              color: '#f6c981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>auto_stories</span>
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '1.02rem', fontStyle: 'italic', lineHeight: '1.5', color: '#fefefe' }}>
              {dailyVerse.text}
            </p>
            <strong style={{ fontSize: '0.88rem', color: '#f6c981' }}>— {dailyVerse.reference}</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon orange">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="kpi-info">
            <h3>Membresía Total</h3>
            <div className="kpi-value">{data.totalMembers}</div>
            <span className="kpi-subtitle">{data.baptizedCount} Bautizados</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon vivid">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className="kpi-info">
            <h3>Nuevos Pendientes</h3>
            <div className="kpi-value">{data.pendingCount}</div>
            <span className="kpi-subtitle">Registrados recientemente</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon pastel">
            <span className="material-symbols-outlined">diversity_3</span>
          </div>
          <div className="kpi-info">
            <h3>En Consolidación</h3>
            <div className="kpi-value">{data.followUpCount}</div>
            <span className="kpi-subtitle">Seguimientos activos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <span className="material-symbols-outlined">notification_important</span>
          </div>
          <div className="kpi-info">
            <h3>Atención Urgente</h3>
            <div className="kpi-value">0</div>
            <span className="kpi-subtitle">Sin retrasos críticos</span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Seguimientos de Consolidación</h2>
            <Link href="/consolidacion" className="view-all">Ver Todos</Link>
          </div>
          <div className="table-responsive">
            {data.followUps.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#9ca3af', marginBottom: '8px' }}>inbox</span>
                <p style={{ margin: 0, fontWeight: '600' }}>No hay seguimientos registrados en la base de datos.</p>
              </div>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Persona</th>
                    <th>Contacto</th>
                    <th>Consolidador</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.followUps.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.member?.fullName || 'Miembro'}</strong>
                      </td>
                      <td>{f.member?.phone || 'Sin teléfono'}</td>
                      <td>{f.consolidator?.name || 'Sin asignar'}</td>
                      <td>
                        <span className="status warning">{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Próximos Eventos</h2>
            <Link href="/agenda" className="view-all">Ver Agenda</Link>
          </div>
          <div className="agenda-list">
            {data.upcomingEvents.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#9ca3af', marginBottom: '8px' }}>event_busy</span>
                <p style={{ margin: 0, fontWeight: '600' }}>No hay eventos programados en la base de datos.</p>
              </div>
            ) : (
              data.upcomingEvents.map((ev) => {
                const dateObj = new Date(ev.date);
                const day = dateObj.getDate().toString().padStart(2, '0');
                const month = dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();

                return (
                  <div key={ev.id} className="agenda-item">
                    <div className="agenda-time">
                      <strong>{day}</strong>
                      <span>{month}</span>
                    </div>
                    <div className="agenda-details">
                      <h4>{ev.title}</h4>
                      <p>📍 {ev.location}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
