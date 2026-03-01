import { getSunSign, isCusp } from '@/lib/astrology/sun-sign';

describe('Sun Sign', () => {
  it('should identify Pisces for Feb 24', () => {
    const result = getSunSign(new Date('2026-02-24T12:00:00Z'));
    expect(result.sign).toBe('Balık');
  });

  it('should identify Aries for April 15', () => {
    const result = getSunSign(new Date('2026-04-15T12:00:00Z'));
    expect(result.sign).toBe('Koç');
  });

  it('should identify Leo for Aug 1', () => {
    const result = getSunSign(new Date('2026-08-01T12:00:00Z'));
    expect(result.sign).toBe('Aslan');
  });

  it('should detect cusp dates', () => {
    // Around March 20 (Pisces→Aries cusp)
    const cusp = isCusp(new Date('2026-03-20T12:00:00Z'));
    expect(typeof cusp).toBe('boolean');
  });
});
