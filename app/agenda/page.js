'use client';

import { useState, useActionState } from 'react';
import { createEventAction } from '@/app/actions/agendaActions';

export default function AgendaPage() {
  const [showModal, setShowModal] = useState(false);
  const [reminders, setReminders] = useState({
    none: false,
    oneHour: true,
    oneDay: true,
    oneWeek: false,
  });

  const [state, formAction, isPending] = useActionState(createEventAction, null);

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

  const sampleEvents = [
    {
      id: '1',
      title: 'Visita Pastoral: Familia Pérez',
      date: '2026-09-02 • 16:00',
      location: 'Sector Centro',
      type: 'Pastoral',
      whatsapp: ['1 Día Antes', '1 Hora Antes'],
    },
    {
      id: '2',
      title: 'Reunión de Consejo Pastoral',
      date: '2026-09-03 • 19:00',
      location: 'Salón Ministerial',
      type: 'Liderazgo',
      whatsapp: ['1 Día Antes'],
    },
    {
      id: '3',
      title: 'Culto Dominical Principal',
      date: '2026-09-06 • 09:30',
      location: 'Templo Principal',
      type: 'Culto',
      whatsapp: ['1 Semana Antes', '1 Día Antes'],
    },
  ];

  return (
    <div className="main-content">
      <div className="page-header flex-between">
        <div>
          <h1>Agenda Pastoral y Calendario Eclesiástico</h1>
          <p className="subtitle">Gestión de actividades, visitas pastorales y notificaciones por WhatsApp.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined">event</span>
          Nuevo Evento / Cita
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <span className="material-symbols-outlined icon text-vivid">today</span>
          <div className="kpi-details">
            <h3>Eventos esta Semana</h3>
            <span className="value">5</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined icon text-warning">how_to_reg</span>
          <div className="kpi-details">
            <h3>Visitas Programadas</h3>
            <span className="value">3</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="material-symbols-outlined icon text-success">chat</span>
          <div className="kpi-details">
            <h3>Recordatorios WhatsApp</h3>
            <span className="value" style={{ color: '#25D366' }}>Activo</span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="content-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">calendar_month</span>
          Próximas Actividades y Compromisos
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sampleEvents.map((item) => (
            <div
              key={item.id}
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
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#1b1f3b' }}>{item.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    📅 {item.date} • 📍 {item.location}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="tag" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                  {item.type}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {item.whatsapp.map((w, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: '600',
                      }}
                    >
                      💬 WA: {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal New Event with Multi-choice WhatsApp Reminders */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Nuevo Evento y Recordatorio Pastoral</h2>
              <button className="icon-button" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form action={formAction}>
              <div className="form-group">
                <label>Título del Evento / Visita</label>
                <input type="text" name="title" placeholder="Ej. Visita Pastoral a Familia López" required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Fecha y Hora</label>
                  <input type="datetime-local" name="date" required />
                </div>
                <div className="form-group">
                  <label>Lugar / Dirección</label>
                  <input type="text" name="location" placeholder="Ej. Templo Principal" />
                </div>
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
              <div className="form-group" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px' }}>
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

              <div className="modal-actions" style={{ marginTop: '20px' }}>
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
    </div>
  );
}
