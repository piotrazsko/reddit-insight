import { PromptTemplate } from '@langchain/core/prompts';
import { createChatModel } from './models';
import type { AIConfig } from './types';

/**
 * Comment generation options
 */
export interface CommentGenerationOptions {
  post: {
    title: string;
    content: string;
    author: string;
    subreddit: string;
  };
  tone: 'helpful' | 'friendly' | 'professional' | 'casual';
  context?: string;
  reportSummary?: string;
  aiConfig: AIConfig;
}

/**
 * Tone descriptions for the prompt
 */
const TONE_DESCRIPTIONS: Record<string, string> = {
  helpful: 'helpful and informative - provide value, answer questions, share knowledge',
  friendly: 'friendly and approachable - be warm, use casual language, show enthusiasm',
  professional: 'professional and authoritative - be concise, factual, and well-structured',
  casual: 'casual and conversational - be relaxed, use humor when appropriate, speak naturally',
};

/**
 * Prompt template for generating Reddit comments
 */
const COMMENT_PROMPT = PromptTemplate.fromTemplate(`
You are an expert Reddit commenter who writes engaging, valuable comments.

POST INFORMATION:
- Subreddit: r/{subreddit}
- Title: {title}
- Author: u/{author}
- Content: {content}

{context_section}

{insights_section}

YOUR TASK:
Write a Reddit comment that is {tone_description}.

GUIDELINES:
- Be genuine and add value to the discussion
- Reference specific points from the post when relevant
- Keep it concise but substantive (2-4 paragraphs max)
- Use Reddit conventions naturally (but don't overdo it)
- If you have insights from the analysis, incorporate them naturally
- Don't be preachy or condescending
- Don't start with "Great post!" or similar generic phrases
- Write in {language}

Write only the comment text, nothing else.
`);

/**
 * Generate an AI-powered comment for a Reddit post
 */
export async function generateComment(options: CommentGenerationOptions): Promise<string> {
  const { post, tone, context, reportSummary, aiConfig } = options;

  const model = createChatModel(aiConfig);

  // Build context section if provided
  const contextSection = context
    ? `ADDITIONAL CONTEXT FROM USER:\n${context}`
    : '';

  // Build insights section if report summary exists
  const insightsSection = reportSummary
    ? `INSIGHTS FROM YOUR ANALYSIS (use if relevant):\n${reportSummary.slice(0, 2000)}...`
    : '';

  const toneDescription = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.helpful;
  const language = aiConfig.reportLanguage || 'English';

  const prompt = await COMMENT_PROMPT.format({
    subreddit: post.subreddit,
    title: post.title,
    author: post.author,
    content: post.content.slice(0, 3000), // Limit content length
    context_section: contextSection,
    insights_section: insightsSection,
    tone_description: toneDescription,
    language,
  });

  console.log(`[AI Comments] Generating ${tone} comment for post in r/${post.subreddit}`);

  const response = await model.invoke(prompt);
  const commentText = typeof response.content === 'string' 
    ? response.content 
    : response.content.toString();

  return commentText.trim();
}
