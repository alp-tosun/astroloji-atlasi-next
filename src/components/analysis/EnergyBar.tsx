'use client';

interface EnergyBarProps {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

export function EnergyBar({ label, value, color = 'bg-accent', icon }: EnergyBarProps) {
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="text-sm w-5 text-center" aria-hidden="true">{icon}</span>}
      <span className="text-xs text-muted w-20 shrink-0">{label}</span>
      <div
        className="flex-1 h-2 rounded-full bg-border overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${clampedValue}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      <span className="text-xs text-muted w-10 text-right" aria-hidden="true">{clampedValue}%</span>
    </div>
  );
}
