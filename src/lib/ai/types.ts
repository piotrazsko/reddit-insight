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
  sourceIds?: string[];
}

/**
 * Extracted item from AI analysis (raw from AI)
 */
export interface ExtractedItemRaw {
  title: string;
  summary: string;
  postIndex: number;
}

/**
 * Extracted item with resolved URL
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
 * AI returns postIndex instead of URL - we resolve URLs programmatically
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
          title: z.string().describe('Title or theme of the item'),
          summary: z.string().describe('Detailed content/summary'),
          postIndex: z.number().describe('The index number of the referenced post (e.g., 1, 2, 3). Use the [Post N] number from the posts data.'),
        })
      )
      .describe(section.prompt || section.description);
  });

  return z.object(schemaShape);
}
