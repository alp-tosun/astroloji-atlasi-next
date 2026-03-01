import { create } from 'zustand';
import { isNative } from '@/lib/capacitor/platform';

interface PremiumState {
  isPremium: boolean;
  loading: boolean;
  setPremium: (isPremium: boolean) => void;
  toggle: () => void;
  checkPremium: (userToken?: string) => Promise<void>;
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  isPremium: false,
  loading: false,

  setPremium: (isPremium) => set({ isPremium }),

  toggle: () => set({ isPremium: !get().isPremium }),

  checkPremium: async (userToken?: string) => {
    // On native, check via RevenueCat
    if (isNative()) {
      try {
        const { checkPremiumStatus } = await import('@/lib/capacitor/revenuecat');
        const isPremium = await checkPremiumStatus();
        set({ isPremium });
        return;
      } catch {
        // Fall through to server check
      }
    }

    // On web or as fallback, check via server
    if (!userToken) return;
    try {
      set({ loading: true });
      const res = await fetch('/api/check-premium', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({ isPremium: data.isPremium });
      }
    } catch {
      // Keep current state
    } finally {
      set({ loading: false });
    }
  },
}));
