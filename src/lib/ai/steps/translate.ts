import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { TRANSLATION_PROMPT } from '../prompts';
import { createSectionSchema, type PipelineContext, type ExtractedItem } from '../types';

/**
 * Step 4: Translate content if needed
 */
export async function translateContent(
  ctx: PipelineContext,
  model: BaseChatModel
): Promise<PipelineContext> {
  const targetLanguage = ctx.config.reportLanguage || 'English';

  if (!ctx.extractedData) {
    throw new Error('Extracted data must be available for translation');
  }

  // Skip translation for English
  if (targetLanguage === 'English') {
    return { ...ctx, translatedData: ctx.extractedData };
  }

  console.log(`[AI Pipeline] Translating to ${targetLanguage}...`);

  const schema = createSectionSchema(ctx.sections);
  const structuredModel = model.withStructuredOutput(schema);
  const chain = TRANSLATION_PROMPT.pipe(structuredModel);

  const translated = (await chain.invoke({
    json_data: JSON.stringify(ctx.extractedData),
    language: targetLanguage,
  })) as Record<string, ExtractedItem[]>;

  return { ...ctx, translatedData: translated };
}
