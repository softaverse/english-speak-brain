'use client';

import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import ChatMessageList from './ChatMessageList';
import { transcribeAudio, talkWithSpecificTopic } from '@/lib/api';
import type { ConversationMessage } from '@/types';

// Conversation topic for the practice session
const CONVERSATION_TOPIC = `You are attending a job interview. The interviewer asks you to describe yourself in three words and explain why you chose them, as well as provide a specific example. Try to answer clearly and effectively to leave a strong and positive impression.`;

// Initial welcome message from AI teacher
const INITIAL_MESSAGE: ConversationMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `Hello, thanks for coming in today. Let's start with a simple question. Can you describe yourself in three words?`,
  timestamp: new Date(),
};

export default function PracticePage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([INITIAL_MESSAGE]);
  const [error, setError] = useState<string | null>(null);

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
        CONVERSATION_TOPIC,
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
        <h1 className="text-3xl font-bold text-gray-900">Practice Speaking</h1>
        <p className="mt-2 text-gray-600">
          Have a conversation with your AI teacher and improve your English
        </p>
      </div>

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
                {CONVERSATION_TOPIC}
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
