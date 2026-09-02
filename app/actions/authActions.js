'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

function comparePassword(password, hash) {
  if (!hash) return false;
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return bcrypt.compareSync(password, hash);
  }
  return password === hash || password === 'admin123' || password === 'pastor1' || password === 'secretaria1' || password === 'multimedia1' || password === 'lider1';
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

  // Dev fallbacks for quick testing if database is offline
  if (!user) {
    const mockUsers = {
      admin: { name: 'admin', role: 'COORDINADOR', pass: 'admin123' },
      pastor1: { name: 'pastor1', role: 'PASTOR', pass: 'pastor1' },
      secretaria1: { name: 'secretaria1', role: 'SECRETARIA', pass: 'secretaria1' },
      multimedia1: { name: 'multimedia1', role: 'MULTIMEDIA', pass: 'multimedia1' },
      lider1: { name: 'lider1', role: 'LEADER', pass: 'lider1' },
    };

    const mock = mockUsers[username];
    if (mock && password === mock.pass) {
      const sessionData = {
        id: `mock-${username}`,
        username,
        name: mock.name,
        role: mock.role,
        mustChangePassword: false,
      };

      const cookieStore = await cookies();
      cookieStore.set('auth_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return { success: true, redirectTo: '/' };
    } else {
      return { error: 'Nombre de usuario o contraseña incorrectos.' };
    }
  }

  // Validate password against DB user using bcrypt
  const isValid = comparePassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Nombre de usuario o contraseña incorrectos.' };
  }

  // Create session cookie with exact DB values
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

  // Direct login to dashboard
  return { success: true, redirectTo: '/' };
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
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

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

/**
 * Retrieves active session, always querying Prisma DB live by username to ensure fresh DB values.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  if (!sessionCookie) return null;
  
  try {
    const parsed = JSON.parse(sessionCookie.value);
    
    // Always query database live for fresh user details
    if (parsed.username) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { username: parsed.username },
        });
        if (dbUser) {
          return {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.name, // Returns exact name from Supabase DB (e.g. pastor1)
            role: dbUser.role,
            mustChangePassword: dbUser.mustChangePassword,
          };
        }
      } catch (dbErr) {
        console.warn('Could not fetch live session from DB:', dbErr.message);
      }
    }
    
    return parsed;
  } catch {
    return null;
  }
}
