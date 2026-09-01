import Link from 'next/link';

export default function UnderConstruction({ title, description }) {
  return (
    <div className="maintenance-container">
      <div className="maintenance-icon">
        <span className="material-symbols-outlined">settings_suggest</span>
      </div>
      <h2 className="maintenance-title">{title}</h2>
      <p className="maintenance-text">
        {description || 'Esta sección se encuentra en mantenimiento y actualización. Estará disponible muy pronto.'}
      </p>
      <div style={{ marginBottom: '24px' }}>
        <span className="sprint-badge">En Mantenimiento y Actualización</span>
      </div>
      <Link href="/" className="primary-button">
        <span className="material-symbols-outlined">arrow_back</span>
        Volver al Inicio
      </Link>
    </div>
  );
}
