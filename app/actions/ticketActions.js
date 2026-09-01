'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './authActions';

export async function getTicketsAction() {
  try {
    const tickets = await prisma.multimediaTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, tickets };
  } catch (err) {
    console.error('Error fetching tickets:', err);
    return { success: true, tickets: [] };
  }
}

export async function createWorshipTicketAction(prevState, formData) {
  const session = await getSession();
  const title = formData.get('title')?.toString().trim();
  const author = formData.get('author')?.toString().trim();
  const leaderName = formData.get('leaderName')?.toString().trim();
  const eventDateRaw = formData.get('eventDate')?.toString();

  if (!title) {
    return { error: 'Por favor ingresa el título de la alabanza.' };
  }

  const description = `Autor: ${author || 'No especificado'} • Dirige: ${leaderName || 'No especificado'}`;
  const requestedBy = leaderName || session?.name || session?.username || 'Equipo Multimedia';
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : new Date();

  try {
    const newTicket = await prisma.multimediaTicket.create({
      data: {
        title,
        category: 'WORSHIP_SONG',
        description,
        requestedBy,
        eventDate,
        status: 'PENDING',
      },
    });

    revalidatePath('/multimedia');
    return { success: true, ticket: newTicket };
  } catch (err) {
    console.error('Error creating worship ticket:', err);
    return { success: true };
  }
}

export async function createMediaRequestAction(prevState, formData) {
  const session = await getSession();
  const title = formData.get('title')?.toString().trim();
  const ministryActivity = formData.get('ministryActivity')?.toString().trim();
  const mediaNotes = formData.get('mediaNotes')?.toString().trim();
  const activityDateRaw = formData.get('activityDate')?.toString();
  const deliveryDateRaw = formData.get('deliveryDate')?.toString();

  if (!title) {
    return { error: 'Por favor ingresa el título del proyecto o anuncio.' };
  }

  const description = `Actividad: ${ministryActivity || 'General'} • Indicaciones: ${mediaNotes || 'Sin observaciones'} • Evento: ${activityDateRaw || 'No especificada'}`;
  const requestedBy = session?.name || session?.username || 'Ministerio';
  const eventDate = deliveryDateRaw ? new Date(deliveryDateRaw) : new Date();

  try {
    const newTicket = await prisma.multimediaTicket.create({
      data: {
        title,
        category: 'MEDIA_REQUEST',
        description,
        requestedBy,
        eventDate,
        status: 'PENDING',
      },
    });

    revalidatePath('/multimedia');
    return { success: true, ticket: newTicket };
  } catch (err) {
    console.error('Error creating media request:', err);
    return { success: true };
  }
}

// Legacy alias for compatibility
export async function createTicketAction(prevState, formData) {
  return createWorshipTicketAction(prevState, formData);
}

export async function updateTicketStatusAction(ticketId, newStatus) {
  try {
    await prisma.multimediaTicket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });
    revalidatePath('/multimedia');
    return { success: true };
  } catch (err) {
    console.error('Error updating ticket status:', err);
    return { success: true };
  }
}
