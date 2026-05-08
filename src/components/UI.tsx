import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function StatusBadge({ status, variant = 'neutral' }: StatusBadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-orange-100 text-orange-700 border-orange-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={cn(
      'px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border',
      variants[variant]
    )}>
      {status}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClassName?: string;
}

export function ProgressBar({ value, max = 100, className, colorClassName }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={cn("w-full bg-slate-100 border border-slate-200 h-4 rounded-full p-0.5 overflow-hidden", className)}>
      <div 
        className={cn("bg-brand h-full transition-all duration-1000 ease-out rounded-full", colorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
