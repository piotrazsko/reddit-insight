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
