export interface AnalysisResult {
  id?: string;
  tip: string;
  veri: string;
  tarih: string;
}

export interface ApiResponse<T = string> {
  ok: boolean;
  result?: T;
  error?: string;
}

export interface PlanetData {
  tarih: string;
  ayEvresi: string;
  ayIkon: string;
  merkurRetro: boolean;
  gunesBurcu: string;
  gundogumu: string;
  gunbatimi: string;
  ayDogumu: string;
  ayBatimi: string;
}

export interface NumerologyNumbers {
  yasamYolu: number;
  kader: number;
  ruhArzu: number;
  kisilik: number;
}

export interface CosmicEnergy {
  ask: number;
  para: number;
  kariyer: number;
  ruhsal: number;
}
