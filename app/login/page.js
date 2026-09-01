'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { loginAction } from '@/app/actions/authActions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Image
            src="/images/logo.svg"
            alt="Church Logo"
            width={64}
            height={64}
            style={{ borderRadius: '16px', marginBottom: '12px' }}
          />
          <h1 style={styles.title}>Church Admin</h1>
          <p style={styles.subtitle}>Sistema de Gestión Eclesiástica</p>
        </div>

        {state?.error && (
          <div style={styles.errorAlert}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nombre de Usuario (Username)</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>person</span>
              <input
                type="text"
                name="username"
                placeholder="Ej. admin"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Contraseña Inicial / Temporal</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="primary-button"
            style={styles.submitBtn}
          >
            <span className="material-symbols-outlined">login</span>
            {isPending ? 'Iniciando Sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div style={styles.footerNote}>
          <p>🔒 Acceso restringido a líderes y administradores autorizados.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1f3b',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#1b1f3b',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#6b7280',
    marginTop: '4px',
  },
  errorAlert: {
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1b1f3b',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6b7280',
    fontSize: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    fontSize: '0.9rem',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '12px',
    marginTop: '8px',
    fontSize: '0.95rem',
  },
  footerNote: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '0.78rem',
    color: '#6b7280',
  },
};
