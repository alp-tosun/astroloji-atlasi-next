import { findAspects } from '@/lib/astrology/aspects';

describe('Aspects', () => {
  it('should find conjunction for planets at same longitude', () => {
    const aspects = findAspects([
      { name: 'Planet1', longitude: 100, speed: 1 },
      { name: 'Planet2', longitude: 102, speed: 0.5 },
    ]);
    expect(aspects.length).toBeGreaterThan(0);
    expect(aspects[0].type).toBe('conjunction');
  });

  it('should find opposition for planets 180° apart', () => {
    const aspects = findAspects([
      { name: 'Planet1', longitude: 0, speed: 1 },
      { name: 'Planet2', longitude: 182, speed: 0.5 },
    ]);
    expect(aspects.length).toBeGreaterThan(0);
    expect(aspects[0].type).toBe('opposition');
  });

  it('should find trine for planets 120° apart', () => {
    const aspects = findAspects([
      { name: 'Planet1', longitude: 30, speed: 1 },
      { name: 'Planet2', longitude: 150, speed: 0.5 },
    ]);
    expect(aspects.length).toBeGreaterThan(0);
    expect(aspects[0].type).toBe('trine');
  });

  it('should find square for planets 90° apart', () => {
    const aspects = findAspects([
      { name: 'Planet1', longitude: 10, speed: 1 },
      { name: 'Planet2', longitude: 100, speed: 0.5 },
    ]);
    expect(aspects.length).toBeGreaterThan(0);
    expect(aspects[0].type).toBe('square');
  });

  it('should find sextile for planets 60° apart', () => {
    const aspects = findAspects([
      { name: 'Planet1', longitude: 10, speed: 1 },
      { name: 'Planet2', longitude: 70, speed: 0.5 },
    ]);
    expect(aspects.length).toBeGreaterThan(0);
    expect(aspects[0].type).toBe('sextile');
  });

  it('should not find aspects for widely separated planets', () => {
    const aspects = findAspects([
      { name: 'Planet1', longitude: 0, speed: 1 },
      { name: 'Planet2', longitude: 45, speed: 0.5 },
    ]);
    expect(aspects.length).toBe(0);
  });
});
