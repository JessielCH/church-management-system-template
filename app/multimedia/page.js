'use client';

import { useState, useActionState, useEffect } from 'react';
import { getTicketsAction, createTicketAction, updateTicketStatusAction } from '@/app/actions/ticketActions';

export default function MultimediaPage() {
  const [activeTab, setActiveTab] = useState('worship'); // 'worship' | 'media' | 'calendar'
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);

  const [state, formAction, isPending] = useActionState(createTicketAction, null);

  useEffect(() => {
    async function loadTickets() {
      const res = await getTicketsAction();
      if (res?.success) {
        setTickets(res.tickets);
      }
    }
    loadTickets();
  }, [state]);

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
      <div className="page-header flex-between">
        <div>
          <h1>Módulo Multimedia y Proyección de Alabanzas</h1>
          <p className="subtitle">Gestión de tickets de letras para proyección en cultos y peticiones de producción semanal.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined">add_task</span>
          Nuevo Ticket / Solicitud
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('worship')}
          className={`secondary-button ${activeTab === 'worship' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'worship' ? '#1b1f3b' : 'transparent',
            color: activeTab === 'worship' ? '#ffffff' : '#4b5563',
          }}
        >
          <span className="material-symbols-outlined">queue_music</span>
          Proyección de Alabanzas ({worshipTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`secondary-button ${activeTab === 'media' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'media' ? '#1b1f3b' : 'transparent',
            color: activeTab === 'media' ? '#ffffff' : '#4b5563',
          }}
        >
          <span className="material-symbols-outlined">video_library</span>
          Producción de Video y Gráfica ({mediaTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`secondary-button ${activeTab === 'calendar' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'calendar' ? '#1b1f3b' : 'transparent',
            color: activeTab === 'calendar' ? '#ffffff' : '#4b5563',
          }}
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
            Cola de Alabanzas para Proyectar (Letras y Tonos)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {worshipTickets.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No hay alabanzas pendientes en la cola de proyección.</p>
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
                    border: '1px solid #e5e7eb',
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
                      }}
                    >
                      <span className="material-symbols-outlined">queue_music</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1b1f3b' }}>{t.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                        {t.description || 'Sin notas adicionales'} • Solicitado por: <strong>{t.requestedBy}</strong>
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
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No hay solicitudes de publicidad o video pendientes.</p>
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
                    border: '1px solid #e5e7eb',
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
                      }}
                    >
                      <span className="material-symbols-outlined">video_settings</span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1b1f3b' }}>{t.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                        {t.description || 'Sin detalles'} • Solicitado por: <strong>{t.requestedBy}</strong>
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
          <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '16px' }}>
            Visualización de fechas límite para proyección de alabanzas y videos de anuncios (sin notificaciones de WhatsApp).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
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
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#4b5563' }}>{t.description || 'Sin observaciones'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Ticket Creation */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Levantar Ticket Multimedia</h2>
              <button className="icon-button" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form action={formAction}>
              <div className="form-group">
                <label>Categoría del Ticket</label>
                <select name="category">
                  <option value="WORSHIP_SONG">🎵 Alabanza / Letra para Proyectar</option>
                  <option value="MEDIA_REQUEST">🎬 Video de Anuncio / Gráfica / Publicidad</option>
                </select>
              </div>

              <div className="form-group">
                <label>Título o Nombre de la Alabanza/Proyecto</label>
                <input type="text" name="title" placeholder="Ej. Cuán Grande es Él (Tono G) o Video Campamento" required />
              </div>

              <div className="form-group">
                <label>Detalles / Tonos / Observaciones</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Ej. Tono Sol Mayor, incluir estrofas 1 a 4 y puente..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>

              <div className="form-group">
                <label>Fecha del Culto o Límite de Entrega</label>
                <input type="date" name="eventDate" required />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="primary-button">
                  {isPending ? 'Guardando...' : 'Crear Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
