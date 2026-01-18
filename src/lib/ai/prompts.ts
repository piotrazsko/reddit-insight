import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Prompt for OVERVIEW mode - analytical summary of trends
 */
export const OVERVIEW_PROMPT = PromptTemplate.fromTemplate(`
You are an expert analyst creating an OVERVIEW of community discussions.

TASK: Write a brief analytical summary of what people are discussing in this category.

OUTPUT FORMAT:
- Write 2-4 key observations/trends as separate items
- Each item should describe a THEME or TREND, not just summarize one post
- Include the postIndex of the MOST RELEVANT post for each observation (for source linking)
- Be analytical: "People are frustrated with X", "There's growing interest in Y", "The community recommends Z"

CATEGORY:
{section_instructions}

---

POSTS TO ANALYZE:
{posts}

---

Write an analytical overview. Focus on WHAT people are saying and WHY.
`);

/**
 * Prompt for POSTS mode - curated list of specific posts
 */
export const POSTS_LIST_PROMPT = PromptTemplate.fromTemplate(`
You are a content curator selecting the BEST posts for a specific category.

TASK: Select 3-5 most relevant/interesting posts that match this category.

OUTPUT FORMAT:
- For each selected post provide:
  - title: Brief descriptive title (can be different from original)
  - summary: 1-2 sentences about what makes this post interesting
  - postIndex: The exact post number from "[Post X]" 

CATEGORY:
{section_instructions}

---

POSTS TO ANALYZE:
{posts}

---

Select the best posts for this category. Include postIndex for each.
`);

// Alias for backward compatibility
export const GENERATION_PROMPT = OVERVIEW_PROMPT;

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
