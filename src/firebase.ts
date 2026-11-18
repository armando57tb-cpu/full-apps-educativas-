import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CertificateData, LearningLevel, LanguageCode, UserProfile } from './types';
import { pruneDailyXpHistory } from './utils/profileStatsLogic';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Permission denied on /test/connection when signed out still confirms server reachability
    return true;
  }
}

void testConnection();

export { onAuthStateChanged };
export type { FirebaseUser };

export async function signInWithGoogleCloud(): Promise<FirebaseUser> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutFirebaseCloud(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // ignore signout error if not currently signed into Firebase Auth
  }
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'user_default';
}

export async function syncProfileToCloudFirestore(profile: UserProfile): Promise<boolean> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) {
    return false;
  }

  const uid = sanitizeId(fbUser.uid);
  const rootPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/cloudState`;

  const rootRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'cloudState');

  try {
    const existingSnap = await getDoc(rootRef);
    const rootPayload = {
      uid,
      displayName: (profile.displayName || 'Estudiante Yachay').slice(0, 100),
      accountCategory: profile.accountCategory || 'primary',
      accountLabel: (profile.accountLabel || 'Cuenta Google').slice(0, 60),
      streakDays: Math.max(0, Number(profile.streakDays) || 0),
      xp: Math.max(0, Number(profile.xp) || 0),
      chakanas: Math.max(0, Number(profile.chakanas) || 0),
      currentLanguage: profile.currentLanguage || 'kichwa',
      isPro: Boolean(profile.isPro),
      updatedAt: serverTimestamp(),
    };

    if (!existingSnap.exists()) {
      await setDoc(rootRef, {
        ...rootPayload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(rootRef, rootPayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, rootPath);
  }

  try {
    const privatePayload = {
      ownerUid: uid,
      email: (profile.email || fbUser.email || 'usuario@gmail.com').slice(0, 160),
      username: (profile.username || profile.displayName || 'estudiante').slice(0, 80),
      completedLessonIds: (profile.completedLessonIds || []).slice(0, 200),
      savedMythIds: (profile.savedMythIds || []).slice(0, 100),
      adUnlockedMythIds: (profile.adUnlockedMythIds || []).slice(0, 100),
      languageLevels: profile.languageLevels || {},
      dailyXpHistory: pruneDailyXpHistory(profile.dailyXpHistory, 30),
      chessStats: {
        elo: Number(profile.chessStats?.elo) || 1200,
        wins: Number(profile.chessStats?.wins) || 0,
        draws: Number(profile.chessStats?.draws) || 0,
        losses: Number(profile.chessStats?.losses) || 0,
      },
      updatedAt: serverTimestamp(),
    };

    const existingPrivate = await getDoc(privateRef);
    if (!existingPrivate.exists()) {
      await setDoc(privateRef, privatePayload);
    } else {
      await updateDoc(privateRef, privatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }

  for (const cert of profile.certificates.slice(0, 20)) {
    const certId = sanitizeId(cert.id);
    const certPath = `users/${uid}/certificates/${certId}`;
    try {
      const certRef = doc(db, 'users', uid, 'certificates', certId);
      const certSnap = await getDoc(certRef);
      if (!certSnap.exists()) {
        await setDoc(certRef, {
          id: certId,
          ownerUid: uid,
          studentName: cert.studentName.slice(0, 120),
          language: cert.language.slice(0, 100),
          languageCode: cert.languageCode,
          level: cert.level.slice(0, 80),
          issueDate: cert.issueDate.slice(0, 40),
          verificationCode: cert.verificationCode.slice(0, 64),
          grade: (cert.grade || 'Aprobado').slice(0, 40),
          accreditedBy: (cert.accreditedBy || 'Yachay & Raíces').slice(0, 120),
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, certPath);
    }
  }

  return true;
}

export async function loadProfileFromCloudFirestore(
  fbUser: FirebaseUser
): Promise<Partial<UserProfile> | null> {
  if (!fbUser.emailVerified) return null;
  const uid = sanitizeId(fbUser.uid);
  const rootPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/cloudState`;
  const certsPath = `users/${uid}/certificates`;

  let rootData: Record<string, any> | null = null;
  let privateData: Record<string, any> | null = null;
  const certs: CertificateData[] = [];

  try {
    const rootSnap = await getDoc(doc(db, 'users', uid));
    if (rootSnap.exists()) {
      rootData = rootSnap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, rootPath);
  }

  if (!rootData) return null;

  try {
    const privSnap = await getDoc(doc(db, 'users', uid, 'private', 'cloudState'));
    if (privSnap.exists()) {
      privateData = privSnap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath);
  }

  try {
    const certsSnap = await getDocs(collection(db, 'users', uid, 'certificates'));
    certsSnap.forEach(docSnap => {
      const c = docSnap.data();
      certs.push({
        id: c.id,
        studentName: c.studentName,
        language: c.language,
        languageCode: c.languageCode as LanguageCode,
        level: c.level,
        issueDate: c.issueDate,
        verificationCode: c.verificationCode,
        grade: c.grade || 'Aprobado',
        accreditedBy: c.accreditedBy || 'Yachay & Raíces',
        qrPayload: `YACHAY-CERT|${c.verificationCode}|${c.languageCode}|${c.level}`,
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, certsPath);
  }

  return {
    cloudUid: uid,
    cloudProvider: 'google',
    displayName: rootData.displayName || fbUser.displayName || 'Estudiante Google',
    email: privateData?.email || fbUser.email || '',
    username: privateData?.username || fbUser.displayName || '',
    avatarUrl: fbUser.photoURL || '',
    avatarType: fbUser.photoURL ? 'custom' : 'initial',
    accountCategory: rootData.accountCategory || 'primary',
    accountLabel: rootData.accountLabel || 'Cuenta Google',
    streakDays: Number(rootData.streakDays) || 1,
    xp: Number(rootData.xp) || 0,
    chakanas: Number(rootData.chakanas) || 0,
    currentLanguage: (rootData.currentLanguage as LanguageCode) || 'kichwa',
    isPro: Boolean(rootData.isPro),
    completedLessonIds: Array.isArray(privateData?.completedLessonIds)
      ? privateData.completedLessonIds
      : [],
    savedMythIds: Array.isArray(privateData?.savedMythIds) ? privateData.savedMythIds : [],
    adUnlockedMythIds: Array.isArray(privateData?.adUnlockedMythIds)
      ? privateData.adUnlockedMythIds
      : [],
    languageLevels: (privateData?.languageLevels || {}) as Partial<Record<LanguageCode, LearningLevel>>,
    dailyXpHistory: pruneDailyXpHistory(privateData?.dailyXpHistory, 30),
    chessStats: privateData?.chessStats || { elo: 1200, wins: 0, draws: 0, losses: 0 },
    certificates: certs,
    lastCloudSyncAt: new Date().toISOString(),
  };
}
