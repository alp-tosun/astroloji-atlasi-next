'use client';

import { SelectHTMLAttributes, forwardRef, useId } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="text-xs font-medium text-muted">{label}</label>}
        <select
          ref={ref}
          id={id}
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
