import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ... imports

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          openaiKey: true, 
          reportSections: true,
          aiProvider: true,
          ollamaUrl: true,
          ollamaModel: true,
          openaiModel: true,
          reportLanguage: true
        }
    });

    return NextResponse.json({ 
        openaiKey: user?.openaiKey || '', 
        reportSections: user?.reportSections || null,
        aiProvider: user?.aiProvider || 'openai',
        ollamaUrl: user?.ollamaUrl || 'http://localhost:11434',
        ollamaModel: user?.ollamaModel || 'llama3',
        openaiModel: user?.openaiModel || 'gpt-4o',
        reportLanguage: user?.reportLanguage || 'English'
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { openaiKey, reportSections, aiProvider, ollamaUrl, ollamaModel, openaiModel, reportLanguage } = await request.json();
    console.log('[API] Settings Update:', { aiProvider, ollamaModel, openaiModel, reportLanguage, hasKey: !!openaiKey });

    // Prepare data object, only including defined fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (openaiKey !== undefined) updateData.openaiKey = openaiKey;
    if (reportSections !== undefined) updateData.reportSections = reportSections;
    if (aiProvider !== undefined) updateData.aiProvider = aiProvider;
    if (ollamaUrl !== undefined) updateData.ollamaUrl = ollamaUrl;
    if (ollamaModel !== undefined) updateData.ollamaModel = ollamaModel;
    if (openaiModel !== undefined) updateData.openaiModel = openaiModel;
    if (reportLanguage !== undefined) updateData.reportLanguage = reportLanguage;

    await prisma.user.update({
        where: { email: session.user.email },
        data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
