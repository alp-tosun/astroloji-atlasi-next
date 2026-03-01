import * as Astronomy from 'astronomy-engine';

const DEG = Math.PI / 180;
const OBLIQUITY = 23.4393; // approximate, could also compute from Astronomy

const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

export interface RisingSignResult {
  sign: string;
  degree: number;
  longitude: number;
}

export function getRisingSign(date: Date, latitude: number, longitude: number): RisingSignResult {
  // Local Sidereal Time in hours
  const lstHours = Astronomy.SiderealTime(date) + longitude / 15;
  // Convert to degrees (RAMC)
  const ramc = ((lstHours % 24 + 24) % 24) * 15;
  
  const ramcRad = ramc * DEG;
  const latRad = latitude * DEG;
  const oblRad = OBLIQUITY * DEG;
  
  // Ascendant formula
  let ascLon = Math.atan2(
    -Math.cos(ramcRad),
    Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad)
  ) / DEG;
  
  // Normalize to 0-360
  ascLon = ((ascLon % 360) + 360) % 360;
  
  const signIdx = Math.floor(ascLon / 30) % 12;
  const degree = ascLon % 30;
  
  return { sign: SIGNS[signIdx], degree: Math.round(degree * 100) / 100, longitude: Math.round(ascLon * 100) / 100 };
}
