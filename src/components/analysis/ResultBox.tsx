'use client';

import { useMemo, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { VisualResultCard } from './VisualResultCard';

interface ResultBoxProps {
  content: string;
  loading?: boolean;
  streaming?: boolean;
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Title skeleton */}
      <div className="skeleton-line w-2/5 h-4" />
      {/* Paragraph skeletons */}
      <div className="space-y-2">
        <div className="skeleton-line w-full" />
        <div className="skeleton-line w-11/12" />
        <div className="skeleton-line w-4/5" />
      </div>
      {/* Second section */}
      <div className="skeleton-line w-1/3 h-4 mt-4" />
      <div className="space-y-2">
        <div className="skeleton-line w-full" />
        <div className="skeleton-line w-10/12" />
        <div className="skeleton-line w-3/4" />
        <div className="skeleton-line w-5/6" />
      </div>
      {/* Third section */}
      <div className="skeleton-line w-2/5 h-4 mt-4" />
      <div className="space-y-2">
        <div className="skeleton-line w-full" />
        <div className="skeleton-line w-9/12" />
      </div>
    </div>
  );
}

export function ResultBox({ content, loading, streaming }: ResultBoxProps) {
  const proseRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    if (!content) return '';
    const raw = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [content]);

  // Typewriter-like cascading reveal for non-streaming results
  useEffect(() => {
    if (!proseRef.current || loading || streaming) return;
    const children = proseRef.current.children;
    Array.from(children).forEach((child, i) => {
      const el = child as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      el.style.transition = `opacity 0.3s ease ${i * 50}ms, transform 0.3s ease ${i * 50}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }, [html, loading, streaming]);

  // Check if we can show visual cards (non-streaming, has multiple ## sections)
  const hasVisualSections = useMemo(() => {
    if (!content || streaming) return false;
    const sectionCount = (content.match(/^##\s+/gm) || []).length;
    return sectionCount >= 2;
  }, [content, streaming]);

  if (!content && !loading) return null;

  // When not streaming and content has multiple sections, use visual cards
  if (!streaming && !loading && content && hasVisualSections) {
    return (
      <div className="mt-4 animate-[resultSlideIn_0.3s_ease-out]">
        <VisualResultCard content={content} />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card/50 p-5 animate-[resultSlideIn_0.3s_ease-out]">
      {loading && !content ? (
        <SkeletonLoader />
      ) : loading && content ? (
        <div className="flex items-center gap-2 text-accent">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">{content}</span>
        </div>
      ) : (
        <div
          ref={proseRef}
          className="prose prose-invert prose-sm max-w-none prose-headings:text-accent-light prose-headings:text-base prose-p:text-text/90 prose-li:text-text/90 prose-strong:text-text"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
