import { PushNotifications } from '@capacitor/push-notifications';
import { isNative } from './platform';

/** Register for push notifications and return the FCM token. */
export async function registerPush(): Promise<string | null> {
  if (!isNative()) return null;

  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== 'granted') {
    console.warn('[Push] Permission denied');
    return null;
  }

  await PushNotifications.register();

  return new Promise((resolve) => {
    PushNotifications.addListener('registration', (token) => {
      resolve(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Registration error:', err);
      resolve(null);
    });
  });
}

/** Set up notification received/action listeners. */
export function setupPushListeners(options?: {
  onNotificationReceived?: (title: string, body: string) => void;
  onNotificationAction?: (data: Record<string, unknown>) => void;
}) {
  if (!isNative()) return;

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    options?.onNotificationReceived?.(
      notification.title || '',
      notification.body || '',
    );
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    options?.onNotificationAction?.(action.notification.data || {});
  });
}

/** Remove all listeners (call on unmount). */
export async function removePushListeners() {
  if (!isNative()) return;
  await PushNotifications.removeAllListeners();
}
