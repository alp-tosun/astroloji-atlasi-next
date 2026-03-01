'use client';

import { useState, useEffect, useMemo } from 'react';
import * as Astronomy from 'astronomy-engine';
import type { ToolId } from '@/types/profile';
import type { StreakData } from '@/lib/firebase/firestore';

const SIGNS = ['Koc','Boga','Ikizler','Yengec','Aslan','Basak','Terazi','Akrep','Yay','Oglak','Kova','Balik'];
const SIGNS_TR = ['Koc','Boga','Ikizler','Yengec','Aslan','Basak','Terazi','Akrep','Yay','Oglak','Kova','Balik'];
const SIGNS_DISPLAY: Record<string, string> = {
  'Koc': 'Koc', 'Boga': 'Boga', 'Ikizler': 'Ikizler', 'Yengec': 'Yengec',
  'Aslan': 'Aslan', 'Basak': 'Basak', 'Terazi': 'Terazi', 'Akrep': 'Akrep',
  'Yay': 'Yay', 'Oglak': 'Oglak', 'Kova': 'Kova', 'Balik': 'Balik',
};

const MOON_MESSAGES_TR: Record<string, string> = {
  'Koc': 'Enerjik ve atilgan bir gun',
  'Boga': 'Huzur ve konfor oncelikli',
  'Ikizler': 'Iletisim ve merak yukseliste',
  'Yengec': 'Duygusal ve sezgisel bir gun',
  'Aslan': 'Yaraticilik ve cesaret dorukta',
  'Basak': 'Detaylara odaklanma zamani',
  'Terazi': 'Denge ve uyum arayisi',
  'Akrep': 'Derin duygular ve donusum',
  'Yay': 'Ozgurluk ve macera enerjisi',
  'Oglak': 'Disiplin ve hedef odakli gun',
  'Kova': 'Yenilikci fikirler ve bagimsizilik',
  'Balik': 'Hayalci ve spiritüel enerji',
};

const MOON_MESSAGES_EN: Record<string, string> = {
  'Koc': 'An energetic and bold day',
  'Boga': 'Comfort and peace take priority',
  'Ikizler': 'Communication and curiosity rising',
  'Yengec': 'An emotional and intuitive day',
  'Aslan': 'Creativity and courage at their peak',
  'Basak': 'Time to focus on details',
  'Terazi': 'Seeking balance and harmony',
  'Akrep': 'Deep emotions and transformation',
  'Yay': 'Freedom and adventure energy',
  'Oglak': 'Discipline and goal-focused day',
  'Kova': 'Innovative ideas and independence',
  'Balik': 'Dreamy and spiritual energy',
};

const SIGN_ICONS: Record<string, string> = {
  'Koc': '\u2648', 'Boga': '\u2649', 'Ikizler': '\u264A', 'Yengec': '\u264B',
  'Aslan': '\u264C', 'Basak': '\u264D', 'Terazi': '\u264E', 'Akrep': '\u264F',
  'Yay': '\u2650', 'Oglak': '\u2651', 'Kova': '\u2652', 'Balik': '\u2653',
};

// Tool suggestion based on usage
const TOOL_SUGGESTIONS: { id: ToolId; weight: (streak: number, hour: number) => number }[] = [
  { id: 'gunluk', weight: (_s, h) => h < 12 ? 10 : 3 }, // Morning boost for daily
  { id: 'burc', weight: (s) => s === 1 ? 8 : 4 }, // New users → burc
  { id: 'kosm', weight: (_s, h) => h >= 18 ? 8 : 3 }, // Evening → cosmic
  { id: 'ruya', weight: (_s, h) => h < 10 ? 7 : 2 }, // Morning → dream
  { id: 'num', weight: (s) => s > 5 ? 6 : 2 }, // Engaged users → numerology
  { id: 'uyum', weight: () => 4 },
];

function getMoonSign(): string {
  try {
    const moon = Astronomy.EclipticGeoMoon(new Date());
    const idx = Math.floor(((moon.lon % 360 + 360) % 360) / 30) % 12;
    return SIGNS[idx];
  } catch {
    return SIGNS[0];
  }
}

interface DashboardCardProps {
  name: string;
  streakData: StreakData | null;
  lastAnalysis: { tip: string; tarih: string } | null;
  lang: string;
  t: (key: string) => string;
  onToolSelect: (id: ToolId) => void;
}

export function DashboardCard({ name, streakData, lastAnalysis, lang, t, onToolSelect }: DashboardCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const moonSign = useMemo(() => (mounted ? getMoonSign() : null), [mounted]);

  const suggestedTool = useMemo(() => {
    const hour = new Date().getHours();
    const streak = streakData?.streak || 0;
    const sorted = [...TOOL_SUGGESTIONS].sort((a, b) => b.weight(streak, hour) - a.weight(streak, hour));
    return sorted[0].id;
  }, [streakData]);

  const suggestedToolNameKey = `card_${suggestedTool}_name`;

  if (!mounted) return null;

  const streak = streakData?.streak || 0;
  const moonMessages = lang === 'en' ? MOON_MESSAGES_EN : MOON_MESSAGES_TR;
  const moonMsg = moonSign ? moonMessages[moonSign] || '' : '';
  const moonIcon = moonSign ? (SIGN_ICONS[moonSign] || '') : '';
  const suggestedToolName = t(suggestedToolNameKey);

  // Format "last analysis" relative time
  const lastAnalysisText = (() => {
    if (!lastAnalysis) return null;
    const diff = Date.now() - new Date(lastAnalysis.tarih).getTime();
    const hours = Math.floor(diff / 3600000);
    const tipKey = `gecmis_tip_${lastAnalysis.tip}`;
    const tipLabel = t(tipKey) !== tipKey ? t(tipKey) : t('gecmis_tip_diger');
    if (hours < 1) return `${tipLabel} — ${t('dash_just_now')}`;
    if (hours < 24) return `${tipLabel} — ${hours} ${t('dash_hours_ago')}`;
    const days = Math.floor(hours / 24);
    return `${tipLabel} — ${days} ${t('dash_days_ago')}`;
  })();

  // Check for broken streak
  const streakBroken = (() => {
    if (!streakData?.lastActiveDate) return false;
    const last = new Date(streakData.lastActiveDate);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    return streakData.lastActiveDate !== todayStr && streakData.lastActiveDate !== yesterdayStr && streakData.streak === 0 && last.getTime() > 0;
  })();

  return (
    <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-surface/80 to-card/50 backdrop-blur-sm p-5 sm:p-6 space-y-4">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-text">
          {t('dash_greeting').replace('{name}', name || t('dash_default_name'))}
        </h2>
        <p className="text-sm text-muted mt-0.5">{t('dash_subtitle')}</p>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Moon sign */}
        {moonSign && (
          <div className="rounded-xl bg-card/60 border border-border/50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{moonIcon}</span>
              <span className="text-xs font-medium text-text">{t('dash_moon')}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{moonMsg}</p>
          </div>
        )}

        {/* Streak */}
        <div className="rounded-xl bg-card/60 border border-border/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">{streak > 0 ? '\uD83D\uDD25' : '\u2744\uFE0F'}</span>
            <span className="text-xs font-medium text-text">
              {streak > 0 ? `${streak} ${t('dash_streak_days')}` : t('dash_no_streak')}
            </span>
          </div>
          {streakBroken ? (
            <p className="text-xs text-amber-400 animate-pulse">{t('dash_streak_broken')}</p>
          ) : streak > 0 ? (
            <p className="text-xs text-muted">{t('dash_streak_keep')}</p>
          ) : (
            <p className="text-xs text-muted">{t('dash_streak_start')}</p>
          )}
          {/* Badge display */}
          {streakData?.badges && streakData.badges.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {streakData.badges.includes('streak-7') && <span className="text-xs" title="7 days">🥉</span>}
              {streakData.badges.includes('streak-30') && <span className="text-xs" title="30 days">🥈</span>}
              {streakData.badges.includes('streak-100') && <span className="text-xs" title="100 days">🥇</span>}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: last analysis + suggested tool chip */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {lastAnalysisText && (
          <p className="text-xs text-muted">
            {t('dash_last_analysis')}: {lastAnalysisText}
          </p>
        )}
        <button
          onClick={() => onToolSelect(suggestedTool)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/20 hover:border-accent/40 transition-all duration-200 ml-auto"
        >
          <span>💡</span>
          <span>{t('dash_suggested_chip')}: {suggestedToolName}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
