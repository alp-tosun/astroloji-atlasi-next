'use client';

import { useEffect, useMemo } from 'react';

const texts = {
  tr: {
    title: 'Bir sorun oluştu',
    description: 'Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen tekrar deneyin.',
    retry: 'Tekrar Dene',
  },
  en: {
    title: 'Something went wrong',
    description: 'The application encountered an unexpected error. Please try again.',
    retry: 'Try Again',
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useMemo(() => {
    if (typeof window === 'undefined') return 'tr';
    const path = window.location.pathname;
    return path.startsWith('/en') ? 'en' : 'tr';
  }, []);

  const t = texts[lang] || texts.tr;

  useEffect(() => {
    import('@/lib/capacitor/crashlytics')
      .then(({ recordError }) => recordError(error, 'ErrorBoundary'))
      .catch(() => {});
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div className="text-center space-y-4 p-8">
        <div className="text-4xl">&#128171;</div>
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <p className="text-sm text-muted max-w-sm">
          {t.description}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
        >
          {t.retry}
        </button>
      </div>
    </div>
  );
}
