'use client';

interface EnergyBarProps {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

export function EnergyBar({ label, value, color = 'bg-accent', icon }: EnergyBarProps) {
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="text-sm w-5 text-center">{icon}</span>}
      <span className="text-xs text-muted w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted w-10 text-right">{value}%</span>
    </div>
  );
}
