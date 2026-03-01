'use client';

interface ProfileBannerProps {
  score: number;
  t: (key: string) => string;
}

export function ProfileBanner({ score, t }: ProfileBannerProps) {
  if (score >= 80) return null;

  const handleClick = () => {
    document.querySelector('[data-tour="profile"]')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (score < 60) {
    return (
      <button
        onClick={handleClick}
        className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-200 hover:bg-amber-500/20 transition-colors"
      >
        {t('banner_low').replace('%{score}', `%${score}`)}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-left text-sm text-blue-200 hover:bg-blue-500/20 transition-colors"
    >
      {t('banner_mid')}
    </button>
  );
}
