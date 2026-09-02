'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from './authActions';
import { revalidatePath } from 'next/cache';

// Middleware para verificar que sea ADMIN
async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('No autorizado: Solo administradores pueden gestionar usuarios.');
  }
}

export async function getUsersAction() {
  await verifyAdmin();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
      }
    });
    return { success: true, users };
  } catch (error) {
    return { success: false, error: 'Error al cargar usuarios' };
  }
}

export async function createUserAction(prevState, formData) {
  await verifyAdmin();
  try {
    const name = formData.get('name');
    const username = formData.get('username');
    const role = formData.get('role') || 'LEADER';
    let password = formData.get('password');

    if (!name || !username) {
      return { success: false, error: 'Nombre y Usuario son obligatorios.' };
    }

    // Si no enviaron contraseña, generar una aleatoria segura
    if (!password) {
      // Regla: 6-12 chars, 1 mayúscula, 1 minúscula, 1 número
      const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lower = 'abcdefghijklmnopqrstuvwxyz';
      const nums = '0123456789';
      const chars = upper + lower + nums + '!@#$%';
      
      password = 
        upper[Math.floor(Math.random() * upper.length)] + 
        lower[Math.floor(Math.random() * lower.length)] + 
        nums[Math.floor(Math.random() * nums.length)];
        
      while(password.length < 8) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return { success: false, error: 'El nombre de usuario ya existe.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        role,
        passwordHash,
        mustChangePassword: true, // Siempre obligar a cambiar
      }
    });

    revalidatePath('/usuarios');
    return { 
      success: true, 
      user: { name: newUser.name, username: newUser.username }, 
      generatedPassword: password 
    };
  } catch (error) {
    return { success: false, error: error.message || 'Error al crear usuario.' };
  }
}

export async function updateUserAction(prevState, formData) {
  await verifyAdmin();
  try {
    const id = formData.get('id');
    const name = formData.get('name');
    const role = formData.get('role');

    if (!id || !name || !role) {
      return { success: false, error: 'Faltan datos obligatorios.' };
    }

    await prisma.user.update({
      where: { id },
      data: { name, role }
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al actualizar usuario.' };
  }
}

export async function resetPasswordAction(userId, newPassword) {
  await verifyAdmin();
  try {
    if (!userId || !newPassword) {
      return { success: false, error: 'Usuario o contraseña no proporcionados.' };
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash,
        mustChangePassword: true 
      }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al resetear contraseña.' };
  }
}

export async function deleteUserAction(id) {
  await verifyAdmin();
  const session = await getSession();
  
  if (id === session.id) {
    return { success: false, error: 'No puedes eliminarte a ti mismo.' };
  }

  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al eliminar usuario.' };
  }
}
