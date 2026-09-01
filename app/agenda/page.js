'use client';

import { useState, useActionState, useEffect } from 'react';
import {
  getEventsAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from '@/app/actions/agendaActions';
import { getSession } from '@/app/actions/authActions';

export default function AgendaPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState({
    none: false,
    oneHour: true,
    oneDay: true,
    oneWeek: false,
  });

  const [createState, formAction, isPending] = useActionState(createEventAction, null);
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

  const handleReminderChange = (key) => {
    if (key === 'none') {
      setReminders({
        none: true,
        oneHour: false,
        oneDay: false,
        oneWeek: false,
      });
    } else {
      setReminders((prev) => ({
        ...prev,
        none: false,
        [key]: !prev[key],
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento de la agenda?')) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      await deleteEventAction(id);
    }
  };

  const isAllowedAdmin = ['PASTOR', 'COORDINADOR', 'SECRETARIA', 'MULTIMEDIA', 'ADMIN'].includes(userRole);

  return (
    <div>
      <div className="welcome-section" style={{ marginBottom: '32px' }}>
        <div>
          <h1>Agenda Pastoral</h1>
          <p>Gestión de actividades, visitas pastorales y notificaciones por WhatsApp.</p>
        </div>
        {isAllowedAdmin && (
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">event</span>
            + Nuevo Evento / Cita
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: '32px' }}>
        <div className="kpi-card">
          <span className="material-symbols-outlined icon text-vivid" style={{ fontSize: '28px' }}>today</span>
          <div className="kpi-details">
            <h3>Eventos Programados</h3>
            <span className="value">{events.length}</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined icon text-warning" style={{ fontSize: '28px' }}>how_to_reg</span>
          <div className="kpi-details">
            <h3>Visitas Pastoral</h3>
            <span className="value">{events.filter((e) => e.type === 'PASTORAL').length}</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined icon text-success" style={{ fontSize: '28px' }}>chat</span>
          <div className="kpi-details">
            <h3>Notificaciones WA</h3>
            <span className="value" style={{ color: '#25D366' }}>Activo</span>
          </div>
        </div>
      </div>

      {/* Events List with Admin Edit & Delete Actions */}
      <div className="content-card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#1b1f3b' }}>
          <span className="material-symbols-outlined text-vivid" style={{ fontSize: '26px' }}>calendar_month</span>
          Próximas Actividades y Compromisos
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {events.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280', border: '2px dashed var(--borde)', borderRadius: '16px', backgroundColor: '#fafafa' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '12px' }}>event_busy</span>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '1.05rem', color: '#1b1f3b' }}>No hay actividades registradas en la agenda.</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>Presiona "+ Nuevo Evento / Cita" para programar una visita pastoral o culto.</p>
            </div>
          ) : (
            events.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderRadius: '16px',
                  border: '1px solid var(--borde)',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>event_available</span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1b1f3b' }}>{item.title}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#4b5563' }}>
                      📅 {new Date(item.date).toLocaleDateString('es-ES')} • 📍 {item.location}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="tag" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem' }}>
                    {item.type || 'SERVICIO'}
                  </span>

                  {/* Admin CRUD Actions */}
                  {isAllowedAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="action-btn"
                        onClick={() => setEditingEvent(item)}
                        title="Editar Evento"
                        style={{ color: '#4338ca', borderColor: '#e0e7ff', backgroundColor: '#e0e7ff' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleDelete(item.id)}
                        title="Eliminar Evento"
                        style={{ color: '#b91c1c', borderColor: '#fee2e2', backgroundColor: '#fee2e2' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal 1: New Event */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Evento y Recordatorio Pastoral</h2>
              <button className="action-btn" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              action={async (formData) => {
                await formAction(formData);
                setShowModal(false);
              }}
            >
              <div className="form-group">
                <label>Título del Evento / Visita</label>
                <input type="text" name="title" placeholder="Ej. Visita Pastoral a Familia López" required />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input type="datetime-local" name="date" required />
              </div>

              <div className="form-group">
                <label>Lugar / Dirección</label>
                <input type="text" name="location" placeholder="Ej. Templo Principal" />
              </div>

              <div className="form-group">
                <label>Tipo de Actividad</label>
                <select name="type">
                  <option value="SERVICE">Culto / Servicio</option>
                  <option value="PASTORAL">Visita Pastoral</option>
                  <option value="TEACHING">Discipulado / Enseñanza</option>
                  <option value="MEETING">Reunión de Liderazgo</option>
                </select>
              </div>

              {/* WhatsApp Multi-choice Reminders */}
              <div className="form-group" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid var(--borde)' }}>
                <label style={{ color: '#25D366', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined">chat</span>
                  Recordatorios por WhatsApp (Selección Múltiple)
                </label>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '4px 0 12px' }}>
                  Elige una o varias opciones para recibir alertas automáticas en tu WhatsApp:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      name="whatsappReminders"
                      value="NONE"
                      checked={reminders.none}
                      onChange={() => handleReminderChange('none')}
                    />
                    <span>Ninguno (Desactivar)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      name="whatsappReminders"
                      value="1_HOUR"
                      checked={reminders.oneHour}
                      onChange={() => handleReminderChange('oneHour')}
                    />
                    <span>1 Hora Antes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      name="whatsappReminders"
                      value="1_DAY"
                      checked={reminders.oneDay}
                      onChange={() => handleReminderChange('oneDay')}
                    />
                    <span>1 Día Antes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      name="whatsappReminders"
                      value="1_WEEK"
                      checked={reminders.oneWeek}
                      onChange={() => handleReminderChange('oneWeek')}
                    />
                    <span>1 Semana Antes</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="primary-button">
                  {isPending ? 'Guardando...' : 'Guardar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Event */}
      {editingEvent && (
        <div className="modal-backdrop" onClick={() => setEditingEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Evento de la Agenda</h2>
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
                <label>Título del Evento / Visita</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingEvent.title}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input
                  type="datetime-local"
                  name="date"
                  defaultValue={new Date(editingEvent.date).toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lugar / Dirección</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingEvent.location}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Actividad</label>
                <select name="type" defaultValue={editingEvent.type || 'SERVICE'}>
                  <option value="SERVICE">Culto / Servicio</option>
                  <option value="PASTORAL">Visita Pastoral</option>
                  <option value="TEACHING">Discipulado / Enseñanza</option>
                  <option value="MEETING">Reunión de Liderazgo</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setEditingEvent(null)}>
                  Cancelar
                </button>
                <button type="submit" disabled={isUpdatePending} className="primary-button" style={{ backgroundColor: '#4338ca' }}>
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
