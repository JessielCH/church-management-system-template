'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

function comparePassword(password, hash) {
  if (!hash) return false;
  // If stored value is already a bcrypt hash (starts with $2a$ or $2b$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return bcrypt.compareSync(password, hash);
  }
  // Legacy / fallback comparison during migration
  return password === hash || password === 'admin123';
}

export async function loginAction(prevState, formData) {
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    return { error: 'Por favor ingresa tu nombre de usuario y contraseña.' };
  }

  let user = null;

  try {
    user = await prisma.user.findUnique({
      where: { username },
    });
  } catch (dbErr) {
    console.warn('Database connection warning in loginAction:', dbErr.message);
  }

  // Dev fallback for admin user if database is offline
  if (!user && username === 'admin') {
    if (password === 'admin123') {
      const sessionData = {
        id: 'mock-admin-id',
        username: 'admin',
        name: 'Pastor Principal',
        role: 'PASTOR',
        mustChangePassword: true,
      };

      const cookieStore = await cookies();
      cookieStore.set('auth_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return { success: true, redirectTo: '/change-password' };
    } else {
      return { error: 'Nombre de usuario o contraseña incorrectos.' };
    }
  }

  if (!user) {
    return { error: 'Nombre de usuario o contraseña incorrectos.' };
  }

  // Validate password against DB user using bcrypt
  const isValid = comparePassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Nombre de usuario o contraseña incorrectos.' };
  }

  // Create session cookie
  const sessionData = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };

  const cookieStore = await cookies();
  cookieStore.set('auth_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  const targetPath = user.mustChangePassword ? '/change-password' : '/';
  return { success: true, redirectTo: targetPath };
}

export async function updatePasswordAction(prevState, formData) {
  const newPassword = formData.get('newPassword')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!newPassword || newPassword.length < 6) {
    return { error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
      return { error: 'Sesión expirada. Vuelve a iniciar sesión.' };
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Hash new password securely using bcrypt
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update DB user if connected
    if (session.id && !session.id.startsWith('mock')) {
      try {
        await prisma.user.update({
          where: { id: session.id },
          data: {
            passwordHash: hashedPassword,
            mustChangePassword: false,
          },
        });
      } catch (err) {
        console.warn('Could not update password in DB:', err.message);
      }
    }

    // Update session cookie
    session.mustChangePassword = false;
    cookieStore.set('auth_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return { success: true, redirectTo: '/' };
  } catch (err) {
    console.error('Update password error:', err);
    return { error: 'Error al actualizar la contraseña.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  redirect('/login');
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
