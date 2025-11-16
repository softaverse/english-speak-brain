/**
 * Translation constants for the application
 */

/**
 * Default target language for translations
 * Using Traditional Chinese (zh-TW) as primary target for Chinese-speaking users
 */
export const DEFAULT_TARGET_LANGUAGE = 'zh-TW';

/**
 * Supported translation languages
 */
export const SUPPORTED_LANGUAGES = {
  SIMPLIFIED_CHINESE: 'zh-CN',
  TRADITIONAL_CHINESE: 'zh-TW',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
} as const;

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  [SUPPORTED_LANGUAGES.SIMPLIFIED_CHINESE]: '简体中文',
  [SUPPORTED_LANGUAGES.TRADITIONAL_CHINESE]: '繁體中文',
  [SUPPORTED_LANGUAGES.JAPANESE]: '日本語',
  [SUPPORTED_LANGUAGES.KOREAN]: '한국어',
  [SUPPORTED_LANGUAGES.SPANISH]: 'Español',
  [SUPPORTED_LANGUAGES.FRENCH]: 'Français',
  [SUPPORTED_LANGUAGES.GERMAN]: 'Deutsch',
};
