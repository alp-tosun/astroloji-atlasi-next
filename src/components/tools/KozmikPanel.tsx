'use client';

import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';
import { EnergyBar } from '@/components/analysis/EnergyBar';
import { ELEMENT_GROUPS } from '@/types/astrology';
import type { CosmicEnergy } from '@/types/analysis';

interface KozmikPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  cosmicEnergy: CosmicEnergy | null;
  setCosmicEnergy: (e: CosmicEnergy) => void;
  profile: Record<string, string | undefined>;
}

export function KozmikPanel({ t, callApi, result, resultLoading, streaming, cosmicEnergy, setCosmicEnergy, profile }: KozmikPanelProps) {
  const calculate = () => {
    const burc = profile.burc || '';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();

    let ask = 50, para = 50, kariyer = 50, ruhsal = 50;
    const gunEtki = [
      { ask: 0, para: 0, kariyer: 0, ruhsal: 15 },
      { ask: 10, para: -5, kariyer: 0, ruhsal: 5 },
      { ask: 0, para: 5, kariyer: 15, ruhsal: -5 },
      { ask: 5, para: 10, kariyer: 5, ruhsal: 0 },
      { ask: 5, para: 15, kariyer: 10, ruhsal: 5 },
      { ask: 20, para: 5, kariyer: -5, ruhsal: 10 },
      { ask: -5, para: 10, kariyer: 5, ruhsal: 5 },
    ];
    const ge = gunEtki[dayOfWeek];
    ask += ge.ask; para += ge.para; kariyer += ge.kariyer; ruhsal += ge.ruhsal;

    if (ELEMENT_GROUPS.ates.some((s) => s === burc)) { kariyer += 15; ask += 5; ruhsal -= 5; }
    else if (ELEMENT_GROUPS.toprak.some((s) => s === burc)) { para += 15; kariyer += 10; ask -= 5; }
    else if (ELEMENT_GROUPS.hava.some((s) => s === burc)) { ask += 10; ruhsal += 5; para -= 5; }
    else if (ELEMENT_GROUPS.su.some((s) => s === burc)) { ruhsal += 15; ask += 10; kariyer -= 5; }

    const clamp = (v: number) => Math.min(95, Math.max(20, v + (dayOfMonth % 7) - 3));
    setCosmicEnergy({ ask: clamp(ask), para: clamp(para), kariyer: clamp(kariyer), ruhsal: clamp(ruhsal) });

    const gunAdlariTR = ['Pazar', 'Pazartesi', 'Sal\u0131', '\u00c7ar\u015famba', 'Per\u015fembe', 'Cuma', 'Cumartesi'];
    callApi('/api/cosmic', { tarih: now.toLocaleDateString('tr-TR'), gun: gunAdlariTR[dayOfWeek] });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_kosm_title')}</h3>
        <p className="text-xs text-muted">{t('panel_kosm_hint')}</p>
      </div>
      <Button onClick={calculate} loading={resultLoading}>{t('btn_kosm_analiz')}</Button>
      {cosmicEnergy && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text">{t('kosm_enerji')}</h4>
          <EnergyBar label={t('enerji_ask')} value={cosmicEnergy.ask} color="bg-pink-500" icon="\u2764\ufe0f" />
          <EnergyBar label={t('enerji_para')} value={cosmicEnergy.para} color="bg-yellow-500" icon="\ud83d\udcb0" />
          <EnergyBar label={t('enerji_kariyer')} value={cosmicEnergy.kariyer} color="bg-blue-500" icon="\ud83d\udcbc" />
          <EnergyBar label={t('enerji_ruhsal')} value={cosmicEnergy.ruhsal} color="bg-purple-500" icon="\ud83d\udd2e" />
        </div>
      )}
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
