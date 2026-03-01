'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';
import { isNative } from '@/lib/capacitor/platform';

interface ElPanelProps {
  t: (k: string) => string;
  callApi: (e: string, b: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ElPanel({ t, callApi, result, resultLoading, streaming }: ElPanelProps) {
  const [imageBase64, setImageBase64] = useState('');
  const [sizeError, setSizeError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSizeError('');
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(t('el_boyut_hata') !== 'el_boyut_hata' ? t('el_boyut_hata') : 'Dosya boyutu 5MB\'dan kucuk olmali.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNativeCamera = async () => {
    try {
      const { takePhoto } = await import('@/lib/capacitor/camera');
      const dataUrl = await takePhoto();
      if (dataUrl) setImageBase64(dataUrl);
    } catch {
      // Fallback silently — user can still use file input
    }
  };

  const handleNativeGallery = async () => {
    try {
      const { pickPhoto } = await import('@/lib/capacitor/camera');
      const dataUrl = await pickPhoto();
      if (dataUrl) setImageBase64(dataUrl);
    } catch {
      // Fallback silently
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_el_title')}</h3>
        <p className="text-xs text-muted">{t('panel_el_hint')}</p>
      </div>

      {isNative() ? (
        /* Native: camera and gallery buttons */
        <div className="space-y-2">
          {imageBase64 ? (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageBase64} alt="Palm" className="max-h-40 rounded-lg" />
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNativeCamera}
              className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 hover:border-accent/40 transition-colors"
            >
              <span className="text-2xl mb-1">&#128247;</span>
              <span className="text-xs text-muted">{t('el_kamera') !== 'el_kamera' ? t('el_kamera') : 'Kamera'}</span>
            </button>
            <button
              type="button"
              onClick={handleNativeGallery}
              className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 hover:border-accent/40 transition-colors"
            >
              <span className="text-2xl mb-1">&#128444;&#65039;</span>
              <span className="text-xs text-muted">{t('el_galeri') !== 'el_galeri' ? t('el_galeri') : 'Galeri'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Web: standard file input */
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-accent/40 transition-colors">
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          {imageBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageBase64} alt="Palm" className="max-h-40 rounded-lg" />
          ) : (
            <>
              <span className="text-2xl mb-2">{'\u270b'}</span>
              <span className="text-sm text-muted">{t('upload_click')}</span>
              <span className="text-xs text-muted/60">{t('upload_type')}</span>
            </>
          )}
        </label>
      )}

      {sizeError && <p className="text-xs text-red-400">{sizeError}</p>}
      <Button onClick={() => callApi('/api/palm', { imageBase64 })} loading={resultLoading} disabled={!imageBase64}>
        {t('btn_el_yorumla')}
      </Button>
      <ResultBox content={result} loading={resultLoading} streaming={streaming} />
    </div>
  );
}
