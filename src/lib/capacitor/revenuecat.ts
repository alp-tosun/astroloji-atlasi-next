import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { isNative, isIOS } from './platform';

const IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || '';
const ANDROID_KEY = process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || '';

let initialized = false;

/** Initialize RevenueCat SDK. Call once after user login. */
export async function initRevenueCat(userId?: string): Promise<void> {
  if (!isNative() || initialized) return;

  const apiKey = isIOS() ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn('[RevenueCat] API key not set for this platform');
    return;
  }

  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey, appUserID: userId || undefined });
  initialized = true;
}

/** Identify user (call on login). */
export async function identifyUser(userId: string): Promise<void> {
  if (!isNative() || !initialized) return;
  await Purchases.logIn({ appUserID: userId });
}

/** Log out user (call on sign out). */
export async function logOutRevenueCat(): Promise<void> {
  if (!isNative() || !initialized) return;
  await Purchases.logOut();
}

/** Check if user has active premium entitlement. */
export async function checkPremiumStatus(): Promise<boolean> {
  if (!isNative() || !initialized) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

/** Get available subscription packages. */
export async function getOfferings() {
  if (!isNative() || !initialized) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

/** Purchase a package. Returns true on success. */
export async function purchasePackage(packageToPurchase: { identifier: string; offeringIdentifier: string }): Promise<boolean> {
  if (!isNative() || !initialized) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase as never,
    });
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

/** Restore previous purchases. Returns true if premium is active. */
export async function restorePurchases(): Promise<boolean> {
  if (!isNative() || !initialized) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}
