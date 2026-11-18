import { CertificateData, LanguageCode, SpeechEvaluationResult, WordPronunciationFeedback } from '../types';

/**
 * Normalizes text for audio comparison (removes punctuation, lowercases, trims whitespace)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Applies Kichwa and Shuar phonetic normalization to reconcile Ecuadorian Spanish
 * Speech-to-Text transcriptions with indigenous orthography (e.g. c/qu -> k, hu/gu -> w, au -> aw, ai -> ay).
 */
export function normalizeIndigenousPhonetics(text: string): string {
  let norm = normalizeText(text);
  if (!norm) return '';

  norm = norm
    .replace(/qu([ei])/g, 'k$1')
    .replace(/c([aou])/g, 'k$1')
    .replace(/c\b/g, 'k')
    .replace(/hu([aeiou])/g, 'w$1')
    .replace(/gu([aei])/g, 'w$1')
    .replace(/z/g, 's')
    .replace(/au/g, 'aw')
    .replace(/ai/g, 'ay')
    .replace(/ui/g, 'uy')
    .replace(/([a-z])\1+/g, '$1'); // collapse repeated vowels/consonants (ii->i, ll->l)

  return norm;
}

/**
 * Calculates Levenshtein Distance between two normalized strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,      // deletion
        matrix[j][i - 1] + 1,      // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[bn][an];
}

/**
 * Computes word-by-word pronunciation match feedback
 */
function buildWordFeedback(spoken: string, target: string): WordPronunciationFeedback[] {
  const targetWords = target.split(/\s+/).filter(Boolean);
  const spokenWords = spoken.split(/\s+/).filter(Boolean);

  return targetWords.map((expectedWord, idx) => {
    const targetPhonetic = normalizeIndigenousPhonetics(expectedWord);
    if (!targetPhonetic) {
      return { expected: expectedWord, matched: false, similarity: 0 };
    }

    let bestWordScore = 0;
    // Check positional match and neighbor words in case of STT word splitting
    const candidateWindow = spokenWords.length > 0 ? spokenWords : [];
    for (let j = 0; j < candidateWindow.length; j++) {
      const spokenPhonetic = normalizeIndigenousPhonetics(candidateWindow[j]);
      if (!spokenPhonetic) continue;
      if (spokenPhonetic === targetPhonetic) {
        bestWordScore = 100;
        break;
      }
      const maxLen = Math.max(spokenPhonetic.length, targetPhonetic.length);
      const dist = levenshteinDistance(spokenPhonetic, targetPhonetic);
      const sim = Math.max(0, Math.round((1 - dist / maxLen) * 100));
      // Slight preference for matching word order
      const orderBonus = j === idx ? 5 : 0;
      const adjusted = Math.min(100, sim + orderBonus);
      if (adjusted > bestWordScore) {
        bestWordScore = adjusted;
      }
    }

    return {
      expected: expectedWord,
      matched: bestWordScore >= 70,
      similarity: bestWordScore,
    };
  });
}

/**
 * Evaluates speech recognition accuracy against expected phrase and Kichwa/Shuar phonetic variants
 */
export function calculateSpeechSimilarity(
  spokenText: string,
  targetPhrase: string,
  acceptableVariants: string[] = [],
  minAccuracyScore: number = 70
): SpeechEvaluationResult {
  const normSpoken = normalizeText(spokenText);
  const phoneticSpoken = normalizeIndigenousPhonetics(spokenText);
  const rawCandidates = [targetPhrase, ...acceptableVariants];

  if (!normSpoken) {
    return {
      accuracy: 0,
      passed: false,
      feedback: 'No se detectó audio claro. Intenta hablar más cerca del micrófono.',
      matchedTranscript: spokenText,
      phoneticMatch: false,
      wordFeedback: buildWordFeedback('', targetPhrase),
    };
  }

  let highestAccuracy = 0;
  let usedPhoneticMatch = false;

  for (const rawCandidate of rawCandidates) {
    const candidate = normalizeText(rawCandidate);
    if (!candidate) continue;

    if (candidate === normSpoken) {
      highestAccuracy = 100;
      usedPhoneticMatch = false;
      break;
    }

    const phoneticCandidate = normalizeIndigenousPhonetics(rawCandidate);
    if (phoneticCandidate && phoneticCandidate === phoneticSpoken) {
      const phoneticScore = 96;
      if (phoneticScore > highestAccuracy) {
        highestAccuracy = phoneticScore;
        usedPhoneticMatch = true;
      }
      continue;
    }

    const maxLenNorm = Math.max(normSpoken.length, candidate.length);
    const normScore =
      maxLenNorm > 0
        ? Math.max(0, Math.round((1 - levenshteinDistance(normSpoken, candidate) / maxLenNorm) * 100))
        : 0;

    const maxLenPhon = Math.max(phoneticSpoken.length, phoneticCandidate.length);
    const phonScore =
      maxLenPhon > 0
        ? Math.max(
            0,
            Math.round(
              (1 - levenshteinDistance(phoneticSpoken, phoneticCandidate) / maxLenPhon) * 100
            )
          )
        : 0;

    if (phonScore > normScore && phonScore > highestAccuracy) {
      highestAccuracy = phonScore;
      usedPhoneticMatch = true;
    } else if (normScore > highestAccuracy) {
      highestAccuracy = normScore;
      usedPhoneticMatch = false;
    }
  }

  const passed = highestAccuracy >= minAccuracyScore;
  const wordFeedback = buildWordFeedback(spokenText, targetPhrase);
  const weakWords = wordFeedback.filter(w => !w.matched).map(w => w.expected);

  let feedback = '¡Excelente pronunciación nativa!';
  if (highestAccuracy < 50) {
    feedback =
      weakWords.length > 0
        ? `Pronunciación baja. Escucha el modelo nativo y refuerza: "${weakWords.join(', ')}".`
        : 'Pronunciación baja. Escucha el audio guía y modula cada sílaba.';
  } else if (highestAccuracy < minAccuracyScore) {
    feedback =
      weakWords.length > 0
        ? `Buen intento (${highestAccuracy}%). Afina la articulación de: "${weakWords.join(', ')}".`
        : 'Buen intento. Presta atención al acento tonal y las consonantes.';
  } else if (highestAccuracy < 90) {
    feedback = '¡Muy buena pronunciación! Se entiende con claridad.';
  } else if (usedPhoneticMatch) {
    feedback = '¡Pronunciación auténtica! Reconocimiento fonético ancestral validado.';
  }

  return {
    accuracy: highestAccuracy,
    passed,
    feedback,
    matchedTranscript: spokenText,
    phoneticMatch: usedPhoneticMatch,
    wordFeedback,
  };
}

/**
 * Evaluates multiple Web Speech API alternatives and returns the best phonetic match
 */
export function evaluateBestSpeechAlternative(
  alternatives: string[],
  targetPhrase: string,
  acceptableVariants: string[] = [],
  minAccuracyScore: number = 70
): SpeechEvaluationResult {
  const uniqueAlts = alternatives.map(a => a.trim()).filter(Boolean);
  if (uniqueAlts.length === 0) {
    return calculateSpeechSimilarity('', targetPhrase, acceptableVariants, minAccuracyScore);
  }

  let bestResult = calculateSpeechSimilarity(
    uniqueAlts[0],
    targetPhrase,
    acceptableVariants,
    minAccuracyScore
  );

  for (let i = 1; i < uniqueAlts.length; i++) {
    const candidateResult = calculateSpeechSimilarity(
      uniqueAlts[i],
      targetPhrase,
      acceptableVariants,
      minAccuracyScore
    );
    if (candidateResult.accuracy > bestResult.accuracy) {
      bestResult = candidateResult;
    }
  }

  return bestResult;
}

/**
 * Validates if the user's constructed sentence matches target tokens
 */
export function validateSentenceOrder(selectedWords: string[], targetTokens: string[]): boolean {
  if (selectedWords.length !== targetTokens.length) return false;
  return selectedWords.every((word, idx) => normalizeText(word) === normalizeText(targetTokens[idx]));
}

/**
 * Generates official verifiable certificate details
 */
export function generateCertificate(
  studentName: string,
  languageName: string,
  languageCode: LanguageCode,
  level: string
): CertificateData {
  const timestamp = Date.now();
  const dateStr = new Date().toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const baseHash = `${studentName}-${languageCode}-${level}-${timestamp}`;
  let hashNum = 0;
  for (let i = 0; i < baseHash.length; i++) {
    hashNum = (hashNum * 31 + baseHash.charCodeAt(i)) >>> 0;
  }
  const codeSuffix = hashNum.toString(36).toUpperCase().padStart(8, '0');
  const verificationCode = `YACHAY-${languageCode.toUpperCase()}-${codeSuffix}`;

  return {
    id: `cert-${timestamp}`,
    studentName: studentName.trim() || 'Estudiante Yachay',
    language: languageName,
    languageCode,
    level,
    issueDate: dateStr,
    verificationCode,
    grade: 'Aprobado con Excelencia (95% Dominio)',
    accreditedBy: 'Consejo Intercultural de Idiomas & Pedagogía Andina',
    qrPayload: `https://yachay.app/verify/${verificationCode}`,
  };
}

/**
 * Freemium access evaluator:
 * - Free: Level 'principiante' lessons, Solo Chess vs Bot, preview myths
 * - Pro ($1.25 USD): all levels (intermedio, avanzado), Chess PvP matchmaking, certificate downloads, full video catalog
 */
export function checkFreemiumAccess(
  isPro: boolean,
  feature: 'lesson' | 'chess_pvp' | 'certificate_download' | 'myth_video',
  itemLevel?: string
): { allowed: boolean; reason?: string } {
  if (isPro) {
    return { allowed: true };
  }

  switch (feature) {
    case 'lesson':
      if (itemLevel === 'principiante' || !itemLevel) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Los niveles Intermedio y Avanzado requieren el Pase Vitalicio Yachay Pro ($1.25 USD).',
      };
    case 'chess_pvp':
      return {
        allowed: false,
        reason: 'El modo Multijugador Online (PvP) con matchmaking competitivo es exclusivo para usuarios Pro.',
      };
    case 'certificate_download':
      return {
        allowed: false,
        reason: 'La descarga y emisión de Certificados Digitales Verificables con código QR requiere la cuenta Pro ($1.25 USD).',
      };
    case 'myth_video':
      return {
        allowed: false,
        reason: 'El acceso al archivo de videos animados 4K y subtítulos multilingües requiere el Pase Vitalicio.',
      };
    default:
      return { allowed: true };
  }
}

export type DailyNodeStatus = 'completed' | 'skipped' | 'active' | 'locked' | 'pro_locked';

export function getStartingDayForLevel(level?: 'principiante' | 'intermedio' | 'avanzado'): number {
  switch (level) {
    case 'intermedio':
      return 3;
    case 'avanzado':
      return 5;
    case 'principiante':
    default:
      return 1;
  }
}

export function evaluateDailyNodeStatus(params: {
  lesson: { id: string; dayNumber: number; moduleLevel: 'principiante' | 'intermedio' | 'avanzado' };
  allLessons: { id: string; dayNumber: number; moduleLevel: 'principiante' | 'intermedio' | 'avanzado' }[];
  completedLessonIds: string[];
  selectedLevel?: 'principiante' | 'intermedio' | 'avanzado';
  isPro: boolean;
}): DailyNodeStatus {
  const { lesson, allLessons, completedLessonIds, selectedLevel, isPro } = params;
  if (completedLessonIds.includes(lesson.id)) {
    return 'completed';
  }

  const startingDay = getStartingDayForLevel(selectedLevel);
  if (lesson.dayNumber < startingDay) {
    return 'skipped';
  }

  if (lesson.dayNumber === startingDay) {
    return 'active';
  }

  const ordered = [...allLessons].sort((a, b) => a.dayNumber - b.dayNumber);
  const currentIdx = ordered.findIndex(item => item.id === lesson.id);
  const prevLesson = currentIdx > 0 ? ordered[currentIdx - 1] : null;

  const prevSatisfied =
    !prevLesson ||
    completedLessonIds.includes(prevLesson.id) ||
    prevLesson.dayNumber < startingDay;

  if (!prevSatisfied) {
    return 'locked';
  }

  if (!isPro && lesson.moduleLevel !== 'principiante') {
    return 'pro_locked';
  }

  return 'active';
}

export function getPathProgressSummary(
  allLessons: { id: string; dayNumber: number; moduleLevel: 'principiante' | 'intermedio' | 'avanzado' }[],
  completedLessonIds: string[],
  selectedLevel?: 'principiante' | 'intermedio' | 'avanzado'
): {
  totalDays: number;
  completedOrSkippedDays: number;
  completedDays: number;
  percent: number;
  nextRecommendedDay: number;
} {
  const ordered = [...allLessons].sort((a, b) => a.dayNumber - b.dayNumber);
  const startingDay = getStartingDayForLevel(selectedLevel);
  const completedDays = ordered.filter(l => completedLessonIds.includes(l.id)).length;
  const completedOrSkippedDays = ordered.filter(
    l => completedLessonIds.includes(l.id) || l.dayNumber < startingDay
  ).length;
  const totalDays = ordered.length;
  const percent = totalDays > 0 ? Math.round((completedOrSkippedDays / totalDays) * 100) : 0;

  const firstPending = ordered.find(
    l => l.dayNumber >= startingDay && !completedLessonIds.includes(l.id)
  );
  const nextRecommendedDay = firstPending ? firstPending.dayNumber : totalDays;

  return {
    totalDays,
    completedOrSkippedDays,
    completedDays,
    percent,
    nextRecommendedDay,
  };
}

export function hasConsistentSkillOrder(lesson: { exercises: { skill: string }[] }): boolean {
  if (lesson.exercises.length < 3) return false;
  return (
    lesson.exercises[0].skill === 'listening' &&
    lesson.exercises[1].skill === 'writing' &&
    lesson.exercises[2].skill === 'speaking'
  );
}
