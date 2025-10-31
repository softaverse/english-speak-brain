'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  Calendar,
  Flame,
} from 'lucide-react';
import ProgressChart from './ProgressChart';
import ErrorTrendsChart from './ErrorTrendsChart';
import {
  getUserStats,
  getErrorTrends,
  getFluencyMetrics,
  getLearningInsights,
  getProgressData,
} from '@/lib/api';
import type { UserStats, ErrorTrend, FluencyMetrics, LearningInsights } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

// Mock user ID - in production, this would come from auth context
const MOCK_USER_ID = 'user-123';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-success-600" />,
    down: <TrendingDown className="h-4 w-4 text-error-600" />,
    stable: <Minus className="h-4 w-4 text-gray-600" />,
  };

  return (
    <Card variant="bordered">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-lg bg-primary-50 p-3">{icon}</div>
            {trend && trendIcon[trend]}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [errorTrends, setErrorTrends] = useState<ErrorTrend[]>([]);
  const [fluencyMetrics, setFluencyMetrics] = useState<FluencyMetrics | null>(null);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [progressData, setProgressData] = useState<
    Array<{ date: string; score: number; sentenceCount: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);

    try {
      const [statsRes, trendsRes, fluencyRes, insightsRes, progressRes] =
        await Promise.all([
          getUserStats(MOCK_USER_ID),
          getErrorTrends(MOCK_USER_ID, 30),
          getFluencyMetrics(MOCK_USER_ID),
          getLearningInsights(MOCK_USER_ID),
          getProgressData(MOCK_USER_ID, 30),
        ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (trendsRes.success && trendsRes.data) setErrorTrends(trendsRes.data);
      if (fluencyRes.success && fluencyRes.data) setFluencyMetrics(fluencyRes.data);
      if (insightsRes.success && insightsRes.data) setInsights(insightsRes.data);
      if (progressRes.success && progressRes.data) setProgressData(progressRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="mt-2 text-gray-600">
          Track your improvement and identify areas for growth
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Practice Sessions"
            value={stats.totalPracticeSessions}
            icon={<Calendar className="h-6 w-6 text-primary-600" />}
          />
          <StatCard
            title="Sentences Practiced"
            value={stats.totalSentences}
            icon={<Target className="h-6 w-6 text-primary-600" />}
          />
          <StatCard
            title="Average Score"
            value={`${Math.round(stats.averageScore)}%`}
            icon={<Award className="h-6 w-6 text-primary-600" />}
            trend={fluencyMetrics?.trend === 'improving' ? 'up' : fluencyMetrics?.trend === 'declining' ? 'down' : 'stable'}
          />
          <StatCard
            title="Current Streak"
            value={`${stats.streakHistory.filter((h) => h.practiced).length} days`}
            icon={<Flame className="h-6 w-6 text-primary-600" />}
            trend="up"
          />
        </div>
      )}

      {/* Fluency Metrics */}
      {fluencyMetrics && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Fluency Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Current Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(fluencyMetrics.currentScore)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Previous Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(fluencyMetrics.previousScore)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <Badge
                  variant={
                    fluencyMetrics.trend === 'improving'
                      ? 'success'
                      : fluencyMetrics.trend === 'declining'
                      ? 'error'
                      : 'default'
                  }
                  size="lg"
                >
                  {fluencyMetrics.trend}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Over Time */}
      {progressData.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={progressData} />
          </CardContent>
        </Card>
      )}

      {/* Error Trends */}
      {errorTrends.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorTrendsChart trends={errorTrends} />
          </CardContent>
        </Card>
      )}

      {/* Common Errors */}
      {stats && stats.commonErrors.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Most Common Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.commonErrors.slice(0, 5).map((error, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium capitalize text-gray-900">
                      {error.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {error.count} occurrences
                    </p>
                  </div>
                  <Badge
                    variant={error.improvementRate > 0 ? 'success' : 'warning'}
                  >
                    {error.improvementRate > 0 ? '+' : ''}
                    {error.improvementRate}% improvement
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Insights */}
      {insights && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Strengths */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-success-700">Your Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 text-success-600">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-warning-700">
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 text-warning-600">→</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {insights && insights.recommendations.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {idx + 1}
                  </div>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
