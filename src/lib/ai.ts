import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { prisma } from './db';
import { z } from 'zod';
import { DEFAULT_REPORT_SECTIONS } from './defaults';
import { ChatOllama } from "@langchain/ollama";
import { RunnableLambda } from "@langchain/core/runnables";

export interface AIConfig {
    provider: string; // 'openai' | 'ollama'
    openaiKey?: string;
    ollamaUrl?: string; // e.g. http://localhost:11434
    ollamaModel?: string; // e.g. llama3
    reportLanguage?: string;
}

export async function generateDailyReport(aiConfig: AIConfig, sectionsConfig?: string) {
  // 1. Fetch posts from the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const posts = await prisma.post.findMany({
    where: {  postedAt: { gt: yesterday } },
    include: { source: true },
    orderBy: { postedAt: 'desc' },
    take: 100 
  });

  if (posts.length === 0) return null;

  // 2. Format inputs
  const postsText = posts.map(p => 
    `[${p.source.name}] ${p.title}\n${p.content.substring(0, 300)}...\nSource: ${p.url}`
  ).join('\n\n');

  // 3. Prepare Sections & Schema
  let sections = DEFAULT_REPORT_SECTIONS;
  if (sectionsConfig) {
    try {
        const parsed = JSON.parse(sectionsConfig);
        if (Array.isArray(parsed) && parsed.length > 0) {
            sections = parsed;
        }
    } catch (e) {
        console.error("Failed to parse custom sections", e);
    }
  }

  // Dynamically build Zod Schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemaShape: Record<string, any> = {};
  
  sections.forEach(section => {
    schemaShape[section.id] = z.array(z.object({
        title: z.string().describe("Title or theme of the item"),
        summary: z.string().describe("Detailed content/summary"),
        sourceUrl: z.string().describe("The DIRECT link to the reddit post. MUST be a valid URL.")
    })).describe(section.prompt || section.description);
  });

  const dynamicSchema = z.object(schemaShape);

  // 4. Initialize LangChain with Structured Output
  let model;
  
  if (aiConfig.provider === 'ollama') {
      console.log(`[AI] Using Ollama: ${aiConfig.ollamaUrl} - ${aiConfig.ollamaModel}`);
      model = new ChatOllama({
        baseUrl: aiConfig.ollamaUrl || "http://localhost:11434",
        model: aiConfig.ollamaModel || "llama3",
        temperature: 0.2,
      });
  } else {
      // Default to OpenAI
      model = new ChatOpenAI({
        openAIApiKey: aiConfig.openaiKey || process.env.OPENAI_API_KEY,
        modelName: 'gpt-4o', 
        temperature: 0.2,
      });
  }

  const structuredModel = model.withStructuredOutput(dynamicSchema);

  // --- Step A: Generation Chain ---
  const generationPrompt = PromptTemplate.fromTemplate(`
    You are an intelligent Content Analyzer. Your goal is to examine Reddit posts and extract items that match the user's defined categories.
    
    CRITICAL INSTRUCTIONS:
    1. You will be provided with a list of categories. Each category has its own "Prompt Instruction".
    2. For each category, ONLY extract content that matches that category's specific instruction.
    3. If a category's instruction is broad (e.g. "Everything"), include everything relevant. If it is specific (e.g. "Bugs"), be strict.
    4. If no content matches a category, return an empty list.
    5. Always include the direct source link.
    6. Always include the direct source link.

    Topical Sections to Extract:
    {section_instructions}

    Input Data (Reddit Posts):
    {posts}
  `);

  const generationChain = generationPrompt.pipe(structuredModel);

  // --- Step B: Translation Chain (Conditional) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translationLogic = RunnableLambda.from(async (input: Record<string, any>) => {
      const targetLanguage = aiConfig.reportLanguage || 'English';
      
      if (targetLanguage === 'English') {
          return input; // Pass through
      }

      console.log(`[AI] Piping to Translation Step (${targetLanguage})...`);

      const translationPrompt = PromptTemplate.fromTemplate(`
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

      const translationChain = translationPrompt.pipe(structuredModel);
      
      
      const translated = await translationChain.invoke({
          json_data: JSON.stringify(input),
          language: targetLanguage
      });
      return translated;
  });

  // --- Final Composition ---
  console.log('Running structured analysis pipeline...');
  
  // Construct the textual instructions for the prompt
  const sectionInstructionsText = sections.map(s => {
    let instruction = `- Category "${s.title}": ${s.prompt}`;
    if (s.sourceId) {
        const matchingPost = posts.find(p => p.sourceId === s.sourceId);
        if (matchingPost) {
            // @ts-expect-error - Post include source, but TS might complain about nulls
            instruction += ` (STRICTLY RESTRICTED TO SOURCE: "${matchingPost.source.name}")`;
        } else {
            instruction += ` (CRITICAL: You must ONLY extract content where the Source is matching ID ${s.sourceId})`;
        }
    }
    return instruction;
  }).join('\n');

  const mainPipeline = generationChain.pipe(translationLogic);

  const result = await mainPipeline.invoke({ 
      posts: postsText,
      section_instructions: sectionInstructionsText
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as Record<string, any[]>;


  // 5. Convert JSON back to Markdown for display
  let markdown = '';
  
  sections.forEach(section => {
    markdown += `# ${section.title}\n`;
    const items = result[section.id] || [];
    if (items.length === 0) {
        markdown += `No significant data found.\n\n`;
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.forEach((item: any) => {
            markdown += `- **${item.title}**\n  ${item.summary}\n  [Source](${item.sourceUrl})\n\n`;
        });
    }
  });

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 6. Save to Database
  const report = await prisma.report.create({
    data: {
      title: `Insight - ${now.toLocaleDateString()} (${timeString})`,
      summary: markdown,
    },
  });

  return report;
}
