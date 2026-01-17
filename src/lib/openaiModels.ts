export type OpenAIModelOption = {
  id: string;
  label: string;
  hint?: string;
};

export const OPENAI_DEFAULT_MODEL = 'gpt-4o';

export const OPENAI_MODELS: OpenAIModelOption[] = [
  { id: 'gpt-4o', label: 'GPT-4o (Best quality)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast, cheaper)' },
  { id: 'o1-preview', label: 'o1-preview (Reasoning, slower)' },
  { id: 'o1-mini', label: 'o1-mini (Fast reasoning)' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Legacy)' },
];
