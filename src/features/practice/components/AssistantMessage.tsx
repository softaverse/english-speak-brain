'use client';

import { GraduationCap, Loader2 } from 'lucide-react';
import type { ConversationMessage } from '@/types';

interface AssistantMessageProps {
  message: ConversationMessage;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex justify-start gap-3 mb-4">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <GraduationCap className="w-4 h-4 text-green-600" />
      </div>

      <div className="flex flex-col items-start max-w-[80%]">
        {/* AI Label */}
        <span className="text-xs font-medium text-gray-600 mb-1">AI Teacher</span>

        {/* Message Content */}
        <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
              {message.content}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {!message.isLoading && (
          <span className="text-xs text-gray-500 mt-1">{formattedTime}</span>
        )}
      </div>
    </div>
  );
}
