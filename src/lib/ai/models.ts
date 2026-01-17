import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import { OPENAI_DEFAULT_MODEL } from '../openaiModels';
import type { AIConfig } from './types';

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
    });
  }

  console.log(`[AI] Using OpenAI: ${config.openaiModel || OPENAI_DEFAULT_MODEL}`);
  return new ChatOpenAI({
    openAIApiKey: config.openaiKey || process.env.OPENAI_API_KEY,
    modelName: config.openaiModel || OPENAI_DEFAULT_MODEL,
    temperature: 0.2,
  });
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
