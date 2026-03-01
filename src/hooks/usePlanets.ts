'use client';

import { useEffect } from 'react';
import { usePlanetStore } from '@/stores/planet-store';

export function usePlanets() {
  const { data, loading, error, fetch: fetchPlanets } = usePlanetStore();

  useEffect(() => {
    if (!data && !loading) {
      fetchPlanets();
    }
  }, [data, loading, fetchPlanets]);

  return { data, loading, error, refetch: fetchPlanets };
}
