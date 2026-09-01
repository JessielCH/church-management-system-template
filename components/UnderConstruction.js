import Link from 'next/link';

export default function UnderConstruction({ title, sprint, description }) {
  return (
    <div className="maintenance-container">
      <div className="maintenance-icon">
        <span className="material-symbols-outlined">engineering</span>
      </div>
      <h2 className="maintenance-title">{title}</h2>
      <p className="maintenance-text">
        {description || 'Este módulo está actualmente en desarrollo como parte de la hoja de ruta de la Versión 1 (V1).'}
      </p>
      <div style={{ marginBottom: '24px' }}>
        <span className="sprint-badge">Programado para: {sprint}</span>
      </div>
      <Link href="/" className="primary-button">
        <span className="material-symbols-outlined">arrow_back</span>
        Volver al Dashboard
      </Link>
    </div>
  );
}
