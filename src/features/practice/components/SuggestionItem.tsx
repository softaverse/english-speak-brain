'use client';

import { useState, useEffect } from 'react';
import { Languages, Copy, Check, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/hooks';

interface SuggestionItemProps {
  suggestion: string;
}

export default function SuggestionItem({ suggestion }: SuggestionItemProps) {
  const {
    translation,
    isTranslating,
    showTranslation,
    error: translationError,
    toggleTranslation,
  } = useTranslation(suggestion);

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timerId = setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => clearTimeout(timerId);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
      {/* Suggestion Text */}
      <p className="text-sm text-gray-800 leading-relaxed">{suggestion}</p>

      {/* Translation Section */}
      {showTranslation && translation && (
        <div className="mt-2 pt-2 border-t border-primary-300">
          <div className="text-xs font-medium text-gray-600 mb-1">中文翻譯</div>
          <div className="text-sm leading-relaxed text-gray-700">
            {translation}
          </div>
        </div>
      )}

      {/* Translation Error */}
      {translationError && (
        <div className="mt-2 text-xs text-red-600">
          {translationError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-2 flex items-center gap-3">
        {/* Translation Button */}
        <button
          onClick={toggleTranslation}
          disabled={isTranslating}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={translation ? (showTranslation ? '隱藏翻譯' : '顯示翻譯') : '翻譯成中文'}
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>翻譯中...</span>
            </>
          ) : (
            <>
              <Languages className="w-3.5 h-3.5" />
              <span>{translation ? (showTranslation ? '隱藏翻譯' : '顯示翻譯') : '翻譯'}</span>
            </>
          )}
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          title={isCopied ? '已複製！' : '複製文字'}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">已複製</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>複製</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
