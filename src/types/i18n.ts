export interface ArrayMessages {
  kosm_gun_adlari: string[];
  kosm_gun_mesajlari: string[];
}

export interface Array2DMessages {
  kosm_risk_havuzu: string[][];
  kosm_firsat_havuzu: string[][];
}

export type Messages = Record<string, string | string[] | string[][]>
  & ArrayMessages & Array2DMessages;
