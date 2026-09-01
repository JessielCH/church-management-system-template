import Link from 'next/link';
import prisma from '@/lib/prisma';

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

    return {
      totalMembers,
      baptizedCount,
      pendingCount,
      followUpCount,
      followUps,
      upcomingEvents,
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
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="main-content">
      <div className="welcome-section flex-between">
        <div>
          <h1>Dashboard Institucional</h1>
          <p className="subtitle">Resumen en tiempo real del crecimiento y atención de la congregación.</p>
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
