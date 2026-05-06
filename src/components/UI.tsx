import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function StatusBadge({ status, variant = 'neutral' }: StatusBadgeProps) {
  const variants = {
    success: 'bg-brand/20 text-brand border-brand/20 shadow-[0_0_10px_#CCFF0020]',
    warning: 'bg-amber-400/20 text-amber-400 border-amber-400/20',
    error: 'bg-red-500/20 text-red-500 border-red-500/20',
    info: 'bg-white/10 text-white border-white/20',
    neutral: 'bg-white/5 text-white/40 border-white/10',
  };

  return (
    <span className={cn(
      'px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-none border italic',
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
    <div className={cn("w-full bg-white/5 border border-white/10 h-6 p-1 overflow-hidden", className)}>
      <div 
        className={cn("bg-brand h-full transition-all duration-1000 ease-out shadow-[0_0_15px_#CCFF0030]", colorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
