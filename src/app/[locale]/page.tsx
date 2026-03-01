'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { SpaceBackground } from '@/components/layout/SpaceBackground';
import { Header } from '@/components/layout/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ToolGrid, CategoryTabs, TOOLS } from '@/components/tools/ToolGrid';
import { ToolModal } from '@/components/tools/ToolModal';
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

import type { ToolId } from '@/types/profile';
import type { CosmicEnergy, NumerologyNumbers } from '@/types/analysis';
import type { Messages } from '@/types/i18n';
import { getAnalyses, getOnboardingStatus, setOnboardingComplete, getStreakData } from '@/lib/firebase/firestore';
import type { StreakData } from '@/lib/firebase/firestore';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToolPanelRenderer } from '@/components/tools/ToolPanelRenderer';
import { PaywallModal } from '@/components/premium/PaywallModal';

// i18n
import trMessages from '@/messages/tr.json';
import enMessages from '@/messages/en.json';

const messages: Record<string, Messages> = { tr: trMessages as Messages, en: enMessages as Messages };

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
  const [paywallOpen, setPaywallOpen] = useState(false);

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
  const { activeTool, setActiveTool, result, resultLoading, streaming, error: toolError, clearError: clearToolError, callApi } = useToolApi({
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
    }).catch((err) => console.error('[Onboarding] Status fetch error:', err));
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
      if (!isPremium) { setPaywallOpen(true); return; }
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
      <LivePlanetBand t={t} lang={lang} />
      <Header lang={lang} onLangChange={changeLang} onAuthOpen={() => setAuthOpen(true)} onToolSelect={handleToolSelect} t={t} streak={streakData?.streak} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} t={t} lang={lang} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} content={result} t={t} lang={lang} burc={profile.burc} />
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} onPurchased={() => usePremiumStore.getState().setPremium(true)} t={t} lang={lang} />
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
          error={toolError}
          onRetry={clearToolError}
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

      <main id="main-content" className="relative z-10 mx-auto max-w-lg px-3 pt-4 pb-24 space-y-5">
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

        <div data-tour="profile">
          <ProfileForm t={t} onToolSelect={handleToolSelect} />
        </div>

        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} t={t} />

        <div data-tour="tools">
          <ToolGrid activeTool={activeTool} onSelect={handleToolSelect} onActiveTabChange={setActiveTab} t={t} />
        </div>

        <ProfileBanner score={signalScore} t={t} />
      </main>

      <BottomNav
        activeTab={activeTab}
        onAuthOpen={() => setAuthOpen(true)}
        onClearTool={() => { setActiveTool(null); }}
        isLoggedIn={!!user}
        t={t}
      />
    </div>
  );
}
