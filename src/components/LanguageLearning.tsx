import React, { useEffect, useRef, useState } from 'react';
import { LanguageCode, LearningLevel, Lesson, UserProfile, Exercise, SpeechEvaluationResult } from '../types';
import { LANGUAGES_CATALOG, LESSONS_DATABASE } from '../data/languages';
import {
  evaluateBestSpeechAlternative,
  validateSentenceOrder,
  evaluateDailyNodeStatus,
  getPathProgressSummary,
} from '../utils/pedagogyLogic';
import { speakText, playChime } from '../utils/audioSpeech';
import {
  SpeechRecognitionSession,
  startBrowserSpeechRecognition,
} from '../utils/speechRecognition';
import { SpeechVocabularyPractice } from './SpeechVocabularyPractice';
import { GoogleAdSenseBanner } from './GoogleAdSenseBanner';
import { AiLanguageChatBubble } from './AiLanguageChatBubble';
import { normalizePracticeLanguage } from '../utils/aiPracticeLogic';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Lock,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  Info,
  RotateCcw,
  Square,
  Keyboard,
  Compass,
  Calendar,
  SlidersHorizontal,
  Play,
  Crown,
  MessageCircle,
} from 'lucide-react';

interface LanguageLearningProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenFreemium: () => void;
  onOpenCertificateModal: (languageCode: LanguageCode, level: string) => void;
}

const LEVEL_OPTIONS: {
  id: LearningLevel;
  title: string;
  cefr: string;
  startDay: number;
  summary: string;
  badge: string;
}[] = [
  {
    id: 'principiante',
    title: 'Principiante',
    cefr: 'Nivel A1 • Desde cero',
    startDay: 1,
    summary: 'Inicias desde el Día 1 con saludos, fonética esencial y frases cotidianas.',
    badge: 'Día 1',
  },
  {
    id: 'intermedio',
    title: 'Intermedio',
    cefr: 'Nivel B1 • Bases previas',
    startDay: 3,
    summary: 'Ya conoces lo básico. Comienzas en el Día 3 con sufijos, diálogo y cultura viva.',
    badge: 'Día 3',
  },
  {
    id: 'avanzado',
    title: 'Avanzado',
    cefr: 'Nivel C1 • Fluidez',
    startDay: 5,
    summary: 'Dominas estructuras previas. Avanzas directo al Día 5 de oratoria y sabiduría.',
    badge: 'Día 5',
  },
];

// Duolingo-style alternating horizontal offsets along the winding path
const PATH_NODE_OFFSETS = [
  'translate-x-0',
  'translate-x-8 sm:translate-x-12',
  'translate-x-0',
  '-translate-x-8 sm:-translate-x-12',
  'translate-x-0',
];

export const LanguageLearning: React.FC<LanguageLearningProps> = ({
  user,
  onUpdateUser,
  onOpenFreemium,
  onOpenCertificateModal,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(user.currentLanguage || 'kichwa');
  const [isChangingLevel, setIsChangingLevel] = useState<boolean>(false);
  const [isAiPracticeOpen, setIsAiPracticeOpen] = useState<boolean>(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  useEffect(() => {
    if (user.currentLanguage && user.currentLanguage !== selectedLang) {
      setSelectedLang(user.currentLanguage);
      setIsChangingLevel(false);
    }
  }, [user.currentLanguage]);

  // Listening
  const [selectedListeningOption, setSelectedListeningOption] = useState<string | null>(null);
  const [listeningChecked, setListeningChecked] = useState<boolean>(false);
  const [listeningIsCorrect, setListeningIsCorrect] = useState<boolean>(false);

  // Speaking
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [spokenText, setSpokenText] = useState<string>('');
  const [speechResult, setSpeechResult] = useState<SpeechEvaluationResult | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showLessonSpeechFallback, setShowLessonSpeechFallback] = useState<boolean>(false);
  const [lessonManualSpeech, setLessonManualSpeech] = useState<string>('');
  const speechSessionRef = useRef<SpeechRecognitionSession | null>(null);
  const lessonSpeechResolvedRef = useRef<boolean>(false);

  // Writing
  const [constructedWords, setConstructedWords] = useState<string[]>([]);
  const [writingChecked, setWritingChecked] = useState<boolean>(false);
  const [writingIsCorrect, setWritingIsCorrect] = useState<boolean>(false);

  // Lesson Finished
  const [lessonFinished, setLessonFinished] = useState<boolean>(false);

  const activeLangInfo = LANGUAGES_CATALOG.find(l => l.code === selectedLang) || LANGUAGES_CATALOG[0];
  const lessonsForLang = (LESSONS_DATABASE[selectedLang] || []).slice().sort((a, b) => a.dayNumber - b.dayNumber);
  const chosenLevel = user.languageLevels?.[selectedLang];
  const needsLevelPrompt = !chosenLevel || isChangingLevel;

  const progressSummary = getPathProgressSummary(
    lessonsForLang,
    user.completedLessonIds,
    chosenLevel
  );

  useEffect(() => {
    return () => {
      lessonSpeechResolvedRef.current = true;
      speechSessionRef.current?.abort();
      speechSessionRef.current = null;
    };
  }, []);

  const handleSelectStartingLevel = (level: LearningLevel) => {
    onUpdateUser({
      languageLevels: {
        ...(user.languageLevels || {}),
        [selectedLang]: level,
      },
    });
    setIsChangingLevel(false);
    playChime('success');
  };

  const applyLessonSpeechEvaluation = (
    alternatives: string[],
    targetPhrase: string,
    acceptable: string[],
    minAccuracyScore: number = 70
  ) => {
    lessonSpeechResolvedRef.current = true;
    const evaluation = evaluateBestSpeechAlternative(
      alternatives,
      targetPhrase,
      acceptable,
      minAccuracyScore
    );
    setSpokenText(evaluation.matchedTranscript || alternatives[0] || '');
    setSpeechResult(evaluation);
    setInterimTranscript('');
    setIsRecording(false);
    setSpeechError(null);
    if (evaluation.passed) {
      playChime('success');
    } else {
      playChime('error');
    }
  };

  const startSpeechRecognition = (
    targetLang: LanguageCode,
    targetPhrase: string,
    acceptable: string[] = [],
    minAccuracyScore: number = 70
  ) => {
    if (isRecording) {
      speechSessionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    lessonSpeechResolvedRef.current = false;
    playChime('bell');
    setIsRecording(true);
    setSpeechResult(null);
    setSpeechError(null);
    setInterimTranscript('');
    setSpokenText('');

    const session = startBrowserSpeechRecognition(targetLang, {
      onInterim: transcript => {
        setInterimTranscript(transcript);
      },
      onResult: (_transcript, alternatives) => {
        speechSessionRef.current = null;
        applyLessonSpeechEvaluation(alternatives, targetPhrase, acceptable, minAccuracyScore);
      },
      onError: (_code, message) => {
        lessonSpeechResolvedRef.current = true;
        speechSessionRef.current = null;
        setIsRecording(false);
        setInterimTranscript('');
        setSpeechError(message);
        setShowLessonSpeechFallback(true);
        playChime('error');
      },
      onEnd: () => {
        speechSessionRef.current = null;
        setIsRecording(false);
        if (!lessonSpeechResolvedRef.current) {
          lessonSpeechResolvedRef.current = true;
          setSpeechError(
            'No se detectó voz suficiente antes de finalizar. Habla cerca del micrófono o usa el modo sin micrófono.'
          );
          setShowLessonSpeechFallback(true);
        }
      },
    });

    speechSessionRef.current = session;
  };

  const handleStartLesson = (lesson: Lesson, nodeStatus: ReturnType<typeof evaluateDailyNodeStatus>) => {
    if (nodeStatus === 'pro_locked') {
      onOpenFreemium();
      return;
    }
    if (nodeStatus === 'locked') {
      playChime('error');
      return;
    }

    setActiveLesson(lesson);
    setCurrentExerciseIndex(0);
    resetExerciseStates();
    setLessonFinished(false);
    playChime('click');
  };

  const resetExerciseStates = () => {
    lessonSpeechResolvedRef.current = true;
    speechSessionRef.current?.abort();
    speechSessionRef.current = null;
    setSelectedListeningOption(null);
    setListeningChecked(false);
    setListeningIsCorrect(false);
    setIsRecording(false);
    setInterimTranscript('');
    setSpokenText('');
    setSpeechResult(null);
    setSpeechError(null);
    setShowLessonSpeechFallback(false);
    setLessonManualSpeech('');
    setConstructedWords([]);
    setWritingChecked(false);
    setWritingIsCorrect(false);
  };

  const handleCheckListening = (currentEx: Exercise) => {
    if (currentEx.skill !== 'listening' || !selectedListeningOption) return;
    const isCorrect = selectedListeningOption === currentEx.correctOptionId;
    setListeningIsCorrect(isCorrect);
    setListeningChecked(true);
    if (isCorrect) playChime('success');
    else playChime('error');
  };

  const handleCheckWriting = (currentEx: Exercise) => {
    if (currentEx.skill !== 'writing') return;
    const isCorrect = validateSentenceOrder(constructedWords, currentEx.correctSentenceTokens);
    setWritingIsCorrect(isCorrect);
    setWritingChecked(true);
    if (isCorrect) playChime('success');
    else playChime('error');
  };

  const handleNextExercise = () => {
    if (!activeLesson) return;
    if (currentExerciseIndex < activeLesson.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      resetExerciseStates();
      playChime('click');
    } else {
      setLessonFinished(true);
      playChime('success');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#0ea5e9', '#6366f1', '#ffffff'],
        });
      } catch {
        // ignore confetti errors
      }

      const alreadyCompleted = user.completedLessonIds.includes(activeLesson.id);
      const newCompleted = alreadyCompleted
        ? user.completedLessonIds
        : [...user.completedLessonIds, activeLesson.id];

      onUpdateUser({
        xp: user.xp + activeLesson.xpReward,
        chakanas: user.chakanas + 15,
        completedLessonIds: newCompleted,
      });
    }
  };

  const currentExercise = activeLesson ? activeLesson.exercises[currentExerciseIndex] : null;
  const levelLabelMap: Record<LearningLevel, string> = {
    principiante: 'Principiante A1',
    intermedio: 'Intermedio B1',
    avanzado: 'Avanzado C1',
  };

  return (
    <div className="space-y-4">
      {/* Language Selector Header */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Idiomas del Ecuador (6) y Globales (2)
          </span>
          <span className="text-[11px] text-sky-200 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 whitespace-nowrap">
            {activeLangInfo.totalLearners} estudiantes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LANGUAGES_CATALOG.map(lang => {
            const isSelected = lang.code === selectedLang;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setIsChangingLevel(false);
                  onUpdateUser({ currentLanguage: lang.code });
                  playChime('click');
                }}
                className={`p-2.5 rounded-xl border text-left transition relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 to-indigo-950/80 border-amber-400 shadow-sm ring-1 ring-amber-400/40'
                    : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{lang.flag}</span>
                  {lang.category === 'ancestral' && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                      Nativo EC
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-white truncate">{lang.name}</div>
                <div className="text-[10px] text-slate-300 truncate">{lang.nativeName}</div>
              </button>
            );
          })}
        </div>

        {/* Selected language summary info */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="font-bold text-amber-300">{activeLangInfo.name}:</span>
            <span className="text-[11px] text-slate-300">{activeLangInfo.description}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="open-ai-practice-btn"
              onClick={() => {
                setIsAiPracticeOpen(prev => !prev);
                playChime('click');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500/25 to-indigo-500/25 hover:from-sky-500/35 hover:to-indigo-500/35 border border-sky-400/50 text-sky-200 px-3 py-1 rounded-lg font-bold text-[11px] transition shadow-xs active:scale-95"
              title="Abrir chat tipo burbuja con Gemini para conversar en Kichwa o Shuar"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-300" />
              <span>Práctica con IA</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
            <button
              onClick={() =>
                onOpenCertificateModal(
                  selectedLang,
                  chosenLevel ? levelLabelMap[chosenLevel] : 'Principiante A1'
                )
              }
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition shrink-0"
              title="Ver modelo de certificación oficial"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Emitir Certificado</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: INITIAL LEVEL PLACEMENT QUESTION OR DUOLINGO DAILY PATH */}
      {needsLevelPrompt ? (
        <section
          key={`level-prompt-${selectedLang}`}
          aria-label="Diagnóstico inicial de nivel"
          data-testid="level-placement-card"
          className="bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 border border-sky-500/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 animate-section-enter"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Paso Inicial • Personalización de Ruta
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  ¿Qué nivel tienes en {activeLangInfo.name}?
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Elige tu punto de partida para abrir tu camino diario. En cada módulo trabajarás el mismo ciclo completo:{' '}
                  <strong className="text-sky-300">1. Escuchar → 2. Escribir → 3. Hablar</strong>.
                </p>
              </div>
            </div>

            {chosenLevel && isChangingLevel && (
              <button
                type="button"
                onClick={() => setIsChangingLevel(false)}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shrink-0"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LEVEL_OPTIONS.map(option => {
              const isCurrent = chosenLevel === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  data-testid={`select-level-${option.id}`}
                  onClick={() => handleSelectStartingLevel(option.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                    isCurrent
                      ? 'bg-sky-500/20 border-sky-400 ring-1 ring-sky-400/50'
                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-amber-400/70'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Inicia en {option.badge}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition" />
                    </div>
                    <h3 className="text-sm font-extrabold text-white">{option.title}</h3>
                    <div className="text-[11px] font-semibold text-sky-300">{option.cefr}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{option.summary}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/70 text-[11px] font-bold text-amber-300 flex items-center justify-between">
                    <span>Comenzar desde {option.badge}</span>
                    <span>🎧 ✍️ 🗣️</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        /* STEP 2: DUOLINGO-STYLE WINDING DAILY PATH */
        <section
          key={`daily-path-${selectedLang}-${chosenLevel}`}
          aria-label="Camino diario de aprendizaje"
          data-testid="daily-learning-path"
          className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md space-y-5 animate-section-enter"
        >
          {/* Path Header & Level Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Camino Diario • {activeLangInfo.name}</span>
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Nivel: {levelLabelMap[chosenLevel]}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Cada día desbloquea el siguiente. Todos los módulos entrenan{' '}
                <strong className="text-white">🎧 Escucha → ✍️ Escribe → 🗣️ Habla</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-bold text-sky-300">
                Progreso: {progressSummary.completedOrSkippedDays}/{progressSummary.totalDays} días ({progressSummary.percent}%)
              </div>
              <button
                type="button"
                data-testid="change-level-btn"
                onClick={() => {
                  setIsChangingLevel(true);
                  playChime('click');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambiar nivel</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-400 to-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(8, progressSummary.percent)}%` }}
            />
          </div>

          {/* Winding Path Nodes */}
          <div className="relative py-2 flex flex-col items-center space-y-6">
            {lessonsForLang.map((lesson, idx) => {
              const status = evaluateDailyNodeStatus({
                lesson,
                allLessons: lessonsForLang,
                completedLessonIds: user.completedLessonIds,
                selectedLevel: chosenLevel,
                isPro: user.isPro,
              });

              const offsetClass = PATH_NODE_OFFSETS[idx % PATH_NODE_OFFSETS.length];
              const isNextRecommended =
                status === 'active' && lesson.dayNumber === progressSummary.nextRecommendedDay;
              const isFirstOfSection =
                idx === 0 || lessonsForLang[idx - 1].moduleLevel !== lesson.moduleLevel;

              return (
                <React.Fragment key={lesson.id}>
                  {/* Level Unit Banner */}
                  {isFirstOfSection && (
                    <div
                      className={`w-full rounded-2xl p-3 border flex items-center justify-between gap-2 ${
                        lesson.moduleLevel === 'principiante'
                          ? 'bg-gradient-to-r from-sky-950/90 to-slate-900 border-sky-500/40'
                          : lesson.moduleLevel === 'intermedio'
                          ? 'bg-gradient-to-r from-indigo-950/90 to-slate-900 border-indigo-400/40'
                          : 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-400/40'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                          Etapa {lesson.moduleLevel === 'principiante' ? '1' : lesson.moduleLevel === 'intermedio' ? '2' : '3'}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-white">
                          {levelLabelMap[lesson.moduleLevel]}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950/70 text-slate-200 border border-slate-700">
                        🎧 Escucha · ✍️ Escribe · 🗣️ Habla
                      </span>
                    </div>
                  )}

                  {/* Staggered Winding Node Card */}
                  <div className={`w-full max-w-md flex flex-col items-center relative ${offsetClass} transition-transform`}>
                    {idx > 0 && !isFirstOfSection && (
                      <div className="w-1 h-5 bg-slate-700 rounded-full -mt-4 mb-2" aria-hidden="true" />
                    )}

                    {/* Floating active callout */}
                    {isNextRecommended && (
                      <div className="mb-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                        Empezar Día {lesson.dayNumber}
                      </div>
                    )}

                    <div
                      data-testid={`day-node-${lesson.dayNumber}`}
                      className={`w-full rounded-2xl border p-3.5 flex items-center gap-3.5 transition ${
                        status === 'active'
                          ? 'bg-slate-800/95 border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
                          : status === 'completed'
                          ? 'bg-sky-950/50 border-sky-500/60'
                          : status === 'skipped'
                          ? 'bg-slate-800/50 border-slate-700/80'
                          : 'bg-slate-950/70 border-slate-800 opacity-85'
                      }`}
                    >
                      {/* Circular Duolingo-style Milestone Button */}
                      <button
                        type="button"
                        onClick={() => handleStartLesson(lesson, status)}
                        disabled={status === 'locked'}
                        aria-label={`Día ${lesson.dayNumber}: ${lesson.title}`}
                        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 font-black text-xs border-b-4 transition active:translate-y-0.5 ${
                          status === 'completed'
                            ? 'bg-sky-500 border-sky-700 text-slate-950'
                            : status === 'skipped'
                            ? 'bg-indigo-500/80 border-indigo-700 text-white'
                            : status === 'active'
                            ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-md'
                            : status === 'pro_locked'
                            ? 'bg-slate-800 border-amber-600/60 text-amber-300'
                            : 'bg-slate-800 border-slate-950 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : status === 'locked' ? (
                          <Lock className="w-5 h-5" />
                        ) : status === 'pro_locked' ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          <>
                            <span className="text-[9px] uppercase leading-none">Día</span>
                            <span className="text-base leading-none">{lesson.dayNumber}</span>
                          </>
                        )}
                      </button>

                      {/* Day Module Summary */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-white truncate">{lesson.title}</span>
                          {status === 'skipped' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                              Nivel superado
                            </span>
                          )}
                          {status === 'pro_locked' && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                              PRO $1.25
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{lesson.description}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px]">
                          <span className="text-sky-300 font-semibold">🎧 Escucha · ✍️ Escribe · 🗣️ Habla</span>
                          <span className="text-amber-300 font-mono font-bold">+{lesson.xpReward} XP</span>
                        </div>
                      </div>

                      {/* Explicit Action Button */}
                      <button
                        type="button"
                        onClick={() => handleStartLesson(lesson, status)}
                        disabled={status === 'locked'}
                        aria-label={
                          status === 'locked'
                            ? `Día ${lesson.dayNumber} bloqueado`
                            : status === 'pro_locked'
                            ? `Desbloquear Día ${lesson.dayNumber} con Pro`
                            : status === 'completed' || status === 'skipped'
                            ? `Repasar Día ${lesson.dayNumber}`
                            : `Iniciar Día ${lesson.dayNumber}`
                        }
                        className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition ${
                          status === 'locked'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : status === 'pro_locked'
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50'
                            : status === 'completed' || status === 'skipped'
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                        }`}
                      >
                        {status === 'locked' ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : status === 'pro_locked' ? (
                          <>
                            <Crown className="w-3.5 h-3.5" />
                            <span>Pro</span>
                          </>
                        ) : status === 'completed' || status === 'skipped' ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Repasar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Iniciar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </section>
      )}

      {/* Google AdSense Placement (Automatically hidden when user is Pro) */}
      <GoogleAdSenseBanner
        user={user}
        slotName="Ruta de Idiomas"
        format="horizontal"
        onOpenFreemium={onOpenFreemium}
      />

      {/* Interactive Oral Vocabulary Q&A */}
      <SpeechVocabularyPractice
        selectedLang={selectedLang}
        user={user}
        onUpdateUser={onUpdateUser}
      />

      {/* ACTIVE LESSON MODAL OVERLAY (Consistent 3-Skill Loop: Escucha -> Escribe -> Habla) */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-950/90 p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {activeLesson.moduleLevel.toUpperCase()} • {activeLesson.title}
                </span>
                <span className="text-xs text-white font-semibold">
                  Paso {currentExerciseIndex + 1} de {activeLesson.exercises.length}
                </span>
              </div>
              <button
                onClick={() => {
                  speechSessionRef.current?.abort();
                  speechSessionRef.current = null;
                  setIsRecording(false);
                  setActiveLesson(null);
                  playChime('click');
                }}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold"
                aria-label="Cerrar lección"
              >
                ✕
              </button>
            </div>

            {/* Uniform 3-Skill Stepper Strip across EVERY module */}
            <div className="bg-slate-900/95 px-3.5 py-2 border-b border-slate-800 grid grid-cols-3 gap-2 text-[11px] font-bold">
              {[
                { idx: 0, label: '1. 🎧 Escucha', skill: 'listening' },
                { idx: 1, label: '2. ✍️ Escribe', skill: 'writing' },
                { idx: 2, label: '3. 🗣️ Habla', skill: 'speaking' },
              ].map(step => {
                const isDone = lessonFinished || currentExerciseIndex > step.idx;
                const isActiveStep = !lessonFinished && currentExerciseIndex === step.idx;
                return (
                  <div
                    key={step.skill}
                    className={`py-1 px-2 rounded-lg text-center border transition ${
                      isDone
                        ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                        : isActiveStep
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                );
              })}
            </div>

            {/* Modal Progress bar */}
            <div className="w-full bg-slate-950 h-1.5">
              <div
                className="bg-gradient-to-r from-sky-400 to-amber-400 h-full transition-all duration-300"
                style={{
                  width: `${((currentExerciseIndex + (lessonFinished ? 1 : 0)) / activeLesson.exercises.length) * 100}%`,
                }}
              />
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {!lessonFinished && currentExercise && (
                <>
                  {/* Skill Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                      {currentExercise.skill === 'listening' && (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> 1. Escuchar (Listening)
                        </>
                      )}
                      {currentExercise.skill === 'writing' && (
                        <>
                          <BookOpen className="w-3.5 h-3.5" /> 2. Escribir (Writing)
                        </>
                      )}
                      {currentExercise.skill === 'speaking' && (
                        <>
                          <Mic className="w-3.5 h-3.5" /> 3. Hablar (Speaking)
                        </>
                      )}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{currentExercise.instruction}</span>
                  </div>

                  {/* 1. LISTENING EXERCISE */}
                  {currentExercise.skill === 'listening' && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center space-y-2">
                        <button
                          onClick={() => speakText(currentExercise.targetPhrase, currentExercise.targetLanguage)}
                          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-sky-400 hover:scale-105 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg transition-transform"
                          title="Reproducir audio nativo"
                        >
                          <Volume2 className="w-8 h-8 fill-slate-950" />
                        </button>
                        <div className="text-xs text-slate-300 font-medium">Toca para escuchar pronunciación nativa</div>
                        {currentExercise.phoneticGuide && (
                          <div className="text-xs text-amber-300 font-mono tracking-wider">
                            Guía fonética: {currentExercise.phoneticGuide}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {currentExercise.options.map(opt => {
                          const isSelected = selectedListeningOption === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                if (listeningChecked) return;
                                setSelectedListeningOption(opt.id);
                                playChime('click');
                              }}
                              disabled={listeningChecked}
                              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-100 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {opt.imageIcon && <span className="text-xl">{opt.imageIcon}</span>}
                                <div>
                                  <div className="font-bold text-xs">{opt.text}</div>
                                  <div className="text-[11px] text-slate-300">{opt.translation}</div>
                                </div>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                  isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-500'
                                }`}
                              >
                                {isSelected && '✓'}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {listeningChecked && (
                        <div
                          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                            listeningIsCorrect
                              ? 'bg-sky-950/70 border-sky-400 text-sky-100'
                              : 'bg-red-950/60 border-red-500 text-red-200'
                          }`}
                        >
                          {listeningIsCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold">{listeningIsCorrect ? '¡Excelente asociación!' : 'Respuesta incorrecta'}</div>
                            <div className="text-[11px] opacity-90">
                              Traducción: <span className="font-semibold">{currentExercise.translation}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. WRITING EXERCISE */}
                  {currentExercise.skill === 'writing' && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
                        <span className="text-xs text-slate-300">Traduce al idioma destino:</span>
                        <div className="text-base font-bold text-white mt-1">"{currentExercise.translation}"</div>
                      </div>

                      <div className="min-h-16 bg-slate-950/80 border-2 border-dashed border-slate-700 rounded-xl p-3 flex flex-wrap gap-2 items-center">
                        {constructedWords.length === 0 ? (
                          <span className="text-xs text-slate-400 italic mx-auto">
                            Toca las palabras de abajo para armar la oración
                          </span>
                        ) : (
                          constructedWords.map((word, wIdx) => (
                            <button
                              key={`chosen-${wIdx}`}
                              onClick={() => {
                                if (writingChecked) return;
                                setConstructedWords(prev => prev.filter((_, i) => i !== wIdx));
                                playChime('click');
                              }}
                              disabled={writingChecked}
                              className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-amber-400 active:scale-95 transition"
                              title="Tocar para devolver palabra"
                            >
                              {word} ✕
                            </button>
                          ))
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-300 font-semibold block">Fichas disponibles:</span>
                        <div className="flex flex-wrap gap-2">
                          {currentExercise.availableWords.map((word, idx) => {
                            const isUsed = constructedWords.includes(word);
                            return (
                              <button
                                key={`bank-${idx}`}
                                onClick={() => {
                                  if (isUsed || writingChecked) return;
                                  setConstructedWords(prev => [...prev, word]);
                                  playChime('click');
                                }}
                                disabled={isUsed || writingChecked}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                  isUsed
                                    ? 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                                }`}
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {writingChecked && (
                        <div
                          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                            writingIsCorrect
                              ? 'bg-sky-950/70 border-sky-400 text-sky-100'
                              : 'bg-red-950/60 border-red-500 text-red-200'
                          }`}
                        >
                          {writingIsCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold">{writingIsCorrect ? '¡Sintaxis perfecta!' : 'Orden incorrecto'}</div>
                            <div className="text-[11px] opacity-90">
                              Oración correcta: <span className="font-semibold">{currentExercise.targetPhrase}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. SPEAKING EXERCISE */}
                  {currentExercise.skill === 'speaking' && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center space-y-2">
                        <span className="text-xs text-amber-300 uppercase tracking-wider font-semibold">
                          Frase a pronunciar:
                        </span>
                        <div className="text-xl font-extrabold text-white">{currentExercise.targetPhrase}</div>
                        <div className="text-xs text-slate-300 italic">"{currentExercise.translation}"</div>
                        {currentExercise.phoneticGuide && (
                          <div className="text-xs text-amber-200 font-mono bg-slate-950/70 inline-block px-2.5 py-1 rounded-md border border-slate-700">
                            {currentExercise.phoneticGuide}
                          </div>
                        )}
                        {currentExercise.culturalNote && (
                          <div className="text-[11px] text-sky-300 flex items-center justify-center gap-1 mt-1">
                            <Info className="w-3.5 h-3.5" />
                            <span>{currentExercise.culturalNote}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => speakText(currentExercise.targetPhrase, currentExercise.targetLanguage)}
                          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Escuchar modelo nativo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLessonSpeechFallback(prev => !prev);
                            playChime('click');
                          }}
                          className="flex items-center gap-1.5 bg-slate-800/70 hover:bg-slate-700 text-sky-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
                        >
                          <Keyboard className="w-3.5 h-3.5" />
                          <span>{showLessonSpeechFallback ? 'Ocultar modo sin micrófono' : 'Modo sin micrófono'}</span>
                        </button>
                      </div>

                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={() =>
                            startSpeechRecognition(
                              currentExercise.targetLanguage,
                              currentExercise.targetPhrase,
                              currentExercise.acceptablePhrases,
                              currentExercise.minAccuracyScore
                            )
                          }
                          className={`w-20 h-20 mx-auto rounded-full flex flex-col items-center justify-center shadow-lg transition-all ${
                            isRecording
                              ? 'bg-red-500 animate-pulse text-white ring-4 ring-red-400/40'
                              : 'bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                          }`}
                        >
                          {isRecording ? <Square className="w-7 h-7 fill-white" /> : <Mic className="w-8 h-8" />}
                          <span className="text-[9px] font-black mt-0.5 uppercase">
                            {isRecording ? 'Detener' : 'Grabar'}
                          </span>
                        </button>
                        <p className="text-[11px] text-slate-300">
                          {isRecording
                            ? interimTranscript
                              ? `Escuchando: "${interimTranscript}"`
                              : 'Habla ahora con claridad...'
                            : 'Presiona para calibrar tu pronunciación (Speech-to-Text)'}
                        </p>
                      </div>

                      {speechError && (
                        <div
                          role="alert"
                          className="p-3 rounded-xl border bg-amber-950/70 border-amber-500/60 text-amber-100 text-xs flex items-start gap-2"
                        >
                          <MicOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-amber-300">Micrófono no disponible</div>
                            <div className="text-[11px] opacity-90">{speechError}</div>
                          </div>
                        </div>
                      )}

                      {showLessonSpeechFallback && (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            if (!lessonManualSpeech.trim()) return;
                            applyLessonSpeechEvaluation(
                              [lessonManualSpeech.trim()],
                              currentExercise.targetPhrase,
                              currentExercise.acceptablePhrases,
                              currentExercise.minAccuracyScore
                            );
                          }}
                          className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 space-y-2"
                        >
                          <label
                            htmlFor={`lesson-phonetic-${currentExercise.id}`}
                            className="block text-[11px] font-bold text-slate-200"
                          >
                            Evaluación fonética sin micrófono:
                          </label>
                          <div className="flex gap-2">
                            <input
                              id={`lesson-phonetic-${currentExercise.id}`}
                              type="text"
                              value={lessonManualSpeech}
                              onChange={e => setLessonManualSpeech(e.target.value)}
                              placeholder="Escribe cómo pronuncias la frase..."
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="submit"
                              disabled={!lessonManualSpeech.trim()}
                              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg"
                            >
                              Evaluar
                            </button>
                          </div>
                        </form>
                      )}

                      {speechResult && (
                        <div
                          className={`p-3.5 rounded-xl border flex flex-col gap-2 text-xs ${
                            speechResult.passed
                              ? 'bg-sky-950/70 border-sky-400 text-sky-100'
                              : 'bg-amber-950/60 border-amber-500 text-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold flex items-center gap-1.5">
                              {speechResult.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                              ) : (
                                <MicOff className="w-4 h-4 text-amber-400" />
                              )}
                              <span>Calibración Fonética: {speechResult.accuracy}%</span>
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                speechResult.passed ? 'bg-sky-500/20 text-sky-200' : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {speechResult.passed ? 'CALIFICACIÓN APROBADA' : 'REQUIERE AJUSTE'}
                            </span>
                          </div>
                          <div className="text-[11px]">{speechResult.feedback}</div>
                          {spokenText && (
                            <div className="text-[10px] text-sky-300 font-mono">
                              Detectado: "{spokenText}"
                            </div>
                          )}
                          {speechResult.wordFeedback && speechResult.wordFeedback.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {speechResult.wordFeedback.map((wf, idx) => (
                                <span
                                  key={`${wf.expected}-${idx}`}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    wf.matched
                                      ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                                      : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                                  }`}
                                >
                                  {wf.matched ? '✓' : '!'} {wf.expected} ({wf.similarity}%)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Lesson Finished Victory Screen */}
              {lessonFinished && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-sky-400 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                    🏆
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white">¡Día {activeLesson.dayNumber} Completado con Éxito!</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Completaste Escucha, Escritura y Habla en {activeLangInfo.name}. Siguiente día desbloqueado en tu camino.
                    </p>
                  </div>

                  <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 grid grid-cols-2 gap-2 text-center max-w-xs mx-auto">
                    <div>
                      <div className="text-xs text-slate-400">Recompensa</div>
                      <div className="text-base font-extrabold text-amber-400">+{activeLesson.xpReward} XP</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Chakanas</div>
                      <div className="text-base font-extrabold text-sky-300">+15 💎</div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                    <button
                      onClick={() => onOpenCertificateModal(selectedLang, levelLabelMap[activeLesson.moduleLevel])}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Award className="w-4 h-4" />
                      <span>Reclamar Certificado Digital</span>
                    </button>

                    <button
                      onClick={() => setActiveLesson(null)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                    >
                      Volver al Camino Diario
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!lessonFinished && currentExercise && (
              <div className="bg-slate-950/90 p-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {currentExercise.skill === 'speaking' && !speechResult && 'Presiona el micrófono para evaluar'}
                  {currentExercise.skill === 'listening' && !listeningChecked && 'Elige una opción para verificar'}
                  {currentExercise.skill === 'writing' && !writingChecked && 'Ordena las fichas y comprueba'}
                </span>

                <div className="flex items-center gap-2">
                  {currentExercise.skill === 'listening' && !listeningChecked && (
                    <button
                      onClick={() => handleCheckListening(currentExercise)}
                      disabled={!selectedListeningOption}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition"
                    >
                      Comprobar
                    </button>
                  )}

                  {currentExercise.skill === 'writing' && !writingChecked && (
                    <button
                      onClick={() => handleCheckWriting(currentExercise)}
                      disabled={constructedWords.length === 0}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition"
                    >
                      Comprobar
                    </button>
                  )}

                  {(listeningChecked || (speechResult && speechResult.passed) || writingChecked) && (
                    <button
                      onClick={handleNextExercise}
                      className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md transition"
                    >
                      <span>Siguiente</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bubble Chat for Conversational Kichwa / Shuar Practice with Real-Time Grammar Correction */}
      {isAiPracticeOpen && (
        <AiLanguageChatBubble
          initialLanguage={normalizePracticeLanguage(selectedLang)}
          onClose={() => setIsAiPracticeOpen(false)}
          onEarnXp={xpAmount => onUpdateUser({ xp: user.xp + xpAmount })}
        />
      )}
    </div>
  );
};
