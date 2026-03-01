'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Global error has no access to i18n — show bilingual text
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#05030f',
          color: '#e8e6f0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>&#x1F4AB;</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Bir sorun oluştu / Something went wrong
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#9896a3',
              maxWidth: '24rem',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
            }}
          >
            Lütfen tekrar deneyin. / Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: '#7c3aed',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tekrar Dene / Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
