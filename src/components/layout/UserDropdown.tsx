'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAnalyses } from '@/lib/firebase/firestore';
import type { ToolId } from '@/types/profile';
import type { User } from 'firebase/auth';

interface UserDropdownProps {
  user: User;
  displayName: string;
  initial: string;
  burc: string | undefined;
  burcSymbol: string;
  isPremium: boolean;
  memberSince: string;
  streak?: number;
  t: (key: string) => string;
  onToolSelect?: (id: ToolId) => void;
  onTogglePremium: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export function UserDropdown({
  user,
  displayName,
  initial,
  burc,
  burcSymbol,
  isPremium,
  memberSince,
  streak,
  t,
  onToolSelect,
  onTogglePremium,
  onOpenSettings,
  onOpenHelp,
}: UserDropdownProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [analysisCount, setAnalysisCount] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  // Fetch analysis count when dropdown opens
  useEffect(() => {
    if (menuOpen && analysisCount === null) {
      getAnalyses(user.uid)
        .then((arr) => setAnalysisCount(arr.length))
        .catch(() => setAnalysisCount(0));
    }
  }, [menuOpen, user.uid, analysisCount]);

  const handleSignOut = useCallback(() => {
    import('@/lib/firebase/client').then(({ auth }) => {
      import('firebase/auth').then(({ signOut }) => {
        signOut(auth);
        setMenuOpen(false);
        setAnalysisCount(null);
      });
    });
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        {typeof streak === 'number' && streak > 0 && (
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-0.5">
            🔥 {streak}
          </span>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs text-accent font-bold transition-transform hover:scale-105"
        >
          {initial}
        </button>
      </div>

      {menuOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-11 w-[280px] rounded-2xl border border-border/60 bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-[fadeSlideUp_0.2s_ease-out_both]"
        >
          {/* User card */}
          <div className="px-4 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)' }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                {burc && (
                  <p className="text-xs text-muted mt-0.5">
                    {burcSymbol} {burc}
                  </p>
                )}
                <span
                  className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                    isPremium
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-border/50 text-muted border border-border'
                  }`}
                >
                  {isPremium ? t('menu_premium_badge') : t('menu_free')}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-4 py-3 border-b border-border/40 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">{t('menu_analiz_sayisi')}</p>
              <p className="text-sm font-semibold text-text mt-0.5">
                {analysisCount === null ? '…' : analysisCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">{t('menu_seri')}</p>
              <p className="text-sm font-semibold text-text mt-0.5 flex items-center gap-1">
                {typeof streak === 'number' && streak > 0 ? (<><span className="text-amber-400">🔥</span> {streak} {t('menu_seri_gun')}</>) : (<span className="text-muted">{t('menu_seri_yok')}</span>)}
              </p>
            </div>
            {memberSince && (
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider">{t('menu_uyelik')}</p>
                <p className="text-sm font-semibold text-text mt-0.5">{memberSince}</p>
              </div>
            )}
          </div>

          {/* Quick tools */}
          <div className="px-4 py-3 border-b border-border/40">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-2">{t('menu_hizli_erisim')}</p>
            <div className="grid grid-cols-4 gap-2">
              {([
                { id: 'gunluk' as ToolId, icon: '⭐', labelKey: 'menu_tool_gunluk' },
                { id: 'uyum' as ToolId, icon: '💞', labelKey: 'menu_tool_uyum' },
                { id: 'ruya' as ToolId, icon: '💭', labelKey: 'menu_tool_ruya' },
                { id: 'ay-takvimi' as ToolId, icon: '🌕', labelKey: 'menu_tool_ay_takvimi' },
              ]).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setMenuOpen(false);
                    onToolSelect?.(tool.id);
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl py-2 px-1 hover:bg-card/60 transition-colors"
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-[10px] text-muted leading-tight text-center">{t(tool.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu links */}
          <div className="p-2">
            <MenuLink
              icon="👤"
              label={t('menu_profil')}
              onClick={() => {
                setMenuOpen(false);
                const el = document.querySelector('[data-tour="profile"]');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                  const btn = el.querySelector('button');
                  btn?.click();
                }
              }}
            />
            <MenuLink
              icon="📜"
              label={t('menu_gecmis')}
              onClick={() => {
                setMenuOpen(false);
                onToolSelect?.('gecmis');
              }}
            />
            {!isPremium && (
              <MenuLink
                icon="💎"
                label={t('menu_premium')}
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePremium();
                }}
                accent
              />
            )}
            <MenuLink
              icon="⚙️"
              label={t('menu_ayarlar')}
              onClick={() => {
                setMenuOpen(false);
                onOpenSettings();
              }}
            />
            <MenuLink
              icon="❓"
              label={t('menu_yardim')}
              onClick={() => {
                setMenuOpen(false);
                onOpenHelp();
              }}
            />
            <div className="my-1 border-t border-border/30" />
            <MenuLink
              icon="🚪"
              label={t('menu_cikis')}
              onClick={handleSignOut}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  icon,
  label,
  onClick,
  danger,
  accent,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : accent
            ? 'text-gold hover:bg-gold/10'
            : 'text-text hover:bg-card'
      }`}
    >
      <span className="text-base" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
