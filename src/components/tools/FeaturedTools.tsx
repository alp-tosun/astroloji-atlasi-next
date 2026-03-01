'use client';

import type { ToolId } from '@/types/profile';

interface FeaturedToolsProps {
  onSelect: (id: ToolId) => void;
  t: (key: string) => string;
}

const FEATURED: { id: ToolId; icon: string; nameKey: string; descKey: string; gradient: string }[] = [
  {
    id: 'gunluk',
    icon: '⭐',
    nameKey: 'featured_gunluk_name',
    descKey: 'featured_gunluk_desc',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  {
    id: 'kosm',
    icon: '🔮',
    nameKey: 'featured_kosm_name',
    descKey: 'featured_kosm_desc',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
  },
  {
    id: 'horar',
    icon: '✦',
    nameKey: 'featured_horar_name',
    descKey: 'featured_horar_desc',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
];

export function FeaturedTools({ onSelect, t }: FeaturedToolsProps) {
  return (
    <div className="flex flex-col gap-2">
      {FEATURED.map((tool, i) => (
        <button
          key={tool.id}
          onClick={() => onSelect(tool.id)}
          className="group relative flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 backdrop-blur-sm px-3.5 py-3 text-left overflow-hidden hover:border-accent/40 transition-all duration-200"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Gradient bg */}
          <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-40 group-hover:opacity-80 transition-opacity`} />

          {/* Icon */}
          <span className="relative text-2xl shrink-0">{tool.icon}</span>

          {/* Text */}
          <div className="relative flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text leading-tight">{t(tool.nameKey)}</h3>
            <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{t(tool.descKey)}</p>
          </div>

          {/* Arrow */}
          <svg className="relative w-4 h-4 text-muted/40 group-hover:text-accent shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}
