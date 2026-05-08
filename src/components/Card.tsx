import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-200 bg-slate-50/50", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn("px-6 py-4 border-t border-slate-200 bg-slate-50/50", className)}>
      {children}
    </div>
  );
}
