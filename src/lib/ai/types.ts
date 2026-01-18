import { z } from 'zod';

/**
 * Progress callback for streaming updates
 */
export type ProgressCallback = (progress: ProgressUpdate) => void;

/**
 * Progress update sent during report generation
 */
export interface ProgressUpdate {
  step: 'fetch' | 'prepare' | 'extract' | 'translate' | 'format' | 'save' | 'done' | 'error';
  message: string;
  current?: number;
  total?: number;
  sectionTitle?: string;
  reportId?: string;
  error?: string;
}

/**
 * AI Provider configuration
 */
export interface AIConfig {
  provider: 'openai' | 'ollama';
  openaiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  openaiModel?: string;
  reportLanguage?: string;
}

/**
 * Report section configuration
 */
export interface ReportSection {
  id: string;
  title: string;
  description: string;
  prompt: string;
  sourceIds?: string[];
}

/**
 * Extracted item from AI analysis
 */
export interface ExtractedItem {
  title: string;
  summary: string;
  postIndex?: number; // Index of the source post (1-based)
}

/**
 * Extracted item with resolved URL
 */
export interface ExtractedItemWithUrl extends ExtractedItem {
  sourceUrl?: string;
}

/**
 * Section result with items and source posts
 */
export interface SectionResult {
  items: ExtractedItemWithUrl[];
  sourcePosts: PostData[]; // Posts that were analyzed for this section
}

/**
 * Post data for analysis
 */
export interface PostData {
  id: string;
  title: string;
  content: string;
  url: string;
  sourceId: string;
  sourceName: string;
}

/**
 * Pipeline context passed between steps
 */
export interface PipelineContext {
  posts: PostData[];
  sections: ReportSection[];
  config: AIConfig;
  postsText?: string;
  extractedData?: Record<string, SectionResult>;
  translatedData?: Record<string, SectionResult>;
  markdown?: string;
}

/**
 * Create dynamic Zod schema for sections
 * AI returns title, summary, and postIndex for source linking
 */
export function createSectionSchema(sections: ReportSection[]) {
  const schemaShape: Record<string, z.ZodArray<z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    postIndex: z.ZodNumber;
  }>>> = {};

  sections.forEach((section) => {
    schemaShape[section.id] = z
      .array(
        z.object({
          title: z.string().describe('Brief title of the insight (5-10 words)'),
          summary: z.string().describe('Summary of the insight (2-3 sentences)'),
          postIndex: z.number().describe('The post number this insight is based on (e.g., 1 for "Post 1")'),
        })
      )
      .describe(section.prompt || section.description);
  });

  return z.object(schemaShape);
}
