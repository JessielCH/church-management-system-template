'use client';

import { useState, useActionState, useEffect } from 'react';
import {
  getTicketsAction,
  createWorshipTicketAction,
  createMediaRequestAction,
  updateTicketStatusAction,
  assignTicketAction,
} from '@/app/actions/ticketActions';
import { getSession } from '@/app/actions/authActions';

export default function MultimediaPage() {
  const [activeTab, setActiveTab] = useState('worship'); // 'worship' | 'media' | 'calendar'
  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const [tickets, setTickets] = useState([]);

  // Dates logic for Media Request (3 days before suggestion)
  const [activityDate, setActivityDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [isTightDeadline, setIsTightDeadline] = useState(false);

  const [worshipState, worshipFormAction, isWorshipPending] = useActionState(createWorshipTicketAction, null);
  const [mediaState, mediaFormAction, isMediaPending] = useActionState(createMediaRequestAction, null);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (session) {
        setUserRole(session.role);
        setUsername(session.username);
        // If pastor/coordinator/secretary, default active tab to media requests
        if (['PASTOR', 'COORDINADOR', 'SECRETARIA'].includes(session.role)) {
          setActiveTab('media');
        }
      }
      const res = await getTicketsAction();
      if (res?.success) {
        setTickets(res.tickets || []);
      }
    }
    init();
  }, [worshipState, mediaState]);

  // Suggest 3-day deadline automatically
  const handleActivityDateChange = (val) => {
    setActivityDate(val);
    if (!val) {
      setSuggestedDate('');
      setIsTightDeadline(false);
      return;
    }

    const eventDateObj = new Date(val);
    const recDate = new Date(eventDateObj);
    recDate.setDate(eventDateObj.getDate() - 3);

    const recStr = recDate.toISOString().split('T')[0];
    setSuggestedDate(recStr);

    if (!deliveryDate) {
      setDeliveryDate(recStr);
    } else {
      checkDeadlineMargin(deliveryDate, val);
    }
  };

  const handleDeliveryDateChange = (val) => {
    setDeliveryDate(val);
    if (activityDate) {
      checkDeadlineMargin(val, activityDate);
    }
  };

  const checkDeadlineMargin = (delivery, activity) => {
    const delObj = new Date(delivery);
    const actObj = new Date(activity);
    const diffTime = actObj - delObj;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      setIsTightDeadline(true);
    } else {
      setIsTightDeadline(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
    await updateTicketStatusAction(id, nextStatus);
  };

  const handleAssignTicket = async (id, assignedTo) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, assignedTo } : t))
    );
    await assignTicketAction(id, assignedTo);
  };

  const worshipTickets = tickets.filter((t) => t.category === 'WORSHIP_SONG');
  const mediaTickets = tickets.filter((t) => t.category === 'MEDIA_REQUEST');

  // Pastor, Coordinator, and Secretary cannot create worship song tickets (only Leader / Multimedia)
  const canCreateWorshipTicket = !['PASTOR', 'COORDINADOR', 'SECRETARIA'].includes(userRole);

  // Only multimedia_admin (or ADMIN role) can assign tickets to operators
  const isMultimediaAdmin = username === 'multimedia_admin' || userRole === 'ADMIN';

  return (
    <div>
      <div className="welcome-section" style={{ marginBottom: '28px' }}>
        <div>
          <h1>Módulo Multimedia y Publicidades</h1>
          <p>Gestión de tickets de letras para proyección en cultos y peticiones de publicidad semanal.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Worship Ticket Button (Only for Worship Leaders & Multimedia) */}
          {canCreateWorshipTicket && (
            <button className="primary-button" onClick={() => setShowWorshipModal(true)} style={{ backgroundColor: '#ea580c' }}>
              <span className="material-symbols-outlined">queue_music</span>
              + Ticket de Alabanza
            </button>
          )}

          {/* Publicity Request Button (Available for Pastor, Secretary, Coordinator, Leaders) */}
          <button className="primary-button" onClick={() => setShowMediaModal(true)} style={{ backgroundColor: '#4338ca' }}>
            <span className="material-symbols-outlined">campaign</span>
            + Petición de Publicidad
          </button>
        </div>
      </div>

      {/* Tabs Pill Bar */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('worship')}
          className={`tab-button ${activeTab === 'worship' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">queue_music</span>
          Proyección de Alabanzas ({worshipTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">campaign</span>
          Publicidades ({mediaTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Calendario de Entregas
        </button>
      </div>

      {/* Tab 1: Worship Songs Projection */}
      {activeTab === 'worship' && (
        <div className="content-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#1b1f3b' }}>
            <span className="material-symbols-outlined text-vivid" style={{ fontSize: '26px' }}>music_note</span>
            Cola de Alabanzas para Proyectar en Culto
          </h3>

          <div>
            {worshipTickets.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280', border: '2px dashed var(--borde)', borderRadius: '16px', backgroundColor: '#fafafa' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '12px' }}>queue_music</span>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: '#1b1f3b' }}>No hay alabanzas registradas en la cola.</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>
                  {canCreateWorshipTicket
                    ? 'Presiona "+ Ticket de Alabanza" para ingresar el título, autor y director de esta semana.'
                    : 'Los tickets de alabanzas son gestionados por el Director de Alabanza / Equipo de Multimedia.'}
                </p>
              </div>
            ) : (
              worshipTickets.map((t) => (
                <div key={t.id} className="ticket-card-item">
                  <div className="ticket-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: t.status === 'COMPLETED' ? '#dcfce7' : '#fff7ed',
                          color: t.status === 'COMPLETED' ? '#15803d' : '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          {t.status === 'COMPLETED' ? 'check_circle' : 'queue_music'}
                        </span>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1b1f3b' }}>{t.title}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#4b5563' }}>
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event</span>
                      Culto: {new Date(t.eventDate || Date.now()).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  <div className="ticket-card-footer">
                    {/* Assignment Selector (Only editable by multimedia_admin) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: '600' }}>👤 Encargado:</span>
                      {isMultimediaAdmin ? (
                        <select
                          value={t.assignedTo || ''}
                          onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                          style={{
                            fontSize: '0.82rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--borde)',
                            backgroundColor: '#ffffff',
                            fontWeight: '600',
                            color: t.assignedTo ? '#4338ca' : '#6b7280',
                          }}
                        >
                          <option value="">Sin Asignar</option>
                          <option value="multimedia1">multimedia1 (Operador 1)</option>
                          <option value="multimedia2">multimedia2 (Operador 2)</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: t.assignedTo ? '#4338ca' : '#9ca3af' }}>
                          {t.assignedTo || 'Sin Asignar'}
                        </span>
                      )}
                    </div>

                    {/* Sliding Dropdown Options Menu */}
                    <TicketStatusDropdown
                      ticket={t}
                      userRole={userRole}
                      username={username}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Publicidades */}
      {activeTab === 'media' && (
        <div className="content-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#1b1f3b' }}>
            <span className="material-symbols-outlined text-vivid" style={{ fontSize: '26px' }}>campaign</span>
            Peticiones de Publicidades y Anuncios
          </h3>

          <div>
            {mediaTickets.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280', border: '2px dashed var(--borde)', borderRadius: '16px', backgroundColor: '#fafafa' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '12px' }}>campaign</span>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: '#1b1f3b' }}>No hay solicitudes de publicidad o anuncios pendientes.</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>Pastores, Líderes y Secretarias pueden enviar peticiones usando "+ Petición de Publicidad".</p>
              </div>
            ) : (
              mediaTickets.map((t) => (
                <div key={t.id} className="ticket-card-item">
                  <div className="ticket-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: t.status === 'COMPLETED' ? '#dcfce7' : '#e0e7ff',
                          color: t.status === 'COMPLETED' ? '#15803d' : '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          {t.status === 'COMPLETED' ? 'check_circle' : 'campaign'}
                        </span>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1b1f3b' }}>{t.title}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#4b5563' }}>
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event</span>
                      Entrega: {new Date(t.eventDate || Date.now()).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  <div className="ticket-card-footer">
                    {/* Assignment Selector (Only editable by multimedia_admin) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: '600' }}>👤 Encargado:</span>
                      {isMultimediaAdmin ? (
                        <select
                          value={t.assignedTo || ''}
                          onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                          style={{
                            fontSize: '0.82rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--borde)',
                            backgroundColor: '#ffffff',
                            fontWeight: '600',
                            color: t.assignedTo ? '#4338ca' : '#6b7280',
                          }}
                        >
                          <option value="">Sin Asignar</option>
                          <option value="multimedia1">multimedia1 (Operador 1)</option>
                          <option value="multimedia2">multimedia2 (Operador 2)</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: t.assignedTo ? '#4338ca' : '#9ca3af' }}>
                          {t.assignedTo || 'Sin Asignar'}
                        </span>
                      )}
                    </div>

                    {/* Sliding Dropdown Options Menu */}
                    <TicketStatusDropdown
                      ticket={t}
                      userRole={userRole}
                      username={username}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Production Calendar */}
      {activeTab === 'calendar' && (
        <div className="content-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#1b1f3b' }}>
            <span className="material-symbols-outlined text-vivid" style={{ fontSize: '26px' }}>calendar_month</span>
            Calendario de Entregas para Cultos y Eventos
          </h3>

          {tickets.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280', border: '2px dashed var(--borde)', borderRadius: '16px', backgroundColor: '#fafafa' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '12px' }}>event_busy</span>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: '#1b1f3b' }}>No hay eventos programados en el calendario multimedia.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--borde)',
                    backgroundColor: t.status === 'COMPLETED' ? '#f0fdf4' : '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: t.category === 'WORSHIP_SONG' ? '#ea580c' : '#4338ca',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: t.category === 'WORSHIP_SONG' ? '#fff7ed' : '#e0e7ff',
                      }}
                    >
                      {t.category === 'WORSHIP_SONG' ? '🎵 Alabanza' : '🎬 Publicidad'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '500' }}>
                      📅 Entrega: {new Date(t.eventDate || Date.now()).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: '700', color: '#1b1f3b' }}>{t.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>{t.description}</p>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--borde)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: '600' }}>
                      👤 Encargado: {t.assignedTo || 'Sin Asignar'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: t.status === 'COMPLETED' ? '#15803d' : '#b45309',
                      }}
                    >
                      {t.status === 'COMPLETED' ? '✓ Realizado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Ticket de Alabanza (Only for Worship Leaders & Multimedia) */}
      {showWorshipModal && canCreateWorshipTicket && (
        <div className="modal-backdrop" onClick={() => setShowWorshipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎵 Ticket de Alabanza para Proyectar</h2>
              <button className="action-btn" onClick={() => setShowWorshipModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              action={async (formData) => {
                await worshipFormAction(formData);
                setShowWorshipModal(false);
              }}
            >
              <div className="form-group">
                <label>Título de la Alabanza</label>
                <input type="text" name="title" placeholder="Ej. Cuán Grande es Él" required />
              </div>

              <div className="form-group">
                <label>Autor / Artista</label>
                <input type="text" name="author" placeholder="Ej. En Espíritu y En Verdad / Miel San Marcos" required />
              </div>

              <div className="form-group">
                <label>Director de esta semana</label>
                <input type="text" name="leaderName" placeholder="Ej. Carlos Ruiz" required />
              </div>

              <div className="form-group">
                <label>Fecha del Culto</label>
                <input type="date" name="eventDate" required />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowWorshipModal(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={isWorshipPending} className="primary-button" style={{ backgroundColor: '#ea580c' }}>
                  {isWorshipPending ? 'Guardando...' : 'Crear Ticket de Alabanza'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Petición de Publicidad */}
      {showMediaModal && (
        <div className="modal-backdrop" onClick={() => setShowMediaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎬 Petición de Publicidad</h2>
              <button className="action-btn" onClick={() => setShowMediaModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              action={async (formData) => {
                await mediaFormAction(formData);
                setShowMediaModal(false);
              }}
            >
              <div className="form-group">
                <label>Título del Proyecto / Anuncio</label>
                <input type="text" name="title" placeholder="Ej. Campamento Juvenil 2026" required />
              </div>

              <div className="form-group">
                <label>¿Para qué actividad o ministerio es?</label>
                <input type="text" name="ministryActivity" placeholder="Ej. Ministerio de Jóvenes / Evangelismo" required />
              </div>

              <div className="form-group">
                <label>Indicaciones (Formatos, Colores, Estilo)</label>
                <textarea
                  name="mediaNotes"
                  rows={3}
                  placeholder="Ej. Video promocional de 1 min, colores vivos, incluir costo de inscripción..."
                />
              </div>

              <div className="form-group">
                <label>Fecha de la Actividad / Evento</label>
                <input
                  type="date"
                  name="activityDate"
                  value={activityDate}
                  onChange={(e) => handleActivityDateChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha Límite de Entrega Requerida</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => handleDeliveryDateChange(e.target.value)}
                  required
                />
                {suggestedDate && (
                  <small style={{ color: '#4b5563', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                    💡 Fecha recomendada de entrega (3 días antes): <strong>{suggestedDate}</strong>
                  </small>
                )}
              </div>

              {isTightDeadline && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
                  <span>
                    <strong>Sugerencia de Producción:</strong> Para evitar retrasos, la entrega debe solicitarse al menos 3 días antes del evento (Recomendado: {suggestedDate}).
                  </span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowMediaModal(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={isMediaPending} className="primary-button" style={{ backgroundColor: '#4338ca' }}>
                  {isMediaPending ? 'Guardando...' : 'Crear Petición de Publicidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sliding Dropdown Menu for Ticket Status Updates
 */
function TicketStatusDropdown({ ticket, userRole, username, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);

  // Strict operator traceability check:
  // ONLY the specific assigned operator (e.g. multimedia1) can change status. Not even admin!
  const canChangeStatus = ticket.assignedTo && (ticket.assignedTo === username || ticket.assignedTo === userRole?.toLowerCase());

  const currentStatusLabel =
    ticket.status === 'COMPLETED'
      ? '✓ Realizado'
      : ticket.status === 'IN_PROGRESS'
      ? 'En Preparación'
      : 'Pendiente';

  const currentBgColor =
    ticket.status === 'COMPLETED'
      ? '#dcfce7'
      : ticket.status === 'IN_PROGRESS'
      ? '#fef3c7'
      : '#fee2e2';

  const currentTextColor =
    ticket.status === 'COMPLETED'
      ? '#15803d'
      : ticket.status === 'IN_PROGRESS'
      ? '#b45309'
      : '#b91c1c';

  if (!canChangeStatus) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.82rem',
          fontWeight: '700',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: currentBgColor,
          color: currentTextColor,
          border: ticket.status === 'COMPLETED' ? '1px solid #86efac' : '1px solid transparent',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {ticket.status === 'COMPLETED' ? 'check_circle' : ticket.status === 'IN_PROGRESS' ? 'hourglass_top' : 'pending'}
        </span>
        {currentStatusLabel}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.82rem',
          fontWeight: '700',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: currentBgColor,
          color: currentTextColor,
          border: '1px solid var(--borde)',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {ticket.status === 'COMPLETED' ? 'check_circle' : ticket.status === 'IN_PROGRESS' ? 'hourglass_top' : 'pending'}
        </span>
        {currentStatusLabel}
        <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '2px' }}>
          expand_more
        </span>
      </button>

      {/* Sliding Dropdown Options Menu */}
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setIsOpen(false)} />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              width: '170px',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid var(--borde)',
              padding: '6px',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <button
              onClick={() => {
                onStatusChange(ticket.id, 'PENDING');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: ticket.status === 'PENDING' ? '#fee2e2' : 'transparent',
                color: '#b91c1c',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>pending</span>
              Pendiente
            </button>

            <button
              onClick={() => {
                onStatusChange(ticket.id, 'IN_PROGRESS');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: ticket.status === 'IN_PROGRESS' ? '#fef3c7' : 'transparent',
                color: '#b45309',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hourglass_top</span>
              En Preparación
            </button>

            <button
              onClick={() => {
                onStatusChange(ticket.id, 'COMPLETED');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: ticket.status === 'COMPLETED' ? '#dcfce7' : 'transparent',
                color: '#15803d',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
              ✓ Realizado
            </button>
          </div>
        </>
      )}
    </div>
  );
}
