import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  PracticeLanguage,
  PracticeChatMessage,
  getStarterDialogueForLanguage,
  parseTutorJsonResponse,
  getGrammarBadgeMeta,
  trimPracticeHistory,
} from '../utils/aiPracticeLogic';
import { speakText, playChime } from '../utils/audioSpeech';
import {
  Sparkles,
  X,
  Send,
  Volume2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
} from 'lucide-react';

interface AiLanguageChatBubbleProps {
  initialLanguage: PracticeLanguage;
  onClose: () => void;
  onEarnXp?: (xpAmount: number) => void;
}

function createInitialMessages(lang: PracticeLanguage): PracticeChatMessage[] {
  const starter = getStarterDialogueForLanguage(lang);
  return [
    {
      id: `starter-${lang}`,
      role: 'assistant',
      text: starter.greetingNative,
      translationEs: starter.greetingEs,
      pronunciationGuide: starter.pronunciationGuide,
    },
  ];
}

export const AiLanguageChatBubble: React.FC<AiLanguageChatBubbleProps> = ({
  initialLanguage,
  onClose,
  onEarnXp,
}) => {
  const [practiceLang, setPracticeLang] = useState<PracticeLanguage>(initialLanguage);
  const [messages, setMessages] = useState<PracticeChatMessage[]>(() =>
    createInitialMessages(initialLanguage)
  );
  const [draft, setDraft] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  const starter = getStarterDialogueForLanguage(practiceLang);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, errorMsg]);

  const handleSwitchLanguage = (nextLang: PracticeLanguage) => {
    if (nextLang === practiceLang) return;
    setPracticeLang(nextLang);
    setMessages(createInitialMessages(nextLang));
    setDraft('');
    setErrorMsg(null);
    playChime('click');
  };

  const handleResetChat = () => {
    setMessages(createInitialMessages(practiceLang));
    setDraft('');
    setErrorMsg(null);
    playChime('click');
  };

  const sendMessage = async (rawText: string) => {
    const clean = rawText.trim();
    if (!clean || isSending) return;

    const userMsg: PracticeChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const historySnapshot = trimPracticeHistory([...messages, userMsg], 8);
    setMessages(prev => [...prev, userMsg]);
    setDraft('');
    setErrorMsg(null);
    setIsSending(true);
    playChime('click');

    try {
      const res = await fetch('/api/ai/language-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: practiceLang,
          message: clean,
          history: historySnapshot.slice(0, -1),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          typeof data?.message === 'string' && data.message
            ? data.message
            : 'No se pudo conectar con el tutor Gemini en este momento.'
        );
        playChime('error');
        return;
      }

      const parsed = parseTutorJsonResponse(typeof data?.raw === 'string' ? data.raw : '');
      if (!parsed) {
        setErrorMsg('El tutor IA respondió en un formato inesperado. Intenta reformular tu frase.');
        playChime('error');
        return;
      }

      const assistantMsg: PracticeChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'assistant',
        text: parsed.replyNative,
        translationEs: parsed.replyEs,
        pronunciationGuide: parsed.pronunciationGuide,
        grammarStatus: parsed.grammarStatus,
        grammarFeedback: parsed.grammarFeedback,
        correctedPhrase: parsed.correctedPhrase,
        nextPromptEs: parsed.nextPromptEs,
      };

      setMessages(prev => [...prev, assistantMsg]);
      playChime('success');
      onEarnXp?.(10);
    } catch {
      setErrorMsg('Error de red al comunicarse con /api/ai/language-practice.');
      playChime('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(draft);
  };

  const bubbleContent = (
    <aside
      data-testid="ai-practice-chat-bubble"
      aria-label="Práctica conversacional con IA en Kichwa y Shuar"
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[420px] z-50 rounded-[28px] bg-slate-900/95 backdrop-blur-2xl border border-sky-400/35 shadow-[0_20px_60px_rgba(0,0,0,0.75)] flex flex-col max-h-[82vh] overflow-hidden animate-modal-enter text-white"
    >
      {/* Bubble Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-sky-950/80 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-md shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                Práctica con IA
              </h3>
              <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/35 px-1.5 py-0.5 rounded-full">
                Gemini
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              Chat breve + corrección gramatical en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-testid="ai-practice-close"
            onClick={onClose}
            aria-label="Cerrar chat de práctica con IA"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Language Switcher Pill Bar (Kichwa / Shuar) */}
      <div className="px-3 py-2 bg-slate-950/70 border-b border-white/[0.06] flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          data-testid="ai-practice-lang-kichwa"
          onClick={() => handleSwitchLanguage('kichwa')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 border ${
            practiceLang === 'kichwa'
              ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>🏔️</span>
          <span>Kichwa Unificado</span>
        </button>
        <button
          type="button"
          data-testid="ai-practice-lang-shuar"
          onClick={() => handleSwitchLanguage('shuar')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 border ${
            practiceLang === 'shuar'
              ? 'bg-sky-500/20 text-sky-200 border-sky-400/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>🌿</span>
          <span>Shuar Chicham</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div
        data-testid="ai-practice-messages"
        className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950/40 min-h-[230px]"
      >
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          const badge = msg.grammarStatus ? getGrammarBadgeMeta(msg.grammarStatus) : null;

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}>
              {/* Chat Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-800/95 border border-slate-700/90 text-slate-100 rounded-bl-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-relaxed">{msg.text}</p>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => {
                        speakText(msg.text, practiceLang);
                        playChime('click');
                      }}
                      aria-label={`Escuchar frase en ${practiceLang === 'shuar' ? 'Shuar' : 'Kichwa'}`}
                      className="p-1 rounded-lg bg-slate-700/70 hover:bg-sky-500/30 text-sky-300 transition shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {msg.pronunciationGuide && (
                  <p className="text-[10px] font-mono text-amber-300/90 mt-1">
                    {msg.pronunciationGuide}
                  </p>
                )}

                {msg.translationEs && (
                  <p className="text-[11px] text-slate-300 mt-1 pt-1 border-t border-white/10">
                    {msg.translationEs}
                  </p>
                )}
              </div>

              {/* Real-Time Grammar Correction Card */}
              {!isUser && msg.grammarFeedback && badge && (
                <div
                  data-testid="ai-grammar-correction-card"
                  className="max-w-[92%] rounded-2xl bg-slate-900/95 border border-slate-700/80 p-2.5 text-[11px] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.toneClass}`}
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold">+10 XP</span>
                  </div>

                  <p className="text-slate-200 leading-snug">{msg.grammarFeedback}</p>

                  {msg.correctedPhrase && (
                    <div className="flex items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          Forma sugerida
                        </span>
                        <span className="text-xs font-bold text-sky-300 break-words">
                          {msg.correctedPhrase}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakText(msg.correctedPhrase!, practiceLang)}
                        aria-label="Escuchar forma sugerida"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {msg.nextPromptEs && (
                    <p className="text-[10px] text-slate-400 italic">💡 {msg.nextPromptEs}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-sky-200 bg-slate-800/80 border border-slate-700 rounded-2xl px-3 py-2 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Revisando gramática y respondiendo...</span>
          </div>
        )}

        {errorMsg && (
          <div
            data-testid="ai-practice-error"
            className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-200 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={scrollBottomRef} />
      </div>

      {/* Starter Prompt Chips */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto shrink-0">
        {starter.quickPrompts.map(prompt => (
          <button
            key={prompt}
            type="button"
            disabled={isSending}
            onClick={() => void sendMessage(prompt)}
            className="text-[10.5px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-slate-950/90 border-t border-white/10 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          data-testid="ai-practice-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={`Escribe en ${practiceLang === 'shuar' ? 'Shuar' : 'Kichwa'} o pregunta...`}
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-full px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition"
        />
        <button
          type="submit"
          data-testid="ai-practice-send"
          disabled={!draft.trim() || isSending}
          aria-label="Enviar mensaje al tutor IA"
          className="w-9 h-9 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition active:scale-95 shrink-0"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </aside>
  );

  return typeof document !== 'undefined' ? createPortal(bubbleContent, document.body) : bubbleContent;
};
