'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/stores/profile-store';
import { useAuthStore } from '@/stores/auth-store';
import { saveProfile } from '@/lib/firebase/firestore';

export function useProfile() {
  const store = useProfileStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    store.loadFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    store.saveToStorage();
    if (user) {
      try {
        await saveProfile(user.uid, store.profile);
      } catch (e) {
        console.error('Profile save error:', e);
      }
    }
  };

  return {
    profile: store.profile,
    signalScore: store.signalScore,
    setField: store.setField,
    setProfile: store.setProfile,
    clearProfile: store.clearProfile,
    save,
  };
}
