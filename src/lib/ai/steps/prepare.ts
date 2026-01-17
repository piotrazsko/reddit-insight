import type { PipelineContext, PostData, ReportSection } from '../types';

/**
 * Map database posts to PostData format
 */
export function mapPostsToData(
  posts: Array<{
    id: string;
    title: string;
    content: string;
    url: string;
    sourceId: string;
    source: { name: string };
  }>
): PostData[] {
  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    url: p.url,
    sourceId: p.sourceId,
    sourceName: p.source.name,
  }));
}

/**
 * Step 1: Prepare posts text for analysis
 * Groups posts by source for better context
 */
export function preparePosts(ctx: PipelineContext): PipelineContext {
  // Group posts by source
  const postsBySource = new Map<string, PostData[]>();
  
  ctx.posts.forEach((p) => {
    const existing = postsBySource.get(p.sourceName) || [];
    existing.push(p);
    postsBySource.set(p.sourceName, existing);
  });

  // Format posts grouped by source
  let postsText = '';
  
  postsBySource.forEach((posts, sourceName) => {
    postsText += `\n=== SOURCE: ${sourceName} ===\n\n`;
    posts.forEach((p, idx) => {
      // Use more content (up to 800 chars) for better context
      const contentPreview = p.content.length > 800 
        ? p.content.substring(0, 800) + '...' 
        : p.content;
      postsText += `[Post ${idx + 1}] ${p.title}\n`;
      postsText += `Content: ${contentPreview}\n`;
      postsText += `URL: ${p.url}\n\n`;
    });
  });

  return { ...ctx, postsText };
}

/**
 * Step 2: Build section instructions for the prompt
 * For source-restricted sections, also filter which posts to include
 */
export function buildSectionInstructions(ctx: PipelineContext): PipelineContext {
  const sectionInstructions = ctx.sections
    .map((s, index) => {
      let instruction = `\n${index + 1}. Category: "${s.title}"`;
      instruction += `\n   Task: ${s.prompt}`;
      
      const sourceIds = s.sourceIds || [];
      if (sourceIds.length > 0) {
        // Find the source names for these sourceIds
        const sourceNames = sourceIds
          .map(sourceId => {
            const matchingPost = ctx.posts.find((p) => p.sourceId === sourceId);
            return matchingPost?.sourceName;
          })
          .filter(Boolean);
        
        if (sourceNames.length > 0) {
          instruction += `\n   ⚠️ RESTRICTION: Only from these sources: ${sourceNames.map(n => `"${n}"`).join(', ')}. IGNORE other sources.`;
        }
      } else {
        instruction += `\n   Scope: ALL sources - analyze EVERY post for this category.`;
      }
      
      return instruction;
    })
    .join('\n');

  return { ...ctx, sectionInstructions };
}

/**
 * Get posts filtered by section (if source-restricted)
 */
export function getPostsForSection(ctx: PipelineContext, section: ReportSection): PostData[] {
  const sourceIds = section.sourceIds || [];
  if (sourceIds.length > 0) {
    return ctx.posts.filter((p) => sourceIds.includes(p.sourceId));
  }
  return ctx.posts;
}
