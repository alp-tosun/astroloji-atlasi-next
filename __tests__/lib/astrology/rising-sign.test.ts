import { getRisingSign } from '@/lib/astrology/rising-sign';

describe('Rising Sign', () => {
  it('should return a valid rising sign for Istanbul', () => {
    const result = getRisingSign(
      new Date('2026-02-24T12:00:00Z'),
      41.0082, // Istanbul lat
      28.9784  // Istanbul lng
    );
    expect(result.sign).toBeTruthy();
    expect(result.longitude).toBeGreaterThanOrEqual(0);
    expect(result.longitude).toBeLessThan(360);
    expect(result.degree).toBeGreaterThanOrEqual(0);
    expect(result.degree).toBeLessThan(30);
  });

  it('should return different rising signs for different times', () => {
    const morning = getRisingSign(new Date('2026-02-24T06:00:00Z'), 41.0082, 28.9784);
    const evening = getRisingSign(new Date('2026-02-24T18:00:00Z'), 41.0082, 28.9784);
    // Rising sign should change throughout the day
    expect(morning.sign !== evening.sign || morning.degree !== evening.degree).toBe(true);
  });
});
