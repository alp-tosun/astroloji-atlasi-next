'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  { key: 'daily', labelKey: 'sect_bugun', fallback: 'Bugün', icon: '☀️' },
  { key: 'sky', labelKey: 'sect_gokyuzu', fallback: 'Gökyüzü', icon: '🌌' },
  { key: 'personal', labelKey: 'sect_kisisel', fallback: 'Kişisel', icon: '🧭' },
  { key: 'mystical', labelKey: 'sect_mistik', fallback: 'Mistik', icon: '🔮' },
  { key: 'archive', labelKey: 'sect_arsiv', fallback: 'Arşiv', icon: '📂' },
] as const;

const GRADIENT_MAP: Record<string, string> = {
  daily: 'from-[var(--gradient-daily-from)] to-[var(--gradient-daily-to)]',
  sky: 'from-[var(--gradient-sky-from)] to-[var(--gradient-sky-to)]',
  personal: 'from-[var(--gradient-personal-from)] to-[var(--gradient-personal-to)]',
  mystical: 'from-[var(--gradient-mystical-from)] to-[var(--gradient-mystical-to)]',
  archive: 'from-[var(--gradient-archive-from)] to-[var(--gradient-archive-to)]',
};

/* ── Category Tabs — compact pill buttons ── */
interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  t: (key: string) => string;
}

export function CategoryTabs({ activeTab, onTabChange, t }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-pill="${activeTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const handleClick = (key: string) => {
    onTabChange(key);
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-[88px] z-30 bg-bg/80 backdrop-blur-xl py-2 -mx-3 px-3">
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
        {SECTIONS.map((section) => {
          const isActive = activeTab === section.key;
          return (
            <button
              key={section.key}
              data-pill={section.key}
              onClick={() => handleClick(section.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? `bg-gradient-to-r ${GRADIENT_MAP[section.key]} text-white shadow-sm`
                  : 'bg-card/50 text-muted hover:text-text hover:bg-card/80 border border-border/50'
              }`}
            >
              <span>{section.icon}</span>
              <span>{t(section.labelKey) || section.fallback}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tool Grid — all categories stacked ── */
interface ToolGridProps {
  activeTool: ToolId | null;
  onSelect: (id: ToolId) => void;
  onActiveTabChange?: (key: string) => void;
  t: (key: string) => string;
}

export function ToolGrid({ activeTool, onSelect, onActiveTabChange, t }: ToolGridProps) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // IntersectionObserver for automatic active pill tracking
  useEffect(() => {
    if (!onActiveTabChange) return;
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((section) => {
      const el = document.getElementById(`section-${section.key}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              onActiveTabChange(section.key);
            }
          });
        },
        { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [onActiveTabChange]);

  // Search: flat 3-col grid with all matching tools
  const searchResults = useMemo(() => {
    if (!query) return null;
    return TOOLS.filter((tool) => {
      const name = t(tool.nameKey).toLowerCase();
      const desc = t(tool.descKey).toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  }, [query, t]);

  return (
    <div className="space-y-4">
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

      {/* Search results — flat grid */}
      {searchResults ? (
        <div className="grid grid-cols-3 gap-2.5">
          {searchResults.map((tool, i) => (
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
      ) : (
        /* All categories stacked */
        <div className="space-y-5">
          {SECTIONS.map((section) => {
            const sectionTools = TOOLS.filter((tool) => tool.section === section.key);
            return (
              <section
                key={section.key}
                id={`section-${section.key}`}
                className="scroll-mt-28 animate-[sectionSlideIn_0.4s_ease-out_both]"
                ref={(el) => { sectionRefs.current[section.key] = el; }}
              >
                {/* Gradient category banner */}
                <div className={`category-banner bg-gradient-to-r ${GRADIENT_MAP[section.key]} mb-2.5`}>
                  <span className="text-base">{section.icon}</span>
                  <span>{t(section.labelKey) || section.fallback}</span>
                  <span className="ml-auto text-xs opacity-80">{sectionTools.length}</span>
                </div>

                {/* 3-column grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {sectionTools.map((tool, i) => (
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
