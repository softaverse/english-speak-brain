import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value, showLabel = false, variant = 'default', ...props },
    ref
  ) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    const variants = {
      default: 'bg-primary-600',
      success: 'bg-success-600',
      error: 'bg-error-600',
      warning: 'bg-warning-600',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              variants[variant]
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-right text-sm font-medium text-gray-700">
            {clampedValue}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;
