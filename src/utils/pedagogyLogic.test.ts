import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  normalizeIndigenousPhonetics,
  levenshteinDistance,
  calculateSpeechSimilarity,
  evaluateBestSpeechAlternative,
  validateSentenceOrder,
  generateCertificate,
  checkFreemiumAccess,
  getStartingDayForLevel,
  evaluateDailyNodeStatus,
  getPathProgressSummary,
  hasConsistentSkillOrder,
} from './pedagogyLogic';
import { LESSONS_DATABASE } from '../data/languages';

test('normalizeText handles accents and punctuation correctly', () => {
  assert.equal(normalizeText('¡Alli puncha, mashi!'), 'alli puncha mashi');
  assert.equal(normalizeText('¿Ima shuti kanki?'), 'ima shuti kanki');
});

test('normalizeIndigenousPhonetics reconciles Spanish STT with Kichwa/Shuar orthography', () => {
  assert.equal(normalizeIndigenousPhonetics('Alí puncha'), normalizeIndigenousPhonetics('Alli puncha'));
  assert.equal(normalizeIndigenousPhonetics('Sumac causai'), normalizeIndigenousPhonetics('Sumak kawsay'));
  assert.equal(normalizeIndigenousPhonetics('Gui pujajai'), normalizeIndigenousPhonetics('Wíi pujajai'));
  assert.equal(normalizeIndigenousPhonetics('Nuncui'), normalizeIndigenousPhonetics('Nunkui'));
});

test('levenshteinDistance calculates correct edit distance', () => {
  assert.equal(levenshteinDistance('kichwa', 'kichwa'), 0);
  assert.equal(levenshteinDistance('shuar', 'shuar'), 0);
  assert.equal(levenshteinDistance('puncha', 'pundha'), 1);
});

test('calculateSpeechSimilarity grades native pronunciation accurately and provides word feedback', () => {
  const perfect = calculateSpeechSimilarity('Alli puncha', 'Alli puncha');
  assert.equal(perfect.passed, true);
  assert.equal(perfect.accuracy, 100);
  assert.equal(perfect.wordFeedback?.length, 2);
  assert.equal(perfect.wordFeedback?.every(w => w.matched), true);

  const phoneticMatch = calculateSpeechSimilarity('Alí puncha', 'Alli puncha');
  assert.equal(phoneticMatch.passed, true);
  assert.ok(phoneticMatch.accuracy >= 90);
  assert.equal(phoneticMatch.phoneticMatch, true);

  const acceptableVariant = calculateSpeechSimilarity('alli chishi', 'Alli tuta', ['alli chishi']);
  assert.equal(acceptableVariant.passed, true);
  assert.equal(acceptableVariant.accuracy, 100);

  const partial = calculateSpeechSimilarity('alli punsha', 'Alli puncha');
  assert.equal(partial.passed, true);
  assert.ok(partial.accuracy >= 70);

  const poor = calculateSpeechSimilarity('hola buenos dias', 'Alli puncha');
  assert.equal(poor.passed, false);
  assert.ok(poor.wordFeedback?.some(w => !w.matched));
});

test('evaluateBestSpeechAlternative selects highest scoring STT hypothesis', () => {
  const result = evaluateBestSpeechAlternative(
    ['buenos dias', 'alí puncha', 'ali poncha'],
    'Alli puncha',
    ['Ali puncha']
  );
  assert.equal(result.passed, true);
  assert.ok(result.accuracy >= 95);
  assert.equal(result.matchedTranscript, 'alí puncha');
});

test('validateSentenceOrder validates correct token sequences', () => {
  const target = ['Ñuka', 'shuti', 'kanmi', 'Inti'];
  assert.equal(validateSentenceOrder(['Ñuka', 'shuti', 'kanmi', 'Inti'], target), true);
  assert.equal(validateSentenceOrder(['shuti', 'Ñuka', 'kanmi', 'Inti'], target), false);
  assert.equal(validateSentenceOrder(['Ñuka', 'shuti'], target), false);
});

test('generateCertificate creates unique verification codes', () => {
  const cert = generateCertificate('Armando TB', 'Kichwa Unificado', 'kichwa', 'Principiante A1');
  assert.ok(cert.verificationCode.startsWith('YACHAY-KICHWA-'));
  assert.equal(cert.studentName, 'Armando TB');
  assert.ok(cert.qrPayload.includes(cert.verificationCode));
});

test('checkFreemiumAccess properly restricts pro features on free tier', () => {
  const freeLessonL1 = checkFreemiumAccess(false, 'lesson', 'principiante');
  assert.equal(freeLessonL1.allowed, true);

  const freeLessonL2 = checkFreemiumAccess(false, 'lesson', 'intermedio');
  assert.equal(freeLessonL2.allowed, false);

  const freePvP = checkFreemiumAccess(false, 'chess_pvp');
  assert.equal(freePvP.allowed, false);

  const proLessonL2 = checkFreemiumAccess(true, 'lesson', 'intermedio');
  assert.equal(proLessonL2.allowed, true);

  const proPvP = checkFreemiumAccess(true, 'chess_pvp');
  assert.equal(proPvP.allowed, true);
});

test('daily learning path starts at chosen level and unlocks sequentially', () => {
  assert.equal(getStartingDayForLevel('principiante'), 1);
  assert.equal(getStartingDayForLevel('intermedio'), 3);
  assert.equal(getStartingDayForLevel('avanzado'), 5);

  const lessons = LESSONS_DATABASE.kichwa;

  // Beginner starts at Day 1 active, Day 2 locked
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[0],
      allLessons: lessons,
      completedLessonIds: [],
      selectedLevel: 'principiante',
      isPro: false,
    }),
    'active'
  );
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[1],
      allLessons: lessons,
      completedLessonIds: [],
      selectedLevel: 'principiante',
      isPro: false,
    }),
    'locked'
  );

  // Completing Day 1 unlocks Day 2
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[1],
      allLessons: lessons,
      completedLessonIds: [lessons[0].id],
      selectedLevel: 'principiante',
      isPro: false,
    }),
    'active'
  );

  // Intermediate skips Days 1-2 and starts active on Day 3
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[0],
      allLessons: lessons,
      completedLessonIds: [],
      selectedLevel: 'intermedio',
      isPro: false,
    }),
    'skipped'
  );
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[2],
      allLessons: lessons,
      completedLessonIds: [],
      selectedLevel: 'intermedio',
      isPro: false,
    }),
    'active'
  );
  // Once Day 3 is completed on free tier, Day 4 asks for Pro unlock
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[3],
      allLessons: lessons,
      completedLessonIds: [lessons[2].id],
      selectedLevel: 'intermedio',
      isPro: false,
    }),
    'pro_locked'
  );
  // Pro tier unlocks Day 4 immediately after Day 3
  assert.equal(
    evaluateDailyNodeStatus({
      lesson: lessons[3],
      allLessons: lessons,
      completedLessonIds: [lessons[2].id],
      selectedLevel: 'intermedio',
      isPro: true,
    }),
    'active'
  );

  const summary = getPathProgressSummary(lessons, [], 'intermedio');
  assert.equal(summary.totalDays, 5);
  assert.equal(summary.completedOrSkippedDays, 2);
  assert.equal(summary.nextRecommendedDay, 3);
});

test('every language module across catalog has 5 daily lessons in listening -> writing -> speaking order', () => {
  for (const lang of [
    'kichwa',
    'shuar',
    'achuar',
    'tsafiki',
    'chapalaa',
    'awapit',
    'en',
    'fr',
  ] as const) {
    const lessons = LESSONS_DATABASE[lang];
    assert.equal(lessons.length, 5, `Expected 5 daily lessons for ${lang}`);
    lessons.forEach((lesson, index) => {
      assert.equal(lesson.dayNumber, index + 1);
      assert.equal(
        hasConsistentSkillOrder(lesson),
        true,
        `Lesson ${lesson.id} must follow listening -> writing -> speaking`
      );
    });
  }
});
