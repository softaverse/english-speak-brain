'use client';

import { User } from 'lucide-react';
import type { ConversationMessage } from '@/types';

interface UserMessageProps {
  message: ConversationMessage;
}

export default function UserMessage({ message }: UserMessageProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex justify-end gap-3 mb-4">
      <div className="flex flex-col items-end max-w-[80%]">
        {/* Message Content */}
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Audio Player - Hidden for now to keep chat clean */}
        {/* Can be enabled later with a compact version */}

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1">{formattedTime}</span>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <User className="w-4 h-4 text-blue-600" />
      </div>
    </div>
  );
}
