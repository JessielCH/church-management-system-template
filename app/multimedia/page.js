'use client';

import { useState, useActionState, useEffect } from 'react';
import { getTicketsAction, createWorshipTicketAction, createMediaRequestAction, updateTicketStatusAction } from '@/app/actions/ticketActions';

export default function MultimediaPage() {
  const [activeTab, setActiveTab] = useState('worship'); // 'worship' | 'media' | 'calendar'
  const [showWorshipModal, setShowWorshipModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [tickets, setTickets] = useState([]);

  // Dates logic for Media Request (3 days before suggestion)
  const [activityDate, setActivityDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [isTightDeadline, setIsTightDeadline] = useState(false);

  const [worshipState, worshipFormAction, isWorshipPending] = useActionState(createWorshipTicketAction, null);
  const [mediaState, mediaFormAction, isMediaPending] = useActionState(createMediaRequestAction, null);

  useEffect(() => {
    async function loadTickets() {
      const res = await getTicketsAction();
      if (res?.success) {
        setTickets(res.tickets || []);
      }
    }
    loadTickets();
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

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
    await updateTicketStatusAction(id, nextStatus);
  };

  const worshipTickets = tickets.filter((t) => t.category === 'WORSHIP_SONG');
  const mediaTickets = tickets.filter((t) => t.category === 'MEDIA_REQUEST');

  return (
    <div className="main-content">
      <div className="page-header flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Módulo Multimedia y Proyección de Alabanzas</h1>
          <p className="subtitle">Gestión de tickets de letras para proyección en cultos y peticiones de producción semanal.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="primary-button" onClick={() => setShowWorshipModal(true)} style={{ backgroundColor: '#ea580c' }}>
            <span className="material-symbols-outlined">queue_music</span>
            + Ticket de Alabanza
          </button>

          <button className="primary-button" onClick={() => setShowMediaModal(true)} style={{ backgroundColor: '#4338ca' }}>
            <span className="material-symbols-outlined">video_settings</span>
            + Petición de Publicidad
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
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
          <span className="material-symbols-outlined">video_library</span>
          Producción de Video y Gráfica ({mediaTickets.length})
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
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined text-vivid">music_note</span>
            Cola de Alabanzas para Proyectar en Culto
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {worshipTickets.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', border: '1px dashed var(--borde)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#9ca3af', marginBottom: '8px' }}>queue_music</span>
                <p style={{ margin: 0, fontWeight: '600' }}>No hay alabanzas registradas en la cola.</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Presiona "+ Ticket de Alabanza" para ingresar el título, autor y quién dirige.</p>
              </div>
            ) : (
              worshipTickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--borde)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined">queue_music</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1b1f3b' }}>{t.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                        {t.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor:
                          t.status === 'COMPLETED' ? '#dcfce7' : t.status === 'IN_PROGRESS' ? '#fef3c7' : '#fee2e2',
                        color:
                          t.status === 'COMPLETED' ? '#15803d' : t.status === 'IN_PROGRESS' ? '#b45309' : '#b91c1c',
                      }}
                    >
                      {t.status === 'COMPLETED' ? 'Listo para Culto' : t.status === 'IN_PROGRESS' ? 'En Preparación' : 'Pendiente'}
                    </span>

                    <button
                      className="action-btn"
                      onClick={() => handleStatusToggle(t.id, t.status)}
                      title="Cambiar Estado"
                    >
                      <span className="material-symbols-outlined">sync_alt</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Weekly Media Requests */}
      {activeTab === 'media' && (
        <div className="content-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined text-vivid">movie</span>
            Peticiones de Videos, Anuncios y Gráficas Semanales
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mediaTickets.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', border: '1px dashed var(--borde)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#9ca3af', marginBottom: '8px' }}>video_library</span>
                <p style={{ margin: 0, fontWeight: '600' }}>No hay solicitudes de publicidad o video pendientes.</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Pastores, Líderes y Secretarias pueden enviar peticiones usando "+ Petición de Publicidad".</p>
              </div>
            ) : (
              mediaTickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--borde)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined">video_settings</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1b1f3b' }}>{t.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                        {t.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor:
                          t.status === 'COMPLETED' ? '#dcfce7' : t.status === 'IN_PROGRESS' ? '#fef3c7' : '#fee2e2',
                        color:
                          t.status === 'COMPLETED' ? '#15803d' : t.status === 'IN_PROGRESS' ? '#b45309' : '#b91c1c',
                      }}
                    >
                      {t.status === 'COMPLETED' ? 'Publicado' : t.status === 'IN_PROGRESS' ? 'En Edición' : 'Pendiente'}
                    </span>

                    <button
                      className="action-btn"
                      onClick={() => handleStatusToggle(t.id, t.status)}
                      title="Cambiar Estado"
                    >
                      <span className="material-symbols-outlined">sync_alt</span>
                    </button>
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
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined text-vivid">calendar_month</span>
            Calendario de Entregas para Cultos y Eventos
          </h3>

          {tickets.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', border: '1px dashed var(--borde)', borderRadius: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#9ca3af', marginBottom: '8px' }}>event_busy</span>
              <p style={{ margin: 0, fontWeight: '600' }}>No hay eventos programados en el calendario multimedia.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--borde)',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: t.category === 'WORSHIP_SONG' ? '#ea580c' : '#4338ca',
                      }}
                    >
                      {t.category === 'WORSHIP_SONG' ? '🎵 Alabanza' : '🎬 Producción'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                      Entrega: {new Date(t.eventDate || Date.now()).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1b1f3b' }}>{t.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#4b5563' }}>{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Ticket de Alabanza */}
      {showWorshipModal && (
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
                <label>¿Quién dirige esa semana? / Líder de Alabanza</label>
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

      {/* MODAL 2: Petición de Publicidad / Media */}
      {showMediaModal && (
        <div className="modal-backdrop" onClick={() => setShowMediaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎬 Petición de Publicidad y Producción</h2>
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
