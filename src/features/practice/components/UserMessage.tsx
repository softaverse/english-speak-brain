'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Volume2, VolumeX } from 'lucide-react';
import type { ConversationMessage } from '@/types';

interface UserMessageProps {
  message: ConversationMessage;
}

export default function UserMessage({ message }: UserMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = () => {
    if (!message.audioBlob) return;

    // If audio already exists and is playing, pause it
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
    }

    // Create new audio element
    const audioUrl = URL.createObjectURL(message.audioBlob);
    audioUrlRef.current = audioUrl;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
    };
    audio.onpause = () => setIsPlaying(false);

    audio.play();
  };

  return (
    <div className="flex justify-end gap-3 mb-4">
      <div className="flex flex-col items-end max-w-[80%]">
        {/* Message Content with Audio Button */}
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <div className="flex items-start gap-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{message.content}</p>

            {/* Audio Play Button - Only show if audioBlob exists */}
            {message.audioBlob && (
              <button
                onClick={handlePlayAudio}
                className="flex-shrink-0 p-1.5 rounded-full hover:bg-blue-500 transition-colors"
                title="播放錄音"
              >
                {isPlaying ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

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
