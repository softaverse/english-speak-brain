'use client';

import { useState, useEffect } from 'react';
import { Calendar, Trophy, Target } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import { getTodayReview, submitExerciseAnswer, completeReview } from '@/lib/api';
import type { DailyReview } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';

// Mock user ID - in production, this would come from auth context
const MOCK_USER_ID = 'user-123';

export default function DailyReviewPage() {
  const [review, setReview] = useState<DailyReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set()
  );
  const [isCompletingReview, setIsCompletingReview] = useState(false);

  useEffect(() => {
    loadTodayReview();
  }, []);

  const loadTodayReview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTodayReview(MOCK_USER_ID);

      if (response.success && response.data) {
        setReview(response.data);
        setCompletedExercises(new Set(response.data.completedExercises));
      } else {
        setError(response.error?.message || 'Failed to load review');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Failed to load review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (
    exerciseId: string,
    answer: string
  ): Promise<{ correct: boolean; explanation: string }> => {
    if (!review) {
      throw new Error('No review loaded');
    }

    const response = await submitExerciseAnswer(review.id, exerciseId, answer);

    if (response.success && response.data) {
      // Mark exercise as completed
      setCompletedExercises((prev) => new Set([...prev, exerciseId]));
      return response.data;
    } else {
      throw new Error(response.error?.message || 'Failed to submit answer');
    }
  };

  const handleCompleteReview = async () => {
    if (!review) return;

    setIsCompletingReview(true);
    try {
      const response = await completeReview(review.id);

      if (response.success && response.data) {
        setReview(response.data);
      }
    } catch (err) {
      console.error('Failed to complete review:', err);
    } finally {
      setIsCompletingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="text-gray-600">Loading your daily review...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <p className="text-error-600 mb-4">{error || 'No review available'}</p>
            <Button onClick={loadTodayReview}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExercise = review.exercises[currentExerciseIndex];
  const progress = (completedExercises.size / review.exercises.length) * 100;
  const isAllCompleted = completedExercises.size === review.exercises.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Daily Review</h1>
        <p className="mt-2 text-gray-600">
          Practice exercises based on your common mistakes
        </p>
      </div>

      {/* Progress Overview */}
      <Card variant="elevated">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">Today's Progress</span>
            </div>
            <span className="text-sm text-gray-600">
              {completedExercises.size} / {review.exercises.length} completed
            </span>
          </div>

          <Progress value={progress} showLabel />

          {isAllCompleted && !review.completed && (
            <div className="rounded-lg bg-success-50 p-4 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-success-600" />
              <p className="font-medium text-success-900">
                All exercises completed!
              </p>
              <Button
                onClick={handleCompleteReview}
                isLoading={isCompletingReview}
                className="mt-3"
              >
                Mark Review as Complete
              </Button>
            </div>
          )}

          {review.completed && (
            <div className="rounded-lg bg-success-50 p-4 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-success-600" />
              <p className="font-medium text-success-900">
                Review completed! Great job!
              </p>
              {review.score !== undefined && (
                <p className="mt-1 text-sm text-success-700">
                  Score: {Math.round(review.score)}%
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Navigation */}
      {review.exercises.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {review.exercises.map((exercise, idx) => (
            <button
              key={exercise.id}
              onClick={() => setCurrentExerciseIndex(idx)}
              className={`h-3 w-3 rounded-full transition-all ${
                idx === currentExerciseIndex
                  ? 'w-8 bg-primary-600'
                  : completedExercises.has(exercise.id)
                  ? 'bg-success-600'
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to exercise ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Current Exercise */}
      {currentExercise && (
        <ExerciseCard
          exercise={currentExercise}
          exerciseNumber={currentExerciseIndex + 1}
          onSubmit={(answer) => handleSubmitAnswer(currentExercise.id, answer)}
          isCompleted={completedExercises.has(currentExercise.id)}
        />
      )}

      {/* Navigation Buttons */}
      {review.exercises.length > 1 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentExerciseIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentExerciseIndex((prev) =>
                Math.min(review.exercises.length - 1, prev + 1)
              )
            }
            disabled={currentExerciseIndex === review.exercises.length - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Focus Area Info */}
      <Card variant="bordered">
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Today's Focus</span>
          </div>
          <p className="text-sm text-gray-600">
            These exercises target your most common error types to help you improve faster.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
