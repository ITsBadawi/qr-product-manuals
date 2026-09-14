import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
      lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] border border-indigo-400/30',
      secondary:
        'bg-slate-800/80 text-slate-200 border border-slate-700/80 hover:bg-slate-700 hover:text-white active:scale-[0.98]',
      outline:
        'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800/50 active:scale-[0.98]',
      danger:
        'bg-rose-600/90 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-600 active:scale-[0.98] border border-rose-500/40',
      ghost:
        'text-slate-400 hover:text-white hover:bg-slate-800/60 active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
