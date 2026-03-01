'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProfileSignal } from './ProfileSignal';
import { ZODIAC_SIGNS_TR } from '@/types/astrology';
import type { ToolId } from '@/types/profile';

const BURC_ICON: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

interface ProfileFormProps {
  t: (key: string) => string;
  onToolSelect?: (id: ToolId) => void;
}

export function ProfileForm({ t, onToolSelect }: ProfileFormProps) {
  const { profile, signalScore, setField, save, clearProfile } = useProfile();
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await save();
  };

  const name = profile.ad || '';
  const burc = profile.burc || '';
  const burcIcon = BURC_ICON[burc] || '✦';
  const birthDate = profile['dogum-tarih'] || '';

  return (
    <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm overflow-hidden">
      {/* Compact summary bar — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-card/30 transition-colors"
      >
        {/* Avatar / icon */}
        <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-lg shrink-0">
          {burc ? burcIcon : '✦'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text truncate">
              {name || t('profil_title')}
            </span>
            {burc && (
              <span className="text-xs text-muted">{burc}</span>
            )}
            {birthDate && (
              <span className="text-xs text-muted hidden sm:inline">{birthDate}</span>
            )}
          </div>
          {/* Profile completion badge */}
          {signalScore >= 80 ? (
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t('profil_badge_done')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-400 animate-pulse">
              {t('profil_badge_incomplete')}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable form */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-5 py-5 sm:px-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">{t('profil_title')}</h2>
              <ProfileSignal score={signalScore} t={t} />
            </div>

            <p className="text-xs text-muted">{t('info_box')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('label_ad')}
                placeholder={t('ph_ad')}
                value={profile.ad || ''}
                onChange={(e) => setField('ad', e.target.value)}
              />

              <Select
                label={t('label_cinsiyet')}
                value={profile.cinsiyet || ''}
                onChange={(e) => setField('cinsiyet', e.target.value)}
              >
                <option value="">{t('opt_belirt')}</option>
                <option value="Kadın">{t('opt_kadin')}</option>
                <option value="Erkek">{t('opt_erkek')}</option>
                <option value="Diğer">{t('opt_diger')}</option>
              </Select>

              <Select
                label={t('label_iliski_durumu')}
                value={profile['iliski-durumu'] || ''}
                onChange={(e) => setField('iliski-durumu', e.target.value)}
              >
                <option value="">{t('opt_belirt')}</option>
                <option value="Bekar">{t('opt_bekar')}</option>
                <option value="İlişkide">{t('opt_iliskide')}</option>
                <option value="Evli">{t('opt_evli')}</option>
                <option value="Boşanmış">{t('opt_bosanmis')}</option>
              </Select>

              <Input
                label={t('label_dogum_tarih')}
                type="date"
                value={profile['dogum-tarih'] || ''}
                onChange={(e) => setField('dogum-tarih', e.target.value)}
              />

              <Select
                label={t('label_dogum_saat')}
                value={profile['dogum-saat'] || ''}
                onChange={(e) => setField('dogum-saat', e.target.value)}
              >
                <option value="">{t('opt_bilmiyorum')}</option>
                <option value="00:00-01:00">00:00 - 01:00</option>
                <option value="01:00-02:00">01:00 - 02:00</option>
                <option value="02:00-03:00">02:00 - 03:00</option>
                <option value="03:00-04:00">03:00 - 04:00</option>
                <option value="04:00-05:00">04:00 - 05:00</option>
                <option value="05:00-06:00">05:00 - 06:00</option>
                <option value="06:00-07:00">06:00 - 07:00</option>
                <option value="07:00-08:00">07:00 - 08:00</option>
                <option value="08:00-09:00">08:00 - 09:00</option>
                <option value="09:00-10:00">09:00 - 10:00</option>
                <option value="10:00-11:00">10:00 - 11:00</option>
                <option value="11:00-12:00">11:00 - 12:00</option>
                <option value="12:00-13:00">12:00 - 13:00</option>
                <option value="13:00-14:00">13:00 - 14:00</option>
                <option value="14:00-15:00">14:00 - 15:00</option>
                <option value="15:00-16:00">15:00 - 16:00</option>
                <option value="16:00-17:00">16:00 - 17:00</option>
                <option value="17:00-18:00">17:00 - 18:00</option>
                <option value="18:00-19:00">18:00 - 19:00</option>
                <option value="19:00-20:00">19:00 - 20:00</option>
                <option value="20:00-21:00">20:00 - 21:00</option>
                <option value="21:00-22:00">21:00 - 22:00</option>
                <option value="22:00-23:00">22:00 - 23:00</option>
                <option value="23:00-00:00">23:00 - 00:00</option>
              </Select>

              <Input
                label={t('label_dogum_yer')}
                placeholder={t('ph_yer')}
                value={profile['dogum-yer'] || ''}
                onChange={(e) => setField('dogum-yer', e.target.value)}
              />

              <Select
                label={t('label_burc')}
                value={profile.burc || ''}
                onChange={(e) => setField('burc', e.target.value)}
              >
                <option value="">{t('opt_secipiz')}</option>
                {ZODIAC_SIGNS_TR.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>

            </div>

            {/* Yükselen & Ay Burcu — grouped with "Öğren" links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label={t('label_yukselen')}
                  value={profile.yukselen || ''}
                  onChange={(e) => setField('yukselen', e.target.value)}
                >
                  <option value="">{t('opt_bilmiyorum')}</option>
                  {ZODIAC_SIGNS_TR.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
                {!profile.yukselen && onToolSelect && (
                  <button
                    type="button"
                    onClick={() => onToolSelect('yuk')}
                    className="mt-1.5 text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <span>🌅</span>
                    <span>{t('profil_ogren_yukselen')}</span>
                  </button>
                )}
              </div>
              <div>
                <Select
                  label={t('label_ay_burc')}
                  value={profile['ay-burcu'] || ''}
                  onChange={(e) => setField('ay-burcu', e.target.value)}
                >
                  <option value="">{t('opt_bilmiyorum')}</option>
                  {ZODIAC_SIGNS_TR.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
                {!profile['ay-burcu'] && onToolSelect && (
                  <button
                    type="button"
                    onClick={() => onToolSelect('ay-burc')}
                    className="mt-1.5 text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <span>🌙</span>
                    <span>{t('profil_ogren_ay_burc')}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button onClick={handleSave}>{t('btn_kaydet')}</Button>
              <Button variant="secondary" onClick={clearProfile}>{t('btn_temizle')}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
