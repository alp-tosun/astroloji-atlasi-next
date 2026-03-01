'use client';

import { useEffect, useRef } from 'react';
import { isNative } from '@/lib/capacitor/platform';

/**
 * Hook that wires up all Capacitor native lifecycle plugins.
 * Call once in the root page component.
 */
export function useCapacitorLifecycle(options?: {
  onNotificationTap?: (data: Record<string, unknown>) => void;
  onResume?: () => void;
  uid?: string | null;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isNative() || initialized.current) return;
    initialized.current = true;

    const cleanups: (() => void)[] = [];

    async function init() {
      // 1. Hide splash screen after app loads
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch {}

      // 2. Configure status bar
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#05030f' });
      } catch {}

      // 3. Setup Android back button
      try {
        const { setupBackButton } = await import('@/lib/capacitor/app-lifecycle');
        const cleanup = setupBackButton(() => {
          // When there's no history to go back to, minimize the app
          import('@capacitor/app').then(({ App }) => App.minimizeApp()).catch(() => {});
        });
        cleanups.push(cleanup);
      } catch {}

      // 4. Setup app state listener (resume/pause)
      try {
        const { setupAppStateListener } = await import('@/lib/capacitor/app-lifecycle');
        const cleanup = setupAppStateListener(
          () => options?.onResume?.(),
        );
        cleanups.push(cleanup);
      } catch {}

      // 5. Register push notifications (only if user is logged in)
      if (options?.uid) {
        try {
          const { registerPush, setupPushListeners } = await import('@/lib/capacitor/push-notifications');
          const token = await registerPush();
          if (token) {
            // Save FCM token to Firestore
            const { saveFcmToken } = await import('@/lib/firebase/firestore');
            await saveFcmToken(options.uid, token).catch(() => {});
          }
          setupPushListeners({
            onNotificationAction: options?.onNotificationTap,
          });
          cleanups.push(() => {
            import('@/lib/capacitor/push-notifications')
              .then(({ removePushListeners }) => removePushListeners())
              .catch(() => {});
          });
        } catch {}
      }
    }

    init();

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [options?.uid, options?.onResume, options?.onNotificationTap]);
}
