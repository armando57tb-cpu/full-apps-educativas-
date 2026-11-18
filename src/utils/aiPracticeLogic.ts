import { LanguageCode } from '../types';

export type PracticeLanguage = 'kichwa' | 'shuar';
export type TutorGrammarStatus = 'correcta' | 'con_sugerencias' | 'consulta_es';

export interface TutorPracticeReply {
  replyNative: string;
  replyEs: string;
  grammarStatus: TutorGrammarStatus;
  grammarFeedback: string;
  correctedPhrase: string;
  pronunciationGuide: string;
  nextPromptEs: string;
}

export interface PracticeChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  translationEs?: string;
  pronunciationGuide?: string;
  grammarStatus?: TutorGrammarStatus;
  grammarFeedback?: string;
  correctedPhrase?: string;
  nextPromptEs?: string;
}

export interface PracticeStarterPack {
  greetingNative: string;
  greetingEs: string;
  pronunciationGuide: string;
  quickPrompts: string[];
}

export function normalizePracticeLanguage(code: LanguageCode | string): PracticeLanguage {
  return code === 'shuar' ? 'shuar' : 'kichwa';
}

export function getStarterDialogueForLanguage(lang: PracticeLanguage): PracticeStarterPack {
  if (lang === 'shuar') {
    return {
      greetingNative: 'Chichamjai, amik! Winia naari Yachay-aitjai. Ame naari yaki?',
      greetingEs: '¡Hola, amigo/a! Mi nombre es Yachay. ¿Cuál es tu nombre?',
      pronunciationGuide: '[chi-cham-jai, a-mik! wi-nia naa-ri ya-chay-ait-jai. a-me naa-ri ya-ki?]',
      quickPrompts: [
        'Winia naari Armando-aitjai',
        'Yuminsajme, penker pujajai',
        '¿Cómo digo buenos días en Shuar?',
      ],
    };
  }

  return {
    greetingNative: 'Alli puncha, mashi! Ñuka shutika Yachaymi kan. Imashutita kanki?',
    greetingEs: '¡Buenos días, amigo/a! Mi nombre es Yachay. ¿Cómo te llamas?',
    pronunciationGuide: '[a-lli pun-cha, ma-shi! ñu-ka shu-ti-ka ya-chay-mi kan. i-ma-shu-ti-ta kan-ki?]',
    quickPrompts: [
      'Alli puncha, ñuka shutika Carlosmi kan',
      'Yupaychani, allillami kani',
      '¿Cómo digo buenas noches en Kichwa?',
    ],
  };
}

export function parseTutorJsonResponse(rawText: string): TutorPracticeReply | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const jsonCandidate = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<TutorPracticeReply>;
    if (
      typeof parsed.replyNative !== 'string' ||
      !parsed.replyNative.trim() ||
      typeof parsed.replyEs !== 'string' ||
      typeof parsed.grammarFeedback !== 'string'
    ) {
      return null;
    }

    const validStatus: TutorGrammarStatus =
      parsed.grammarStatus === 'correcta' ||
      parsed.grammarStatus === 'con_sugerencias' ||
      parsed.grammarStatus === 'consulta_es'
        ? parsed.grammarStatus
        : 'con_sugerencias';

    return {
      replyNative: parsed.replyNative.trim(),
      replyEs: parsed.replyEs.trim(),
      grammarStatus: validStatus,
      grammarFeedback: parsed.grammarFeedback.trim(),
      correctedPhrase: typeof parsed.correctedPhrase === 'string' ? parsed.correctedPhrase.trim() : '',
      pronunciationGuide:
        typeof parsed.pronunciationGuide === 'string' ? parsed.pronunciationGuide.trim() : '',
      nextPromptEs: typeof parsed.nextPromptEs === 'string' ? parsed.nextPromptEs.trim() : '',
    };
  } catch {
    return null;
  }
}

export function getGrammarBadgeMeta(status: TutorGrammarStatus): {
  label: string;
  toneClass: string;
} {
  if (status === 'correcta') {
    return {
      label: 'Gramática correcta',
      toneClass: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    };
  }
  if (status === 'consulta_es') {
    return {
      label: 'Equivalencia / Traducción',
      toneClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
    };
  }
  return {
    label: 'Corrección sugerida',
    toneClass: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  };
}

export function trimPracticeHistory(
  messages: PracticeChatMessage[],
  maxMessages: number = 8
): { role: 'user' | 'assistant'; text: string }[] {
  return messages.slice(-maxMessages).map(m => ({
    role: m.role,
    text: m.text,
  }));
}
