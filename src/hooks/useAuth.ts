'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '@/lib/firebase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';
import { getProfile } from '@/lib/firebase/firestore';
import { isNative } from '@/lib/capacitor/platform';
import { initRevenueCat, identifyUser, logOutRevenueCat } from '@/lib/capacitor/revenuecat';
import { setAnalyticsUserId } from '@/lib/capacitor/analytics';
import { setCrashlyticsUserId } from '@/lib/capacitor/crashlytics';

export function useAuth() {
  const { user, loading, setUser } = useAuthStore();

  useEffect(() => {
    // Handle redirect result for native platforms
    if (isNative()) {
      getRedirectResult(auth).catch(() => {});
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Load profile from Firestore if available
        try {
          const fbProfile = await getProfile(firebaseUser.uid);
          if (fbProfile) {
            useProfileStore.getState().setProfile(fbProfile);
            useProfileStore.getState().saveToStorage();
          }
        } catch {
          // silently fail
        }
        // Initialize native services
        if (isNative()) {
          initRevenueCat(firebaseUser.uid).then(() => {
            identifyUser(firebaseUser.uid);
          }).catch(() => {});
          setAnalyticsUserId(firebaseUser.uid).catch(() => {});
          setCrashlyticsUserId(firebaseUser.uid).catch(() => {});
        }
      }
    });
    return unsub;
  }, [setUser]);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    // signInWithPopup doesn't work in Capacitor WebView, use redirect instead
    if (isNative()) {
      return signInWithRedirect(auth, googleProvider);
    }
    return signInWithPopup(auth, googleProvider);
  };

  const signInWithApple = async () => {
    if (isNative()) {
      return signInWithRedirect(auth, appleProvider);
    }
    return signInWithPopup(auth, appleProvider);
  };

  const logOut = async () => {
    if (isNative()) {
      await logOutRevenueCat().catch(() => {});
    }
    return signOut(auth);
  };

  return { user, loading, signIn, signUp, signInWithGoogle, signInWithApple, logOut };
}
