// Client-safe — tarayıcıda çalışır, Admin SDK import etmez
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './client';
import type { Profile } from '@/types/profile';
import type { AnalysisResult } from '@/types/analysis';

export async function saveProfile(uid: string, profil: Profile) {
  await setDoc(
    doc(db, 'users', uid),
    { profil, guncelleme: new Date().toISOString() },
    { merge: true },
  );
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data().profil ?? null;
}

export async function setOnboardingComplete(uid: string) {
  await setDoc(
    doc(db, 'users', uid),
    { onboardingCompleted: true },
    { merge: true },
  );
}

export async function getOnboardingStatus(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return false;
  return snap.data().onboardingCompleted === true;
}

export interface StreakData {
  streak: number;
  lastActiveDate: string;
  longestStreak: number;
  totalAnalyses: number;
  badges: string[];
}

export async function getStreakData(uid: string): Promise<StreakData> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { streak: 0, lastActiveDate: '', longestStreak: 0, totalAnalyses: 0, badges: [] };
  const d = snap.data();
  return {
    streak: d.streak || 0,
    lastActiveDate: d.lastActiveDate || '',
    longestStreak: d.longestStreak || 0,
    totalAnalyses: d.totalAnalyses || 0,
    badges: d.badges || [],
  };
}

export async function getAnalyses(uid: string): Promise<AnalysisResult[]> {
  const q = query(
    collection(db, 'users', uid, 'analizler'),
    orderBy('tarih', 'desc'),
    limit(20),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnalysisResult));
}

export async function deleteAnalysis(uid: string, analysisId: string) {
  await deleteDoc(doc(db, 'users', uid, 'analizler', analysisId));
}

export async function saveFcmToken(uid: string, token: string) {
  await setDoc(
    doc(db, 'users', uid, 'fcmTokens', token),
    { token, updatedAt: new Date().toISOString() },
  );
}

export async function deleteAllAnalyses(uid: string) {
  const q = query(collection(db, 'users', uid, 'analizler'));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
