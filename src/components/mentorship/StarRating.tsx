
import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  onRatingChange,
  max = 5,
  size = 'md',
  readonly = false,
  className,
}: StarRatingProps) {
  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            starSizes[size],
            'cursor-pointer transition-colors',
            rating > i ? 'fill-primary text-primary' : 'text-muted stroke-muted-foreground fill-transparent',
            !readonly && 'hover:text-primary'
          )}
          onClick={() => {
            if (!readonly && onRatingChange) {
              onRatingChange(i + 1);
            }
          }}
        />
      ))}
    </div>
  );
}
