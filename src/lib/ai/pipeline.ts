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
 * Fetch recent posts from database
 */
async function fetchRecentPosts() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return prisma.post.findMany({
    where: { postedAt: { gt: yesterday } },
    include: { source: true },
    orderBy: { postedAt: 'desc' },
    take: 100,
  });
}

/**
 * Main AI Pipeline for generating daily reports
 * 
 * Pipeline Steps:
 * 1. Fetch posts → 2. Prepare text → 3. Build instructions → 
 * 4. Extract content → 5. Translate → 6. Format → 7. Save
 */
export async function generateDailyReport(aiConfig: AIConfig, sectionsConfig?: string) {
  console.log('[AI Pipeline] Starting report generation...');

  // Step 1: Fetch posts
  const posts = await fetchRecentPosts();

  if (posts.length === 0) {
    console.log('[AI Pipeline] No posts found in the last 24 hours');
    return null;
  }

  console.log(`[AI Pipeline] Found ${posts.length} posts to analyze`);

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

  console.log(`[AI Pipeline] Report generated: ${report.id}`);

  return report;
}
