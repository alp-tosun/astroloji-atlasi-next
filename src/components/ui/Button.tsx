'use client';

import { ButtonHTMLAttributes, forwardRef, useCallback } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, onClick, ...props }, ref) => {
    const base = 'relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';
    const variants: Record<string, string> = {
      primary: 'rounded-xl bg-accent hover:bg-accent-light text-white shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5',
      secondary: 'rounded-xl bg-surface border border-border text-text hover:border-accent/50 hover:bg-card hover:-translate-y-0.5',
      ghost: 'rounded-lg text-muted hover:text-text hover:bg-surface/80',
      premium: 'rounded-xl bg-gradient-to-r from-gold to-yellow-500 text-black font-bold shadow-md shadow-gold/20 hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5',
    };
    const sizes: Record<string, string> = {
      sm: 'px-3.5 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2.5',
    };

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const existing = button.querySelector('.ripple-effect');
        if (existing) existing.remove();

        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple-effect');
        button.appendChild(circle);
        setTimeout(() => circle.remove(), 500);

        onClick?.(e);
      },
      [onClick],
    );

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
