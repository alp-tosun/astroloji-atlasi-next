'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="text-xs font-medium text-muted">{label}</label>}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-sm text-text placeholder:text-muted/40 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 hover:border-border/80 ${className}`}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';
