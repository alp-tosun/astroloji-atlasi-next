import { getAllPlanetPositions, type PlanetPosition } from './ephemeris';
import { findAspects, type Aspect } from './aspects';

export interface TransitInfo {
  transitPlanet: PlanetPosition;
  natalPlanet: PlanetPosition;
  aspect: Aspect;
}

export function getTransits(
  natalDate: Date,
  transitDate: Date,
): TransitInfo[] {
  const natalPositions = getAllPlanetPositions(natalDate);
  const transitPositions = getAllPlanetPositions(transitDate);
  
  const results: TransitInfo[] = [];
  
  // Check each transit planet against each natal planet
  for (const tp of transitPositions) {
    for (const np of natalPositions) {
      const aspects = findAspects([
        { name: 'T-' + tp.name, longitude: tp.longitude, speed: tp.speed },
        { name: 'N-' + np.name, longitude: np.longitude, speed: 0 },
      ]);
      
      if (aspects.length > 0) {
        results.push({
          transitPlanet: tp,
          natalPlanet: np,
          aspect: aspects[0],
        });
      }
    }
  }
  
  return results.sort((a, b) => a.aspect.orb - b.aspect.orb);
}
