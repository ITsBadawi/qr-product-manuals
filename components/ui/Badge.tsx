import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    info: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    purple: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border backdrop-blur-sm tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'success' : 'neutral'} size="sm">
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
        )}
      />
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
