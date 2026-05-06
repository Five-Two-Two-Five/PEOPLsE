import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-brand text-black hover:bg-brand/90 font-black uppercase tracking-widest text-xs',
      secondary: 'bg-white/10 text-white hover:bg-white/20 uppercase tracking-widest text-xs',
      outline: 'border border-white/20 bg-transparent hover:bg-white/5 uppercase tracking-widest text-xs',
      ghost: 'bg-transparent hover:bg-white/10 text-white/60 uppercase tracking-widest text-xs',
      danger: 'bg-red-600 text-white hover:bg-red-700 uppercase tracking-widest text-xs',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
