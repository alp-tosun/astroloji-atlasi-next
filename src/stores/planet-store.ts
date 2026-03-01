import { create } from 'zustand';
import type { PlanetData } from '@/types/analysis';

interface PlanetState {
  data: PlanetData | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const usePlanetStore = create<PlanetState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/gezegenler');
      const json = await res.json();
      if (json.ok) {
        set({ data: json as PlanetData, loading: false });
      } else {
        set({ error: json.error || 'Veri alınamadı', loading: false });
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Bağlantı hatası',
        loading: false,
      });
    }
  },
}));
