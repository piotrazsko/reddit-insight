import { z } from 'zod';

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
  sourceId?: string;
}

/**
 * Extracted item from AI analysis
 */
export interface ExtractedItem {
  title: string;
  summary: string;
  sourceUrl: string;
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
  sectionInstructions?: string;
  extractedData?: Record<string, ExtractedItem[]>;
  translatedData?: Record<string, ExtractedItem[]>;
  markdown?: string;
}

/**
 * Create dynamic Zod schema for sections
 */
export function createSectionSchema(sections: ReportSection[]) {
  const schemaShape: Record<string, z.ZodArray<z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    sourceUrl: z.ZodString;
  }>>> = {};

  sections.forEach((section) => {
    schemaShape[section.id] = z
      .array(
        z.object({
          title: z.string().describe('Title or theme of the item'),
          summary: z.string().describe('Detailed content/summary'),
          sourceUrl: z.string().describe('The DIRECT link to the reddit post. MUST be a valid URL.'),
        })
      )
      .describe(section.prompt || section.description);
  });

  return z.object(schemaShape);
}
