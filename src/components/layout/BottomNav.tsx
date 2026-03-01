'use client';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAuthOpen: () => void;
  onClearTool: () => void;
  isLoggedIn: boolean;
  t: (key: string) => string;
}

export function BottomNav({ activeTab, onTabChange, onAuthOpen, onClearTool, isLoggedIn, t }: BottomNavProps) {
  const tabs = [
    {
      id: 'home',
      label: t('nav_home'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'tools',
      label: t('nav_tools'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'sky',
      label: t('nav_sky'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: t('nav_profile'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const handleClick = (id: string) => {
    import('@/lib/capacitor/haptics').then(({ hapticSelection }) => hapticSelection()).catch(() => {});
    switch (id) {
      case 'home':
        onClearTool();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'tools':
        onTabChange('daily');
        onClearTool();
        document.querySelector('[data-tour="tools"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      case 'sky':
        onTabChange('sky');
        onClearTool();
        document.querySelector('[data-tour="tools"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      case 'profile':
        if (!isLoggedIn) {
          onAuthOpen();
        } else {
          document.querySelector('[data-tour="profile"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
    }
  };

  const getActiveId = () => {
    if (activeTab === 'sky') return 'sky';
    if (activeTab === 'daily' || activeTab === 'discover' || activeTab === 'more') return 'tools';
    return 'home';
  };

  const currentActive = getActiveId();

  return (
    <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = tab.id === currentActive;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? 'text-accent scale-105'
                  : 'text-muted hover:text-text'
              }`}
            >
              <span aria-hidden="true" className={`transition-colors ${isActive ? 'text-accent' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-medium leading-tight ${isActive ? 'text-accent' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
