import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Prompt for content extraction/generation
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
You are an expert Content Analyzer. Your job is to categorize Reddit posts into the specified categories.

TASK: Read ALL posts below and assign them to the appropriate categories.

IMPORTANT RULES:
1. Analyze EVERY post provided below - all posts are pre-filtered and relevant
2. A single post CAN and SHOULD appear in MULTIPLE categories if relevant
3. Extract meaningful insights - bugs, feature requests, important discussions
4. If a category has no matching content, return empty array
5. For postIndex - use the number from [Post N] marker (e.g., if post is marked [Post 3], use postIndex: 3)

CATEGORIES:
{section_instructions}

---

POSTS DATA (analyze ALL of these):
{posts}

---

OUTPUT INSTRUCTIONS:
- For EACH category, carefully review ALL posts and extract matching content
- Use the post number from [Post N] as the postIndex value
- Write concise but informative summaries
- Group related issues/topics together when possible
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
