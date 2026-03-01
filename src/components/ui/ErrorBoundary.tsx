'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isEn = typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-bg text-text">
          <div className="text-center space-y-4 p-8">
            <div className="text-4xl">&#x1F4AB;</div>
            <h2 className="text-lg font-semibold">
              {isEn ? 'Something went wrong' : 'Bir sorun oluştu'}
            </h2>
            <p className="text-sm text-muted max-w-sm">
              {isEn
                ? 'The app encountered an unexpected error. Please try refreshing the page.'
                : 'Uygulama beklenmeyen bir hata ile karşılaştı. Sayfayı yenileyerek tekrar deneyebilirsiniz.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
            >
              {isEn ? 'Refresh Page' : 'Sayfayı Yenile'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
