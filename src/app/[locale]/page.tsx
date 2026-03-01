'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SpaceBackground } from '@/components/layout/SpaceBackground';
import { Header } from '@/components/layout/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ToolGrid, CategoryTabs, TOOLS } from '@/components/tools/ToolGrid';
import { ToolModal } from '@/components/tools/ToolModal';
import { FeaturedTools } from '@/components/tools/FeaturedTools';
import { LivePlanetBand } from '@/components/planet/LivePlanetBand';
import { ShareModal } from '@/components/analysis/ShareModal';
import { useAuth } from '@/hooks/useAuth';
import { useCapacitorLifecycle } from '@/hooks/useCapacitorLifecycle';
import { useToolApi } from '@/hooks/useToolApi';
import { useProfileStore } from '@/stores/profile-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useAuthStore } from '@/stores/auth-store';
import { usePremiumStore } from '@/stores/premium-store';
import { useCrossToolStore } from '@/stores/cross-tool-store';
import { useToastStore } from '@/stores/toast-store';
import type { ToolId } from '@/types/profile';
import type { CosmicEnergy, NumerologyNumbers } from '@/types/analysis';
import { getAnalyses, getOnboardingStatus, setOnboardingComplete, getStreakData } from '@/lib/firebase/firestore';
import type { StreakData } from '@/lib/firebase/firestore';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToolPanelRenderer } from '@/components/tools/ToolPanelRenderer';

// i18n
import trMessages from '@/messages/tr.json';
import enMessages from '@/messages/en.json';

type Messages = Record<string, string | string[] | string[][]>;
const messages: Record<string, Messages> = { tr: trMessages as unknown as Messages, en: enMessages as unknown as Messages };

export default function Home() {
  const [lang, setLang] = useState('tr');
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [cosmicEnergy, setCosmicEnergy] = useState<CosmicEnergy | null>(null);
  const [numNumbers, setNumNumbers] = useState<NumerologyNumbers | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{ tip: string; tarih: string } | null>(null);
  const [activeTab, setActiveTab] = useState('daily');

  // Auth
  useAuth();
  const user = useAuthStore((s) => s.user);
  usePremiumStore();
  useCapacitorLifecycle({ uid: user?.uid });
  const profile = useProfileStore((s) => s.profile);
  const signalScore = useProfileStore((s) => s.signalScore);
  const addCrossResult = useCrossToolStore((s) => s.addResult);
  const getCrossContext = useCrossToolStore((s) => s.getContext);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const addToast = useToastStore((s) => s.addToast);

  // i18n
  const currentMessages = useMemo(() => messages[lang] || messages.tr, [lang]);
  const t = useCallback(
    (key: string): string => {
      const val = currentMessages[key];
      if (typeof val === 'string') return val;
      return key;
    },
    [currentMessages],
  );

  // Tool API hook
  const onAuthRequired = useCallback(() => setAuthOpen(true), []);
  const { activeTool, setActiveTool, result, resultLoading, streaming, callApi } = useToolApi({
    user,
    profile,
    lang,
    getCrossContext,
    addCrossResult,
    t,
    onAuthRequired,
  });

  // Settings store init
  useEffect(() => {
    useSettingsStore.getState().loadFromStorage();
  }, []);

  // i18n from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('astroloji-lang');
    if (saved) setLang(saved);
  }, []);

  // Onboarding tour trigger
  useEffect(() => {
    if (!user) return;
    const localDone = localStorage.getItem('astroloji-onboarding-done');
    if (localDone === 'true') return;
    getOnboardingStatus(user.uid).then((done) => {
      if (!done) setOnboardingOpen(true);
    }).catch(() => {});
  }, [user]);

  // Fetch streak data and last analysis when user logs in
  useEffect(() => {
    if (!user) {
      setStreakData(null);
      setLastAnalysis(null);
      return;
    }
    getStreakData(user.uid)
      .then(setStreakData)
      .catch(() => setStreakData({ streak: 0, lastActiveDate: '', longestStreak: 0, totalAnalyses: 0, badges: [] }));
    getAnalyses(user.uid)
      .then((arr) => {
        if (arr.length > 0) {
          const latest = arr[0];
          setLastAnalysis({ tip: latest.tip, tarih: latest.tarih });
        }
      })
      .catch(() => setLastAnalysis(null));
  }, [user]);

  const handleOnboardingClose = useCallback(() => {
    setOnboardingOpen(false);
    localStorage.setItem('astroloji-onboarding-done', 'true');
    if (user) {
      setOnboardingComplete(user.uid).catch(() => {});
    }
  }, [user]);

  const changeLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('astroloji-lang', newLang);
  };

  // Tool selection with premium check
  const handleToolSelect = (id: ToolId) => {
    const PREMIUM_TOOLS = ['uyum', 'num', 'ruya', 'el', 'kosm', 'horar', 'haftalik', 'aylik', 'tarot'];
    if (PREMIUM_TOOLS.includes(id)) {
      if (!user) { setAuthOpen(true); return; }
      if (!isPremium) { addToast(t('premium_required'), 'warning'); return; }
    }
    import('@/lib/capacitor/haptics').then(({ hapticLight }) => hapticLight()).catch(() => {});
    setActiveTool(id);
  };

  return (
    <div className="relative min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
        Skip to content
      </a>
      <SpaceBackground />
      <LivePlanetBand />
      <Header lang={lang} onLangChange={changeLang} onAuthOpen={() => setAuthOpen(true)} onToolSelect={handleToolSelect} t={t} streak={streakData?.streak} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} t={t} lang={lang} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} content={result} t={t} burc={profile.burc} />
      <ToolModal
        open={!!activeTool}
        onClose={() => { setActiveTool(null); }}
        icon={TOOLS.find((tool) => tool.id === activeTool)?.icon || ''}
        title={activeTool ? t(TOOLS.find((tool) => tool.id === activeTool)?.nameKey || '') : ''}
        onShare={() => setShareOpen(true)}
        showShare={!!result && !resultLoading}
        shareLabel={t('paylasim_baslik')}
      >
        <ToolPanelRenderer
          activeTool={activeTool}
          t={t}
          callApi={callApi}
          result={result}
          resultLoading={resultLoading}
          streaming={streaming}
          profile={profile}
          lang={lang}
          user={user}
          cosmicEnergy={cosmicEnergy}
          setCosmicEnergy={setCosmicEnergy}
          numNumbers={numNumbers}
          setNumNumbers={setNumNumbers}
        />
      </ToolModal>

      <OnboardingTour open={onboardingOpen} onClose={handleOnboardingClose} t={t} />

      <main id="main-content" className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-20 md:pb-12 space-y-6">
        <div data-tour="profile">
          <ProfileForm t={t} onToolSelect={handleToolSelect} />
        </div>
        {user && (
          <DashboardCard
            name={profile.ad || user.displayName || user.email?.split('@')[0] || ''}
            streakData={streakData}
            lastAnalysis={lastAnalysis}
            lang={lang}
            t={t}
            onToolSelect={handleToolSelect}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
          <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} t={t} />
          <FeaturedTools onSelect={handleToolSelect} t={t} />
        </div>

        <div data-tour="tools">
          <ToolGrid activeTool={activeTool} activeTab={activeTab} onSelect={handleToolSelect} t={t} />
        </div>

        <ProfileBanner score={signalScore} t={t} />
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAuthOpen={() => setAuthOpen(true)}
        onClearTool={() => { setActiveTool(null); }}
        isLoggedIn={!!user}
        t={t}
      />
    </div>
  );
}
