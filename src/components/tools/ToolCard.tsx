'use client';

import type { ToolId } from '@/types/profile';

interface ToolCardProps {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  active?: boolean;
  premium?: boolean;
  live?: boolean;
  onClick: (id: ToolId) => void;
  liveBadge?: string;
  index?: number;
}

export function ToolCard({ id, name, description, icon, active, premium, live, onClick, liveBadge, index = 0 }: ToolCardProps) {
  return (
    <button
      onClick={() => onClick(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(id); } }}
      aria-label={`${name}${premium ? ' (Premium)' : ''}${live ? ' (Live)' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`group relative flex flex-col text-left rounded-2xl border p-4 h-full min-h-[160px] transition-all duration-300 animate-[fadeSlideUp_0.4s_ease-out_both] ${
        active
          ? 'border-accent bg-accent/8 shadow-lg shadow-accent/15 -translate-y-0.5'
          : 'border-border bg-card hover:border-accent/40 hover:bg-card/90 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10'
      }`}
    >
      {/* Badges - top right corner */}
      {premium && (
        <span className="absolute top-2.5 right-2.5 text-[10px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-semibold tracking-wide">
          PRO
        </span>
      )}
      {live && (
        <span className="absolute top-2.5 right-2.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          {liveBadge || 'LIVE'}
        </span>
      )}

      {/* Icon */}
      <div className="text-2xl mb-2.5 transition-transform duration-300 group-hover:scale-110">{icon}</div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-text mb-1">{name}</h3>

      {/* Description */}
      <p className="text-xs text-muted line-clamp-2 leading-relaxed">{description}</p>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-accent/5 to-transparent" />
    </button>
  );
}
