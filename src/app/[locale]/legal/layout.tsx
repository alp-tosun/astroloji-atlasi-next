import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border/50 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-text transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Astroloji Atlasi</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border/30 py-6 text-center text-xs text-muted/60">
        <p>Astroloji Atlasi &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
