import { apiClient } from './client';
import type {
  ApiResponse,
  UserStats,
  ErrorTrend,
  FluencyMetrics,
  LearningInsights,
} from '@/types';

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
  return apiClient.get(`/analytics/stats?userId=${userId}`);
}

/**
 * Get error trends over time
 */
export async function getErrorTrends(
  userId: string,
  days: number = 30
): Promise<ApiResponse<ErrorTrend[]>> {
  return apiClient.get(`/analytics/error-trends?userId=${userId}&days=${days}`);
}

/**
 * Get fluency metrics
 */
export async function getFluencyMetrics(
  userId: string
): Promise<ApiResponse<FluencyMetrics>> {
  return apiClient.get(`/analytics/fluency?userId=${userId}`);
}

/**
 * Get learning insights and recommendations
 */
export async function getLearningInsights(
  userId: string
): Promise<ApiResponse<LearningInsights>> {
  return apiClient.get(`/analytics/insights?userId=${userId}`);
}

/**
 * Get progress over time
 */
export async function getProgressData(
  userId: string,
  days: number = 30
): Promise<
  ApiResponse<Array<{ date: string; score: number; sentenceCount: number }>>
> {
  return apiClient.get(`/analytics/progress?userId=${userId}&days=${days}`);
}
