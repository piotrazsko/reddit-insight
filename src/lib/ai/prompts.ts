import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Prompt for content extraction/generation
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
You are an expert Content Analyzer specializing in Reddit community discussions.

YOUR TASK:
Analyze the provided Reddit posts and extract relevant items into the specified categories.

CRITICAL RULES:
1. Each category has a specific instruction - follow it EXACTLY.
2. ⚠️ SOURCE RESTRICTIONS: Some categories are RESTRICTED to specific sources (marked with "RESTRICTION"). 
   For those categories, ONLY analyze posts from that specific source. Completely IGNORE posts from other sources.
3. Categories without restrictions should analyze ALL posts.
4. Match content to categories based on MEANING, not just keywords.
5. If a post discusses multiple topics, it can appear in multiple categories.
6. If no content matches a category, return an empty items list for that category.
7. Always include the original post URL as sourceUrl.
8. Write concise but informative summaries (2-3 sentences).

CATEGORIES TO EXTRACT:
{section_instructions}

---

POSTS TO ANALYZE:
{posts}

---

REMEMBER: 
- Check source restrictions before adding items to a category
- Be precise about categorization
- Include the exact source URL from the post
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
