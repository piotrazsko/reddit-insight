/**
 * AI Module
 * 
 * Provides AI-powered content analysis and report generation.
 * 
 * Structure:
 * - types.ts    - Type definitions and schemas
 * - models.ts   - Model factory (OpenAI, Ollama)
 * - prompts.ts  - Prompt templates
 * - pipeline.ts - Main orchestration
 * - comments.ts - Comment generation
 * - steps/      - Individual pipeline steps
 */

export { generateDailyReport } from './pipeline';
export { generateComment } from './comments';
export { createChatModel, getModelName } from './models';
export type { AIConfig, ReportSection, ExtractedItem, PipelineContext } from './types';
export type { CommentGenerationOptions } from './comments';
