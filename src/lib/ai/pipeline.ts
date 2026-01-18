import { prisma } from '../db';
import { DEFAULT_REPORT_SECTIONS } from '../defaults';
import { createChatModel } from './models';
import {
  preparePosts,
  mapPostsToData,
  extractContent,
  translateContent,
  formatMarkdown,
  generateReportTitle,
} from './steps';
import type { AIConfig, PipelineContext, ReportSection, ProgressCallback } from './types';

/**
 * Parse sections config from JSON string
 */
function parseSectionsConfig(sectionsConfig?: string): ReportSection[] {
  if (!sectionsConfig) {
    return DEFAULT_REPORT_SECTIONS;
  }

  try {
    const parsed = JSON.parse(sectionsConfig);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('[AI Pipeline] Failed to parse custom sections', e);
  }

  return DEFAULT_REPORT_SECTIONS;
}

/**
 * Fetch unprocessed posts from last 7 days
 * Only returns posts that haven't been included in a report yet
 * Limited to 30 posts to avoid timeout with large models
 */
async function fetchUnprocessedPosts() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return prisma.post.findMany({
    where: {
      postedAt: { gt: weekAgo },
      processedAt: null, // Only unprocessed posts
    },
    include: { source: true },
    orderBy: { postedAt: 'desc' },
    take: 30, // Reduced from 100 to prevent timeout
  });
}

/**
 * Mark posts as processed and link to report
 */
async function markPostsAsProcessed(postIds: string[], reportId: string) {
  if (postIds.length === 0) return;
  
  await prisma.post.updateMany({
    where: { id: { in: postIds } },
    data: { 
      processedAt: new Date(),
      reportId: reportId,
    },
  });
  
  console.log(`[AI Pipeline] Linked ${postIds.length} posts to report ${reportId}`);
}

/**
 * Main AI Pipeline for generating daily reports
 * 
 * Pipeline Steps:
 * 1. Fetch unprocessed posts → 2. Prepare text → 3. Extract content → 
 * 4. Translate → 5. Format → 6. Save → 7. Mark processed
 */
export async function generateDailyReport(
  aiConfig: AIConfig, 
  sectionsConfig?: string,
  onProgress?: ProgressCallback
) {
  const progress = onProgress || (() => {});
  
  console.log('[AI Pipeline] Starting report generation...');
  progress({ step: 'fetch', message: 'Fetching posts...' });

  // Step 1: Fetch unprocessed posts
  const posts = await fetchUnprocessedPosts();

  if (posts.length === 0) {
    console.log('[AI Pipeline] No unprocessed posts found');
    return null;
  }

  console.log(`[AI Pipeline] Found ${posts.length} unprocessed posts to analyze`);
  progress({ step: 'fetch', message: `Found ${posts.length} posts to analyze` });

  // Keep track of post IDs for marking as processed later
  const postIds = posts.map((p) => p.id);

  // Initialize context
  const sections = parseSectionsConfig(sectionsConfig);
  let ctx: PipelineContext = {
    posts: mapPostsToData(posts),
    sections,
    config: aiConfig,
  };

  // Step 2: Prepare posts text (for unrestricted sections)
  progress({ step: 'prepare', message: 'Preparing posts for analysis...' });
  ctx = preparePosts(ctx);

  // Create model
  const model = createChatModel(aiConfig);

  // Step 3: Extract content (handles filtering for restricted sections internally)
  ctx = await extractContent(ctx, model, onProgress);

  // Step 4: Translate (if needed)
  ctx = await translateContent(ctx, model, onProgress);

  // Step 5: Format output
  progress({ step: 'format', message: 'Formatting report...' });
  ctx = formatMarkdown(ctx);

  // Step 6: Save to database
  progress({ step: 'save', message: 'Saving report...' });
  const report = await prisma.report.create({
    data: {
      title: generateReportTitle(),
      summary: ctx.markdown!,
    },
  });

  // Step 7: Mark posts as processed and link to report
  await markPostsAsProcessed(postIds, report.id);

  console.log(`[AI Pipeline] Report generated: ${report.id}`);
  progress({ step: 'done', message: 'Report generated!', reportId: report.id });

  return report;
}
