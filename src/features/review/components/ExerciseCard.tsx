'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ReviewExercise } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface ExerciseCardProps {
  exercise: ReviewExercise;
  exerciseNumber: number;
  onSubmit: (answer: string) => Promise<{ correct: boolean; explanation: string }>;
  isCompleted?: boolean;
}

export default function ExerciseCard({
  exercise,
  exerciseNumber,
  onSubmit,
  isCompleted = false,
}: ExerciseCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);

  const handleSubmit = async () => {
    const answer = exercise.type === 'multiple_choice' ? selectedAnswer : userAnswer;

    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await onSubmit(answer);
      setResult(response);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnswerProvided =
    exercise.type === 'multiple_choice' ? selectedAnswer : userAnswer.trim();

  const exerciseTypeLabel = {
    fill_blank: 'Fill in the Blank',
    multiple_choice: 'Multiple Choice',
    rewrite: 'Rewrite Sentence',
    speaking_practice: 'Speaking Practice',
  };

  return (
    <Card variant={isCompleted ? 'bordered' : 'elevated'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Exercise {exerciseNumber}</CardTitle>
          <Badge variant="info" size="sm">
            {exerciseTypeLabel[exercise.type]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question */}
        <div>
          <p className="text-base font-medium text-gray-900">{exercise.question}</p>
        </div>

        {/* Answer Input */}
        {!result && !isCompleted && (
          <div className="space-y-3">
            {exercise.type === 'multiple_choice' && exercise.options ? (
              <div className="space-y-2">
                {exercise.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
                      selectedAnswer === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`exercise-${exercise.id}`}
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={!isAnswerProvided || isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Checking...' : 'Submit Answer'}
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg p-4 ${
              result.correct ? 'bg-success-50' : 'bg-error-50'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              {result.correct ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success-600" />
                  <span className="font-medium text-success-900">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-error-600" />
                  <span className="font-medium text-error-900">Not quite right</span>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-700">Explanation:</p>
                <p className="text-gray-700">{result.explanation}</p>
              </div>

              {!result.correct && (
                <div>
                  <p className="font-medium text-gray-700">Correct Answer:</p>
                  <p className="font-medium text-success-700">{exercise.correctAnswer}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-success-600" />
            <p className="text-sm font-medium text-gray-700">Exercise Completed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
