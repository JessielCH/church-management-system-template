export default function DashboardPage() {
  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>¡Bienvenido, Pastor Admin!</h1>
          <p>Resumen general del crecimiento y atención de la congregación.</p>
        </div>
        <div className="date-display">
          <span className="material-symbols-outlined">calendar_today</span>
          <span>Septiembre 2026</span>
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
            <div className="kpi-value">
              342
              <span className="trend up">+5%</span>
            </div>
            <span className="kpi-subtitle">280 Bautizados</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon vivid">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className="kpi-info">
            <h3>Nuevos Creyentes</h3>
            <div className="kpi-value">
              18
              <span className="trend up">+12%</span>
            </div>
            <span className="kpi-subtitle">Este mes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon pastel">
            <span className="material-symbols-outlined">diversity_3</span>
          </div>
          <div className="kpi-info">
            <h3>En Consolidación</h3>
            <div className="kpi-value">24</div>
            <span className="kpi-subtitle">16 Asignados</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <span className="material-symbols-outlined">notification_important</span>
          </div>
          <div className="kpi-info">
            <h3>Atención Urgente</h3>
            <div className="kpi-value">
              5
              <span className="trend down">!</span>
            </div>
            <span className="kpi-subtitle">&gt; 7 días sin contacto</span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Seguimientos de Consolidación Pendientes</h2>
            <a href="#" className="view-all">Ver Todos</a>
          </div>
          <div className="table-responsive">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Contacto</th>
                  <th>Consolidador</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="person-cell">
                      <div className="avatar-small">CR</div>
                      <div>
                        <strong>Carlos Rodríguez</strong>
                        <span>Nuevo Creyente</span>
                      </div>
                    </div>
                  </td>
                  <td>+591 700 12345</td>
                  <td>Pr. Ricardo Morales</td>
                  <td><span className="status warning">3 días pendiente</span></td>
                  <td>
                    <button className="action-btn" title="Ver Detalle">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="person-cell">
                      <div className="avatar-small" style={{ backgroundColor: '#ffc9c9', color: '#7e1a19' }}>
                        MG
                      </div>
                      <div>
                        <strong>María Gómez</strong>
                        <span>Visita</span>
                      </div>
                    </div>
                  </td>
                  <td>+591 750 98765</td>
                  <td>Sin Asignar</td>
                  <td><span className="status danger">Urgent (8 días)</span></td>
                  <td>
                    <button className="action-btn" title="Asignar">
                      <span className="material-symbols-outlined">person_add</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Próximos Eventos</h2>
            <a href="#" className="view-all">Ver Agenda</a>
          </div>
          <div className="agenda-list">
            <div className="agenda-item">
              <div className="agenda-time">
                <strong>03</strong>
                <span>SEP</span>
              </div>
              <div className="agenda-details">
                <h4>Culto de Oración y Enseñanza</h4>
                <p>19:00 - Templo Principal</p>
              </div>
            </div>
            <div className="agenda-item urgent">
              <div className="agenda-time">
                <strong>06</strong>
                <span>SEP</span>
              </div>
              <div className="agenda-details">
                <h4>Culto Dominical Principal</h4>
                <p>09:30 - Auditorio Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
