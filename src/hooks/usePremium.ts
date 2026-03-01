'use client';

import { usePremiumStore } from '@/stores/premium-store';
import { useAuthStore } from '@/stores/auth-store';

export function usePremium() {
  const { isPremium, setPremium, toggle } = usePremiumStore();
  const user = useAuthStore((s) => s.user);

  const togglePremium = () => {
    if (!user) return false; // need auth first
    toggle();
    return true;
  };

  return { isPremium, setPremium, togglePremium, needsAuth: !user };
}
