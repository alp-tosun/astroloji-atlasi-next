'use client';

import dynamic from 'next/dynamic';
import { PlanetBar } from '@/components/planet/PlanetBar';
import { ResultBox } from '@/components/analysis/ResultBox';
import { Button } from '@/components/ui/Button';
import { ElementBalance } from '@/components/chart/ElementBalance';

import { GunlukPanel } from '@/components/tools/GunlukPanel';
import { UyumPanel } from '@/components/tools/UyumPanel';
import { ElPanel } from '@/components/tools/ElPanel';
import { NumerologiPanel } from '@/components/tools/NumerologiPanel';
import { RuyaPanel } from '@/components/tools/RuyaPanel';
import { HoraryPanel } from '@/components/tools/HoraryPanel';
import { KozmikPanel } from '@/components/tools/KozmikPanel';
import { DailyContentPanel } from '@/components/tools/DailyContentPanel';
import { GecmisPanel } from '@/components/tools/GecmisPanel';

import type { ToolId, Profile } from '@/types/profile';
import type { CosmicEnergy, NumerologyNumbers } from '@/types/analysis';
import type { User } from 'firebase/auth';

function PanelLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

const NatalChartWheel = dynamic(() => import('@/components/chart/NatalChartWheel').then(m => ({ default: m.NatalChartWheel })), { ssr: false, loading: PanelLoader });
const TransitCalendarPanel = dynamic(() => import('@/components/tools/TransitCalendarPanel').then(m => ({ default: m.TransitCalendarPanel })), { ssr: false, loading: PanelLoader });
const LunarCalendarPanel = dynamic(() => import('@/components/tools/LunarCalendarPanel').then(m => ({ default: m.LunarCalendarPanel })), { ssr: false, loading: PanelLoader });
const PlanetaryHoursPanel = dynamic(() => import('@/components/tools/PlanetaryHoursPanel').then(m => ({ default: m.PlanetaryHoursPanel })), { ssr: false, loading: PanelLoader });
const RitualPanel = dynamic(() => import('@/components/tools/RitualPanel').then(m => ({ default: m.RitualPanel })), { ssr: false, loading: PanelLoader });
const TarotPanel = dynamic(() => import('@/components/tools/TarotPanel').then(m => ({ default: m.TarotPanel })), { ssr: false, loading: PanelLoader });

interface ToolPanelRendererProps {
  activeTool: ToolId | null;
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  profile: Profile;
  lang: string;
  user: User | null;
  cosmicEnergy: CosmicEnergy | null;
  setCosmicEnergy: (e: CosmicEnergy | null) => void;
  numNumbers: NumerologyNumbers | null;
  setNumNumbers: (n: NumerologyNumbers | null) => void;
}

export function ToolPanelRenderer({
  activeTool,
  t,
  callApi,
  result,
  resultLoading,
  streaming,
  profile,
  lang,
  user,
  cosmicEnergy,
  setCosmicEnergy,
  numNumbers,
  setNumNumbers,
}: ToolPanelRendererProps) {
  switch (activeTool) {
    case 'burc':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-text mb-1">{t('panel_burc_title')}</h3>
            <p className="text-xs text-muted">{t('panel_burc_hint')}</p>
          </div>
          <NatalChartWheel birthDate={profile['dogum-tarih']} />
          <ElementBalance birthDate={profile['dogum-tarih']} t={t} />
          <Button onClick={() => callApi('/api/burc', {})} loading={resultLoading}>
            {t('btn_burc_analiz')}
          </Button>
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      );

    case 'gunluk':
      return <GunlukPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} profile={profile} />;

    case 'uyum':
      return <UyumPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} profile={profile} />;

    case 'yuk':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-text mb-1">{t('panel_yuk_title')}</h3>
            <p className="text-xs text-muted">{t('panel_yuk_hint')}</p>
          </div>
          <div className="rounded-xl bg-card/50 p-3 text-xs text-muted space-y-1">
            <p className="font-medium text-text mb-1">{t('ozet_baslik')}</p>
            <p>{t('ozet_tarih')}: {profile['dogum-tarih'] || '\u2014'}</p>
            <p>{t('ozet_saat')}: {profile['dogum-saat'] || '\u2014'}</p>
            <p>{t('ozet_yer')}: {profile['dogum-yer'] || '\u2014'}</p>
            <p>{t('ozet_burc')}: {profile.burc || '\u2014'}</p>
          </div>
          <Button
            onClick={() => {
              const eminlik = profile['dogum-tarih'] && profile['dogum-saat'] && profile['dogum-yer']
                ? t('em_yuksek') + ' \u2014 ' + t('em_acik_full')
                : profile['dogum-tarih'] && profile['dogum-saat']
                  ? t('em_orta') + ' \u2014 ' + t('em_acik_noyer')
                  : t('em_dusuk') + ' \u2014 ' + t('em_acik_nosaat');
              callApi('/api/rising', { eminlik });
            }}
            loading={resultLoading}
          >
            {t('btn_yuk_bul')}
          </Button>
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      );

    case 'ay-burc':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-text mb-1">{t('panel_ay_burc_title')}</h3>
            <p className="text-xs text-muted">{t('panel_ay_burc_hint')}</p>
          </div>
          <div className="rounded-xl bg-card/50 p-3 text-xs text-muted space-y-1">
            <p className="font-medium text-text mb-1">{t('ozet_baslik')}</p>
            <p>{t('ozet_tarih')}: {profile['dogum-tarih'] || '\u2014'}</p>
            <p>{t('ozet_saat')}: {profile['dogum-saat'] || '\u2014'}</p>
            <p>{t('ozet_yer')}: {profile['dogum-yer'] || '\u2014'}</p>
            <p>{t('ozet_burc')}: {profile.burc || '\u2014'}</p>
          </div>
          <Button
            onClick={() => {
              const eminlik = profile['dogum-tarih'] && profile['dogum-saat'] && profile['dogum-yer']
                ? t('em_yuksek') + ' \u2014 ' + t('em_acik_full')
                : profile['dogum-tarih'] && profile['dogum-saat']
                  ? t('em_orta') + ' \u2014 ' + t('em_acik_noyer')
                  : t('em_dusuk') + ' \u2014 ' + t('em_acik_nosaat');
              callApi('/api/moon-sign', { eminlik });
            }}
            loading={resultLoading}
          >
            {t('btn_ay_burc_bul')}
          </Button>
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      );

    case 'el':
      return <ElPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} />;

    case 'num':
      return <NumerologiPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} numNumbers={numNumbers} setNumNumbers={setNumNumbers} />;

    case 'ruya':
      return <RuyaPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} />;

    case 'horar':
      return <HoraryPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} />;

    case 'kosm':
      return <KozmikPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} cosmicEnergy={cosmicEnergy} setCosmicEnergy={setCosmicEnergy} profile={profile} />;

    case 'gecmis':
      return <GecmisPanel key={Date.now()} t={t} user={user} />;

    case 'gezegen':
      return (
        <div className="space-y-4">
          <PlanetBar t={t} />
          <Button
            onClick={() => {
              const now = new Date();
              const gunAdlariTR = ['Pazar', 'Pazartesi', 'Sal\u0131', '\u00c7ar\u015famba', 'Per\u015fembe', 'Cuma', 'Cumartesi'];
              callApi('/api/cosmic', { tarih: now.toLocaleDateString('tr-TR'), gun: gunAdlariTR[now.getDay()], web_data: 'Gezegen konumları panelden gönderildi' });
            }}
            loading={resultLoading}
          >
            {t('btn_gezegen_yorumla') !== 'btn_gezegen_yorumla' ? t('btn_gezegen_yorumla') : 'Yorumla'}
          </Button>
          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      );

    case 'gunun-karti':
      return <DailyContentPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} type="gunun-karti" profile={profile} />;

    case 'haftalik':
      return <DailyContentPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} type="haftalik" profile={profile} />;

    case 'aylik':
      return <DailyContentPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} type="aylik" profile={profile} />;

    case 'transit':
      return <TransitCalendarPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} birthDate={profile['dogum-tarih']} />;

    case 'ay-takvimi':
      return <LunarCalendarPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} />;

    case 'gezegen-saatleri':
      return <PlanetaryHoursPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} birthPlace={profile?.['dogum-yer']} />;

    case 'rituel':
      return <RitualPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} />;

    case 'tarot':
      return <TarotPanel t={t} callApi={callApi} result={result} resultLoading={resultLoading} streaming={streaming} lang={lang} />;

    default:
      return null;
  }
}
