import { getMessaging } from 'firebase-admin/messaging';

/** Send a push notification to a specific device token. */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<boolean> {
  try {
    await getMessaging().send({
      token,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: { channelId: 'default' },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
    });
    return true;
  } catch (error) {
    console.error('[Push] Send error:', error);
    return false;
  }
}

/** Send push to all tokens of a user. */
export async function sendPushToUser(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (tokens.length === 0) return;

  await Promise.allSettled(
    tokens.map((token) => sendPushNotification(token, title, body, data)),
  );
}
