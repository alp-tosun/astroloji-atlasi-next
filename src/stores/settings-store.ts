import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';

interface NotificationSettings {
  dailyReminder: boolean;
  featureAnnouncements: boolean;
}

interface SettingsState {
  theme: Theme;
  notifications: NotificationSettings;
  setTheme: (theme: Theme) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  applyTheme: () => void;
}

const STORAGE_KEY = 'astroloji-settings';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(resolved);
}

let mediaQueryCleanup: (() => void) | null = null;

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  notifications: {
    dailyReminder: true,
    featureAnnouncements: true,
  },

  setTheme: (theme) => {
    set({ theme });
    get().applyTheme();
    get().saveToStorage();
  },

  setNotification: (key, value) => {
    const notifications = { ...get().notifications, [key]: value };
    set({ notifications });
    get().saveToStorage();
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.theme) set({ theme: data.theme });
        if (data.notifications) set({ notifications: { ...get().notifications, ...data.notifications } });
      }
    } catch {
      // ignore parse errors
    }
    get().applyTheme();
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    const { theme, notifications } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, notifications }));
  },

  applyTheme: () => {
    const { theme } = get();
    applyThemeClass(theme);

    // Clean up previous listener
    if (mediaQueryCleanup) {
      mediaQueryCleanup();
      mediaQueryCleanup = null;
    }

    // Listen for system theme changes when in 'system' mode
    if (theme === 'system' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyThemeClass('system');
      mq.addEventListener('change', handler);
      mediaQueryCleanup = () => mq.removeEventListener('change', handler);
    }
  },
}));
