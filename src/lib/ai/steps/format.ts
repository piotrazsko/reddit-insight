import { getModelName } from '../models';
import type { PipelineContext, ExtractedItem } from '../types';

/**
 * Step 5: Format output as Markdown
 */
export function formatMarkdown(ctx: PipelineContext): PipelineContext {
  const data = ctx.translatedData || ctx.extractedData;

  if (!data) {
    throw new Error('No data available to format');
  }

  let markdown = '';

  ctx.sections.forEach((section) => {
    markdown += `# ${section.title}\n`;
    const items: ExtractedItem[] = data[section.id] || [];

    if (items.length === 0) {
      markdown += `No significant data found.\n\n`;
    } else {
      items.forEach((item) => {
        markdown += `- **${item.title}**\n  ${item.summary}\n  [Source](${item.sourceUrl})\n\n`;
      });
    }
  });

  // Add footer with metadata
  const modelName = getModelName(ctx.config);
  const footer = `\n\n---\n> **Generation Model:** ${ctx.config.provider} (${modelName}) | **Language:** ${ctx.config.reportLanguage || 'English'}`;

  return { ...ctx, markdown: markdown + footer };
}

/**
 * Generate report title
 */
export function generateReportTitle(): string {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Insight - ${now.toLocaleDateString()} (${timeString})`;
}
