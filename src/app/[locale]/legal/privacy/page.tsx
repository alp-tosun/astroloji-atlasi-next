import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t('legal_privacy_title') + ' — Astroloji Atlasi' };
}

export default async function PrivacyPage() {
  const t = await getTranslations();

  const sections = [
    { title: t('legal_privacy_s1_title'), content: t('legal_privacy_s1') },
    { title: t('legal_privacy_s2_title'), content: t('legal_privacy_s2') },
    { title: t('legal_privacy_s3_title'), content: t('legal_privacy_s3') },
    { title: t('legal_privacy_s4_title'), content: t('legal_privacy_s4') },
    { title: t('legal_privacy_s5_title'), content: t('legal_privacy_s5') },
    { title: t('legal_privacy_s6_title'), content: t('legal_privacy_s6') },
    { title: t('legal_privacy_s7_title'), content: t('legal_privacy_s7') },
  ];

  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold mb-2">{t('legal_privacy_title')}</h1>
      <p className="text-sm text-muted mb-8">{t('legal_last_updated')}: 2026-02-28</p>
      {sections.map((s, i) => (
        <section key={i} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
          <p className="text-sm text-text/80 leading-relaxed whitespace-pre-line">{s.content}</p>
        </section>
      ))}
      <section className="mt-8 pt-4 border-t border-border/30">
        <p className="text-sm text-muted">{t('legal_contact')}: destek@astrolojiatlasi.com</p>
      </section>
    </article>
  );
}
