'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className
}) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  };

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const value = index + 1;

        // Determine fill state
        let fillPercentage = 0;
        if (value <= rating) {
          fillPercentage = 100;
        } else if (value - 1 < rating) {
          // This is the partial star
          fillPercentage = (rating - (value - 1)) * 100;
        }

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            className={cn(
              'focus:outline-none relative transition-transform',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            )}
          >
            {/* Background Star (Gray/Outline) */}
            <Star
              className={cn(
                sizes[size],
                "text-muted-foreground fill-none"
              )}
            />

            {/* Foreground Star (Yellow Fill) */}
            {fillPercentage > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={cn(
                    sizes[size],
                    "fill-yellow-400 text-yellow-400"
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
