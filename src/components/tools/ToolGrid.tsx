'use client';

import { useState, useMemo } from 'react';
import { ToolCard } from './ToolCard';
import type { ToolId } from '@/types/profile';

export interface ToolDef {
  id: ToolId;
  icon: string;
  nameKey: string;
  descKey: string;
  premium?: boolean;
  live?: boolean;
  section: 'daily' | 'sky' | 'personal' | 'mystical' | 'archive';
}

export const TOOLS: ToolDef[] = [
  // ── Bugün (3) ──
  { id: 'gunluk', icon: '⭐', nameKey: 'card_gunluk_name', descKey: 'card_gunluk_desc', section: 'daily' },
  { id: 'gunun-karti', icon: '🃏', nameKey: 'card_gunun_karti_name', descKey: 'card_gunun_karti_desc', section: 'daily' },
  { id: 'rituel', icon: '🕯️', nameKey: 'card_rituel_name', descKey: 'card_rituel_desc', section: 'daily' },

  // ── Gökyüzü (5) ──
  { id: 'gezegen', icon: '🪐', nameKey: 'card_gezegen_name', descKey: 'card_gezegen_desc', live: true, section: 'sky' },
  { id: 'gezegen-saatleri', icon: '⏳', nameKey: 'card_gezegen_saatleri_name', descKey: 'card_gezegen_saatleri_desc', live: true, section: 'sky' },
  { id: 'ay-takvimi', icon: '🌕', nameKey: 'card_ay_takvimi_name', descKey: 'card_ay_takvimi_desc', live: true, section: 'sky' },
  { id: 'transit', icon: '🔀', nameKey: 'card_transit_name', descKey: 'card_transit_desc', live: true, section: 'sky' },
  { id: 'transit-kisisel', icon: '🎯', nameKey: 'card_transit_kisisel_name', descKey: 'card_transit_kisisel_desc', premium: true, section: 'sky' },

  // ── Kişisel (6) ──
  { id: 'burc', icon: '♈', nameKey: 'card_burc_name', descKey: 'card_burc_desc', section: 'personal' },
  { id: 'yuk', icon: '🌅', nameKey: 'card_yuk_name', descKey: 'card_yuk_desc', section: 'personal' },
  { id: 'ay-burc', icon: '🌙', nameKey: 'card_ay_burc_name', descKey: 'card_ay_burc_desc', section: 'personal' },
  { id: 'num', icon: '🔢', nameKey: 'card_num_name', descKey: 'card_num_desc', premium: true, section: 'personal' },
  { id: 'uyum', icon: '💞', nameKey: 'card_uyum_name', descKey: 'card_uyum_desc', premium: true, section: 'personal' },
  { id: 'kosm', icon: '🔮', nameKey: 'card_kosm_name', descKey: 'card_kosm_desc', premium: true, section: 'personal' },

  // ── Mistik (6) ──
  { id: 'tarot', icon: '🎴', nameKey: 'card_tarot_name', descKey: 'card_tarot_desc', premium: true, section: 'mystical' },
  { id: 'ruya', icon: '💭', nameKey: 'card_ruya_name', descKey: 'card_ruya_desc', premium: true, section: 'mystical' },
  { id: 'horar', icon: '✦', nameKey: 'card_horar_name', descKey: 'card_horar_desc', premium: true, section: 'mystical' },
  { id: 'yildizname', icon: '✨', nameKey: 'card_yildizname_name', descKey: 'card_yildizname_desc', premium: true, section: 'mystical' },
  { id: 'kristal', icon: '💎', nameKey: 'card_kristal_name', descKey: 'card_kristal_desc', premium: true, section: 'mystical' },
  { id: 'el', icon: '✋', nameKey: 'card_el_name', descKey: 'card_el_desc', premium: true, section: 'mystical' },

  // ── Arşiv (3) ──
  { id: 'haftalik', icon: '📅', nameKey: 'card_haftalik_name', descKey: 'card_haftalik_desc', premium: true, section: 'archive' },
  { id: 'aylik', icon: '🗓️', nameKey: 'card_aylik_name', descKey: 'card_aylik_desc', premium: true, section: 'archive' },
  { id: 'gecmis', icon: '📜', nameKey: 'card_gecmis_name', descKey: 'card_gecmis_desc', section: 'archive' },
];

const SECTIONS = [
  { key: 'daily', labelKey: 'sect_bugun', fallback: 'Bugün', icon: '☀️', gradient: 'from-amber-500/20 via-orange-500/5' },
  { key: 'sky', labelKey: 'sect_gokyuzu', fallback: 'Gökyüzü', icon: '🌌', gradient: 'from-blue-500/20 via-indigo-500/5' },
  { key: 'personal', labelKey: 'sect_kisisel', fallback: 'Kişisel', icon: '🧭', gradient: 'from-emerald-500/20 via-teal-500/5' },
  { key: 'mystical', labelKey: 'sect_mistik', fallback: 'Mistik', icon: '🔮', gradient: 'from-purple-500/20 via-fuchsia-500/5' },
  { key: 'archive', labelKey: 'sect_arsiv', fallback: 'Arşiv', icon: '📂', gradient: 'from-rose-500/20 via-pink-500/5' },
] as const;

/* ── Category Tabs (rendered separately above FeaturedTools) ── */
interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  t: (key: string) => string;
}

export function CategoryTabs({ activeTab, onTabChange, t }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {SECTIONS.map((section) => {
        const isActive = activeTab === section.key;
        const sectionTools = TOOLS.filter((tool) => tool.section === section.key);

        return (
          <button
            key={section.key}
            onClick={() => onTabChange(section.key)}
            className={`group relative shrink-0 rounded-2xl border p-3 text-left transition-all duration-300 overflow-hidden min-w-[140px] ${
              isActive
                ? 'bg-gradient-to-br ' + section.gradient + ' to-surface/80 border-accent/30 shadow-lg shadow-accent/5'
                : 'bg-card/40 border-border/50 hover:bg-card/70 hover:border-border'
            }`}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                {section.icon}
              </span>
              <span className={`text-sm font-bold truncate transition-colors ${
                isActive ? 'text-text' : 'text-muted group-hover:text-text'
              }`}>
                {t(section.labelKey) || section.fallback}
              </span>
            </div>

            {/* Tool names */}
            <div className="space-y-0.5">
              {sectionTools.slice(0, 4).map((tool) => (
                <div
                  key={tool.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    isActive ? 'text-muted' : 'text-muted/50 group-hover:text-muted/70'
                  }`}
                >
                  <span className={`text-sm transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-70'}`}>
                    {tool.icon}
                  </span>
                  <span className="truncate">{t(tool.nameKey)}</span>
                </div>
              ))}
              {sectionTools.length > 4 && (
                <div className={`text-[10px] ${isActive ? 'text-muted' : 'text-muted/40'}`}>
                  +{sectionTools.length - 4} {t('sect_daha') || 'daha'}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Tool Grid (only the cards, tab state comes from parent) ── */
interface ToolGridProps {
  activeTool: ToolId | null;
  activeTab: string;
  onSelect: (id: ToolId) => void;
  t: (key: string) => string;
}

export function ToolGrid({ activeTool, activeTab, onSelect, t }: ToolGridProps) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const filteredTools = useMemo(
    () =>
      query
        ? TOOLS.filter((tool) => {
            const name = t(tool.nameKey).toLowerCase();
            const desc = t(tool.descKey).toLowerCase();
            return name.includes(query) || desc.includes(query);
          })
        : TOOLS.filter((tool) => tool.section === activeTab),
    [query, activeTab, t],
  );

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full rounded-xl border border-border bg-card/50 pl-9 pr-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredTools.map((tool, i) => (
          <ToolCard
            key={tool.id}
            id={tool.id}
            name={t(tool.nameKey)}
            description={t(tool.descKey)}
            icon={tool.icon}
            active={activeTool === tool.id}
            premium={tool.premium}
            live={tool.live}
            onClick={onSelect}
            liveBadge={t('live_badge')}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
