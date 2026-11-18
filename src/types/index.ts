export type LanguageCode =
  | 'kichwa'
  | 'shuar'
  | 'achuar'
  | 'tsafiki'
  | 'chapalaa'
  | 'awapit'
  | 'en'
  | 'fr';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  category: 'ancestral' | 'global';
  region: string;
  description: string;
  totalModules: number;
  totalLearners: string;
}

export type SkillType = 'listening' | 'speaking' | 'writing';

export interface BaseExercise {
  id: string;
  skill: SkillType;
  instruction: string;
  targetLanguage: LanguageCode;
  targetPhrase: string;
  translation: string;
  phoneticGuide?: string;
  audioVoice?: string;
}

export interface ListeningExercise extends BaseExercise {
  skill: 'listening';
  options: {
    id: string;
    text: string;
    translation: string;
    imageIcon?: string;
  }[];
  correctOptionId: string;
}

export interface SpeakingExercise extends BaseExercise {
  skill: 'speaking';
  acceptablePhrases: string[];
  minAccuracyScore: number; // e.g. 70%
  culturalNote?: string;
}

export interface WritingExercise extends BaseExercise {
  skill: 'writing';
  availableWords: string[];
  correctSentenceTokens: string[];
}

export type Exercise = ListeningExercise | SpeakingExercise | WritingExercise;

export type LearningLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface Lesson {
  id: string;
  moduleLevel: LearningLevel;
  unit: number;
  dayNumber: number;
  title: string;
  description: string;
  xpReward: number;
  culturalConcept: string;
  exercises: Exercise[];
  isLockedDefault: boolean;
}

export interface WordPronunciationFeedback {
  expected: string;
  matched: boolean;
  similarity: number;
}

export interface SpeechEvaluationResult {
  accuracy: number;
  passed: boolean;
  feedback: string;
  matchedTranscript?: string;
  phoneticMatch?: boolean;
  wordFeedback?: WordPronunciationFeedback[];
}

export interface VocabularyVoiceQuestion {
  id: string;
  language: LanguageCode;
  category: string;
  promptEs: string;
  meaningHint: string;
  imageIcon: string;
  targetPhrase: string;
  acceptablePhrases: string[];
  phoneticGuide: string;
  pronunciationTip: string;
  minAccuracyScore?: number;
}

export interface CertificateData {
  id: string;
  studentName: string;
  language: string;
  languageCode: LanguageCode;
  level: string;
  issueDate: string;
  verificationCode: string;
  grade: string;
  accreditedBy: string;
  qrPayload: string;
}

export type NarrativeCategory = 'leyenda' | 'mito';

export interface CulturalMyth {
  id: string;
  category: NarrativeCategory;
  title: string;
  culturalOrigin: string; // e.g. 'Kichwa Sierra', 'Shuar Amazonía', 'Leyenda de Quito', 'Internacional'
  region: 'ecuador-sierra' | 'ecuador-oriente' | 'ecuador-costa' | 'internacional';
  coverImage: string;
  readTimeMin: number;
  summary: string;
  illustratedStory: {
    scene: number;
    title: string;
    text: string;
    glossaryTerms: {
      word: string;
      language: string;
      meaning: string;
      pronunciation: string;
    }[];
    illustrationPrompt: string;
    illustrationStyle: string;
  }[];
  videoExperience: {
    videoTitle: string;
    durationSec: number;
    synopsis: string;
    subtitles: {
      timestampSec: number;
      es: string;
      kichwa?: string;
      shuar?: string;
      en: string;
    }[];
    triviaQuestion: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
    aiVideoAssetUrl?: string;
    aiPromptUsed?: string;
    aiModelUsed?: string;
  };
  userCustomVideoUrl?: string;
  isLockedForFree: boolean;
}

export interface UserSecuritySettings {
  biometricsEnabled: boolean;
  twoFactorEnabled: boolean;
  securityPin: string; // 6-digit PIN (default '123456')
  isAppLockActive: boolean;
  lastLoginDevice: string;
  lastLoginIp: string;
  lastLoginTimestamp: string;
  sessionToken: string;
  securityScore: number; // 0 to 100%
  failedAttempts: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  username?: string;
  email: string;
  avatarUrl: string;
  avatarType?: 'luffy' | 'custom' | 'initial';
  accountCategory?: 'primary' | 'secondary' | 'custom';
  accountLabel?: string;
  cloudUid?: string;
  cloudProvider?: 'google' | 'password' | 'local';
  passwordHash?: string;
  passwordSalt?: string;
  lastCloudSyncAt?: string;
  streakDays: number;
  xp: number;
  dailyXpHistory?: Record<string, number>;
  chakanas: number; // Gamification currency
  currentLanguage: LanguageCode;
  languageLevels?: Partial<Record<LanguageCode, LearningLevel>>;
  isPro: boolean;
  completedLessonIds: string[];
  certificates: CertificateData[];
  savedMythIds: string[];
  adUnlockedMythIds?: string[];
  chessStats: {
    elo: number;
    wins: number;
    draws: number;
    losses: number;
  };
  security: UserSecuritySettings;
}
