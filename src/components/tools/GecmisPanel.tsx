'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AnalysisResult } from '@/types/analysis';
import { getAnalyses, deleteAnalysis, deleteAllAnalyses } from '@/lib/firebase/firestore';

const TIP_ICON: Record<string, string> = {
  burc: '\u2648', gunluk: '\ud83c\udf1e', uyum: '\ud83d\udcab', ruya: '\ud83c\udf19',
  horary: '\u2726', numeroloji: '\ud83d\udd22', el: '\u270b', rising: '\ud83c\udf05', cosmic: '\ud83d\udd2e', ritual: '\ud83d\udd6f\ufe0f',
};

interface GecmisPanelProps {
  t: (k: string) => string;
  lang: string;
  user: { uid: string } | null;
}

export function GecmisPanel({ t, lang, user }: GecmisPanelProps) {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<AnalysisResult | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    setError(false);
    getAnalyses(user.uid)
      .then(setAnalyses)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const executeDelete = useCallback(async () => {
    if (!user?.uid || !confirmDelete) return;
    try {
      await deleteAnalysis(user.uid, confirmDelete);
      setAnalyses((prev) => prev.filter((a) => a.id !== confirmDelete));
      if (selected?.id === confirmDelete) setSelected(null);
    } catch { /* ignore */ }
    setConfirmDelete(null);
  }, [user?.uid, confirmDelete, selected?.id]);

  const executeDeleteAll = useCallback(async () => {
    if (!user?.uid) return;
    try {
      await deleteAllAnalyses(user.uid);
      setAnalyses([]);
      setSelected(null);
    } catch { /* ignore */ }
    setConfirmDeleteAll(false);
  }, [user?.uid]);

  const veriText = (veri: unknown): string => {
    if (typeof veri === 'string') return veri;
    if (veri && typeof veri === 'object') {
      const v = veri as Record<string, unknown>;
      if (v.baslik || v.sonuc) {
        return [v.baslik, v.sonuc].filter(Boolean).join('\n\n');
      }
      return JSON.stringify(veri);
    }
    return String(veri ?? '');
  };

  const tipLabel = (tip: string) => {
    const key = `gecmis_tip_${tip}`;
    const val = t(key);
    return val !== key ? val : t('gecmis_tip_diger');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-text mb-1">{t('panel_gecmis_title')}</h3>
          <p className="text-xs text-muted">{t('panel_gecmis_hint')}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-6 text-center">
          <p className="text-sm text-muted">{t('gecmis_giris_gerekli')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-text mb-1">{t('panel_gecmis_title')}</h3>
          <p className="text-xs text-muted">{t('panel_gecmis_hint')}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-6 text-center">
          <p className="text-sm text-muted animate-pulse">{t('gecmis_yukleniyor')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-text mb-1">{t('panel_gecmis_title')}</h3>
          <p className="text-xs text-muted">{t('panel_gecmis_hint')}</p>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-6 text-center">
          <p className="text-sm text-red-400">{t('gecmis_hata')}</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            {t('gecmis_detay_kapat')}
          </Button>
          <button
            onClick={() => selected.id && setConfirmDelete(selected.id)}
            className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {t('gecmis_sil')}
          </button>
        </div>
        <div className="rounded-xl bg-card/50 border border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TIP_ICON[selected.tip] || '\ud83d\udccb'}</span>
            <span className="font-semibold text-text">{tipLabel(selected.tip)}</span>
          </div>
          <p className="text-xs text-muted">{formatDate(selected.tarih)}</p>
          <div className="mt-3 text-sm text-text whitespace-pre-wrap leading-relaxed">
            {veriText(selected.veri)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text mb-1">{t('panel_gecmis_title')}</h3>
          <p className="text-xs text-muted">{t('panel_gecmis_hint')}</p>
        </div>
        {analyses.length > 0 && (
          <button
            onClick={() => setConfirmDeleteAll(true)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
          >
            {t('gecmis_tumu_sil')}
          </button>
        )}
      </div>
      {analyses.length === 0 ? (
        <div className="rounded-xl bg-card/50 border border-border p-6 text-center">
          <p className="text-sm text-muted">{t('gecmis_bos')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {analyses.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="w-full text-left rounded-xl bg-card/50 border border-border p-3 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{TIP_ICON[a.tip] || '\ud83d\udccb'}</span>
                <span className="font-medium text-text text-sm">{tipLabel(a.tip)}</span>
                <span className="ml-auto text-xs text-muted">{formatDate(a.tarih)}</span>
              </div>
              <p className="text-xs text-muted mt-1 line-clamp-2">{veriText(a.veri)}</p>
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={t('gecmis_sil')}
        message={t('gecmis_sil_confirm')}
        confirmLabel={t('gecmis_sil')}
        cancelLabel={t('btn_vazgec')}
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmDeleteAll}
        title={t('gecmis_tumu_sil')}
        message={t('gecmis_tumu_sil_confirm')}
        confirmLabel={t('gecmis_tumu_sil')}
        cancelLabel={t('btn_vazgec')}
        variant="danger"
        onConfirm={executeDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
}
