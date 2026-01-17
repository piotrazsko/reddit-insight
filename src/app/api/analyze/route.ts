import { NextResponse } from 'next/server';
import { generateDailyReport } from '@/lib/ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { OPENAI_DEFAULT_MODEL } from '@/lib/openaiModels';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const aiConfig = {
      provider: 'openai',
      openaiKey: undefined as string | undefined,
      ollamaUrl: undefined as string | undefined,
      ollamaModel: undefined as string | undefined,
      openaiModel: OPENAI_DEFAULT_MODEL,
      reportLanguage: 'English'
    };
    let reportSections: string | undefined;

    if (session?.user?.email) {
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

        if (user) {
          aiConfig.provider = user.aiProvider;
          if (user.openaiKey) aiConfig.openaiKey = user.openaiKey;
          if (user.ollamaUrl) aiConfig.ollamaUrl = user.ollamaUrl;
          if (user.ollamaModel) aiConfig.ollamaModel = user.ollamaModel;
          if (user.openaiModel) aiConfig.openaiModel = user.openaiModel;
          if (user.reportLanguage) aiConfig.reportLanguage = user.reportLanguage;
          if (user.reportSections) reportSections = user.reportSections;
        }
    }

    const report = await generateDailyReport(aiConfig, reportSections);
    if (!report) {
      return NextResponse.json(
        { success: false, message: 'No posts to analyze.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
