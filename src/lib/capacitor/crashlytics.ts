import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { isNative } from './platform';

/** Record a non-fatal error. */
export async function recordError(error: Error, context?: string): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseCrashlytics.recordException({
      message: `${context ? `[${context}] ` : ''}${error.message}`,
    });
  } catch {}
}

/** Set the user ID for crash reports. */
export async function setCrashlyticsUserId(userId: string): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseCrashlytics.setUserId({ userId });
  } catch {}
}

/** Add a custom log line to crash reports. */
export async function crashLog(message: string): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseCrashlytics.log({ message });
  } catch {}
}

/** Enable/disable crashlytics collection. */
export async function setCrashlyticsEnabled(enabled: boolean): Promise<void> {
  if (!isNative()) return;
  try {
    await FirebaseCrashlytics.setEnabled({ enabled });
  } catch {}
}
