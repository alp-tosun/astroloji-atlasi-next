'use client';

import { useState, useCallback } from 'react';
import { TAROT_CARDS, type TarotCard } from '@/data/tarot-cards';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/analysis/ResultBox';

interface TarotPanelProps {
  t: (key: string) => string;
  callApi: (endpoint: string, body: Record<string, unknown>) => Promise<void>;
  result: string;
  resultLoading: boolean;
  streaming: boolean;
  lang: string;
}

interface DrawnCard {
  card: TarotCard;
  position: 'past' | 'present' | 'future';
  flipped: boolean;
  reversed: boolean;
}

// B6: Fisher-Yates shuffle
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawRandomCards(): { card: TarotCard; reversed: boolean }[] {
  const shuffled = fisherYatesShuffle(TAROT_CARDS);
  return shuffled.slice(0, 3).map((card) => ({
    card,
    reversed: Math.random() < 0.3, // 30% chance reversed
  }));
}

const POSITION_LABELS: Record<string, Record<string, string>> = {
  past: { tr: 'Geçmiş', en: 'Past' },
  present: { tr: 'Şimdi', en: 'Present' },
  future: { tr: 'Gelecek', en: 'Future' },
};

function CardBack({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-[2/3] rounded-xl border-2 border-accent/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-indigo-900/80 overflow-hidden transition-all hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10 active:scale-95 active:border-accent/80 cursor-pointer"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-3 sm:inset-4 border border-accent/40 rounded-lg" />
        <div className="absolute inset-5 sm:inset-6 border border-accent/20 rounded-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 border-2 border-accent/30 rotate-45" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl sm:text-3xl opacity-60 group-hover:opacity-100 transition-opacity">🎴</span>
      </div>
      <div className="absolute bottom-2 inset-x-0 text-center">
        <span className="text-[11px] sm:text-[10px] text-accent/60 font-medium">{label}</span>
      </div>
    </button>
  );
}

function CardFront({ card, position, lang, reversed }: { card: TarotCard; position: string; lang: string; reversed: boolean }) {
  const isMajor = card.arcana === 'major';
  const name = lang === 'tr' ? card.nameTr : card.name;
  const meaning = reversed
    ? (lang === 'tr' ? (card.reversedMeaningTr || card.meaningTr) : (card.reversedMeaning || card.meaning))
    : (lang === 'tr' ? card.meaningTr : card.meaning);

  return (
    <div className={`w-full aspect-[2/3] rounded-xl border-2 ${reversed ? 'border-red-400/40' : 'border-accent/40'} bg-gradient-to-br from-surface via-card to-surface overflow-hidden animate-[cardFlip_0.6s_ease-out]`}>
      {/* Header */}
      <div className="px-2 sm:px-3 pt-2 sm:pt-3 pb-1 sm:pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-[10px] font-bold text-accent uppercase tracking-wider truncate">
            {position}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {reversed && (
              <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                Ters
              </span>
            )}
            <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full ${
              isMajor ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {isMajor ? 'Major' : 'Minor'}
            </span>
          </div>
        </div>
        {isMajor && (
          <div className="text-center text-base sm:text-lg font-bold text-accent/80 mb-0.5 sm:mb-1">{card.id}</div>
        )}
      </div>

      {/* Card center */}
      <div className={`flex-1 flex flex-col items-center justify-center px-2 sm:px-3 py-1 sm:py-2 ${reversed ? 'rotate-180' : ''}`}>
        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">
          {isMajor ? '✦' : card.suit === 'wands' ? '🪄' : card.suit === 'cups' ? '🏆' : card.suit === 'swords' ? '⚔️' : '💰'}
        </div>
      </div>
      <div className="px-2 sm:px-3 pb-2">
        <h4 className="text-xs sm:text-sm font-bold text-text text-center leading-tight mb-0.5 sm:mb-1">{name}</h4>
        <p className="text-[10px] sm:text-[11px] text-muted text-center leading-snug line-clamp-3">{meaning}</p>
      </div>
    </div>
  );
}

export function TarotPanel({ t, callApi, result, resultLoading, streaming, lang }: TarotPanelProps) {
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isDrawn, setIsDrawn] = useState(false);
  const [flippedCount, setFlippedCount] = useState(0);

  const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future'];

  const handleDraw = useCallback(() => {
    const cards = drawRandomCards();
    setDrawnCards(
      cards.map((c, i) => ({
        card: c.card,
        position: positions[i],
        flipped: false,
        reversed: c.reversed,
      })),
    );
    setIsDrawn(true);
    setFlippedCount(0);
  }, []);

  const handleFlip = useCallback(
    (index: number) => {
      setDrawnCards((prev) => {
        const next = [...prev];
        if (!next[index].flipped) {
          next[index] = { ...next[index], flipped: true };
          const newFlippedCount = flippedCount + 1;
          setFlippedCount(newFlippedCount);

          if (newFlippedCount === 3) {
            const cardData = next.map((dc) => ({
              name: lang === 'tr' ? dc.card.nameTr : dc.card.name,
              position: POSITION_LABELS[dc.position][lang] || dc.position,
              meaning: dc.reversed
                ? `(Ters) ${lang === 'tr' ? (dc.card.reversedMeaningTr || dc.card.meaningTr) : (dc.card.reversedMeaning || dc.card.meaning)}`
                : (lang === 'tr' ? dc.card.meaningTr : dc.card.meaning),
            }));
            callApi('/api/tarot', { cards: cardData });
          }
        }
        return next;
      });
    },
    [flippedCount, callApi, lang],
  );

  const handleReset = () => {
    setDrawnCards([]);
    setIsDrawn(false);
    setFlippedCount(0);
  };

  const positionKeys: Record<string, string> = {
    past: 'tarot_gecmis',
    present: 'tarot_simdi',
    future: 'tarot_gelecek',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-text mb-1">{t('panel_tarot_title')}</h3>
        <p className="text-xs text-muted">{t('panel_tarot_hint')}</p>
      </div>

      {!isDrawn ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {positions.map((pos) => (
              <div key={pos} className="space-y-1.5">
                <p className="text-[11px] text-center text-muted font-medium">{t(positionKeys[pos])}</p>
                <div className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-border/50 bg-card/20 flex items-center justify-center">
                  <span className="text-2xl opacity-30">🎴</span>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleDraw} className="w-full">
            {t('btn_tarot_cek')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {drawnCards.map((dc, i) => (
              <div key={dc.card.id} className="space-y-1.5">
                <p className="text-[11px] text-center text-muted font-medium">{t(positionKeys[dc.position])}</p>
                <div style={{ perspective: '600px' }}>
                  {dc.flipped ? (
                    <CardFront
                      card={dc.card}
                      position={POSITION_LABELS[dc.position][lang] || dc.position}
                      lang={lang}
                      reversed={dc.reversed}
                    />
                  ) : (
                    <CardBack
                      onClick={() => handleFlip(i)}
                      label={t('tarot_kart_kapali')}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {flippedCount < 3 && (
            <p className="text-xs text-center text-muted animate-pulse">
              {t('tarot_aciliyor')} ({flippedCount}/3)
            </p>
          )}

          <Button onClick={handleReset} variant="ghost" size="sm" className="w-full">
            {t('btn_tarot_sifirla')}
          </Button>

          <ResultBox content={result} loading={resultLoading} streaming={streaming} />
        </div>
      )}
    </div>
  );
}
