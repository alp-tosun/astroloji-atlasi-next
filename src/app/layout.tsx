import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05030f',
};

export const metadata: Metadata = {
  title: 'Astroloji Atlası — AI Destekli Astroloji Platformu',
  description: 'Yıldızların gizli dilini keşfet. Burç analizi, yükselen hesaplama, uyum testi, numeroloji, rüya yorumu ve daha fazlası — yapay zeka destekli kişisel astroloji deneyimi.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Astroloji Atlası — AI Destekli Astroloji Platformu',
    description: 'Burç analizi, yükselen hesaplama, uyum testi, numeroloji, rüya yorumu ve daha fazlası — yapay zeka destekli kişisel astroloji deneyimi.',
    siteName: 'Astroloji Atlası',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astroloji Atlası',
    description: 'AI destekli kişisel astroloji deneyimi',
  },
  alternates: {
    languages: {
      'tr': '/tr',
      'en': '/en',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('astroloji-settings'));var t=s&&s.theme;if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else if(t==='system'){var m=window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(m?'dark':'light')}}catch(e){}try{var l=localStorage.getItem('astroloji-lang');if(l)document.documentElement.lang=l}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          {/* Nebula background effects */}
          <div className="nebula nebula-1" />
          <div className="nebula nebula-2" />
          <div className="nebula nebula-3" />
          {children}
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
