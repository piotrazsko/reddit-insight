import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { GENERATION_PROMPT } from '../prompts';
import { createSectionSchema, type PipelineContext, type ExtractedItem } from '../types';

/**
 * Step 3: Extract content using AI
 */
export async function extractContent(
  ctx: PipelineContext,
  model: BaseChatModel
): Promise<PipelineContext> {
  if (!ctx.postsText || !ctx.sectionInstructions) {
    throw new Error('Posts text and section instructions must be prepared first');
  }

  const schema = createSectionSchema(ctx.sections);
  const structuredModel = model.withStructuredOutput(schema);
  const chain = GENERATION_PROMPT.pipe(structuredModel);

  console.log('[AI Pipeline] Running content extraction...');

  const result = (await chain.invoke({
    posts: ctx.postsText,
    section_instructions: ctx.sectionInstructions,
  })) as Record<string, ExtractedItem[]>;

  return { ...ctx, extractedData: result };
}
