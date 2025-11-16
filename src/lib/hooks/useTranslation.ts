import { useState, useCallback } from 'react';
import { translateText } from '@/lib/api';
import { DEFAULT_TARGET_LANGUAGE } from '@/lib/constants/translation';

/**
 * Custom hook for managing text translation state and operations
 *
 * @param text - The text to translate
 * @param targetLanguage - The target language code (default: Traditional Chinese)
 * @returns Translation state and control functions
 *
 * @example
 * ```tsx
 * const { translation, isTranslating, showTranslation, error, toggleTranslation } = useTranslation(
 *   message.content
 * );
 * ```
 */
export function useTranslation(text: string, targetLanguage: string = DEFAULT_TARGET_LANGUAGE) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Toggle translation visibility or fetch translation if not already cached
   */
  const toggleTranslation = useCallback(async () => {
    // Don't attempt to translate empty or whitespace-only strings
    if (!text?.trim()) {
      return;
    }

    // If translation already exists, just toggle visibility
    if (translation) {
      setShowTranslation((prev) => !prev);
      return;
    }

    // Otherwise, fetch the translation
    setIsTranslating(true);
    setError(null);

    try {
      const response = await translateText(text, targetLanguage);

      if (!response.success || !response.data?.translatedText) {
        throw new Error(response.error?.message || 'Translation failed');
      }

      setTranslation(response.data.translatedText);
      setShowTranslation(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to translate';
      setError(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [text, targetLanguage, translation]);

  /**
   * Reset translation state
   */
  const resetTranslation = useCallback(() => {
    setTranslation(null);
    setShowTranslation(false);
    setError(null);
    setIsTranslating(false);
  }, []);

  /**
   * Hide translation without clearing the cached translation
   */
  const hideTranslation = useCallback(() => {
    setShowTranslation(false);
  }, []);

  return {
    translation,
    isTranslating,
    showTranslation,
    error,
    toggleTranslation,
    resetTranslation,
    hideTranslation,
  };
}
