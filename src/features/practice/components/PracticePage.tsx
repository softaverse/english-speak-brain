'use client';

import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import ChatMessageList from './ChatMessageList';
import { transcribeAudio, generateConversation } from '@/lib/api';
import type { ConversationMessage } from '@/types';
import type { ChatMessage } from '@/lib/api/practice';

// Initial welcome message from AI teacher
const INITIAL_MESSAGE: ConversationMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `Hello, thanks for coming in today. Let's start with a simple question. Can you describe yourself in three words?`,
  timestamp: new Date(),
};

export default function PracticePage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([INITIAL_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: INITIAL_MESSAGE.content },
  ]);
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

      // Update conversation history for API
      const updatedHistory: ChatMessage[] = [
        ...conversationHistory,
        { role: 'user', content: transcribedText },
      ];

      // Step 3: Add loading message for AI response
      const loadingMessage: ConversationMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      // Step 4: Get AI feedback
      const aiResponse = await generateConversation(
        transcribedText,
        conversationHistory,
        {
          temperature: 0.8,
          maxOutputTokens: 500,
          instructions: `You are a friendly and supportive English teacher. Your role is to:
1. Engage in natural conversation with the student
2. Provide gentle corrections when you notice errors in grammar, vocabulary, or sentence structure
3. Give encouraging feedback and praise improvements
4. Ask follow-up questions to keep the conversation flowing
5. Balance between being a conversational partner and an educational guide

Keep your responses concise (2-4 sentences) and conversational. Don't be overly formal or list-like unless the student specifically asks for detailed analysis.`,
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

      // Update conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: aiResponse.data.text },
      ]);
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
      <div className="flex-1 border border-gray-200 rounded-lg bg-white shadow-sm mx-4 overflow-hidden">
        <ChatMessageList messages={messages} />
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
