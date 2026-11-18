import { UserProfile, UserSecuritySettings } from '../types';
import { formatLocalDateKey, mergeDailyXpHistory } from './profileStatsLogic';

/**
 * Merges a cached snapshot with Firestore cloud data so no progress, XP,
 * certificates, saved myths, or ad-unlocked videos are ever lost.
 */
export function mergeCloudProfileState(
  localAcc: UserProfile,
  cloudPatch: Partial<UserProfile>
): UserProfile {
  const completedSet = new Set([
    ...(localAcc.completedLessonIds || []),
    ...(cloudPatch.completedLessonIds || []),
  ]);
  const savedMythsSet = new Set([
    ...(localAcc.savedMythIds || []),
    ...(cloudPatch.savedMythIds || []),
  ]);
  const adUnlockedSet = new Set([
    ...(localAcc.adUnlockedMythIds || []),
    ...(cloudPatch.adUnlockedMythIds || []),
  ]);

  const mergedCerts = [...(localAcc.certificates || [])];
  for (const c of cloudPatch.certificates || []) {
    if (!mergedCerts.some(existing => existing.id === c.id)) {
      mergedCerts.push(c);
    }
  }

  return {
    ...localAcc,
    ...cloudPatch,
    xp: Math.max(localAcc.xp || 0, cloudPatch.xp || 0),
    dailyXpHistory: mergeDailyXpHistory(localAcc.dailyXpHistory, cloudPatch.dailyXpHistory),
    chakanas: Math.max(localAcc.chakanas || 0, cloudPatch.chakanas || 0),
    streakDays: Math.max(localAcc.streakDays || 1, cloudPatch.streakDays || 1),
    isPro: Boolean(localAcc.isPro || cloudPatch.isPro),
    completedLessonIds: Array.from(completedSet),
    savedMythIds: Array.from(savedMythsSet),
    adUnlockedMythIds: Array.from(adUnlockedSet),
    languageLevels: {
      ...(localAcc.languageLevels || {}),
      ...(cloudPatch.languageLevels || {}),
    },
    certificates: mergedCerts,
    lastCloudSyncAt: cloudPatch.lastCloudSyncAt || new Date().toISOString(),
  };
}

/**
 * Builds a clean UserProfile strictly from an authenticated Firebase Google user.
 */
export function buildFirebaseGoogleProfile(params: {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  securityTemplate: UserSecuritySettings;
}): UserProfile {
  const nowIso = new Date().toISOString();
  const cleanEmail = (params.email || '').trim().toLowerCase();
  const derivedUsername = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : 'google_user';

  return {
    id: `cloud-${params.uid}`,
    displayName: params.displayName.trim() || derivedUsername || 'Usuario Google',
    username: derivedUsername,
    email: cleanEmail,
    avatarUrl: params.photoURL || '',
    avatarType: params.photoURL ? 'custom' : 'initial',
    accountCategory: 'primary',
    accountLabel: 'Cuenta Google',
    cloudUid: params.uid,
    cloudProvider: 'google',
    lastCloudSyncAt: nowIso,
    streakDays: 1,
    xp: 50,
    dailyXpHistory: { [formatLocalDateKey()]: 50 },
    chakanas: 20,
    currentLanguage: 'kichwa',
    languageLevels: {},
    isPro: false,
    completedLessonIds: [],
    savedMythIds: ['myth-cantuna'],
    adUnlockedMythIds: [],
    certificates: [],
    chessStats: {
      elo: 1200,
      wins: 0,
      draws: 0,
      losses: 0,
    },
    security: {
      ...params.securityTemplate,
      lastLoginTimestamp: nowIso,
      sessionToken: `yr_firebase_${params.uid.slice(0, 8)}`,
    },
  };
}
