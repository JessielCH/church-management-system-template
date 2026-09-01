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

export async function createTicketAction(prevState, formData) {
  const session = await getSession();
  const title = formData.get('title')?.toString().trim();
  const category = formData.get('category')?.toString() || 'WORSHIP_SONG';
  const author = formData.get('author')?.toString().trim();
  const leaderName = formData.get('leaderName')?.toString().trim();
  const mediaNotes = formData.get('mediaNotes')?.toString().trim();
  const eventDateRaw = formData.get('eventDate')?.toString();

  if (!title) {
    return { error: 'Por favor ingresa el título.' };
  }

  // Construct structured details based on category
  let description = '';
  if (category === 'WORSHIP_SONG') {
    description = `Autor: ${author || 'No especificado'} • Dirige: ${leaderName || 'No especificado'}`;
  } else {
    description = `Solicitado por: ${leaderName || 'Ministerio'} • Indicaciones: ${mediaNotes || 'Sin observaciones'}`;
  }

  const requestedBy = leaderName || session?.name || session?.username || 'Equipo Multimedia';
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
    return { success: true };
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
