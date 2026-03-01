'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-xs font-medium text-muted">{label}</label>}
        <select
          ref={ref}
          className={`w-full rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-sm text-text outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/20 hover:border-border/80 ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  },
);
Select.displayName = 'Select';
