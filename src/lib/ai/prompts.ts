import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Prompt for content extraction/generation
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
You are an expert Content Analyst creating a focused executive report.

TASK: Select the 3-5 MOST INTERESTING posts for this category and summarize them.

RULES:
1. Pick 3-5 posts that best match the category
2. For each selected post, provide:
   - A brief title (5-10 words)
   - A 2-3 sentence summary of what makes it interesting
   - The post number (postIndex) - IMPORTANT: use the exact number from "[Post X]"
3. Focus on the most valuable/actionable insights
4. If nothing relevant, return empty array

CATEGORY:
{section_instructions}

---

POSTS TO ANALYZE:
{posts}

---

Select and summarize the most relevant posts for this category. Always include the postIndex.
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
