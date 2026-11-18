import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeCloudProfileState,
  buildFirebaseGoogleProfile,
} from './cloudAuthLogic';
import { UserProfile, UserSecuritySettings } from '../types';

const SECURITY_TEMPLATE: UserSecuritySettings = {
  biometricsEnabled: false,
  twoFactorEnabled: false,
  securityPin: '123456',
  isAppLockActive: true,
  lastLoginDevice: 'Android 14',
  lastLoginIp: '127.0.0.1',
  lastLoginTimestamp: '2026-11-17T00:00:00Z',
  sessionToken: 'token',
  securityScore: 85,
  failedAttempts: 0,
};

test('buildFirebaseGoogleProfile constructs a Firebase-backed Google profile cleanly', () => {
  const profile = buildFirebaseGoogleProfile({
    uid: 'firebase_uid_9912',
    displayName: 'María Chimbo',
    email: 'MARIA.CHIMBO@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/avatar.png',
    securityTemplate: SECURITY_TEMPLATE,
  });

  assert.equal(profile.id, 'cloud-firebase_uid_9912');
  assert.equal(profile.cloudUid, 'firebase_uid_9912');
  assert.equal(profile.cloudProvider, 'google');
  assert.equal(profile.email, 'maria.chimbo@gmail.com');
  assert.equal(profile.username, 'maria.chimbo');
  assert.equal(profile.avatarType, 'custom');
  assert.equal(profile.currentLanguage, 'kichwa');
});

test('mergeCloudProfileState preserves XP, lessons, certificates, and adUnlockedMythIds across devices', () => {
  const localAcc: UserProfile = buildFirebaseGoogleProfile({
    uid: 'uid-sync-1',
    displayName: 'Estudiante Cloud',
    email: 'est@gmail.com',
    securityTemplate: SECURITY_TEMPLATE,
  });
  localAcc.xp = 150;
  localAcc.completedLessonIds = ['kichwa-101'];
  localAcc.adUnlockedMythIds = ['myth-dama-tapada'];

  const merged = mergeCloudProfileState(localAcc, {
    xp: 320,
    chakanas: 90,
    completedLessonIds: ['kichwa-101', 'kichwa-102', 'tsafiki-101'],
    adUnlockedMythIds: ['leyenda-casa-1028'],
  });

  assert.equal(merged.xp, 320);
  assert.equal(merged.chakanas, 90);
  assert.deepEqual(merged.completedLessonIds, ['kichwa-101', 'kichwa-102', 'tsafiki-101']);
  assert.deepEqual(merged.adUnlockedMythIds, ['myth-dama-tapada', 'leyenda-casa-1028']);
});
