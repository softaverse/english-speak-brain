'use client';

import { useState, useCallback } from 'react';
import VoiceRecorder from './VoiceRecorder';
import ChatMessageList from './ChatMessageList';
import { transcribeAudio, talkWithSpecificTopic } from '@/lib/api';
import type { ConversationMessage } from '@/types';

// Define conversation topic presets
interface TopicPreset {
  id: string;
  name: string;
  topic: string;
  initialMessage: string;
}

const TOPIC_PRESETS: TopicPreset[] = [
  {
    id: 'job-interview',
    name: 'Job Interview',
    topic: `You are attending a job interview. The interviewer asks you to describe yourself in three words and explain why you chose them, as well as provide a specific example. Try to answer clearly and effectively to leave a strong and positive impression.`,
    initialMessage: `Hello, thanks for coming in today. Let's start with a simple question. Can you describe yourself in three words?`,
  },
  {
    id: 'casual-chat',
    name: 'Casual Chat',
    topic: `You are having a casual conversation with a friendly English speaker. They want to get to know you better and practice everyday conversation topics like hobbies, interests, and daily life.`,
    initialMessage: `Hey there! Nice to meet you. I'd love to get to know you better. What do you like to do in your free time?`,
  },
  {
    id: 'travel-planning',
    name: 'Travel Planning',
    topic: `You are discussing travel plans with a travel advisor. They will help you plan your trip by asking about your preferences, budget, and interests. Practice expressing your travel desires and asking relevant questions.`,
    initialMessage: `Hello! I'm here to help you plan your next adventure. Where would you like to go, and what kind of experience are you looking for?`,
  },
];

export default function PracticePage() {
  // Use a constant for the initial preset to avoid repetition
  const initialPreset = TOPIC_PRESETS[0];

  // Topic and message configuration
  const [conversationTopic, setConversationTopic] = useState<string>(initialPreset.topic);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Custom input fields
  const [customTopic, setCustomTopic] = useState<string>('');
  const [customInitialMessage, setCustomInitialMessage] = useState<string>('');

  // Chat state
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: initialPreset.initialMessage,
      timestamp: new Date(),
    }
  ]);
  const [error, setError] = useState<string | null>(null);

  // Reset conversation with new initial message
  const resetConversation = useCallback((newInitialMessage: string) => {
    setMessages([
      {
        id: 'welcome-msg',
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
    }
  }, [customTopic, customInitialMessage, resetConversation]);

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
        id: `user-${crypto.randomUUID()}`,
        role: 'user',
        content: transcribedText,
        audioBlob: audioBlob,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Step 3: Add loading message for AI response
      const loadingMessage: ConversationMessage = {
        id: `assistant-${crypto.randomUUID()}`,
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
        <div className="mx-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configure Conversation Topic</h2>

          {/* Preset Topics */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Select Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 rounded-lg border border-gray-200 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Or Create Custom Topic</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="custom-topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation Topic Description
                </label>
                <textarea
                  id="custom-topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Describe the conversation scenario and context..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label htmlFor="custom-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Initial AI Message
                </label>
                <textarea
                  id="custom-message"
                  value={customInitialMessage}
                  onChange={(e) => setCustomInitialMessage(e.target.value)}
                  placeholder="Enter the AI's opening message to start the conversation..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleCustomSubmit}
                disabled={!customTopic.trim() || !customInitialMessage.trim()}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Start Custom Conversation
              </button>
            </div>
          </div>
        </div>
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
