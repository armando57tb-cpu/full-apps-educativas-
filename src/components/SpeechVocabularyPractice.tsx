import React, { useEffect, useRef, useState } from 'react';
import { LanguageCode, SpeechEvaluationResult, UserProfile } from '../types';
import { LANGUAGES_CATALOG, VOCABULARY_QUIZ_BANK } from '../data/languages';
import { evaluateBestSpeechAlternative } from '../utils/pedagogyLogic';
import { playChime, speakText } from '../utils/audioSpeech';
import {
  isSpeechRecognitionSupported,
  resolveSpeechLocale,
  SpeechRecognitionSession,
  startBrowserSpeechRecognition,
} from '../utils/speechRecognition';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';

interface SpeechVocabularyPracticeProps {
  selectedLang: LanguageCode;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SpeechVocabularyPractice: React.FC<SpeechVocabularyPracticeProps> = ({
  selectedLang,
  user,
  onUpdateUser,
}) => {
  const questions = VOCABULARY_QUIZ_BANK[selectedLang] || [];
  const activeLangInfo =
    LANGUAGES_CATALOG.find((l) => l.code === selectedLang) || LANGUAGES_CATALOG[0];

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [spokenText, setSpokenText] = useState<string>('');
  const [speechResult, setSpeechResult] = useState<SpeechEvaluationResult | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showFallbackInput, setShowFallbackInput] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const resolvedOutcomeRef = useRef<boolean>(false);
  const speechSupported = isSpeechRecognitionSupported();
  const currentQuestion = questions[questionIndex] || questions[0];

  const resetQuestionState = () => {
    resolvedOutcomeRef.current = true;
    sessionRef.current?.abort();
    sessionRef.current = null;
    setIsRecording(false);
    setInterimTranscript('');
    setSpokenText('');
    setSpeechResult(null);
    setSpeechError(null);
    setShowHint(false);
    setManualInput('');
  };

  useEffect(() => {
    resetQuestionState();
    setQuestionIndex(0);
    setShowFallbackInput(false);
    return () => {
      sessionRef.current?.abort();
      sessionRef.current = null;
    };
  }, [selectedLang]);

  if (!currentQuestion) {
    return null;
  }

  const applyEvaluation = (alternatives: string[]) => {
    resolvedOutcomeRef.current = true;
    const result = evaluateBestSpeechAlternative(
      alternatives,
      currentQuestion.targetPhrase,
      currentQuestion.acceptablePhrases,
      currentQuestion.minAccuracyScore ?? 70
    );

    setSpokenText(result.matchedTranscript || alternatives[0] || '');
    setSpeechResult(result);
    setInterimTranscript('');
    setIsRecording(false);
    setSpeechError(null);

    if (result.passed) {
      playChime('success');
      if (!masteredIds.includes(currentQuestion.id)) {
        setMasteredIds((prev) => [...prev, currentQuestion.id]);
        onUpdateUser({
          xp: user.xp + 15,
          chakanas: user.chakanas + 5,
        });
      }
    } else {
      playChime('error');
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      sessionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    resolvedOutcomeRef.current = false;
    setSpeechResult(null);
    setSpeechError(null);
    setInterimTranscript('');
    setSpokenText('');
    playChime('bell');
    setIsRecording(true);

    const session = startBrowserSpeechRecognition(selectedLang, {
      onInterim: (transcript) => {
        setInterimTranscript(transcript);
      },
      onResult: (_transcript, alternatives) => {
        sessionRef.current = null;
        applyEvaluation(alternatives);
      },
      onError: (_code, message) => {
        resolvedOutcomeRef.current = true;
        sessionRef.current = null;
        setIsRecording(false);
        setInterimTranscript('');
        setSpeechError(message);
        setShowFallbackInput(true);
        playChime('error');
      },
      onEnd: () => {
        sessionRef.current = null;
        setIsRecording(false);
        if (!resolvedOutcomeRef.current) {
          resolvedOutcomeRef.current = true;
          setSpeechError(
            'No se detectó voz suficiente antes de finalizar. Habla cerca del micrófono o usa el modo sin micrófono.'
          );
          setShowFallbackInput(true);
        }
      },
    });

    sessionRef.current = session;
  };

  const handleManualEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualInput.trim();
    if (!cleaned) return;
    applyEvaluation([cleaned]);
  };

  const handlePrevQuestion = () => {
    if (questions.length <= 1) return;
    resetQuestionState();
    setQuestionIndex((prev) => (prev - 1 + questions.length) % questions.length);
    playChime('click');
  };

  const handleNextQuestion = () => {
    if (questions.length <= 1) return;
    resetQuestionState();
    setQuestionIndex((prev) => (prev + 1) % questions.length);
    playChime('click');
  };

  const masteredInLang = questions.filter((q) => masteredIds.includes(q.id)).length;
  const isCurrentMastered = masteredIds.includes(currentQuestion.id);

  return (
    <section
      aria-label="Desafío oral de vocabulario"
      className="bg-gradient-to-br from-slate-900/95 via-slate-900 to-indigo-950/90 border border-amber-500/35 rounded-2xl p-4 shadow-lg space-y-3.5"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              Práctica Oral de Vocabulario
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-200 border border-slate-700">
              {activeLangInfo.name} ({resolveSpeechLocale(selectedLang)})
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Responde en voz alta en {activeLangInfo.name} y recibe calificación fonética inmediata.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            Dominadas: {masteredInLang}/{questions.length}
          </span>
          <span className="text-[11px] font-semibold text-sky-200 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg">
            {questionIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Question Prompt Card */}
      <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
              {currentQuestion.imageIcon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-950/70 border border-sky-700/40 px-2 py-0.5 rounded">
                  {currentQuestion.category}
                </span>
                {isCurrentMastered && (
                  <span className="text-[10px] font-bold text-sky-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                    Dominada (+15 XP)
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                {currentQuestion.promptEs}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{currentQuestion.meaningHint}</p>
            </div>
          </div>
        </div>

        {/* Audio Hint & Optional Phonetic Guide Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => speakText(currentQuestion.targetPhrase, currentQuestion.language)}
            className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Escuchar modelo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowHint((prev) => !prev);
              playChime('click');
            }}
            aria-expanded={showHint}
            className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-800 text-amber-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showHint ? 'Ocultar guía fonética' : 'Ver respuesta y guía fonética'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowFallbackInput((prev) => !prev);
              playChime('click');
            }}
            aria-expanded={showFallbackInput}
            className="flex items-center gap-1.5 bg-slate-950/60 hover:bg-slate-800 text-sky-300 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition sm:ml-auto"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{showFallbackInput ? 'Ocultar teclado fonético' : 'Modo sin micrófono'}</span>
          </button>
        </div>

        {showHint && (
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                Expresión esperada ({activeLangInfo.name})
              </span>
              <span className="text-sm font-extrabold text-white">
                {currentQuestion.targetPhrase}
              </span>
              <span className="ml-2 font-mono text-amber-200">{currentQuestion.phoneticGuide}</span>
            </div>
            <p className="text-[11px] text-slate-300 sm:max-w-xs">
              {currentQuestion.pronunciationTip}
            </p>
          </div>
        )}
      </div>

      {/* Primary Voice Capture Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/65 border border-slate-800 rounded-xl p-3.5">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleToggleRecording}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 whitespace-nowrap shadow-md transition active:scale-95 flex-1 sm:flex-initial ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-red-400/50 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white shrink-0" />
                <span>Detener grabación</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 shrink-0" />
                <span>Responder hablando</span>
              </>
            )}
          </button>

          {speechResult && (
            <button
              type="button"
              onClick={resetQuestionState}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-300 text-center sm:text-right">
          {isRecording ? (
            <span className="text-amber-300 font-semibold">
              {interimTranscript
                ? `Escuchando: "${interimTranscript}"`
                : `Habla ahora en ${activeLangInfo.name}...`}
            </span>
          ) : (
            <span>
              {speechSupported
                ? 'Reconocimiento Web Speech API activo con validación fonética andina/amazónica.'
                : 'Navegador sin sensor de voz nativo: pulsa "Responder hablando" o usa el modo sin micrófono.'}
            </span>
          )}
        </div>
      </div>

      {/* Friendly Microphone Error Banner */}
      {speechError && (
        <div
          role="alert"
          className="bg-amber-950/70 border border-amber-500/60 text-amber-100 rounded-xl p-3 text-xs flex items-start gap-2.5"
        >
          <MicOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300">Micrófono no disponible o bloqueado</div>
            <p className="text-[11px] text-amber-100/90 mt-0.5">{speechError}</p>
          </div>
        </div>
      )}

      {/* Phonetic / No-Mic Fallback Form */}
      {showFallbackInput && (
        <form
          onSubmit={handleManualEvaluate}
          className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2"
        >
          <label
            htmlFor={`phonetic-input-${currentQuestion.id}`}
            className="block text-xs font-bold text-slate-200"
          >
            Práctica sin micrófono — escribe tu respuesta tal como suena en {activeLangInfo.name}:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id={`phonetic-input-${currentQuestion.id}`}
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={`Ej. escribe cómo pronuncias la respuesta...`}
              className="flex-1 bg-slate-950/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl transition shrink-0"
            >
              Evaluar respuesta
            </button>
          </div>
        </form>
      )}

      {/* Immediate Pronunciation Feedback Card */}
      {speechResult && (
        <div
          aria-live="polite"
          className={`rounded-xl border p-3.5 space-y-2.5 text-xs ${
            speechResult.passed
              ? 'bg-sky-950/65 border-sky-500 text-sky-100'
              : 'bg-red-950/50 border-red-500/70 text-red-100'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              {speechResult.passed ? (
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>Precisión de Pronunciación: {speechResult.accuracy}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              {speechResult.phoneticMatch && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/40">
                  Equivalencia fonética
                </span>
              )}
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                  speechResult.passed
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                    : 'bg-red-500/25 text-red-200 border border-red-400/40'
                }`}
              >
                {speechResult.passed ? 'Pronunciación aprobada' : 'Sigue practicando'}
              </span>
            </div>
          </div>

          {/* Accuracy Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950/70 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                speechResult.passed
                  ? 'bg-gradient-to-r from-sky-400 to-indigo-400'
                  : 'bg-gradient-to-r from-amber-500 to-red-400'
              }`}
              style={{ width: `${Math.max(4, speechResult.accuracy)}%` }}
            />
          </div>

          <p className="text-xs font-medium">{speechResult.feedback}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-950/40 rounded-lg px-2.5 py-2 border border-white/10">
            <div>
              <span className="text-slate-300">Lo que escuchamos: </span>
              <span className="font-mono font-bold text-white">"{spokenText}"</span>
            </div>
            <div>
              <span className="text-slate-300">Esperado: </span>
              <span className="font-bold text-amber-300">{currentQuestion.targetPhrase}</span>
            </div>
          </div>

          {/* Word-by-word pronunciation breakdown */}
          {speechResult.wordFeedback && speechResult.wordFeedback.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-200 block">
                Análisis por palabra:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {speechResult.wordFeedback.map((wf, idx) => (
                  <span
                    key={`${wf.expected}-${idx}`}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                      wf.matched
                        ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                        : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    }`}
                  >
                    <span>{wf.matched ? '✓' : '!'}</span>
                    <span>{wf.expected}</span>
                    <span className="opacity-75 font-mono text-[10px]">({wf.similarity}%)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Articulatory tip */}
          <div className="text-[11px] text-amber-200/90 flex items-start gap-1.5 pt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Consejo de articulación:</strong> {currentQuestion.pronunciationTip}
            </span>
          </div>
        </div>
      )}

      {/* Question Navigation */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/70">
        <button
          type="button"
          onClick={handlePrevQuestion}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Pregunta anterior</span>
        </button>

        <button
          type="button"
          onClick={handleNextQuestion}
          className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1 transition"
        >
          <span>Siguiente pregunta</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
