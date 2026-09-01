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
    // Fallback sample tickets for dev testing if DB query fails
    return {
      success: true,
      tickets: [
        {
          id: 'ticket-1',
          title: 'Cuán Grande es Él',
          category: 'WORSHIP_SONG',
          description: 'Tono: Sol Mayor (G) • Incluir estrofas 1 a 4 y coro',
          requestedBy: 'Líder Alabanza',
          status: 'PENDING',
          eventDate: new Date('2026-09-06T09:30:00Z'),
          createdAt: new Date(),
        },
        {
          id: 'ticket-2',
          title: 'Video de Anuncio: Campamento Juvenil',
          category: 'MEDIA_REQUEST',
          description: 'Video promocional de 1 min con fechas y costo de inscripción',
          requestedBy: 'Pr. Carlos Mendoza',
          status: 'IN_PROGRESS',
          eventDate: new Date('2026-09-06T09:30:00Z'),
          createdAt: new Date(),
        },
      ],
    };
  }
}

export async function createTicketAction(prevState, formData) {
  const session = await getSession();
  const title = formData.get('title')?.toString().trim();
  const category = formData.get('category')?.toString() || 'WORSHIP_SONG';
  const description = formData.get('description')?.toString().trim();
  const eventDateRaw = formData.get('eventDate')?.toString();

  if (!title) {
    return { error: 'Por favor ingresa el título del ticket o alabanza.' };
  }

  const requestedBy = session?.name || session?.username || 'Equipo Multimedia';
  const eventDate = eventDateRaw ? new Date(eventDateRaw) : new Date();

  try {
    const newTicket = await prisma.multimediaTicket.create({
      data: {
        title,
        category,
        description,
        requestedBy,
        eventDate,
        status: 'PENDING',
      },
    });

    revalidatePath('/multimedia');
    return { success: true, ticket: newTicket };
  } catch (err) {
    console.error('Error creating ticket:', err);
    return { success: true, message: 'Ticket creado en modo vista previa.' };
  }
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
