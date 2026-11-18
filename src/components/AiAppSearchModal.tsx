import React, { useState, useMemo } from 'react';
import {
  AppSearchHit,
  buildAppSearchIndex,
  searchIndexedAppContent,
  buildGeminiSearchContext,
} from '../utils/appSearchLogic';
import {
  LANGUAGES_CATALOG,
  LESSONS_DATABASE,
  VOCABULARY_QUIZ_BANK,
} from '../data/languages';
import { CULTURAL_MYTHS } from '../data/myths';
import { playChime } from '../utils/audioSpeech';
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Languages,
  Crown,
  User,
  Globe,
} from 'lucide-react';

interface AiAppSearchModalProps {
  onClose: () => void;
  onNavigateHit: (hit: AppSearchHit) => void;
  onOpenWebSearch?: (query: string) => void;
}

const SUGGESTED_QUERIES = [
  '¿Cómo saludar en Tsáfiki?',
  'Leyenda de Cantuña',
  'Palabras en Achuar Chicham',
  'Jaque mate en Ajedrez',
  "Cha'palaa y Awapit",
];

export const AiAppSearchModal: React.FC<AiAppSearchModalProps> = ({
  onClose,
  onNavigateHit,
  onOpenWebSearch,
}) => {
  const [query, setQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const searchIndex = useMemo(
    () =>
      buildAppSearchIndex({
        languages: LANGUAGES_CATALOG,
        lessonsByLanguage: LESSONS_DATABASE,
        vocabByLanguage: VOCABULARY_QUIZ_BANK,
        myths: CULTURAL_MYTHS,
      }),
    []
  );

  const catalogHits = useMemo(() => {
    const activeQuery = query.trim() || submittedQuery.trim();
    return activeQuery ? searchIndexedAppContent(searchIndex, activeQuery, 8) : [];
  }, [searchIndex, query, submittedQuery]);

  const runAiSearch = async (rawInput: string) => {
    const cleanQuery = rawInput.trim();
    if (!cleanQuery) return;

    setQuery(cleanQuery);
    setSubmittedQuery(cleanQuery);
    setAiAnswer(null);
    setAiError(null);
    setIsLoadingAi(true);
    playChime('click');

    const localHits = searchIndexedAppContent(searchIndex, cleanQuery, 8);
    const contextSnippets = buildGeminiSearchContext(localHits, 6);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQuery,
          contextSnippets,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAiError(
          typeof data?.message === 'string' && data.message
            ? data.message
            : 'No se pudo obtener respuesta del asistente IA en este momento.'
        );
      } else {
        setAiAnswer(typeof data?.answer === 'string' ? data.answer : '');
        setAiModel(typeof data?.model === 'string' ? data.model : 'gemini-4-hydrogen');
      }
    } catch {
      setAiError('Error de conexión con el servidor IA (/api/ai/search).');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runAiSearch(query);
  };

  const getKindBadgeStyle = (kind: AppSearchHit['kind']) => {
    switch (kind) {
      case 'Idioma':
      case 'Lección':
      case 'Vocabulario':
        return 'bg-sky-500/20 text-sky-300 border-sky-400/35';
      case 'Leyenda':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/35';
      case 'Mito':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/35';
      case 'Ajedrez':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/35';
      default:
        return 'bg-slate-700/60 text-slate-200 border-slate-600';
    }
  };

  const getKindIcon = (hit: AppSearchHit) => {
    if (hit.targetTab === 'languages') return <Languages className="w-4 h-4 text-sky-400 shrink-0" />;
    if (hit.targetTab === 'myths') return <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />;
    if (hit.targetTab === 'chess') return <Crown className="w-4 h-4 text-purple-400 shrink-0" />;
    return <User className="w-4 h-4 text-slate-300 shrink-0" />;
  };

  return (
    <div
      data-testid="ai-search-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-14 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Buscador inteligente e IA dentro de Yachay y Raíces"
    >
      <div className="animate-modal-enter w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center text-sky-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                Buscador IA de Yachay &amp; Raíces
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Busca idiomas del Ecuador, lecciones, mitos, leyendas o reglas de ajedrez
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador IA"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Form */}
        <div className="p-4 sm:p-6 space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                data-testid="ai-search-input"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ej: ¿Cómo se saluda en Tsáfiki?, Cantuña, Kichwa, jaque mate..."
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-sky-400 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              data-testid="ai-search-submit"
              disabled={!query.trim() || isLoadingAi}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition active:scale-[0.98] shrink-0"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buscar con IA</span>
                </>
              )}
            </button>
          </form>

          {/* Suggested Quick Chips */}
          {!submittedQuery && !query.trim() && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Sugerencias rápidas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void runAiSearch(suggestion)}
                    className="text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-full transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gemini AI Synthesized Answer Panel */}
          {(isLoadingAi || aiAnswer || aiError) && (
            <div
              data-testid="ai-search-answer-box"
              className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-950 via-indigo-950/35 to-slate-950 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Asistente IA de la App
                </span>
                {aiModel && (
                  <span className="text-[10px] text-slate-400 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-full">
                    {aiModel}
                  </span>
                )}
              </div>

              {isLoadingAi && (
                <div className="flex items-center gap-2 text-xs text-slate-300 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Analizando idiomas, lecciones, leyendas y mitos dentro de la app...</span>
                </div>
              )}

              {aiAnswer && (
                <div className="text-xs sm:text-sm text-slate-100 leading-relaxed space-y-1.5">
                  {aiAnswer.split('\n').map((line, lineIdx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    const normalizedLine = trimmed.replace(/^\*\s+/, '• ');
                    const parts = normalizedLine.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={lineIdx}>
                        {parts.map((part, pIdx) =>
                          part.startsWith('**') && part.endsWith('**') ? (
                            <strong key={pIdx} className="font-bold text-amber-200">
                              {part.slice(2, -2)}
                            </strong>
                          ) : (
                            <React.Fragment key={pIdx}>{part.replace(/\*/g, '')}</React.Fragment>
                          )
                        )}
                      </p>
                    );
                  })}
                </div>
              )}

              {aiError && (
                <div className="flex items-start gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          )}

          {/* Direct In-App Clickable Results */}
          {query.trim().length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Resultados directos en la app ({catalogHits.length})
                </span>
              </div>

              {catalogHits.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center text-xs text-slate-400">
                  No hay coincidencias exactas en el catálogo para &ldquo;{query.trim()}&rdquo;. Pulsa{' '}
                  <strong className="text-sky-300">Buscar con IA</strong> para consultar al asistente.
                </div>
              ) : (
                <div
                  data-testid="ai-search-results-list"
                  className="max-h-72 overflow-y-auto space-y-2 pr-1"
                >
                  {catalogHits.map(hit => (
                    <button
                      key={hit.id}
                      type="button"
                      data-testid={`search-hit-${hit.id}`}
                      onClick={() => {
                        onNavigateHit(hit);
                        onClose();
                      }}
                      className="w-full text-left rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800/80 hover:border-sky-500/40 p-3.5 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5">{getKindIcon(hit)}</div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getKindBadgeStyle(
                                hit.kind
                              )}`}
                            >
                              {hit.kind}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-200 transition">
                              {hit.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-300/90 font-medium">
                            {hit.subtitle}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {hit.excerpt}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {onOpenWebSearch && (
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                ¿Quieres investigar más en libros digitales, papers académicos o internet?
              </span>
              <button
                type="button"
                data-testid="search-modal-open-web-btn"
                onClick={() => {
                  const q = (query.trim() || submittedQuery.trim());
                  onClose();
                  onOpenWebSearch(q);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/45 text-indigo-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-300" />
                <span>Navegar en Internet y Libros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
