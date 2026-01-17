import { prisma } from '../db';
import { DEFAULT_REPORT_SECTIONS } from '../defaults';
import { createChatModel } from './models';
import {
  preparePosts,
  buildSectionInstructions,
  mapPostsToData,
  extractContent,
  translateContent,
  formatMarkdown,
  generateReportTitle,
} from './steps';
import type { AIConfig, PipelineContext, ReportSection } from './types';

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
    take: 100,
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
 * 1. Fetch unprocessed posts → 2. Prepare text → 3. Build instructions → 
 * 4. Extract content → 5. Translate → 6. Format → 7. Save → 8. Mark processed
 */
export async function generateDailyReport(aiConfig: AIConfig, sectionsConfig?: string) {
  console.log('[AI Pipeline] Starting report generation...');

  // Step 1: Fetch unprocessed posts
  const posts = await fetchUnprocessedPosts();

  if (posts.length === 0) {
    console.log('[AI Pipeline] No unprocessed posts found');
    return null;
  }

  console.log(`[AI Pipeline] Found ${posts.length} unprocessed posts to analyze`);

  // Keep track of post IDs for marking as processed later
  const postIds = posts.map((p) => p.id);

  // Initialize context
  const sections = parseSectionsConfig(sectionsConfig);
  let ctx: PipelineContext = {
    posts: mapPostsToData(posts),
    sections,
    config: aiConfig,
  };

  // Step 2: Prepare posts text
  ctx = preparePosts(ctx);

  // Step 3: Build section instructions
  ctx = buildSectionInstructions(ctx);

  // Create model
  const model = createChatModel(aiConfig);

  // Step 4: Extract content
  ctx = await extractContent(ctx, model);

  // Step 5: Translate (if needed)
  ctx = await translateContent(ctx, model);

  // Step 6: Format output
  ctx = formatMarkdown(ctx);

  // Step 7: Save to database
  const report = await prisma.report.create({
    data: {
      title: generateReportTitle(),
      summary: ctx.markdown!,
    },
  });

  // Step 8: Mark posts as processed and link to report
  await markPostsAsProcessed(postIds, report.id);

  console.log(`[AI Pipeline] Report generated: ${report.id}`);

  return report;
}
