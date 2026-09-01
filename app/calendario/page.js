'use client';

import { useState, useEffect, useActionState } from 'react';
import { getEventsAction, createEventAction, updateEventAction, deleteEventAction } from '@/app/actions/agendaActions';
import { getSession } from '@/app/actions/authActions';
import ConfirmModal from '@/components/ConfirmModal';

export default function CalendarioPage() {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null); // { day, events }

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const canManageEvents = ['SECRETARIA', 'COORDINADOR', 'ADMIN'].includes(userRole);

  const translateType = (type) => {
    switch (type) {
      case 'SERVICE': return '⛪ Culto';
      case 'MINISTRY': return '👥 Ministerio';
      case 'TEACHING': return '📚 Enseñanza';
      case 'OUTREACH': return '🌍 Evangelismo';
      default: return type;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'SERVICE': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'MINISTRY': return { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' };
      case 'TEACHING': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'OUTREACH': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
  };

  // --- Calendar Math & Logic ---
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sunday, 1 = Monday
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Generate calendar grid array
  const calendarDays = [];
  // Fill empty slots before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Helper to open modal prefilled with clicked day
  const handleDayClick = (dayNumber) => {
    if (!canManageEvents || !dayNumber) return;
    const dateToSet = new Date(currentYear, currentMonthIndex, dayNumber, 19, 0); // Default to 7:00 PM
    const localIsoString = new Date(dateToSet.getTime() - dateToSet.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setSelectedDateForNewEvent(localIsoString);
    setShowModal(true);
  };

  return (
    <div>
      <div className="welcome-section" style={{ marginBottom: '28px' }}>
        <div>
          <h1>Calendario de Eventos IEBB</h1>
          <p>Fechas de próximos cultos, ministerios y actividades generales de la iglesia.</p>
        </div>

        {canManageEvents && (
          <button className="primary-button" onClick={() => { setSelectedDateForNewEvent(null); setShowModal(true); }}>
            <span className="material-symbols-outlined">add_circle</span>
            + Añadir Evento
          </button>
        )}
      </div>

      <div className="content-card" style={{ padding: '24px' }}>
        {/* Calendar Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'nowrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="icon-button" onClick={prevMonth} style={{ backgroundColor: '#f3f4f6', flexShrink: 0 }}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', fontWeight: '800', color: '#1b1f3b', textAlign: 'center' }}>
              {monthNames[currentMonthIndex]} {currentYear}
            </h2>
            <button className="icon-button" onClick={nextMonth} style={{ backgroundColor: '#f3f4f6', flexShrink: 0 }}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <button 
            onClick={goToday} 
            style={{ 
              padding: '6px 12px', 
              borderRadius: '8px', 
              border: '1px solid var(--borde)', 
              backgroundColor: '#ffffff', 
              fontWeight: '600', 
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            Hoy
          </button>
        </div>

        <div className="calendar-container">
          {/* Calendar Grid Header */}
          <div className="calendar-grid-header">
            <div>Dom</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
          </div>

          {/* Calendar Grid Body */}
          <div className="calendar-grid-body">
            {calendarDays.map((day, idx) => {
              const isToday = day === new Date().getDate() && currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear();
              
              // Filter events for this specific day
              const dayEvents = day ? events.filter(e => {
                const eDate = new Date(e.date);
                return eDate.getDate() === day && eDate.getMonth() === currentMonthIndex && eDate.getFullYear() === currentYear;
              }) : [];

              return (
                <div 
                  key={idx} 
                  className={`calendar-cell ${day ? 'active' : 'empty'} ${isToday ? 'today' : ''}`}
                  onClick={() => {
                    if (day) {
                      // Open the new Day Events Modal
                      setSelectedDayEvents({ day, events: dayEvents });
                    }
                  }}
                >
                  {day && (
                    <div className="calendar-day-header">
                      <span className="day-number">{day}</span>
                    </div>
                  )}

                  {/* Render events as small pills (dots on mobile) */}
                  <div className="calendar-events-container">
                    {dayEvents.map(ev => {
                      const colors = getEventColor(ev.type);
                      const evTime = new Date(ev.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div 
                          key={ev.id}
                          className="calendar-event-pill"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border
                          }}
                          title={`${ev.title} - ${evTime}`}
                        >
                          <span className="event-title">{ev.title}</span>
                          <span className="event-time">{evTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingEventId}
        title="¿Eliminar Evento?"
        message="Esta acción no se puede deshacer. Se eliminará el evento del calendario de forma permanente."
        confirmText="Sí, Eliminar Evento"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingEventId(null)}
      />

      {/* DAY EVENTS MODAL */}
      {selectedDayEvents && (
        <div className="modal-backdrop" onClick={() => setSelectedDayEvents(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Eventos del {selectedDayEvents.day} de {monthNames[currentMonthIndex]}</h2>
              <button className="action-btn" onClick={() => setSelectedDayEvents(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              {selectedDayEvents.events.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '16px' }}>No hay eventos programados para este día.</p>
              ) : (
                selectedDayEvents.events.map(ev => {
                  const colors = getEventColor(ev.type);
                  const evTime = new Date(ev.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, borderRadius: '8px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', color: colors.text, fontSize: '1rem', fontWeight: '700' }}>{ev.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: colors.text }}>🕒 {evTime} | 📍 {ev.location}</p>
                      </div>
                      {canManageEvents && (
                        <button 
                          className="action-btn" 
                          style={{ backgroundColor: '#ffffff', borderColor: colors.border }}
                          onClick={() => {
                            setSelectedDayEvents(null);
                            setEditingEvent(ev);
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: colors.text }}>edit</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {canManageEvents && (
              <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
                <button 
                  className="primary-button" 
                  onClick={() => {
                    setSelectedDayEvents(null);
                    handleDayClick(selectedDayEvents.day);
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Añadir Evento este día
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                <input 
                  type="datetime-local" 
                  name="date" 
                  defaultValue={selectedDateForNewEvent || ''} 
                  required 
                />
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

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <button 
                  type="button" 
                  className="secondary-button" 
                  style={{ color: '#b91c1c', borderColor: '#fee2e2', backgroundColor: '#fee2e2' }}
                  onClick={() => {
                    setDeletingEventId(editingEvent.id);
                    setEditingEvent(null);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  Eliminar
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="secondary-button" onClick={() => setEditingEvent(null)}>Cancelar</button>
                  <button type="submit" className="primary-button" disabled={isUpdatePending}>
                    {isUpdatePending ? 'Actualizando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
