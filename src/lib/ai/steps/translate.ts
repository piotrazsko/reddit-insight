import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { TRANSLATION_PROMPT } from '../prompts';
import { createSectionSchema, type PipelineContext, type ExtractedItem, type ExtractedItemWithUrl, type SectionResult, type ProgressCallback } from '../types';

/**
 * Step 4: Translate content if needed
 * Translates each section separately for better performance
 */
export async function translateContent(
  ctx: PipelineContext,
  model: BaseChatModel,
  onProgress?: ProgressCallback
): Promise<PipelineContext> {
  const targetLanguage = ctx.config.reportLanguage || 'English';
  const progress = onProgress || (() => {});

  if (!ctx.extractedData) {
    throw new Error('Extracted data must be available for translation');
  }

  // Skip translation for English
  if (targetLanguage === 'English') {
    return { ...ctx, translatedData: ctx.extractedData };
  }

  console.log(`[AI Pipeline] Translating to ${targetLanguage}...`);
  
  const translatedData: Record<string, SectionResult> = {};
  const sections = Object.entries(ctx.extractedData);
  const totalSections = sections.length;

  // Translate each section separately
  for (let i = 0; i < sections.length; i++) {
    const [sectionId, sectionResult] = sections[i];
    const sectionNum = i + 1;
    
    // Skip empty sections
    if (sectionResult.items.length === 0) {
      translatedData[sectionId] = sectionResult;
      continue;
    }

    const sectionTitle = ctx.sections.find(s => s.id === sectionId)?.title || sectionId;
    
    progress({
      step: 'translate',
      message: `Translating "${sectionTitle}"...`,
      current: sectionNum,
      total: totalSections,
      sectionTitle
    });

    try {
      const sectionSchema = createSectionSchema([ctx.sections.find(s => s.id === sectionId)!]);
      const structuredModel = model.withStructuredOutput(sectionSchema);
      const chain = TRANSLATION_PROMPT.pipe(structuredModel);

      // Keep sourceUrls separate - don't send to translation
      const originalUrls = sectionResult.items.map(item => item.sourceUrl);
      const itemsToTranslate = { [sectionId]: sectionResult.items.map(({ title, summary }) => ({ title, summary, postIndex: 0 })) };
      
      const translatedItems = (await chain.invoke({
        json_data: JSON.stringify(itemsToTranslate),
        language: targetLanguage,
      })) as Record<string, ExtractedItem[]>;

      // Restore sourceUrls to translated items
      const itemsWithUrls: ExtractedItemWithUrl[] = (translatedItems[sectionId] || []).map((item, idx) => ({
        title: item.title,
        summary: item.summary,
        sourceUrl: originalUrls[idx],
      }));

      translatedData[sectionId] = {
        items: itemsWithUrls,
        sourcePosts: sectionResult.sourcePosts,
      };
      
      console.log(`[AI Pipeline] [${sectionNum}/${totalSections}] Translated "${sectionTitle}"`);
    } catch (error) {
      console.error(`[AI Pipeline] Translation failed for "${sectionTitle}":`, error);
      // Keep original on failure
      translatedData[sectionId] = sectionResult;
    }
  }

  return { ...ctx, translatedData };
}
