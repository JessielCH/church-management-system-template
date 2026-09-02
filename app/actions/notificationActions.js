'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './authActions';

export async function getNotificationsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'No autenticado' };

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.id,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Error al obtener notificaciones' };
  }
}

export async function markNotificationAsReadAction(id) {
  const session = await getSession();
  if (!session) return { success: false, error: 'No autenticado' };

  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Error al actualizar la notificación' };
  }
}
