import { getAllPlanetPositions, getPlanetPosition, getMoonIllumination, getMoonPhaseAngle } from '@/lib/astrology/ephemeris';

describe('Ephemeris', () => {
  const testDate = new Date('2026-02-24T12:00:00Z');

  describe('getAllPlanetPositions', () => {
    it('should return 10 planet positions', () => {
      const positions = getAllPlanetPositions(testDate);
      expect(positions).toHaveLength(10);
    });

    it('should include all expected bodies', () => {
      const positions = getAllPlanetPositions(testDate);
      const names = positions.map(p => p.name);
      expect(names).toContain('Sun');
      expect(names).toContain('Moon');
      expect(names).toContain('Mercury');
      expect(names).toContain('Venus');
      expect(names).toContain('Mars');
      expect(names).toContain('Jupiter');
      expect(names).toContain('Saturn');
    });

    it('should have valid longitude values (0-360)', () => {
      const positions = getAllPlanetPositions(testDate);
      for (const p of positions) {
        expect(p.longitude).toBeGreaterThanOrEqual(0);
        expect(p.longitude).toBeLessThan(360);
      }
    });

    it('should assign correct zodiac signs', () => {
      const positions = getAllPlanetPositions(testDate);
      for (const p of positions) {
        expect(p.sign).toBeTruthy();
        expect(p.degree).toBeGreaterThanOrEqual(0);
        expect(p.degree).toBeLessThan(30);
      }
    });
  });

  describe('getPlanetPosition', () => {
    it('should return Sun in Balık (Pisces) for Feb 24', () => {
      const sun = getPlanetPosition('Sun', testDate);
      // Sun at ~335° = Balık (Pisces, 330-360°)
      expect(sun.sign).toBe('Balık');
    });

    it('should return valid speed for Mercury', () => {
      const merc = getPlanetPosition('Mercury', testDate);
      expect(typeof merc.speed).toBe('number');
      expect(typeof merc.retrograde).toBe('boolean');
    });
  });

  describe('getMoonIllumination', () => {
    it('should return 0-100 range', () => {
      const illum = getMoonIllumination(testDate);
      expect(illum).toBeGreaterThanOrEqual(0);
      expect(illum).toBeLessThanOrEqual(100);
    });
  });

  describe('getMoonPhaseAngle', () => {
    it('should return 0-360 range', () => {
      const angle = getMoonPhaseAngle(testDate);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
    });
  });
});
