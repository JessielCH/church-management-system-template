'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './authActions';

export async function getEventsAction() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    return { success: true, events };
  } catch (err) {
    console.error('Error fetching events:', err);
    return {
      success: true,
      events: [],
    };
  }
}

export async function createEventAction(prevState, formData) {
  const session = await getSession();
  const allowedRoles = ['PASTOR', 'COORDINADOR', 'SECRETARIA', 'MULTIMEDIA', 'ADMIN'];
  
  if (session && !allowedRoles.includes(session.role)) {
    return { error: 'No tienes permisos para crear eventos en la agenda.' };
  }

  const title = formData.get('title')?.toString().trim();
  const dateRaw = formData.get('date')?.toString();
  const location = formData.get('location')?.toString() || 'Templo Principal';
  const type = formData.get('type')?.toString() || 'SERVICE';
  const whatsappReminders = formData.getAll('whatsappReminders');

  if (!title || !dateRaw) {
    return { error: 'Por favor ingresa el título y la fecha del evento.' };
  }

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        date: new Date(dateRaw),
        location,
        type,
      },
    });

    revalidatePath('/agenda');
    revalidatePath('/');
    return { success: true, event: newEvent, whatsappReminders };
  } catch (err) {
    console.error('Error creating agenda event:', err);
    return { error: 'Error al registrar el evento.' };
  }
}

export async function updateEventAction(prevState, formData) {
  const session = await getSession();
  const allowedRoles = ['PASTOR', 'COORDINADOR', 'SECRETARIA', 'MULTIMEDIA', 'ADMIN'];

  if (session && !allowedRoles.includes(session.role)) {
    return { error: 'No tienes permisos para editar eventos.' };
  }

  const id = formData.get('id')?.toString();
  const title = formData.get('title')?.toString().trim();
  const dateRaw = formData.get('date')?.toString();
  const location = formData.get('location')?.toString() || 'Templo Principal';
  const type = formData.get('type')?.toString() || 'SERVICE';

  if (!id || !title || !dateRaw) {
    return { error: 'Datos incompletos para actualizar el evento.' };
  }

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        date: new Date(dateRaw),
        location,
        type,
      },
    });

    revalidatePath('/agenda');
    revalidatePath('/');
    return { success: true, event: updated };
  } catch (err) {
    console.error('Error updating event:', err);
    return { error: 'Error al actualizar el evento.' };
  }
}

export async function deleteEventAction(id) {
  const session = await getSession();
  const allowedRoles = ['PASTOR', 'COORDINADOR', 'SECRETARIA', 'MULTIMEDIA', 'ADMIN'];

  if (session && !allowedRoles.includes(session.role)) {
    return { error: 'No tienes permisos para eliminar eventos.' };
  }

  if (!id) return { error: 'ID de evento no especificado.' };

  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath('/agenda');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Error deleting event:', err);
    return { error: 'Error al eliminar el evento.' };
  }
}
