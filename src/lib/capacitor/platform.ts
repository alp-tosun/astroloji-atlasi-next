import { Capacitor } from '@capacitor/core';

/** Returns true when running inside a native Capacitor shell (iOS/Android). */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Returns true when running on iOS (native). */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/** Returns true when running on Android (native). */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/** Returns the current platform: 'ios' | 'android' | 'web'. */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
