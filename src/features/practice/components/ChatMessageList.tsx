'use client';

import { useEffect, useRef } from 'react';
import type { ConversationMessage } from '@/types';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import { MessageCircle } from 'lucide-react';

interface ChatMessageListProps {
  messages: ConversationMessage[];
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-blue-50 p-6 mb-4">
          <MessageCircle className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Start Your Conversation
        </h3>
        <p className="text-gray-600 max-w-md">
          Click the record button below to start speaking with your AI teacher.
          Practice your English and get instant feedback!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '400px' }}
    >
      {messages.map((message) => (
        message.role === 'user' ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        )
      ))}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
