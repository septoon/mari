import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/classnames';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const spinnerSizeClassName = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
} satisfies Record<NonNullable<LoadingSpinnerProps['size']>, string>;

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={cn(
        'shrink-0 animate-spin motion-reduce:animate-none',
        spinnerSizeClassName[size],
        className
      )}
    />
  );
}

type LoadingLabelProps = {
  label: string;
  size?: LoadingSpinnerProps['size'];
  className?: string;
  spinnerClassName?: string;
};

export function LoadingLabel({
  label,
  size = 'md',
  className,
  spinnerClassName
}: LoadingLabelProps) {
  return (
    <span className={cn('inline-flex items-center justify-center gap-2', className)}>
      <LoadingSpinner size={size} className={spinnerClassName} />
      <span>{label}</span>
    </span>
  );
}
