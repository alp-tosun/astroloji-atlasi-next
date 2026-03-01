import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { isNative } from './platform';

/** Log a custom event. */
export async function logEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseAnalytics.logEvent({ name, params: params || {} });
  } catch {
    // Silently fail — analytics should never block UI
  }
}

/** Log a screen view. */
export async function logScreenView(screenName: string): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseAnalytics.logEvent({
      name: 'screen_view',
      params: { screen_name: screenName },
    });
  } catch {}
}

/** Set user ID for analytics. */
export async function setAnalyticsUserId(userId: string): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseAnalytics.setUserId({ userId });
  } catch {}
}

/** Set user property. */
export async function setUserProperty(
  key: string,
  value: string,
): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseAnalytics.setUserProperty({ key, value });
  } catch {}
}

/** Enable/disable analytics collection. */
export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseAnalytics.setEnabled({ enabled });
  } catch {}
}
