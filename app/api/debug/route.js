import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { username: true }
    });
    
    // Mask the full URL for security, just show the host
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    const host = dbUrl.split('@')[1]?.split('/')[0] || 'Unknown';
    
    return NextResponse.json({
      connectedHost: host,
      userCount: users.length,
      users: users.map(u => u.username)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
