import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsappBot';

// This endpoint should ideally be protected by a secret key in production
// so that only the cron service can call it.
export async function GET(request) {
  try {
    // 1. Find all pending reminders that are due
    const now = new Date();
    const pendingReminders = await prisma.eventReminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now, // scheduledFor is less than or equal to current time
        }
      },
      include: {
        event: true
      }
    });

    if (pendingReminders.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending reminders to process.' });
    }

    const processedIds = [];
    const failedIds = [];

    // For QA, we'll use a fixed number or environment variable
    // In the future, this could be fetched from the Pastor's User profile
    const pastorPhoneNumber = process.env.PASTOR_PHONE_NUMBER || '+1234567890';

    // 2. Process each reminder
    for (const reminder of pendingReminders) {
      const event = reminder.event;
      
      const eventDateStr = new Date(event.date).toLocaleString('es-ES', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      });

      const message = `*Recordatorio de Agenda Pastoral*\n\nTienes un evento próximo:\n📌 *${event.title}*\n🗓️ Fecha: ${eventDateStr}\n📍 Lugar: ${event.location || 'No especificado'}\n\n_Recordatorio programado: ${reminder.type}_`;

      try {
        await sendWhatsAppMessage(pastorPhoneNumber, message);
        processedIds.push(reminder.id);
      } catch (error) {
        console.error(`Error sending message for reminder ${reminder.id}:`, error);
        failedIds.push(reminder.id);
      }
    }

    // 3. Update status in database
    if (processedIds.length > 0) {
      await prisma.eventReminder.updateMany({
        where: { id: { in: processedIds } },
        data: { status: 'SENT' }
      });
    }

    if (failedIds.length > 0) {
      await prisma.eventReminder.updateMany({
        where: { id: { in: failedIds } },
        data: { status: 'FAILED' }
      });
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedIds.length,
      failed: failedIds.length 
    });

  } catch (error) {
    console.error('Error processing cron reminders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
