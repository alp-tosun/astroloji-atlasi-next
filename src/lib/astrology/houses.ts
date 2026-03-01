import * as Astronomy from 'astronomy-engine';
import { getRisingSign } from './rising-sign';

const DEG = Math.PI / 180;
const OBLIQUITY = 23.4393;
const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];

export type HouseSystem = 'placidus' | 'whole-sign' | 'equal';

export interface HouseCusp {
  house: number;     // 1-12
  longitude: number; // 0-360
  sign: string;
  degree: number;
}

function lonToSign(lon: number) {
  const n = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  return { sign: SIGNS[idx], degree: Math.round((n % 30) * 100) / 100 };
}

// Midheaven (MC) calculation
function getMC(date: Date, longitude: number): number {
  const lstHours = Astronomy.SiderealTime(date) + longitude / 15;
  const ramc = ((lstHours % 24 + 24) % 24) * 15;
  const oblRad = OBLIQUITY * DEG;
  let mc = Math.atan2(Math.sin(ramc * DEG), Math.cos(ramc * DEG) * Math.cos(oblRad)) / DEG;
  mc = ((mc % 360) + 360) % 360;
  return mc;
}

export function getHouses(
  date: Date,
  latitude: number,
  longitude: number,
  system: HouseSystem = 'whole-sign'
): HouseCusp[] {
  const asc = getRisingSign(date, latitude, longitude);
  const cusps: HouseCusp[] = [];
  
  if (system === 'whole-sign') {
    // Whole Sign: Each house starts at 0° of a sign
    const startSign = Math.floor(asc.longitude / 30);
    for (let i = 0; i < 12; i++) {
      const signIdx = (startSign + i) % 12;
      const lon = signIdx * 30;
      cusps.push({
        house: i + 1,
        longitude: lon,
        sign: SIGNS[signIdx],
        degree: 0,
      });
    }
  } else if (system === 'equal') {
    // Equal House: Each house is exactly 30° from Ascendant
    for (let i = 0; i < 12; i++) {
      const lon = ((asc.longitude + i * 30) % 360 + 360) % 360;
      const s = lonToSign(lon);
      cusps.push({
        house: i + 1,
        longitude: Math.round(lon * 100) / 100,
        sign: s.sign,
        degree: s.degree,
      });
    }
  } else {
    // Placidus: simplified - use ASC, MC, and interpolate
    const mc = getMC(date, longitude);
    const ic = (mc + 180) % 360;
    const desc = (asc.longitude + 180) % 360;
    
    // Houses 1, 4, 7, 10 are fixed (ASC, IC, DESC, MC)
    const fixedCusps: Record<number, number> = {
      1: asc.longitude,
      4: ic,
      7: desc,
      10: mc,
    };
    
    // Interpolate intermediate houses
    function interpolate(start: number, end: number, fraction: number): number {
      let diff = end - start;
      if (diff < 0) diff += 360;
      return (start + diff * fraction) % 360;
    }
    
    // Houses 2, 3 between ASC(1) and IC(4)
    fixedCusps[2] = interpolate(asc.longitude, ic, 1/3);
    fixedCusps[3] = interpolate(asc.longitude, ic, 2/3);
    // Houses 5, 6 between IC(4) and DESC(7)
    fixedCusps[5] = interpolate(ic, desc, 1/3);
    fixedCusps[6] = interpolate(ic, desc, 2/3);
    // Houses 8, 9 between DESC(7) and MC(10)
    fixedCusps[8] = interpolate(desc, mc, 1/3);
    fixedCusps[9] = interpolate(desc, mc, 2/3);
    // Houses 11, 12 between MC(10) and ASC(1)
    fixedCusps[11] = interpolate(mc, asc.longitude, 1/3);
    fixedCusps[12] = interpolate(mc, asc.longitude, 2/3);
    
    for (let i = 1; i <= 12; i++) {
      const lon = ((fixedCusps[i] % 360) + 360) % 360;
      const s = lonToSign(lon);
      cusps.push({
        house: i,
        longitude: Math.round(lon * 100) / 100,
        sign: s.sign,
        degree: s.degree,
      });
    }
  }
  
  return cusps;
}
