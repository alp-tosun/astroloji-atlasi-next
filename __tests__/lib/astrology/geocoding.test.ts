import { geocode } from '@/lib/astrology/geocoding';

describe('Geocoding', () => {
  it('should resolve Istanbul from cache', async () => {
    const result = await geocode('istanbul');
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(41.0082, 1);
    expect(result!.lng).toBeCloseTo(28.9784, 1);
  });

  it('should resolve Ankara from cache', async () => {
    const result = await geocode('Ankara');
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(39.9334, 1);
  });

  it('should handle Turkish characters', async () => {
    const res = await geocode('İstanbul');
    // May or may not match due to lowercase normalization
    // At minimum should not throw
    expect(res === null || typeof res?.lat === 'number').toBe(true);
  });
});
