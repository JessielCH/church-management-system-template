'use client';

import { useState, useEffect, useActionState } from 'react';
import { getEventsAction, createEventAction, updateEventAction, deleteEventAction } from '@/app/actions/agendaActions';
import { getSession } from '@/app/actions/authActions';
import ConfirmModal from '@/components/ConfirmModal';

export default function CalendarioPage() {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);

  const [createState, createFormAction, isCreatePending] = useActionState(createEventAction, null);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateEventAction, null);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (session) {
        setUserRole(session.role);
      }
      const res = await getEventsAction();
      if (res?.success) {
        // Show all upcoming/past events, sorted by date (handled in server action)
        setEvents(res.events || []);
      }
    }
    init();
  }, [createState, updateState]);

  const handleConfirmDelete = async () => {
    if (deletingEventId) {
      const targetId = deletingEventId;
      setDeletingEventId(null);
      setEvents((prev) => prev.filter((e) => e.id !== targetId));
      await deleteEventAction(targetId);
    }
  };

  // Only Secretary, Coordinator, and Admin can create/edit/delete general events
  const canManageEvents = ['SECRETARIA', 'COORDINADOR', 'ADMIN'].includes(userRole);

  const translateType = (type) => {
    switch (type) {
      case 'SERVICE': return '⛪ Culto General';
      case 'MINISTRY': return '👥 Reunión de Ministerio';
      case 'TEACHING': return '📚 Enseñanza / Discipulado';
      case 'OUTREACH': return '🌍 Evangelismo';
      default: return type;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'SERVICE': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'MINISTRY': return { bg: '#fce7f3', text: '#be185d' };
      case 'TEACHING': return { bg: '#ffedd5', text: '#c2410c' };
      case 'OUTREACH': return { bg: '#dcfce7', text: '#15803d' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div>
      <div className="welcome-section" style={{ marginBottom: '28px' }}>
        <div>
          <h1>Calendario de Eventos</h1>
          <p>Visualización de fechas de próximos eventos, cultos y reuniones de la iglesia.</p>
        </div>

        {canManageEvents && (
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">event_note</span>
            + Nuevo Evento
          </button>
        )}
      </div>

      <div className="content-card">
        {events.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280', border: '2px dashed var(--borde)', borderRadius: '16px', backgroundColor: '#fafafa' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '12px' }}>event_busy</span>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: '#1b1f3b' }}>No hay eventos programados en el calendario.</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>Las fechas de los próximos eventos serán agregadas por el Secretario o Coordinador.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {events.map((e) => {
              const dateObj = new Date(e.date);
              const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
              const colors = getEventColor(e.type);

              return (
                <div
                  key={e.id}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--borde)',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    opacity: isPast ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      backgroundColor: '#1b1f3b',
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      minWidth: '60px'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: '1' }}>{dateObj.getDate()}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
                        {dateObj.toLocaleString('es-ES', { month: 'short' })}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: colors.text,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: colors.bg,
                      }}
                    >
                      {translateType(e.type)}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '700', color: '#1b1f3b' }}>{e.title}</h4>
                  
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                    {dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                    {e.location}
                  </div>

                  {canManageEvents && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--borde)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="action-btn"
                        onClick={() => setEditingEvent(e)}
                        title="Editar Evento"
                        style={{ color: '#4338ca', borderColor: '#e0e7ff', backgroundColor: '#e0e7ff' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => setDeletingEventId(e.id)}
                        title="Eliminar Evento"
                        style={{ color: '#b91c1c', borderColor: '#fee2e2', backgroundColor: '#fee2e2' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deletingEventId}
        title="¿Eliminar Evento?"
        message="Esta acción no se puede deshacer. Se eliminará el evento del calendario de forma permanente."
        confirmText="Sí, Eliminar Evento"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingEventId(null)}
      />

      {/* CREATE MODAL */}
      {showModal && canManageEvents && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Nuevo Evento de Iglesia</h2>
              <button className="action-btn" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              action={async (formData) => {
                await createFormAction(formData);
                setShowModal(false);
              }}
            >
              <div className="form-group">
                <label>Título del Evento</label>
                <input type="text" name="title" required placeholder="Ej. Culto Dominical / Bautismos" />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input type="datetime-local" name="date" required />
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input type="text" name="location" defaultValue="Templo Principal IEBB" required />
              </div>

              <div className="form-group">
                <label>Tipo de Evento</label>
                <select name="type">
                  <option value="SERVICE">⛪ Culto General</option>
                  <option value="MINISTRY">👥 Reunión de Ministerio</option>
                  <option value="TEACHING">📚 Enseñanza / Discipulado</option>
                  <option value="OUTREACH">🌍 Evangelismo / Misiones</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={isCreatePending}>
                  {isCreatePending ? 'Guardando...' : 'Guardar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEvent && canManageEvents && (
        <div className="modal-backdrop" onClick={() => setEditingEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Evento de Iglesia</h2>
              <button className="action-btn" onClick={() => setEditingEvent(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              action={async (formData) => {
                await updateFormAction(formData);
                setEditingEvent(null);
              }}
            >
              <input type="hidden" name="id" value={editingEvent.id} />
              <div className="form-group">
                <label>Título del Evento</label>
                <input type="text" name="title" defaultValue={editingEvent.title} required />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input
                  type="datetime-local"
                  name="date"
                  defaultValue={new Date(new Date(editingEvent.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input type="text" name="location" defaultValue={editingEvent.location} required />
              </div>

              <div className="form-group">
                <label>Tipo de Evento</label>
                <select name="type" defaultValue={editingEvent.type}>
                  <option value="SERVICE">⛪ Culto General</option>
                  <option value="MINISTRY">👥 Reunión de Ministerio</option>
                  <option value="TEACHING">📚 Enseñanza / Discipulado</option>
                  <option value="OUTREACH">🌍 Evangelismo / Misiones</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setEditingEvent(null)}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={isUpdatePending}>
                  {isUpdatePending ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
