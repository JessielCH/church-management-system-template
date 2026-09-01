'use client';

export default function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', textAlign: 'center', padding: '32px 28px', borderRadius: '20px' }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            backgroundColor: isDanger ? '#fee2e2' : '#e0e7ff',
            color: isDanger ? '#dc2626' : '#4338ca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
            {isDanger ? 'warning' : 'help_outline'}
          </span>
        </div>

        <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', color: '#1b1f3b', fontWeight: '700' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button type="button" className="secondary-button" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
            {cancelText}
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onConfirm}
            style={{
              flex: 1,
              backgroundColor: isDanger ? '#dc2626' : '#4338ca',
              justifyContent: 'center',
              fontWeight: '700',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
