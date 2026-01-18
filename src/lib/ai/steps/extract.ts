import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { GENERATION_PROMPT } from '../prompts';
import { createSectionSchema, type PipelineContext, type ExtractedItem, type ReportSection, type PostData } from '../types';

/**
 * Format posts for a specific subset
 */
function formatPostsText(posts: PostData[]): string {
  const postsBySource = new Map<string, PostData[]>();
  
  posts.forEach((p) => {
    const existing = postsBySource.get(p.sourceName) || [];
    existing.push(p);
    postsBySource.set(p.sourceName, existing);
  });

  let postsText = '';
  
  postsBySource.forEach((sourcePosts, sourceName) => {
    postsText += `\n=== SOURCE: ${sourceName} ===\n\n`;
    sourcePosts.forEach((p, idx) => {
      const contentPreview = p.content.length > 800 
        ? p.content.substring(0, 800) + '...' 
        : p.content;
      postsText += `[Post ${idx + 1}] ${p.title}\n`;
      postsText += `Content: ${contentPreview}\n`;
      postsText += `URL: ${p.url}\n\n`;
    });
  });

  return postsText;
}

/**
 * Build instructions for a single section
 */
function buildSingleSectionInstruction(section: ReportSection): string {
  return `\n1. Category: "${section.title}"\n   Task: ${section.prompt}\n   Scope: Analyze ALL posts provided below for this category.`;
}

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
 * Step 3: Extract content using AI
 * Processes sections in groups - unrestricted sections together, restricted sections separately
 */
export async function extractContent(
  ctx: PipelineContext,
  model: BaseChatModel
): Promise<PipelineContext> {
  const extractedData: Record<string, ExtractedItem[]> = {};
  
  // Separate sections into unrestricted and restricted
  const unrestrictedSections = ctx.sections.filter(s => !s.sourceIds || s.sourceIds.length === 0);
  const restrictedSections = ctx.sections.filter(s => s.sourceIds && s.sourceIds.length > 0);

  console.log(`[AI Pipeline] Processing ${unrestrictedSections.length} unrestricted + ${restrictedSections.length} restricted sections`);

  // Process unrestricted sections together (they use all posts)
  if (unrestrictedSections.length > 0) {
    const schema = createSectionSchema(unrestrictedSections);
    const structuredModel = model.withStructuredOutput(schema);
    const chain = GENERATION_PROMPT.pipe(structuredModel);

    const instructions = unrestrictedSections
      .map((s, index) => `\n${index + 1}. Category: "${s.title}"\n   Task: ${s.prompt}\n   Scope: ALL sources - analyze EVERY post for this category.`)
      .join('\n');

    console.log('[AI Pipeline] Extracting unrestricted sections...');
    const result = (await chain.invoke({
      posts: ctx.postsText,
      section_instructions: instructions,
    })) as Record<string, ExtractedItem[]>;

    Object.assign(extractedData, result);
  }

  // Process each restricted section separately with filtered posts
  for (const section of restrictedSections) {
    const filteredPosts = getPostsForSection(ctx.posts, section);
    
    if (filteredPosts.length === 0) {
      console.log(`[AI Pipeline] Section "${section.title}" - no matching posts, skipping`);
      extractedData[section.id] = [];
      continue;
    }

    const sourceNames = [...new Set(filteredPosts.map(p => p.sourceName))];
    console.log(`[AI Pipeline] Section "${section.title}" - using ${filteredPosts.length} posts from: ${sourceNames.join(', ')}`);

    const schema = createSectionSchema([section]);
    const structuredModel = model.withStructuredOutput(schema);
    const chain = GENERATION_PROMPT.pipe(structuredModel);

    const postsText = formatPostsText(filteredPosts);
    const instruction = buildSingleSectionInstruction(section);

    const result = (await chain.invoke({
      posts: postsText,
      section_instructions: instruction,
    })) as Record<string, ExtractedItem[]>;

    Object.assign(extractedData, result);
  }

  return { ...ctx, extractedData };
}
