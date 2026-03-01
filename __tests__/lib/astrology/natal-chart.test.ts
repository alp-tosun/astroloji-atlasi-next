import { calculateNatalChart } from '@/lib/astrology/natal-chart';

describe('Natal Chart', () => {
  it('should calculate a complete natal chart', () => {
    const chart = calculateNatalChart(
      new Date('1990-06-15T10:30:00Z'),
      41.0082,
      28.9784,
      'whole-sign'
    );
    
    expect(chart.planets).toHaveLength(10);
    expect(chart.houses).toHaveLength(12);
    expect(chart.ascendant.sign).toBeTruthy();
    expect(chart.aspects.length).toBeGreaterThan(0);
    expect(chart.houseSystem).toBe('whole-sign');
  });

  it('should identify Sun in Gemini for June 15', () => {
    const chart = calculateNatalChart(
      new Date('1990-06-15T10:30:00Z'),
      41.0082,
      28.9784
    );
    const sun = chart.planets.find(p => p.name === 'Sun');
    expect(sun?.sign).toBe('İkizler');
  });
});
