'use client';

import { useActionState, useEffect } from 'react';
import Image from 'next/image';
import { updatePasswordAction } from '@/app/actions/authActions';

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null);

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Image
            src="/images/logo.svg"
            alt="Church Logo"
            width={56}
            height={56}
            style={{ borderRadius: '14px', marginBottom: '10px' }}
          />
          <h1 style={styles.title}>Cambio Obligatorio de Contraseña</h1>
          <p style={styles.subtitle}>
            Es tu primer inicio de sesión. Por seguridad, debes definir tu nueva contraseña personal.
          </p>
        </div>

        {state?.error && (
          <div style={styles.errorAlert}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nueva Contraseña Personal</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock_reset</span>
              <input
                type="password"
                name="newPassword"
                placeholder="Ej: Aa1... (6-12 caracteres)"
                required
                minLength={6}
                maxLength={12}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirmar Nueva Contraseña</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>check_circle</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repite la nueva contraseña"
                required
                minLength={6}
                maxLength={12}
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
            <span className="material-symbols-outlined">save</span>
            {isPending ? 'Guardando Contraseña...' : 'Actualizar Contraseña y Entrar'}
          </button>
        </form>
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
    maxWidth: '440px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1b1f3b',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginTop: '6px',
    lineHeight: '1.4',
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
};
