'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import VoiceRecorder from './VoiceRecorder';
import ChatMessageList from './ChatMessageList';
import TopicConfigurationPanel from './TopicConfigurationPanel';
import SuggestionItem from './SuggestionItem';
import { transcribeAudio, talkWithSpecificTopic, generateResponseSuggestions } from '@/lib/api';
import { DEFAULT_PRESET, TOPIC_PRESETS } from '@/features/practice/constants/topics';
import type { ConversationMessage, TopicPreset } from '@/types';

export default function PracticePage() {
  // Topic and message configuration
  const [conversationTopic, setConversationTopic] = useState<string>(DEFAULT_PRESET.topic);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Custom input fields
  const [customTopic, setCustomTopic] = useState<string>('');
  const [customInitialMessage, setCustomInitialMessage] = useState<string>('');

  // Chat state - use lazy initializer to ensure unique ID on mount
  const [messages, setMessages] = useState<ConversationMessage[]>(() => [
    {
      id: `assistant-${uuidv4()}`,
      role: 'assistant',
      content: DEFAULT_PRESET.initialMessage,
      timestamp: new Date(),
    }
  ]);
  const [error, setError] = useState<string | null>(null);

  // Response suggestions state
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  // Reset conversation with new initial message
  const resetConversation = useCallback((newInitialMessage: string) => {
    setMessages([
      {
        id: `assistant-${uuidv4()}`,
        role: 'assistant',
        content: newInitialMessage,
        timestamp: new Date(),
      }
    ]);
  }, []);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: TopicPreset) => {
    setConversationTopic(preset.topic);
    resetConversation(preset.initialMessage);
    setShowConfig(false);
    setCustomTopic('');
    setCustomInitialMessage('');
  }, [resetConversation]);

  // Handle custom topic submission
  const handleCustomSubmit = useCallback(() => {
    if (customTopic.trim() && customInitialMessage.trim()) {
      setConversationTopic(customTopic);
      resetConversation(customInitialMessage);
      setShowConfig(false);
      setCustomTopic('');
      setCustomInitialMessage('');
    }
  }, [customTopic, customInitialMessage, resetConversation]);

  // Handle generating response suggestions
  const handleGenerateSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    setError(null);

    try {
      // Build conversation history from recent messages
      const conversationHistory = messages
        .slice(-6) // Get last 6 messages for context
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Teacher'}: ${msg.content}`)
        .join('\n');

      const response = await generateResponseSuggestions(
        conversationTopic,
        conversationHistory,
        { store: false }
      );

      if (!response.success || !response.data?.text) {
        throw new Error(response.error?.message || 'Failed to generate suggestions');
      }

      // Parse the suggestions (split by newlines and filter empty lines)
      const parsedSuggestions = response.data.text
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 3); // Ensure we only have 3 suggestions

      setSuggestions(parsedSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate suggestions. Please try again.'
      );
    } finally {
      setLoadingSuggestions(false);
    }
  }, [conversationTopic, messages]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setError(null);

    try {
      // Step 1: Transcribe audio to text
      const transcriptionResponse = await transcribeAudio(audioBlob, {
        language: 'en',
        temperature: 0.2,
      });

      if (!transcriptionResponse.success || !transcriptionResponse.data?.text) {
        throw new Error(
          transcriptionResponse.error?.message || 'Failed to transcribe audio'
        );
      }

      const transcribedText = transcriptionResponse.data.text;

      // Step 2: Add user message to chat
      const userMessage: ConversationMessage = {
        id: `user-${uuidv4()}`,
        role: 'user',
        content: transcribedText,
        audioBlob: audioBlob,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Step 3: Add loading message for AI response
      const loadingMessage: ConversationMessage = {
        id: `assistant-${uuidv4()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      // Step 4: Get AI response using talkWithSpecificTopic
      const aiResponse = await talkWithSpecificTopic(
        conversationTopic,
        transcribedText,
        {
          store: true,
        }
      );

      if (!aiResponse.success || !aiResponse.data?.text) {
        throw new Error(aiResponse.error?.message || 'Failed to get AI response');
      }

      // Step 5: Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: aiResponse.data!.text,
                isLoading: false,
                timestamp: new Date(),
              }
            : msg
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );

      // Remove loading message if there was an error
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
    }
  };

  return (
    <div className="mx-auto max-w-4xl h-full flex flex-col">
      {/* Header */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Practice Speaking</h1>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
          >
            {showConfig ? 'Hide Config' : 'Configure Topic'}
          </button>
        </div>
        <p className="mt-2 text-gray-600">
          Have a conversation with your AI teacher and improve your English
        </p>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <TopicConfigurationPanel
          presets={TOPIC_PRESETS}
          customTopic={customTopic}
          customInitialMessage={customInitialMessage}
          onCustomTopicChange={setCustomTopic}
          onCustomInitialMessageChange={setCustomInitialMessage}
          onPresetSelect={handlePresetSelect}
          onCustomSubmit={handleCustomSubmit}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4 rounded-lg bg-error-50 border border-error-200 p-4">
          <p className="font-medium text-error-900">Error</p>
          <p className="mt-1 text-sm text-error-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm font-medium text-error-700 underline hover:text-error-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 border border-gray-200 rounded-lg bg-white shadow-sm mx-4 overflow-hidden flex flex-col">
        {/* Topic Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-primary-900 mb-1">
                Conversation Topic
              </h3>
              <p className="text-sm text-primary-700 leading-relaxed">
                {conversationTopic}
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-hidden">
          <ChatMessageList messages={messages} />
        </div>
      </div>

      {/* Response Suggestions Button and Panel */}
      <div className="mt-4 mx-4">
        <button
          onClick={handleGenerateSuggestions}
          disabled={loadingSuggestions}
          className="w-full px-4 py-3 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          {loadingSuggestions ? '生成中...' : '提示'}
        </button>

        {/* Suggestions Popup */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-3 p-4 bg-white border border-primary-200 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">回應建議</h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <SuggestionItem
                  key={suggestion}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voice Recorder - Fixed at bottom */}
      <div className="mt-4 mb-6 mx-4">
        <VoiceRecorder
          onAnalysisRequest={handleRecordingComplete}
          autoSubmit={true}
        />
      </div>
    </div>
  );
}
