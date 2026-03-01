'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface StoryCardProps {
  content: string;
  burc?: string;
  t: (key: string) => string;
  lang: string;
}

function extractSummary(content: string, maxLen = 200): string {
  // Try to find ## Kısa Özet or ## Summary section
  const match = content.match(/##\s*(Kısa Özet|Summary)\s*\n+([\s\S]*?)(?=\n##|\n*$)/i);
  if (match && match[2]) {
    const text = match[2].replace(/[*_#`]/g, '').trim();
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }
  // Fallback: first 200 chars of cleaned content
  const cleaned = content.replace(/[#*_`]/g, '').replace(/\n+/g, ' ').trim();
  return cleaned.length > maxLen ? cleaned.substring(0, maxLen) + '...' : cleaned;
}

const BURC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
};

export function StoryCard({ content, burc, t, lang }: StoryCardProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const summary = extractSummary(content);
  const burcSymbol = burc ? BURC_SYMBOLS[burc] || '' : '';
  const today = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const downloadImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const cardContent = (isSquare: boolean) => (
    <>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950" />

      {/* Decorative star pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[10%] left-[15%] text-white text-xl">✦</div>
        <div className="absolute top-[20%] right-[20%] text-white text-sm">✧</div>
        <div className="absolute bottom-[30%] left-[10%] text-white text-xs">✦</div>
        <div className="absolute bottom-[15%] right-[15%] text-white text-lg">✧</div>
      </div>

      {/* Zodiac background symbol */}
      {burcSymbol && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 pointer-events-none"
             style={{ fontSize: isSquare ? '200px' : '280px' }}>
          {burcSymbol}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Logo header */}
        <div className="flex items-center gap-2 mb-auto">
          <span className="text-xl">🔮</span>
          <span className="text-white/90 font-bold text-sm tracking-wide">{t('site_name')}</span>
        </div>

        {/* Summary */}
        <div className={`flex-1 flex items-center justify-center ${isSquare ? 'py-4' : 'py-8'}`}>
          <p className="text-white/90 text-center leading-relaxed" style={{ fontSize: isSquare ? '14px' : '16px' }}>
            {summary}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-white/40 text-xs">{today}</span>
          <span className="text-white/40 text-xs">astrolojiatlasi.com</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {/* Preview - Story (9:16) */}
      <div className="relative mx-auto overflow-hidden rounded-xl" style={{ width: '180px', height: '320px' }}>
        <div
          ref={storyRef}
          className="relative w-[1080px] h-[1920px] origin-top-left"
          style={{ transform: 'scale(0.1667)' }}
        >
          {cardContent(false)}
        </div>
      </div>

      {/* Hidden full-size renders */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <div ref={squareRef} className="relative" style={{ width: '1080px', height: '1080px' }}>
          {cardContent(true)}
        </div>
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => downloadImage(storyRef, 'astroloji-story.png')}
          variant="ghost"
          size="sm"
          disabled={downloading}
        >
          {downloading ? t('paylasim_hazirlaniyor') : t('paylasim_story')}
        </Button>
        <Button
          onClick={() => downloadImage(squareRef, 'astroloji-kare.png')}
          variant="ghost"
          size="sm"
          disabled={downloading}
        >
          {downloading ? t('paylasim_hazirlaniyor') : t('paylasim_kare')}
        </Button>
      </div>
    </div>
  );
}
