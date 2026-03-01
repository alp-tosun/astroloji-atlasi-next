'use client';

import { TextareaHTMLAttributes, forwardRef, useId } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, className = '', id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={id} className="text-sm text-muted">{label}</label>}
        <textarea
          ref={ref}
          id={id}
          className={`w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-text placeholder:text-muted/50 outline-none transition-colors focus:border-accent resize-none ${className}`}
          {...props}
        />
      </div>
    );
  },
);
TextArea.displayName = 'TextArea';
