import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateDailyReport } from '@/lib/ai';
import { OPENAI_DEFAULT_MODEL } from '@/lib/openaiModels';
import type { AIConfig, ProgressUpdate } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for streaming report generation progress
 */
export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: ProgressUpdate) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Auth & config setup
        const session = await getServerSession(authOptions);
        const aiConfig: AIConfig = {
          provider: 'openai',
          openaiKey: undefined,
          ollamaUrl: undefined,
          ollamaModel: undefined,
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
            aiConfig.provider = user.aiProvider as 'openai' | 'ollama';
            if (user.openaiKey) aiConfig.openaiKey = user.openaiKey;
            if (user.ollamaUrl) aiConfig.ollamaUrl = user.ollamaUrl;
            if (user.ollamaModel) aiConfig.ollamaModel = user.ollamaModel;
            if (user.openaiModel) aiConfig.openaiModel = user.openaiModel;
            if (user.reportLanguage) aiConfig.reportLanguage = user.reportLanguage;
            if (user.reportSections) reportSections = user.reportSections;
          }
        }

        // Generate report with progress streaming
        const report = await generateDailyReport(aiConfig, reportSections, send);
        
        if (!report) {
          send({ step: 'error', message: 'No posts to analyze', error: 'no_posts' });
        } else {
          send({ step: 'done', message: 'Report generated!', reportId: report.id });
        }
      } catch (error) {
        console.error('Stream analysis failed:', error);
        send({ 
          step: 'error', 
          message: error instanceof Error ? error.message : 'Analysis failed',
          error: 'generation_failed'
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
