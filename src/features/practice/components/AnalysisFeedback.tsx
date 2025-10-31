'use client';

import { AlertCircle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import type { SentenceAnalysis, ErrorDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { getScoreColor } from '@/lib/utils';

interface AnalysisFeedbackProps {
  analysis: SentenceAnalysis;
}

function ErrorTypeIcon({ type }: { type: string }) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'grammar':
      return <AlertCircle className={iconClass} />;
    case 'pronunciation':
      return <TrendingUp className={iconClass} />;
    default:
      return <AlertCircle className={iconClass} />;
  }
}

function ErrorItem({ error }: { error: ErrorDetail }) {
  const severityVariant = {
    minor: 'warning' as const,
    moderate: 'warning' as const,
    major: 'error' as const,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ErrorTypeIcon type={error.type} />
          <Badge variant={severityVariant[error.severity]} size="sm">
            {error.type.replace('_', ' ')}
          </Badge>
          <Badge variant="default" size="sm">
            {error.severity}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-600">Original:</p>
          <p className="text-sm text-gray-900 line-through">{error.originalText}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600">Corrected:</p>
          <p className="text-sm font-medium text-success-700">{error.correctedText}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600">Explanation:</p>
          <p className="text-sm text-gray-700">{error.explanation}</p>
        </div>

        {error.examples && error.examples.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-600">Examples:</p>
            <ul className="mt-1 space-y-1">
              {error.examples.map((example, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  • {example}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisFeedback({ analysis }: AnalysisFeedbackProps) {
  const hasErrors = analysis.errors.length > 0;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Your Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score */}
          <div className="text-center">
            <div
              className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}
            >
              {Math.round(analysis.overallScore)}
            </div>
            <p className="text-sm text-gray-600">Overall Score</p>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Grammar</span>
                <span className={getScoreColor(analysis.grammarScore)}>
                  {Math.round(analysis.grammarScore)}%
                </span>
              </div>
              <Progress
                value={analysis.grammarScore}
                variant={analysis.grammarScore >= 80 ? 'success' : 'warning'}
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Fluency</span>
                <span className={getScoreColor(analysis.fluencyScore)}>
                  {Math.round(analysis.fluencyScore)}%
                </span>
              </div>
              <Progress
                value={analysis.fluencyScore}
                variant={analysis.fluencyScore >= 80 ? 'success' : 'warning'}
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Pronunciation</span>
                <span className={getScoreColor(analysis.pronunciationScore)}>
                  {Math.round(analysis.pronunciationScore)}%
                </span>
              </div>
              <Progress
                value={analysis.pronunciationScore}
                variant={analysis.pronunciationScore >= 80 ? 'success' : 'warning'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcription */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>What You Said</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Original:</p>
            <p className="text-base text-gray-900">{analysis.originalText}</p>
          </div>

          {hasErrors && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">Corrected Version:</p>
              <p className="text-base font-medium text-success-700">
                {analysis.correctedText}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errors Section */}
      {hasErrors ? (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Areas for Improvement</CardTitle>
              <Badge variant="info">{analysis.errors.length} errors found</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.errors.map((error) => (
              <ErrorItem key={error.id} error={error} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success-600" />
            <p className="text-lg font-medium text-success-700">Perfect! No errors found.</p>
            <p className="text-sm text-gray-600">Keep up the great work!</p>
          </CardContent>
        </Card>
      )}

      {/* AI Feedback */}
      {analysis.feedback && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning-600" />
              <CardTitle>AI Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{analysis.feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Suggestions for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1 text-primary-600">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
