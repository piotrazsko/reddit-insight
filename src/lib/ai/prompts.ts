import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Prompt for content extraction/generation
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
You are an expert Content Analyzer. Your job is to categorize Reddit posts into the specified categories.

TASK: Read ALL posts below and assign them to the appropriate categories.

IMPORTANT RULES:
1. Categories marked with "Scope: ALL sources" - analyze EVERY post from ALL sources
2. Categories marked with "RESTRICTION: Only from [sources]" - ONLY analyze posts from those specific sources listed
3. A single post CAN and SHOULD appear in MULTIPLE categories if relevant
4. For general categories (Executive Summary, Bugs, Features, Sentiment) - ALWAYS check ALL posts
5. Extract meaningful insights - bugs, feature requests, important discussions
6. If a category has no matching content, return empty array (this should be rare for general categories)
7. When a category is restricted to multiple sources, include posts from ANY of those listed sources

CATEGORIES:
{section_instructions}

---

POSTS DATA:
{posts}

---

INSTRUCTIONS:
- For EACH category, go through ALL relevant posts and extract matching content
- Executive Summary should capture the most important/discussed topics across ALL sources
- Bugs & Issues should find ANY technical problems mentioned in ANY post
- Feature Requests should find ANY suggestions/wishes in ANY post  
- User Sentiment should analyze the overall mood across ALL posts
- Source-restricted categories should ONLY use posts from their specified source(s)
- When multiple sources are specified, include posts from ALL of those sources
`);

/**
 * Prompt for translation
 */
export const TRANSLATION_PROMPT = PromptTemplate.fromTemplate(`
You are a professional translator. 
Your task is to translate the 'title' and 'summary' fields of the provided JSON data into {language}.

RULES:
1. ONLY translate 'title' and 'summary' values.
2. Do NOT change any keys or the structure of the JSON.
3. Do NOT translate 'sourceUrl'.
4. Maintain the original tone and technical accuracy.

Input JSON:
{json_data}
`);
