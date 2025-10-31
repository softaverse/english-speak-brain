'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ErrorTrend } from '@/types';

interface ErrorTrendsChartProps {
  trends: ErrorTrend[];
}

export default function ErrorTrendsChart({ trends }: ErrorTrendsChartProps) {
  const chartData = trends.map((trend) => ({
    type: trend.errorType.replace('_', ' '),
    occurrences: trend.totalOccurrences,
    improvement: trend.improvementRate,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="type"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend />
          <Bar
            dataKey="occurrences"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            name="Total Errors"
          />
          <Bar
            dataKey="improvement"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            name="Improvement %"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
