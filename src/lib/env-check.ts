/**
 * Server-side environment variable validation.
 * Import this in instrumentation.ts or layout.tsx to fail fast on missing vars.
 */

const REQUIRED_SERVER_VARS = [
  'OPENAI_API_KEY',
] as const;

const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
] as const;

const OPTIONAL_VARS = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'IPGEO_API_KEY',
  'NEXT_PUBLIC_REVENUECAT_IOS_KEY',
  'NEXT_PUBLIC_REVENUECAT_ANDROID_KEY',
  'REVENUECAT_WEBHOOK_AUTH_KEY',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of REQUIRED_PUBLIC_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) warnings.push(key);
  }

  if (warnings.length > 0) {
    console.warn(`[env-check] Optional env vars not set: ${warnings.join(', ')}`);
  }

  if (missing.length > 0) {
    const msg = `[env-check] Missing required env vars: ${missing.join(', ')}`;
    console.error(msg);
    throw new Error(msg);
  }
}
