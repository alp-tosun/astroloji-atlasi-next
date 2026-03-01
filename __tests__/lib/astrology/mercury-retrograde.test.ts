import { getMercuryRetrograde, isRetrograde } from '@/lib/astrology/mercury-retrograde';

describe('Mercury Retrograde', () => {
  it('should return valid retrograde info', () => {
    const info = getMercuryRetrograde(new Date('2026-02-24T12:00:00Z'));
    expect(typeof info.isRetrograde).toBe('boolean');
    expect(typeof info.speed).toBe('number');
    expect(['direct', 'stationary-retrograde', 'retrograde', 'stationary-direct']).toContain(info.phase);
  });

  it('isRetrograde should work for any planet', () => {
    const result = isRetrograde('Mars', new Date('2026-02-24T12:00:00Z'));
    expect(typeof result).toBe('boolean');
  });
});
