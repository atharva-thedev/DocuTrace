import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'bordered';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverEffect = false,
  className,
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';

  const variantClasses = {
    glass: 'glass-panel text-slate-900 dark:text-white',
    elevated: 'glass-panel-elevated text-slate-900 dark:text-white',
    bordered: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs',
  };

  const hoverClasses = hoverEffect
    ? 'hover:border-slate-400 hover:shadow-xl dark:hover:border-blue-500/50 dark:hover:shadow-blue-500/10 hover:-translate-y-0.5'
    : '';

  return (
    <div className={twMerge(clsx(baseClasses, variantClasses[variant], hoverClasses, className))} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={twMerge('px-6 py-4 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-4 w-full', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={twMerge('text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={twMerge('text-xs text-slate-500 dark:text-slate-400 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={twMerge('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={twMerge('px-6 py-4 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 rounded-b-2xl flex items-center', className)} {...props}>
    {children}
  </div>
);
