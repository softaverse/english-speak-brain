import { apiClient } from './client';
import type {
  ApiResponse,
  SentenceAnalysis,
  AnalysisResponse,
  PracticeSession,
  TranscriptionResponse,
  AudioFormatsResponse,
} from '@/types';

/**
 * Upload audio for analysis
 */
export async function uploadAudioForAnalysis(
  audioBlob: Blob,
  userId: string
): Promise<ApiResponse<AnalysisResponse>> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('userId', userId);

  return apiClient.upload<AnalysisResponse>('/practice/analyze', formData);
}

/**
 * Get practice history
 */
export async function getPracticeHistory(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<{ sentences: SentenceAnalysis[]; total: number }>> {
  return apiClient.get(`/practice/history?userId=${userId}&page=${page}&limit=${limit}`);
}

/**
 * Get a specific sentence analysis
 */
export async function getSentenceAnalysis(
  sentenceId: string
): Promise<ApiResponse<SentenceAnalysis>> {
  return apiClient.get(`/practice/sentence/${sentenceId}`);
}

/**
 * Start a new practice session
 */
export async function startPracticeSession(
  userId: string
): Promise<ApiResponse<PracticeSession>> {
  return apiClient.post('/practice/session/start', { userId });
}

/**
 * End a practice session
 */
export async function endPracticeSession(
  sessionId: string
): Promise<ApiResponse<PracticeSession>> {
  return apiClient.post('/practice/session/end', { sessionId });
}

/**
 * Get current active session
 */
export async function getActiveSession(
  userId: string
): Promise<ApiResponse<PracticeSession | null>> {
  return apiClient.get(`/practice/session/active?userId=${userId}`);
}

/**
 * Transcribe audio to text using OpenAI Whisper
 */
export async function transcribeAudio(
  audioBlob: Blob,
  options?: {
    language?: string;
    prompt?: string;
    temperature?: number;
  }
): Promise<ApiResponse<TranscriptionResponse>> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  if (options?.language) {
    formData.append('language', options.language);
  }
  if (options?.prompt) {
    formData.append('prompt', options.prompt);
  }
  if (options?.temperature !== undefined) {
    formData.append('temperature', options.temperature.toString());
  }

  return apiClient.upload<TranscriptionResponse>('/practice/transcribe', formData);
}

/**
 * Transcribe audio with detailed word-level timestamps
 */
export async function transcribeAudioWithTimestamps(
  audioBlob: Blob,
  options?: {
    language?: string;
    prompt?: string;
    temperature?: number;
  }
): Promise<ApiResponse<TranscriptionResponse>> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  if (options?.language) {
    formData.append('language', options.language);
  }
  if (options?.prompt) {
    formData.append('prompt', options.prompt);
  }
  if (options?.temperature !== undefined) {
    formData.append('temperature', options.temperature.toString());
  }

  return apiClient.upload<TranscriptionResponse>('/practice/transcribe/detailed', formData);
}

/**
 * Get supported audio formats and size limits
 */
export async function getSupportedAudioFormats(): Promise<ApiResponse<AudioFormatsResponse>> {
  return apiClient.get('/practice/transcribe/formats');
}

/**
 * Message role types
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Text generation options for talkWithSpecificTopic API
 */
export interface TextGenerationOptions {
  store?: boolean;
  include?: Array<string>;
}

/**
 * Text generation response from Responses API
 */
export interface TextGenerationResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    reasoningTokens?: number;
  };
  status: string;
  id: string;
  createdAt: number;
  output: Array<any>;
}

/**
 * Talk with specific topic using reusable OpenAI prompt
 * POST /api/practice/generate/talk-with-topic
 *
 * @param topic - The conversation topic/scenario
 * @param initial_message - The initial message in the conversation
 * @param options - Optional generation settings
 * @returns AI-generated conversation response
 *
 * @example
 * ```typescript
 * const response = await talkWithSpecificTopic(
 *   "You are attending a job interview. The interviewer asks you to describe yourself.",
 *   "Hello, nice to meet you",
 *   { store: true }
 * );
 * ```
 */
export async function talkWithSpecificTopic(
  topic: string,
  initial_message: string,
  options?: TextGenerationOptions
): Promise<ApiResponse<TextGenerationResponse>> {
  return apiClient.post('/practice/generate/talk-with-topic', {
    topic,
    initial_message,
    options,
  });
}

/**
 * Translation response interface
 */
export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Translate text from English to Chinese
 * POST /api/practice/translate
 *
 * @param text - The text to translate
 * @param targetLanguage - The target language code (default: 'zh-CN' for Simplified Chinese)
 * @returns Translated text
 *
 * @example
 * ```typescript
 * const response = await translateText(
 *   "Hello, how are you?",
 *   "zh-CN"
 * );
 * ```
 */
export async function translateText(
  text: string,
  targetLanguage: string = 'zh-CN'
): Promise<ApiResponse<TranslationResponse>> {
  return apiClient.post('/practice/translate', {
    text,
    targetLanguage,
  });
}

