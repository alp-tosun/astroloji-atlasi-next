'use client';

interface ProfileSignalProps {
  score: number;
  t: (key: string) => string;
}

export function ProfileSignal({ score, t }: ProfileSignalProps) {
  const [label, color] =
    score < 30
      ? [t('sinyal_dusuk'), '#f87171']
      : score < 70
        ? [t('sinyal_orta'), '#fbbf24']
        : [t('sinyal_yuksek'), '#34d399'];

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted">{t('sinyal_label')}</span>
        <span className="text-xs font-medium" style={{ color }}>
          {score}/100 ({label})
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}
