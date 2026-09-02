'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  resetPasswordAction,
} from '@/app/actions/userActions';
import ConfirmModal from '@/components/ConfirmModal';

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Suggested username & generated password states
  const [suggestedUsername, setSuggestedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPasswordDetails, setShowPasswordDetails] = useState(null); // to show generated password after creation

  const [createState, formAction, isPending] = useActionState(createUserAction, null);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateUserAction, null);

  const formRef = useRef(null);

  useEffect(() => {
    async function loadUsers() {
      const res = await getUsersAction();
      if (res?.success) {
        setUsers(res.users);
      }
    }
    loadUsers();
  }, [createState, updateState]);

  useEffect(() => {
    if (createState?.success) {
      setShowNewModal(false);
      setShowPasswordDetails({
        name: createState.user.name,
        username: createState.user.username,
        password: createState.generatedPassword
      });
      if (formRef.current) formRef.current.reset();
    }
  }, [createState]);

  const handleNameChange = (e) => {
    const fullName = e.target.value.trim();
    if (fullName) {
      const parts = fullName.split(' ');
      if (parts.length > 1) {
        setSuggestedUsername((parts[0].charAt(0) + parts[1]).toLowerCase());
      } else {
        setSuggestedUsername(parts[0].toLowerCase());
      }
    } else {
      setSuggestedUsername('');
    }
  };

  const generateSecurePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const chars = upper + lower + nums + '!@#$%';
    
    let pass = 
      upper[Math.floor(Math.random() * upper.length)] + 
      lower[Math.floor(Math.random() * lower.length)] + 
      nums[Math.floor(Math.random() * nums.length)];
      
    while(pass.length < 8) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    setGeneratedPassword(pass);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      const targetId = deletingId;
      setDeletingId(null);
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      await deleteUserAction(targetId);
    }
  };

  const handleResetPassword = async (userId) => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    let newPass = upper[0] + lower[0] + nums[0] + Math.random().toString(36).slice(-5);
    
    if (window.confirm(`¿Estás seguro de restablecer la contraseña? Se generará una nueva y el usuario será forzado a cambiarla.`)) {
      const res = await resetPasswordAction(userId, newPass);
      if (res.success) {
        alert(`Contraseña restablecida con éxito.\nNueva contraseña temporal: ${newPass}`);
      } else {
        alert(res.error || 'Error al restablecer.');
      }
    }
  };

  return (
    <div>
      <div className="welcome-section" style={{ marginBottom: '28px' }}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Control total de accesos, roles y contraseñas del sistema.</p>
        </div>
        <button className="primary-button" onClick={() => {
          setSuggestedUsername('');
          setGeneratedPassword('');
          setShowNewModal(true);
        }}>
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      {createState?.error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>
          {createState.error}
        </div>
      )}

      {showPasswordDetails && (
        <div style={{ padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#047857', borderRadius: '12px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">check_circle</span>
            Usuario Creado Exitosamente
          </h3>
          <p style={{ margin: '4px 0' }}><strong>Nombre:</strong> {showPasswordDetails.name}</p>
          <p style={{ margin: '4px 0' }}><strong>Usuario:</strong> {showPasswordDetails.username}</p>
          <p style={{ margin: '4px 0', fontSize: '1.2rem' }}><strong>Contraseña Temporal:</strong> <code style={{ backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>{showPasswordDetails.password}</code></p>
          <p style={{ margin: '12px 0 0', fontSize: '0.9rem' }}><em>* Por favor copia esta contraseña y entrégasela al usuario. El sistema le pedirá cambiarla en su primer inicio de sesión.</em></p>
          <button className="secondary-button" style={{ marginTop: '16px' }} onClick={() => setShowPasswordDetails(null)}>Cerrar Mensaje</button>
        </div>
      )}

      <div className="content-card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#1b1f3b' }}>
          <span className="material-symbols-outlined text-vivid" style={{ fontSize: '26px' }}>admin_panel_settings</span>
          Usuarios del Sistema
        </h3>

        <div style={{ display: 'grid', gap: '14px' }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
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
                    borderRadius: '50%',
                    backgroundColor: user.role === 'ADMIN' ? '#fee2e2' : '#eef2ff',
                    color: user.role === 'ADMIN' ? '#b91c1c' : '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1b1f3b' }}>{user.name}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#4b5563' }}>
                    @{user.username}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="tag" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem' }}>
                  {user.role}
                </span>

                {user.mustChangePassword && (
                  <span className="tag" style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '6px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                    Cambio Pendiente
                  </span>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="action-btn"
                    onClick={() => handleResetPassword(user.id)}
                    title="Restablecer Contraseña"
                    style={{ color: '#047857', borderColor: '#d1fae5', backgroundColor: '#d1fae5' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>key</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setEditingUser(user)}
                    title="Editar Usuario"
                    style={{ color: '#4338ca', borderColor: '#e0e7ff', backgroundColor: '#e0e7ff' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setDeletingId(user.id)}
                    title="Eliminar Usuario"
                    style={{ color: '#b91c1c', borderColor: '#fee2e2', backgroundColor: '#fee2e2' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        title="¿Eliminar Usuario?"
        message="Esta acción no se puede deshacer. El usuario perderá el acceso al sistema permanentemente."
        confirmText="Sí, Eliminar"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingId(null)}
      />

      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Usuario del Sistema</h2>
              <button className="action-btn" onClick={() => setShowNewModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form action={formAction} ref={formRef}>
              <div className="form-group">
                <label>Nombre y Apellido</label>
                <input type="text" name="name" placeholder="Ej. Juan Perez" required onChange={handleNameChange} />
              </div>

              <div className="form-group">
                <label>Usuario Sugerido</label>
                <input type="text" name="username" value={suggestedUsername} onChange={(e) => setSuggestedUsername(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Rol de Acceso</label>
                <select name="role" required>
                  <option value="LEADER">Líder (Acceso Básico)</option>
                  <option value="PASTOR">Pastor (Agenda)</option>
                  <option value="SECRETARIA">Secretaría</option>
                  <option value="COORDINADOR">Coordinador</option>
                  <option value="MULTIMEDIA">Multimedia (Solo Calendario y Multimedia)</option>
                  <option value="ADMIN">Administrador (Total)</option>
                </select>
              </div>

              <div className="form-group" style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid var(--borde)' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Contraseña Inicial
                  <button type="button" onClick={generateSecurePassword} style={{ fontSize: '0.8rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Auto-generar
                  </button>
                </label>
                <input type="text" name="password" value={generatedPassword} onChange={(e) => setGeneratedPassword(e.target.value)} placeholder="Ej. Temp1234! (Opcional)" />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '6px 0 0' }}>Si dejas este campo vacío, el sistema generará una contraseña segura automáticamente.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" disabled={isPending} className="primary-button">{isPending ? 'Creando...' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button className="action-btn" onClick={() => setEditingUser(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateFormAction(formData);
                setEditingUser(null);
              }}
            >
              <input type="hidden" name="id" value={editingUser.id} />
              
              <div className="form-group">
                <label>Nombre y Apellido</label>
                <input type="text" name="name" defaultValue={editingUser.name} required />
              </div>

              <div className="form-group">
                <label>Rol de Acceso</label>
                <select name="role" defaultValue={editingUser.role} required>
                  <option value="LEADER">Líder (Acceso Básico)</option>
                  <option value="PASTOR">Pastor (Agenda)</option>
                  <option value="SECRETARIA">Secretaría</option>
                  <option value="COORDINADOR">Coordinador</option>
                  <option value="MULTIMEDIA">Multimedia (Solo Calendario y Multimedia)</option>
                  <option value="ADMIN">Administrador (Total)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setEditingUser(null)}>Cancelar</button>
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
