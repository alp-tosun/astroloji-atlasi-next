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

export function ToolCard({ id, name, icon, active, premium, live, onClick, index = 0 }: ToolCardProps) {
  return (
    <button
      onClick={() => onClick(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(id); } }}
      aria-label={`${name}${premium ? ' (Premium)' : ''}${live ? ' (Live)' : ''}`}
      style={{ animationDelay: `${index * 40}ms` }}
      className={`compact-card-glow group relative flex flex-col items-center justify-center text-center rounded-xl border aspect-square transition-all duration-200 animate-[fadeSlideUp_0.3s_ease-out_both] active:scale-95 ${
        active
          ? 'border-accent bg-accent/10 shadow-md shadow-accent/15'
          : 'border-border bg-card hover:border-accent/40 hover:bg-card/80 hover:shadow-md hover:shadow-accent/10'
      }`}
    >
      {/* Premium badge — small gold lock */}
      {premium && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}

      {/* Live badge — green pulse dot */}
      {live && !premium && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      )}

      {/* Icon */}
      <span className="text-[2rem] leading-none mb-1.5 transition-transform duration-200 group-hover:scale-110">{icon}</span>

      {/* Name */}
      <span className="text-[11px] font-semibold text-text leading-tight line-clamp-1 px-1.5">{name}</span>
    </button>
  );
}
