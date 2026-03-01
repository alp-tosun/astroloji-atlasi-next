import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div className="text-center space-y-4 p-8">
        <div className="text-5xl">&#x1F52D;</div>
        <h2 className="text-lg font-semibold">{t('notfound_title')}</h2>
        <p className="text-sm text-muted max-w-sm">
          {t('notfound_description')}
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
        >
          {t('notfound_btn')}
        </Link>
      </div>
    </div>
  );
}
