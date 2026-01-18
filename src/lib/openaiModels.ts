export type OpenAIModelOption = {
  id: string;
  label: string;
  hint?: string;
};

export const OPENAI_DEFAULT_MODEL = 'gpt-4o';

export const OPENAI_MODELS: OpenAIModelOption[] = [
  // GPT-5 series (latest)
  { id: 'gpt-5', label: 'GPT-5 (Most powerful)', hint: 'Best for complex analysis' },
  { id: 'gpt-5.1', label: 'GPT-5.1 (Latest)', hint: 'Newest model' },
  { id: 'gpt-5-mini', label: 'GPT-5 Mini', hint: 'Balanced performance' },
  { id: 'gpt-5-nano', label: 'GPT-5 Nano', hint: 'Fast and cheap' },
  // GPT-4 series
  { id: 'gpt-4.1-2025-04-14', label: 'GPT-4.1', hint: 'High quality' },
  { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', hint: 'Cheapest GPT-4.1' },
  { id: 'gpt-4o', label: 'GPT-4o', hint: 'Fast and capable' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', hint: 'Budget friendly' },
];
