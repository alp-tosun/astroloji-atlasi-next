'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { usePremiumStore } from '@/stores/premium-store';
import { useProfileStore } from '@/stores/profile-store';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { HelpModal } from '@/components/settings/HelpModal';
import { UserDropdown } from '@/components/layout/UserDropdown';
import type { ToolId } from '@/types/profile';

const BURC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

interface HeaderProps {
  lang: string;
  onLangChange: (lang: string) => void;
  onAuthOpen: () => void;
  onToolSelect?: (id: ToolId) => void;
  t: (key: string) => string;
  streak?: number;
}

export function Header({ lang, onLangChange, onAuthOpen, onToolSelect, t, streak }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const { isPremium, toggle: togglePremium } = usePremiumStore();
  const profile = useProfileStore((s) => s.profile);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const displayName = user?.displayName || profile.ad || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';
  const burc = profile.burc;
  const burcSymbol = burc ? BURC_SYMBOLS[burc] || '' : '';

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <header className="sticky top-[40px] z-40 border-b border-border/50 bg-bg/80 backdrop-blur-xl safe-area-top">
        <div className="mx-auto flex max-w-lg items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div role="img" aria-label={t('site_name')} className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-accent/25 shrink-0">
              <span className="text-white text-base leading-none" aria-hidden="true">✦</span>
            </div>
            <h1 className="text-sm font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-text via-accent to-purple-400 bg-clip-text text-transparent">
                {t('site_name')}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {['tr', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    lang === l ? 'bg-accent text-white' : 'text-muted hover:text-text'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Premium toggle — hidden on mobile */}
            <label className="hidden md:flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-muted">{t('prem_label')}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={() => {
                    if (!user) {
                      onAuthOpen();
                      return;
                    }
                    togglePremium();
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border rounded-full peer-checked:bg-gold transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
            </label>

            {/* User button / dropdown */}
            {user ? (
              <UserDropdown
                user={user}
                displayName={displayName}
                initial={initial}
                burc={burc}
                burcSymbol={burcSymbol}
                isPremium={isPremium}
                memberSince={memberSince}
                streak={streak}
                t={t}
                onToolSelect={onToolSelect}
                onTogglePremium={togglePremium}
                onOpenSettings={() => setSettingsOpen(true)}
                onOpenHelp={() => setHelpOpen(true)}
              />
            ) : (
              <button
                onClick={onAuthOpen}
                className="rounded-xl bg-accent/10 border border-accent/30 px-3 py-1.5 text-xs text-accent hover:bg-accent/20 transition-colors"
              >
                {t('auth_giris')}
              </button>
            )}
          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} lang={lang} onLangChange={onLangChange} t={t} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} t={t} lang={lang} />
    </>
  );
}
