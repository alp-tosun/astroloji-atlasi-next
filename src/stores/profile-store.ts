import { create } from 'zustand';
import type { Profile, ProfileFieldId } from '@/types/profile';
import { SINYAL_AGIRLIK, SINYAL_MAX } from '@/types/profile';

interface ProfileState {
  profile: Profile;
  signalScore: number;
  setField: (field: ProfileFieldId, value: string) => void;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

function calcSignal(profile: Profile): number {
  let raw = 0;
  for (const [id, weight] of Object.entries(SINYAL_AGIRLIK)) {
    const val = profile[id as ProfileFieldId];
    if (val && val.trim()) raw += weight;
  }
  return Math.round((raw / SINYAL_MAX) * 100);
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: {},
  signalScore: 0,
  setField: (field, value) => {
    const profile = { ...get().profile, [field]: value };
    set({ profile, signalScore: calcSignal(profile) });
  },
  setProfile: (profile) => {
    set({ profile, signalScore: calcSignal(profile) });
  },
  clearProfile: () => {
    set({ profile: {}, signalScore: 0 });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astroloji-profil');
    }
  },
  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('astroloji-profil');
      if (raw) {
        const profile = JSON.parse(raw) as Profile;
        set({ profile, signalScore: calcSignal(profile) });
      }
    } catch {
      // ignore parse errors
    }
  },
  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('astroloji-profil', JSON.stringify(get().profile));
  },
}));
