import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    // Delete all posts
    await prisma.post.deleteMany({});
    
    // Delete all reports
    await prisma.report.deleteMany({});
    
    // Optional: Delete sources? The user asked for "removing info", maybe they want to keep sources configuration.
    // We will keep sources for now, as "reset data" usually means collected data. 
    // If they want to remove sources they can do it in the sources tab.

    return NextResponse.json({ success: true, message: 'Data cleared successfully' });
  } catch (error) {
    console.error('Reset failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
