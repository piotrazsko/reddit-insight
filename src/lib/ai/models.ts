import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import { OPENAI_DEFAULT_MODEL } from '../openaiModels';
import type { AIConfig } from './types';

// Default timeout config for OpenAI
const DEFAULT_OPENAI_CONFIG = {
  timeout: 90000, // 90 seconds
  maxRetries: 2,
};

/**
 * Create chat model based on AI config
 */
export function createChatModel(config: AIConfig) {
  if (config.provider === 'ollama') {
    console.log(`[AI] Using Ollama: ${config.ollamaUrl} - ${config.ollamaModel}`);
    return new ChatOllama({
      baseUrl: config.ollamaUrl || 'http://localhost:11434',
      model: config.ollamaModel || 'llama3',
      temperature: 0.2,
      headers: {
        'Connection': 'keep-alive',
      },
      // @ts-expect-error - numCtx is supported but not in types
      numCtx: 4096,
    });
  }

  const modelName = config.openaiModel || OPENAI_DEFAULT_MODEL;
  const apiKey = config.openaiKey || process.env.OPENAI_API_KEY;
  console.log(`[AI] Using OpenAI: ${modelName}`);

  // Model-specific configurations
  switch (modelName) {
    case 'gpt-5':
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: modelName,
        temperature: 1,
        // @ts-expect-error - useResponsesApi and reasoning are newer features
        useResponsesApi: true,
        reasoning: { effort: 'low' },
        ...DEFAULT_OPENAI_CONFIG,
      });

    case 'gpt-5.1':
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: modelName,
        temperature: 1,
        // @ts-expect-error - useResponsesApi and reasoning are newer features
        useResponsesApi: true,
        reasoning: { effort: 'none' },
        ...DEFAULT_OPENAI_CONFIG,
      });

    case 'gpt-5-mini':
    case 'gpt-5-nano':
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: modelName,
        temperature: 1,
        // @ts-expect-error - useResponsesApi and reasoning are newer features
        useResponsesApi: true,
        reasoning: { effort: 'low' },
        ...DEFAULT_OPENAI_CONFIG,
      });

    case 'gpt-4o':
    case 'gpt-4o-mini':
    case 'gpt-4.1-2025-04-14':
    case 'gpt-4.1-nano':
    default:
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: modelName,
        temperature: 0.7,
        ...DEFAULT_OPENAI_CONFIG,
      });
  }
}

/**
 * Get model name for display
 */
export function getModelName(config: AIConfig): string {
  if (config.provider === 'ollama') {
    return config.ollamaModel || 'llama3';
  }
  return config.openaiModel || OPENAI_DEFAULT_MODEL;
}
