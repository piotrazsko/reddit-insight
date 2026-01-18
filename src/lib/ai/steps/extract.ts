import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { GENERATION_PROMPT } from '../prompts';
import { createSectionSchema, type PipelineContext, type ExtractedItem, type ExtractedItemRaw, type ReportSection, type PostData } from '../types';

/**
 * Format posts with global indices for AI processing
 * Returns both the formatted text and a map of index -> URL
 */
function formatPostsWithIndices(posts: PostData[]): { text: string; urlMap: Map<number, string> } {
  const urlMap = new Map<number, string>();
  let postsText = '';
  
  // Group posts by source for readability
  const postsBySource = new Map<string, { post: PostData; globalIndex: number }[]>();
  
  posts.forEach((p, idx) => {
    const globalIndex = idx + 1; // 1-based index
    urlMap.set(globalIndex, p.url);
    
    const existing = postsBySource.get(p.sourceName) || [];
    existing.push({ post: p, globalIndex });
    postsBySource.set(p.sourceName, existing);
  });

  postsBySource.forEach((sourcePosts, sourceName) => {
    postsText += `\n=== SOURCE: ${sourceName} ===\n\n`;
    sourcePosts.forEach(({ post, globalIndex }) => {
      const contentPreview = post.content.length > 800 
        ? post.content.substring(0, 800) + '...' 
        : post.content;
      postsText += `[Post ${globalIndex}] ${post.title}\n`;
      postsText += `Content: ${contentPreview}\n\n`;
    });
  });

  return { text: postsText, urlMap };
}

/**
 * Resolve postIndex to actual URLs
 */
function resolveUrls(
  rawData: Record<string, ExtractedItemRaw[]>,
  urlMap: Map<number, string>
): Record<string, ExtractedItem[]> {
  const resolved: Record<string, ExtractedItem[]> = {};
  
  for (const [sectionId, items] of Object.entries(rawData)) {
    resolved[sectionId] = items.map(item => ({
      title: item.title,
      summary: item.summary,
      sourceUrl: urlMap.get(item.postIndex) || '#',
    }));
  }
  
  return resolved;
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
 * AI returns postIndex which we resolve to actual URLs programmatically
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
    const { text: postsText, urlMap } = formatPostsWithIndices(ctx.posts);
    
    const schema = createSectionSchema(unrestrictedSections);
    const structuredModel = model.withStructuredOutput(schema);
    const chain = GENERATION_PROMPT.pipe(structuredModel);

    const instructions = unrestrictedSections
      .map((s, index) => `\n${index + 1}. Category: "${s.title}"\n   Task: ${s.prompt}\n   Scope: ALL sources - analyze EVERY post for this category.`)
      .join('\n');

    console.log('[AI Pipeline] Extracting unrestricted sections...');
    const rawResult = (await chain.invoke({
      posts: postsText,
      section_instructions: instructions,
    })) as Record<string, ExtractedItemRaw[]>;

    const resolved = resolveUrls(rawResult, urlMap);
    Object.assign(extractedData, resolved);
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

    const { text: postsText, urlMap } = formatPostsWithIndices(filteredPosts);
    
    const schema = createSectionSchema([section]);
    const structuredModel = model.withStructuredOutput(schema);
    const chain = GENERATION_PROMPT.pipe(structuredModel);

    const instruction = buildSingleSectionInstruction(section);

    const rawResult = (await chain.invoke({
      posts: postsText,
      section_instructions: instruction,
    })) as Record<string, ExtractedItemRaw[]>;

    const resolved = resolveUrls(rawResult, urlMap);
    Object.assign(extractedData, resolved);
  }

  return { ...ctx, extractedData };
}
