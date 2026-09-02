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

  const description = `Autor: ${author || 'No especificado'} • Director: ${leaderName || 'No especificado'}`;
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
    return { success: true, ticket: { id: newTicket.id, title: newTicket.title } };
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
    return { success: true, ticket: { id: newTicket.id, title: newTicket.title } };
  } catch (err) {
    console.error('Error creating media request:', err);
    return { success: true };
  }
}

export async function assignTicketAction(ticketId, assignedTo) {
  try {
    const updatedTicket = await prisma.multimediaTicket.update({
      where: { id: ticketId },
      data: { assignedTo },
    });

    if (assignedTo) {
      const user = await prisma.user.findUnique({ where: { username: assignedTo } });
      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            message: `Se te ha asignado el ticket/petición: ${updatedTicket.title}`,
          }
        });
      }
    }

    revalidatePath('/multimedia');
    return { success: true };
  } catch (err) {
    console.error('Error assigning ticket:', err);
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

export async function updateTicketAction(prevState, formData) {
  const session = await getSession();
  const isMultimediaAdmin = session?.username === 'multimedia_admin' || session?.role === 'ADMIN' || session?.role === 'MULTIMEDIA_LEADER';

  if (!isMultimediaAdmin) {
    return { error: 'Únicamente el Admin de Multimedia puede editar tickets o publicaciones.' };
  }

  const id = formData.get('id')?.toString();
  const title = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const eventDateRaw = formData.get('eventDate')?.toString();

  if (!id || !title) {
    return { error: 'Datos incompletos para actualizar el ticket.' };
  }

  try {
    const updated = await prisma.multimediaTicket.update({
      where: { id },
      data: {
        title,
        description,
        ...(eventDateRaw ? { eventDate: new Date(eventDateRaw) } : {}),
      },
    });

    revalidatePath('/multimedia');
    return { success: true, ticket: { id: updated.id, title: updated.title } };
  } catch (err) {
    console.error('Error updating ticket:', err);
    return { error: 'Error al actualizar el ticket.' };
  }
}

export async function deleteTicketAction(id) {
  const session = await getSession();
  const isMultimediaAdmin = session?.username === 'multimedia_admin' || session?.role === 'ADMIN' || session?.role === 'MULTIMEDIA_LEADER';

  if (!isMultimediaAdmin) {
    return { error: 'Únicamente el Admin de Multimedia puede eliminar tickets o publicaciones.' };
  }

  if (!id) return { error: 'ID de ticket no especificado.' };

  try {
    await prisma.multimediaTicket.delete({
      where: { id },
    });

    revalidatePath('/multimedia');
    return { success: true };
  } catch (err) {
    console.error('Error deleting ticket:', err);
    return { error: 'Error al eliminar ticket o petición.' };
  }
}

export async function getMultimediaOperatorsAction() {
  const session = await getSession();
  if (!session) return { error: 'No autorizado' };

  try {
    const operators = await prisma.user.findMany({
      where: {
        role: {
          in: ['MULTIMEDIA', 'MULTIMEDIA_LEADER']
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return { success: true, operators };
  } catch (err) {
    console.error('Error fetching operators:', err);
    return { error: 'Error al cargar los operadores' };
  }
}
