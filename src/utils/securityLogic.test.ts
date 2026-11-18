/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateSecurityScore,
  generateSessionToken,
  verifySecurityPin,
  validateTwoFactorCode,
} from './securityLogic.ts';
import { UserSecuritySettings } from '../types/index.ts';

test('calculateSecurityScore should scale according to enabled protections', () => {
  const baseSettings: UserSecuritySettings = {
    biometricsEnabled: false,
    twoFactorEnabled: false,
    securityPin: '123456',
    isAppLockActive: false,
    lastLoginDevice: 'Android 14',
    lastLoginIp: '192.168.1.1',
    lastLoginTimestamp: '2026-11-03T10:00:00Z',
    sessionToken: 'token-123',
    securityScore: 40,
    failedAttempts: 0,
  };

  const baseScore = calculateSecurityScore(baseSettings);
  assert.strictEqual(baseScore, 40);

  const advancedSettings: UserSecuritySettings = {
    ...baseSettings,
    biometricsEnabled: true,
    twoFactorEnabled: true,
    securityPin: '984521',
  };

  const advancedScore = calculateSecurityScore(advancedSettings);
  assert.strictEqual(advancedScore, 100);
});

test('generateSessionToken should generate valid token with prefix', () => {
  const token = generateSessionToken('armando.57.tb@gmail.com');
  assert.ok(token.startsWith('yr_sec_'));
  assert.ok(token.length > 15);
});

test('verifySecurityPin should accurately check input', () => {
  assert.strictEqual(verifySecurityPin('554433', '554433'), true);
  assert.strictEqual(verifySecurityPin('000000', '554433'), false);
  assert.strictEqual(verifySecurityPin('', '554433'), false);
});

test('validateTwoFactorCode should check 6 digits', () => {
  assert.strictEqual(validateTwoFactorCode('123456').valid, true);
  assert.strictEqual(validateTwoFactorCode('123').valid, false);
  assert.strictEqual(validateTwoFactorCode('abcdef').valid, false);
});
