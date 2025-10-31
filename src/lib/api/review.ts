import { apiClient } from './client';
import type { ApiResponse, DailyReview, ReviewExercise } from '@/types';

/**
 * Get today's daily review
 */
export async function getTodayReview(userId: string): Promise<ApiResponse<DailyReview>> {
  return apiClient.get(`/review/today?userId=${userId}`);
}

/**
 * Get review by date
 */
export async function getReviewByDate(
  userId: string,
  date: string
): Promise<ApiResponse<DailyReview>> {
  return apiClient.get(`/review/date?userId=${userId}&date=${date}`);
}

/**
 * Submit exercise answer
 */
export async function submitExerciseAnswer(
  reviewId: string,
  exerciseId: string,
  answer: string
): Promise<ApiResponse<{ correct: boolean; explanation: string }>> {
  return apiClient.post('/review/submit', {
    reviewId,
    exerciseId,
    answer,
  });
}

/**
 * Mark review as completed
 */
export async function completeReview(
  reviewId: string
): Promise<ApiResponse<DailyReview>> {
  return apiClient.post('/review/complete', { reviewId });
}

/**
 * Get review history
 */
export async function getReviewHistory(
  userId: string,
  limit: number = 30
): Promise<ApiResponse<DailyReview[]>> {
  return apiClient.get(`/review/history?userId=${userId}&limit=${limit}`);
}
