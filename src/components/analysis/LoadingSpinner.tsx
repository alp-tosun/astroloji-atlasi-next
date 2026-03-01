interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      {text && <p className="text-sm text-muted animate-pulse">{text}</p>}
    </div>
  );
}
