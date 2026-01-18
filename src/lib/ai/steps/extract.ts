import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { GENERATION_PROMPT } from '../prompts';
import { createSectionSchema, type PipelineContext, type ExtractedItem, type ExtractedItemWithUrl, type SectionResult, type ReportSection, type PostData, type ProgressCallback } from '../types';
import { formatPostsForAI } from './prepare';

/**
 * Get posts filtered by section (if source-restricted)
 */
function getPostsForSection(allPosts: PostData[], section: ReportSection): PostData[] {
  const sourceIds = section.sourceIds || [];
  if (sourceIds.length > 0) {
    return allPosts.filter((p) => sourceIds.includes(p.sourceId));
  }
  return allPosts;
}

/**
 * Resolve postIndex to URL from posts array
 */
function resolvePostUrls(items: ExtractedItem[], posts: PostData[]): ExtractedItemWithUrl[] {
  return items.map(item => {
    const postIndex = item.postIndex;
    // postIndex is 1-based
    const post = postIndex && postIndex > 0 && postIndex <= posts.length 
      ? posts[postIndex - 1] 
      : undefined;
    
    return {
      title: item.title,
      summary: item.summary,
      sourceUrl: post?.url,
    };
  });
}

/**
 * Step 3: Extract content using AI
 * Processes each section separately for better reliability with large models
 */
export async function extractContent(
  ctx: PipelineContext,
  model: BaseChatModel,
  onProgress?: ProgressCallback
): Promise<PipelineContext> {
  const extractedData: Record<string, SectionResult> = {};
  const totalSections = ctx.sections.length;
  const progress = onProgress || (() => {});

  console.log(`[AI Pipeline] Processing ${totalSections} sections (one request per section)`);

  // Process each section separately
  for (let i = 0; i < ctx.sections.length; i++) {
    const section = ctx.sections[i];
    const sectionNum = i + 1;
    
    // Get posts for this section (filtered if source-restricted)
    const postsForSection = getPostsForSection(ctx.posts, section);
    
    if (postsForSection.length === 0) {
      console.log(`[AI Pipeline] [${sectionNum}/${totalSections}] "${section.title}" - no posts, skipping`);
      extractedData[section.id] = { items: [], sourcePosts: [] };
      progress({ 
        step: 'extract', 
        message: `Skipped "${section.title}" (no posts)`,
        current: sectionNum,
        total: totalSections,
        sectionTitle: section.title
      });
      continue;
    }

    const sourceNames = [...new Set(postsForSection.map(p => p.sourceName))];
    console.log(`[AI Pipeline] [${sectionNum}/${totalSections}] "${section.title}" - ${postsForSection.length} posts from: ${sourceNames.join(', ')}`);
    
    progress({ 
      step: 'extract', 
      message: `Analyzing "${section.title}"...`,
      current: sectionNum,
      total: totalSections,
      sectionTitle: section.title
    });

    // Format posts for this section
    const postsText = formatPostsForAI(postsForSection);
    
    // Create schema and chain for single section
    const schema = createSectionSchema([section]);
    const structuredModel = model.withStructuredOutput(schema);
    const chain = GENERATION_PROMPT.pipe(structuredModel);

    const instruction = `\n1. Category: "${section.title}"\n   Task: ${section.prompt}\n   Scope: Analyze ALL posts provided below for this category.`;

    try {
      const result = (await chain.invoke({
        posts: postsText,
        section_instructions: instruction,
      })) as Record<string, ExtractedItem[]>;

      // Resolve post indices to URLs
      const itemsWithUrls = resolvePostUrls(result[section.id] || [], postsForSection);

      extractedData[section.id] = {
        items: itemsWithUrls,
        sourcePosts: postsForSection,
      };
      
      const itemCount = itemsWithUrls.length;
      console.log(`[AI Pipeline] [${sectionNum}/${totalSections}] "${section.title}" - extracted ${itemCount} items`);
      
      progress({ 
        step: 'extract', 
        message: `Completed "${section.title}" (${itemCount} insights)`,
        current: sectionNum,
        total: totalSections,
        sectionTitle: section.title
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = errorMessage.includes('Timeout') || 
                        (error as NodeJS.ErrnoException)?.code === 'UND_ERR_HEADERS_TIMEOUT';
      
      console.error(`[AI Pipeline] [${sectionNum}/${totalSections}] "${section.title}" - failed:`, errorMessage);
      
      // For timeout errors, throw to stop the pipeline
      if (isTimeout) {
        progress({ 
          step: 'error', 
          message: `Timeout on "${section.title}" - model too slow`,
          error: 'timeout'
        });
        throw new Error(`AI model timeout on section "${section.title}". Try a smaller/faster model.`);
      }
      
      // For other errors, continue with remaining sections
      extractedData[section.id] = { items: [], sourcePosts: [] };
      
      progress({ 
        step: 'extract', 
        message: `Failed "${section.title}" - continuing...`,
        current: sectionNum,
        total: totalSections,
        sectionTitle: section.title
      });
    }
  }

  return { ...ctx, extractedData };
}
