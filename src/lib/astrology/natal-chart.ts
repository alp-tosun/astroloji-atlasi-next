import { getAllPlanetPositions, type PlanetPosition } from './ephemeris';
import { getRisingSign, type RisingSignResult } from './rising-sign';
import { getHouses, type HouseCusp, type HouseSystem } from './houses';
import { findAspects, type Aspect } from './aspects';

export interface NatalChart {
  date: Date;
  latitude: number;
  longitude: number;
  planets: PlanetPosition[];
  ascendant: RisingSignResult;
  houses: HouseCusp[];
  aspects: Aspect[];
  houseSystem: HouseSystem;
}

export function calculateNatalChart(
  date: Date,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = 'whole-sign'
): NatalChart {
  const planets = getAllPlanetPositions(date);
  const ascendant = getRisingSign(date, latitude, longitude);
  const houses = getHouses(date, latitude, longitude, houseSystem);
  const aspects = findAspects(planets.map(p => ({
    name: p.name,
    longitude: p.longitude,
    speed: p.speed,
  })));
  
  return { date, latitude, longitude, planets, ascendant, houses, aspects, houseSystem };
}
