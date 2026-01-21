import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateComment } from '@/lib/ai/comments';
import { OPENAI_DEFAULT_MODEL } from '@/lib/openaiModels';
import type { AIConfig } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';

interface GenerateCommentRequest {
  postId: string;
  tone?: 'helpful' | 'friendly' | 'professional' | 'casual';
  context?: string;
}

/**
 * POST /api/comments/generate
 * Generate an AI comment for a Reddit post based on analysis insights
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateCommentRequest = await request.json();
    const { postId, tone = 'helpful', context } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Fetch user settings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        openaiKey: true,
        aiProvider: true,
        ollamaUrl: true,
        ollamaModel: true,
        openaiModel: true,
        reportLanguage: true,
      },
    });

    // Fetch the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { 
        source: true,
        report: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Build AI config
    const aiConfig: AIConfig = {
      provider: (user?.aiProvider as 'openai' | 'ollama') || 'openai',
      openaiKey: user?.openaiKey || undefined,
      ollamaUrl: user?.ollamaUrl || undefined,
      ollamaModel: user?.ollamaModel || undefined,
      openaiModel: user?.openaiModel || OPENAI_DEFAULT_MODEL,
      reportLanguage: user?.reportLanguage || 'English',
    };

    // Generate the comment
    const comment = await generateComment({
      post: {
        title: post.title,
        content: post.content,
        author: post.author,
        subreddit: post.source.name,
      },
      tone,
      context,
      reportSummary: post.report?.summary,
      aiConfig,
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Comment generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate comment' },
      { status: 500 }
    );
  }
}
