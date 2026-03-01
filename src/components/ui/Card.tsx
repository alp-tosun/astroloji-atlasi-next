import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  premium?: boolean;
}

export function Card({ active, premium, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border bg-card transition-all duration-300 ${
        active
          ? 'border-accent shadow-lg shadow-accent/10'
          : 'border-border hover:border-accent/30'
      } ${premium ? 'ring-1 ring-gold/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
