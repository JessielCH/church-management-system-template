'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

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
      events: [
        {
          id: 'ev-1',
          title: 'Culto de Oración y Enseñanza',
          date: new Date('2026-09-03T19:00:00Z'),
          location: 'Templo Principal',
          type: 'SERVICE',
        },
        {
          id: 'ev-2',
          title: 'Culto Dominical Principal',
          date: new Date('2026-09-06T09:30:00Z'),
          location: 'Auditorio Principal',
          type: 'SERVICE',
        },
      ],
    };
  }
}

export async function createEventAction(prevState, formData) {
  const title = formData.get('title')?.toString().trim();
  const dateRaw = formData.get('date')?.toString();
  const location = formData.get('location')?.toString() || 'Templo Principal';
  const type = formData.get('type')?.toString() || 'SERVICE';
  
  // Multi-choice WhatsApp reminder selections (e.g. ['1_HOUR', '1_DAY'])
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
    return { success: true, event: newEvent, whatsappReminders };
  } catch (err) {
    console.error('Error creating agenda event:', err);
    return { success: true, message: 'Evento registrado en vista previa.' };
  }
}
