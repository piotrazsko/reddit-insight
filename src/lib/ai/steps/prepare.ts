import type { PipelineContext, PostData } from '../types';

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
 * Format posts for AI consumption with global numbering
 * Returns formatted text and a map of post indices to posts
 */
export function formatPostsForAI(posts: PostData[]): string {
  let text = '';
  
  // Group by source for readability
  const postsBySource = new Map<string, PostData[]>();
  posts.forEach(p => {
    const existing = postsBySource.get(p.sourceName) || [];
    existing.push(p);
    postsBySource.set(p.sourceName, existing);
  });

  let globalIndex = 1;
  postsBySource.forEach((sourcePosts, sourceName) => {
    text += `\n=== SOURCE: ${sourceName} ===\n\n`;
    sourcePosts.forEach((p) => {
      const contentPreview = p.content.length > 500 
        ? p.content.substring(0, 500) + '...' 
        : p.content;
      text += `[Post ${globalIndex}] ${p.title}\n`;
      text += `${contentPreview}\n\n`;
      globalIndex++;
    });
  });

  return text;
}

/**
 * Step 1: Prepare posts text for analysis
 */
export function preparePosts(ctx: PipelineContext): PipelineContext {
  const postsText = formatPostsForAI(ctx.posts);
  return { ...ctx, postsText };
}
