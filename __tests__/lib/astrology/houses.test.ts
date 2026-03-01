import { getHouses } from '@/lib/astrology/houses';

describe('Houses', () => {
  const date = new Date('2026-02-24T12:00:00Z');
  const lat = 41.0082;
  const lng = 28.9784;

  it('should return 12 houses for whole-sign system', () => {
    const houses = getHouses(date, lat, lng, 'whole-sign');
    expect(houses).toHaveLength(12);
    expect(houses[0].house).toBe(1);
    expect(houses[11].house).toBe(12);
  });

  it('should return 12 houses for equal system', () => {
    const houses = getHouses(date, lat, lng, 'equal');
    expect(houses).toHaveLength(12);
  });

  it('should return 12 houses for placidus system', () => {
    const houses = getHouses(date, lat, lng, 'placidus');
    expect(houses).toHaveLength(12);
  });

  it('whole-sign houses should start at 0° of signs', () => {
    const houses = getHouses(date, lat, lng, 'whole-sign');
    for (const h of houses) {
      expect(h.degree).toBe(0);
    }
  });

  it('equal houses should be 30° apart', () => {
    const houses = getHouses(date, lat, lng, 'equal');
    for (let i = 1; i < 12; i++) {
      let diff = houses[i].longitude - houses[i - 1].longitude;
      if (diff < 0) diff += 360;
      expect(Math.round(diff)).toBe(30);
    }
  });
});
