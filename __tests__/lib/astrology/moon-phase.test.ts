import { getMoonPhase } from '@/lib/astrology/moon-phase';

describe('Moon Phase', () => {
  it('should return valid phase info', () => {
    const phase = getMoonPhase(new Date('2026-02-24T12:00:00Z'));
    expect(phase.angle).toBeGreaterThanOrEqual(0);
    expect(phase.angle).toBeLessThan(360);
    expect(phase.illumination).toBeGreaterThanOrEqual(0);
    expect(phase.illumination).toBeLessThanOrEqual(100);
    expect(phase.name).toBeTruthy();
    expect(phase.emoji).toBeTruthy();
  });

  it('should return new moon near actual new moon date', () => {
    // Moon phase angle ~360/0 at new moon; accept < 10 or > 350
    const phase = getMoonPhase(new Date('2026-02-17T12:00:00Z'));
    expect(phase.angle < 10 || phase.angle > 350).toBe(true);
  });

  it('should return full moon near actual full moon date', () => {
    // Approximate full moon for testing
    const phase = getMoonPhase(new Date('2026-03-03T12:00:00Z'));
    expect(phase.angle).toBeGreaterThan(135);
    expect(phase.angle).toBeLessThan(225);
  });
});
