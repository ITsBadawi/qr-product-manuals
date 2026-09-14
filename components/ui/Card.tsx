import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

export function Card({ className, gradient = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl transition-all duration-200',
        gradient && 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.03] before:to-transparent before:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  title,
  description,
  action,
  children,
}: {
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div>
        {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
