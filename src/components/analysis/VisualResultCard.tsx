'use client';

import { useMemo, type ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface Section {
  title: string;
  content: string;
  icon: ReactNode;
  gradient: string;
}

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
    <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-purple-400">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
  </svg>
);

function getIconForTitle(title: string): { icon: ReactNode; gradient: string } {
  const lower = title.toLowerCase();
  if (lower.includes('özet') || lower.includes('summary')) {
    return { icon: <StarIcon />, gradient: 'from-amber-500/20 to-transparent' };
  }
  if (lower.includes('analiz') || lower.includes('analysis') || lower.includes('detay') || lower.includes('detail')) {
    return { icon: <SearchIcon />, gradient: 'from-blue-500/20 to-transparent' };
  }
  if (lower.includes('dikkat') || lower.includes('watch') || lower.includes('uyar') || lower.includes('warning')) {
    return { icon: <WarningIcon />, gradient: 'from-orange-500/20 to-transparent' };
  }
  if (lower.includes('aksiyon') || lower.includes('öneri') || lower.includes('action') || lower.includes('recommend') || lower.includes('tavsiye')) {
    return { icon: <LightbulbIcon />, gradient: 'from-emerald-500/20 to-transparent' };
  }
  return { icon: <SparkleIcon />, gradient: 'from-purple-500/20 to-transparent' };
}

function parsePreamble(content: string): string | null {
  const lines = content.split('\n');
  const preambleLines: string[] = [];
  for (const line of lines) {
    if (/^##\s+/.test(line)) break;
    // Extract H1 text (e.g. "# Yengeç" → "Yengeç")
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      preambleLines.push(h1[1].trim());
    } else if (line.trim()) {
      preambleLines.push(line.trim());
    }
  }
  return preambleLines.length > 0 ? preambleLines.join(' ') : null;
}

function parseMarkdownSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      if (currentTitle && currentLines.length > 0) {
        const { icon, gradient } = getIconForTitle(currentTitle);
        sections.push({
          title: currentTitle,
          content: currentLines.join('\n').trim(),
          icon,
          gradient,
        });
      }
      currentTitle = headerMatch[1].trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Push last section
  if (currentTitle && currentLines.length > 0) {
    const { icon, gradient } = getIconForTitle(currentTitle);
    sections.push({
      title: currentTitle,
      content: currentLines.join('\n').trim(),
      icon,
      gradient,
    });
  }

  return sections;
}

interface VisualResultCardProps {
  content: string;
}

export function VisualResultCard({ content }: VisualResultCardProps) {
  const sections = useMemo(() => parseMarkdownSections(content), [content]);
  const preamble = useMemo(() => parsePreamble(content), [content]);

  if (sections.length < 2) return null;

  return (
    <div className="space-y-3">
      {preamble && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-center animate-[resultSlideIn_0.3s_ease-out]">
          <p className="text-lg font-bold text-accent">{preamble}</p>
        </div>
      )}
      {sections.map((section, i) => {
        const html = DOMPurify.sanitize(
          marked.parse(section.content, { async: false }) as string,
        );

        return (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card/50 overflow-hidden animate-[resultSlideIn_0.3s_ease-out]"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
          >
            {/* Accent bar + header */}
            <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${section.gradient}`}>
              <span className="shrink-0">{section.icon}</span>
              <h3 className="text-sm font-semibold text-text">{section.title}</h3>
            </div>

            {/* Content */}
            <div
              className="px-4 py-3 prose prose-invert prose-sm max-w-none prose-p:text-text/90 prose-li:text-text/90 prose-strong:text-text"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        );
      })}
    </div>
  );
}
