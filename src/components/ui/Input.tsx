'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-xs font-medium text-muted">{label}</label>}
        <input
          ref={ref}
          className={`w-full rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-sm text-text placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 hover:border-border/80 ${className}`}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';
