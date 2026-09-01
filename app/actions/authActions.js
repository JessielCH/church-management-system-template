'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

// Mock/Default password hash comparison for MVP prototype phase
function comparePassword(password, hash) {
  // In production, use bcrypt/argon2.
  // For initial admin user seed ('admin' / 'admin123' or initial temp pass)
  if (password === 'admin123' || password === 'temp123' || password === hash) {
    return true;
  }
  return password === hash;
}

export async function loginAction(prevState, formData) {
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    return { error: 'Por favor ingresa tu nombre de usuario y contraseña.' };
  }

  try {
    // 1. Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Fallback mock user for dev testing if database is not seeded yet
    if (!user) {
      if (username === 'admin' && password === 'admin123') {
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
          maxAge: 60 * 60 * 24, // 1 day
        });
        redirect('/change-password');
      }
      return { error: 'Nombre de usuario o contraseña incorrectos.' };
    }

    // 2. Validate password
    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Nombre de usuario o contraseña incorrectos.' };
    }

    // 3. Create session cookie
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
      maxAge: 60 * 60 * 24, // 1 day
    });

    // 4. Redirect based on mustChangePassword flag
    if (user.mustChangePassword) {
      redirect('/change-password');
    }

    redirect('/');
  } catch (err) {
    if (err.message === 'NEXT_REDIRECT') throw err;
    console.error('Login error:', err);
    return { error: 'Error al iniciar sesión. Intenta nuevamente.' };
  }
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
      redirect('/login');
    }

    const session = JSON.parse(sessionCookie.value);

    // Update in database if not mock
    if (session.id && !session.id.startsWith('mock')) {
      await prisma.user.update({
        where: { id: session.id },
        data: {
          passwordHash: newPassword,
          mustChangePassword: false,
        },
      });
    }

    // Update session cookie
    session.mustChangePassword = false;
    cookieStore.set('auth_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    redirect('/');
  } catch (err) {
    if (err.message === 'NEXT_REDIRECT') throw err;
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
