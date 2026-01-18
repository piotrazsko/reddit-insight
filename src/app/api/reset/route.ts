import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DEFAULT_REPORT_SECTIONS } from '@/lib/defaults';

/**
 * Reset analysis data (posts and reports only)
 */
export async function POST() {
  try {
    // Delete all posts
    await prisma.post.deleteMany({});
    
    // Delete all reports
    await prisma.report.deleteMany({});

    return NextResponse.json({ success: true, message: 'Data cleared successfully' });
  } catch (error) {
    console.error('Reset failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Full factory reset - delete everything and reset settings
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    // Delete all posts first (due to foreign key)
    await prisma.post.deleteMany({});
    
    // Delete all reports
    await prisma.report.deleteMany({});
    
    // Delete all sources
    await prisma.source.deleteMany({});
    
    // Reset user settings to defaults (if logged in)
    if (session?.user?.email) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          reportSections: JSON.stringify(DEFAULT_REPORT_SECTIONS),
          aiProvider: 'openai',
          ollamaUrl: 'http://localhost:11434',
          ollamaModel: 'llama3',
          openaiModel: 'gpt-4o',
          reportLanguage: 'English',
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Full reset completed' });
  } catch (error) {
    console.error('Full reset failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
