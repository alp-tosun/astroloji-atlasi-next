'use client';

import { useState } from 'react';
import { calculateYildizname, type YildizNameResult } from '@/lib/astrology/yildizname';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';
import type { Profile } from '@/types/profile';

interface YildizNamePanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  profile: Profile;
}

export function YildizNamePanel({ t, callApi, result, resultLoading, streaming, profile }: YildizNamePanelProps) {
  const [ad, setAd] = useState(profile.ad || '');
  const [anneAdi, setAnneAdi] = useState('');
  const [yildizResult, setYildizResult] = useState<YildizNameResult | null>(null);

  const handleCalculate = () => {
    if (!ad.trim()) return;
    const res = calculateYildizname(ad.trim(), anneAdi.trim() || undefined, profile['dogum-tarih']);
    setYildizResult(res);
  };

  const handleAIInterpret = () => {
    if (!yildizResult) return;
    const summary = [
      `Ad: ${yildizResult.ad}${yildizResult.anneAdi ? `, Anne: ${yildizResult.anneAdi}` : ''}`,
      `Ebced Değeri: ${yildizResult.abjadTotal}`,
      `Yıldız Sayısı: ${yildizResult.yildizSayisi}`,
      `Burç Karşılığı: ${yildizResult.burcKarsiligi}`,
      `Gezegen Yönetici: ${yildizResult.gezegenYonetici.name}`,
      `Tabiat: ${yildizResult.tabiat.ad} (${yildizResult.tabiat.sicaklik}/${yildizResult.tabiat.nem})`,
      `Element: ${yildizResult.element}`,
      `Uğurlu Gün: ${yildizResult.ugurlu.gun}, Renk: ${yildizResult.ugurlu.renk}, Taş: ${yildizResult.ugurlu.tas}`,
      `Karakter: ${yildizResult.karakter}`,
    ].join('\n');

    callApi('/api/yildizname', { yildizSummary: summary });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_yildizname_title')}</h3>
        <p className="text-xs text-muted">{t('panel_yildizname_hint')}</p>
      </div>

      {/* Input fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1">{t('yildiz_ad_label')}</label>
          <input
            type="text"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            placeholder={t('yildiz_ad_ph')}
            className="w-full rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">{t('yildiz_anne_label')}</label>
          <input
            type="text"
            value={anneAdi}
            onChange={(e) => setAnneAdi(e.target.value)}
            placeholder={t('yildiz_anne_ph')}
            className="w-full rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent"
          />
          <p className="text-[10px] text-muted mt-1">{t('yildiz_anne_hint')}</p>
        </div>
      </div>

      <Button onClick={handleCalculate} disabled={!ad.trim()}>
        {t('btn_yildiz_hesapla')}
      </Button>

      {/* Results */}
      {yildizResult && (
        <div className="space-y-3">
          {/* Ebced value */}
          <div className="rounded-xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-surface/80 border border-amber-500/20 p-4 text-center">
            <p className="text-[10px] text-muted">{t('yildiz_ebced_label')}</p>
            <p className="text-3xl font-bold text-amber-400">{yildizResult.abjadTotal}</p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-card/50 border border-border p-3">
              <p className="text-[10px] text-muted">{t('yildiz_burc')}</p>
              <p className="text-sm font-medium text-text">{yildizResult.burcKarsiligi}</p>
            </div>
            <div className="rounded-xl bg-card/50 border border-border p-3">
              <p className="text-[10px] text-muted">{t('yildiz_gezegen')}</p>
              <p className="text-sm font-medium text-text">
                {yildizResult.gezegenYonetici.icon} {yildizResult.gezegenYonetici.name}
              </p>
            </div>
            <div className="rounded-xl bg-card/50 border border-border p-3">
              <p className="text-[10px] text-muted">{t('yildiz_tabiat')}</p>
              <p className="text-sm font-medium text-text">{yildizResult.tabiat.ad}</p>
              <p className="text-[10px] text-muted">{yildizResult.tabiat.sicaklik} / {yildizResult.tabiat.nem}</p>
            </div>
            <div className="rounded-xl bg-card/50 border border-border p-3">
              <p className="text-[10px] text-muted">{t('yildiz_element')}</p>
              <p className="text-sm font-medium text-text">{yildizResult.element}</p>
            </div>
          </div>

          {/* Lucky info */}
          <div className="rounded-xl bg-card/50 border border-border p-3">
            <p className="text-xs font-medium text-text mb-2">{t('yildiz_ugurlu')}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted">{t('sans_gun_label')}: </span>
                <span className="text-text">{yildizResult.ugurlu.gun}</span>
              </div>
              <div>
                <span className="text-muted">{t('sans_renk_label')}: </span>
                <span className="text-text">{yildizResult.ugurlu.renk}</span>
              </div>
              <div>
                <span className="text-muted">{t('sans_sayi_label')}: </span>
                <span className="text-text">{yildizResult.ugurlu.sayi}</span>
              </div>
              <div>
                <span className="text-muted">{t('yildiz_tas')}: </span>
                <span className="text-text">{yildizResult.ugurlu.tas}</span>
              </div>
            </div>
          </div>

          {/* Character */}
          <div className="rounded-xl bg-card/50 border border-border p-3">
            <p className="text-xs font-medium text-text mb-1">{t('yildiz_karakter')}</p>
            <p className="text-xs text-muted">{yildizResult.karakter}</p>
          </div>

          <Button onClick={handleAIInterpret} loading={resultLoading}>
            {t('btn_yildiz_yorum')}
          </Button>
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      )}
    </div>
  );
}
