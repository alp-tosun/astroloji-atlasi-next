import { App } from '@capacitor/app';
import { isNative } from './platform';

/** Set up Android back button handler. Returns cleanup function. */
export function setupBackButton(onBack: () => void): () => void {
  if (!isNative()) return () => {};

  const listener = App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      onBack();
    }
  });

  return () => {
    listener.then((l) => l.remove());
  };
}

/** Set up app state change listener (foreground/background). */
export function setupAppStateListener(
  onResume: () => void,
  onPause?: () => void,
): () => void {
  if (!isNative()) return () => {};

  const listener = App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      onResume();
    } else {
      onPause?.();
    }
  });

  return () => {
    listener.then((l) => l.remove());
  };
}
