import React, { useState, useEffect, useCallback } from 'react';
import {
  WebSourceCategory,
  WebSearchResult,
  ReadableWebPage,
  normalizeNavigableUrl,
  extractHostname,
} from '../utils/webBrowserLogic';
import { playChime } from '../utils/audioSpeech';
import {
  Globe,
  Search,
  BookOpen,
  GraduationCap,
  X,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  FileText,
  Monitor,
  Link2,
} from 'lucide-react';

interface WebAcademicBrowserModalProps {
  initialQuery?: string;
  onClose: () => void;
}

type HistoryEntry =
  | { type: 'home' }
  | { type: 'search'; query: string; category: WebSourceCategory }
  | { type: 'page'; url: string; title?: string };

const CATEGORY_TABS: {
  id: WebSourceCategory;
  label: string;
  mobileLabel: string;
  icon: React.ReactNode;
}[] = [
  { id: 'all', label: 'Todo Internet', mobileLabel: 'Todo', icon: <Globe className="w-3.5 h-3.5" /> },
  {
    id: 'academic',
    label: 'Fuentes Académicas',
    mobileLabel: 'Académicas',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
  },
  { id: 'books', label: 'Libros', mobileLabel: 'Libros', icon: <BookOpen className="w-3.5 h-3.5" /> },
  {
    id: 'web',
    label: 'Enciclopedia y Web',
    mobileLabel: 'Web',
    icon: <FileText className="w-3.5 h-3.5" />,
  },
];

const QUICK_TOPICS = [
  { label: 'Cultura Kichwa Ecuador libros', category: 'books' as WebSourceCategory },
  { label: 'Lengua Shuar Amazonía lingüística', category: 'academic' as WebSourceCategory },
  { label: 'Leyendas de Quito Cantuña patrimonio', category: 'all' as WebSourceCategory },
  { label: 'Historia del ajedrez FIDE estrategia', category: 'academic' as WebSourceCategory },
  { label: 'Idiomas indígenas del Ecuador', category: 'web' as WebSourceCategory },
];

export const WebAcademicBrowserModal: React.FC<WebAcademicBrowserModalProps> = ({
  initialQuery = '',
  onClose,
}) => {
  const [addressInput, setAddressInput] = useState<string>(initialQuery);
  const [category, setCategory] = useState<WebSourceCategory>('all');
  const [history, setHistory] = useState<HistoryEntry[]>([{ type: 'home' }]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  // Search state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [aiWarning, setAiWarning] = useState<string | null>(null);
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // In-app page reader state
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<ReadableWebPage | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState<'reader' | 'iframe'>('reader');

  const currentEntry = history[historyIdx] || { type: 'home' };

  const pushHistory = useCallback((entry: HistoryEntry) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIdx + 1);
      return [...sliced, entry];
    });
    setHistoryIdx(prev => prev + 1);
  }, [historyIdx]);

  const executeWebSearch = useCallback(
    async (rawQuery: string, targetCategory: WebSourceCategory, recordHistory: boolean = true) => {
      const clean = rawQuery.trim();
      if (!clean) return;

      setAddressInput(clean);
      setCategory(targetCategory);
      setActiveSearchQuery(clean);
      setIsSearching(true);
      setSearchError(null);
      setAiSummary(null);
      setAiModel(null);
      setAiWarning(null);
      if (recordHistory) {
        pushHistory({ type: 'search', query: clean, category: targetCategory });
      }
      playChime('click');

      try {
        const res = await fetch('/api/web/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: clean,
            category: targetCategory,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSearchError(
            typeof data?.message === 'string' && data.message
              ? data.message
              : 'No se pudo consultar la web en este momento.'
          );
          setResults([]);
        } else {
          setAiSummary(typeof data?.aiSummary === 'string' ? data.aiSummary : null);
          setAiModel(typeof data?.aiModel === 'string' ? data.aiModel : null);
          setAiWarning(typeof data?.aiWarning === 'string' ? data.aiWarning : null);
          setResults(Array.isArray(data?.results) ? data.results : []);
        }
      } catch {
        setSearchError('Error de red al conectar con el buscador web integrado (/api/web/search).');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [pushHistory]
  );

  const openUrlInsideApp = useCallback(
    async (rawUrl: string, recordHistory: boolean = true) => {
      const normalized = normalizeNavigableUrl(rawUrl);
      if (!normalized) {
        setPageError('URL inválida. Escribe una dirección http:// o https:// válida.');
        return;
      }

      setAddressInput(normalized);
      setReaderMode('reader');
      setIsLoadingPage(true);
      setPageError(null);
      setCurrentPage({
        url: normalized,
        domain: extractHostname(normalized),
        title: extractHostname(normalized),
        description: '',
        blocks: [],
        links: [],
      });
      if (recordHistory) {
        pushHistory({ type: 'page', url: normalized });
      }
      playChime('click');

      try {
        const res = await fetch('/api/web/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalized }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setPageError(
            typeof data?.message === 'string' && data.message
              ? data.message
              : 'No se pudo cargar la página dentro de la app.'
          );
        } else if (data?.page) {
          setCurrentPage(data.page as ReadableWebPage);
        }
      } catch {
        setPageError('Error de conexión al leer la página web dentro de la app.');
      } finally {
        setIsLoadingPage(false);
      }
    },
    [pushHistory]
  );

  useEffect(() => {
    if (initialQuery.trim()) {
      void executeWebSearch(initialQuery.trim(), 'all', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOmniboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = addressInput.trim();
    if (!trimmed) return;

    const maybeUrl = normalizeNavigableUrl(trimmed);
    if (maybeUrl) {
      void openUrlInsideApp(maybeUrl, true);
    } else {
      void executeWebSearch(trimmed, category, true);
    }
  };

  const navigateHistoryTo = (nextIdx: number) => {
    const entry = history[nextIdx];
    if (!entry) return;
    setHistoryIdx(nextIdx);
    playChime('click');
    if (entry.type === 'home') {
      setAddressInput('');
    } else if (entry.type === 'search') {
      void executeWebSearch(entry.query, entry.category, false);
    } else if (entry.type === 'page') {
      void openUrlInsideApp(entry.url, false);
    }
  };

  const handleReload = () => {
    if (currentEntry.type === 'search') {
      void executeWebSearch(currentEntry.query, currentEntry.category, false);
    } else if (currentEntry.type === 'page') {
      void openUrlInsideApp(currentEntry.url, false);
    }
  };

  const getCategoryBadge = (cat: WebSearchResult['category']) => {
    if (cat === 'academic') {
      return {
        label: 'Académico',
        cls: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
      };
    }
    if (cat === 'books') {
      return {
        label: 'Libro',
        cls: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
      };
    }
    return {
      label: 'Web',
      cls: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    };
  };

  return (
    <div
      data-testid="web-academic-browser-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Navegador web, libros y fuentes académicas dentro de la app"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5"
    >
      <div className="animate-modal-enter w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Top Browser Chrome Toolbar */}
        <div className="px-3 sm:px-4 py-2.5 bg-slate-950 border-b border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  Navegador Internet, Libros &amp; Fuentes Académicas
                </h2>
                <p className="text-[10px] text-slate-400 truncate">
                  Explora artículos científicos, libros y web sin salir de Yachay &amp; Raíces
                </p>
              </div>
            </div>

            <button
              type="button"
              data-testid="close-web-browser-btn"
              onClick={onClose}
              aria-label="Cerrar navegador web integrado"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Controls + Omnibox */}
          <form onSubmit={handleOmniboxSubmit} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                data-testid="web-browser-back"
                disabled={historyIdx <= 0}
                onClick={() => navigateHistoryTo(historyIdx - 1)}
                aria-label="Atrás en el navegador"
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-700 flex items-center justify-center text-slate-200 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-testid="web-browser-forward"
                disabled={historyIdx >= history.length - 1}
                onClick={() => navigateHistoryTo(historyIdx + 1)}
                aria-label="Adelante en el navegador"
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-700 flex items-center justify-center text-slate-200 transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleReload}
                disabled={currentEntry.type === 'home' || isSearching || isLoadingPage}
                aria-label="Recargar"
                className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 border border-slate-700 items-center justify-center text-slate-200 transition"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSearching || isLoadingPage ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => pushHistory({ type: 'home' })}
                aria-label="Inicio del navegador"
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-300 transition"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                data-testid="web-browser-input"
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                placeholder="Buscar libros, papers, temas o pegar URL (https://...)"
                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              data-testid="web-browser-submit"
              disabled={!addressInput.trim() || isSearching || isLoadingPage}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow transition shrink-0"
            >
              {isSearching || isLoadingPage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Ir / Buscar</span>
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {CATEGORY_TABS.map(tab => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`web-filter-${tab.id}`}
                  onClick={() => {
                    setCategory(tab.id);
                    const q =
                      (currentEntry.type === 'search' ? currentEntry.query : activeSearchQuery) ||
                      addressInput.trim();
                    if (q && !normalizeNavigableUrl(q)) {
                      void executeWebSearch(q, tab.id, true);
                    }
                  }}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition shrink-0 ${
                    active
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewport Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-900/60 space-y-4">
          {/* HOME VIEW */}
          {currentEntry.type === 'home' && (
            <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border border-slate-800 p-5 sm:p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center mx-auto text-sky-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Investiga en Internet, Libros y Papers Académicos sin salir de la App
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                  Busca libros en <strong>Open Library</strong>, artículos científicos en{' '}
                  <strong>OpenAlex</strong>, enciclopedia y resultados en vivo con{' '}
                  <strong>Google Search Grounding</strong>, y abre cada fuente en el lector integrado.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Temas recomendados para investigar ahora
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_TOPICS.map(topic => (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => void executeWebSearch(topic.label, topic.category, true)}
                      className="text-left rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-400/45 p-3.5 transition flex items-center justify-between gap-2 group"
                    >
                      <span className="text-xs font-semibold text-slate-100 group-hover:text-sky-200">
                        {topic.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEARCH RESULTS VIEW */}
          {currentEntry.type === 'search' && (
            <div className="space-y-4">
              {/* Gemini Grounded Research Summary */}
              {(isSearching || aiSummary || aiWarning) && (
                <div
                  data-testid="web-search-ai-summary"
                  className="rounded-2xl border border-sky-500/35 bg-gradient-to-br from-slate-950 via-indigo-950/35 to-slate-950 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Síntesis Académica &amp; Web con IA
                    </span>
                    {aiModel && (
                      <span className="text-[10px] text-slate-300 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-full">
                        {aiModel}
                      </span>
                    )}
                  </div>

                  {isSearching ? (
                    <div className="flex items-center gap-2 text-xs text-slate-300 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                      <span>Buscando en internet, libros y repositorios académicos...</span>
                    </div>
                  ) : aiSummary ? (
                    <div className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line">
                      {aiSummary.replace(/\*\*/g, '')}
                    </div>
                  ) : aiWarning ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{aiWarning}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void executeWebSearch(activeSearchQuery, category, false)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-100 font-bold text-[11px] whitespace-nowrap shrink-0 transition"
                      >
                        Reintentar IA
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {searchError && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Results Cards */}
              {!isSearching && results.length > 0 && (
                <div className="space-y-2.5" data-testid="web-search-results-list">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Fuentes encontradas en la web ({results.length}) — pulsa cualquiera para navegar dentro de la app
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.map(item => {
                      const badge = getCategoryBadge(item.category);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`web-result-card-${item.id}`}
                          onClick={() => void openUrlInsideApp(item.url, true)}
                          className="text-left rounded-2xl bg-slate-950/85 hover:bg-slate-800/85 border border-slate-800 hover:border-sky-400/50 p-3.5 transition flex flex-col justify-between gap-2.5 group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.cls}`}
                                >
                                  {badge.label}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {item.sourceName}
                                </span>
                              </div>
                              {item.year && (
                                <span className="text-[10px] text-amber-300 font-bold">
                                  {item.year}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-200 line-clamp-2">
                              {item.title}
                            </h4>

                            {item.authors && (
                              <p className="text-[11px] text-sky-300/90 truncate">{item.authors}</p>
                            )}

                            <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                              {item.snippet}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
                            <span className="text-slate-400 truncate font-mono">{item.domain}</span>
                            <span className="text-sky-300 font-bold flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                              <span>Abrir aquí</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isSearching && results.length === 0 && !searchError && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center text-xs text-slate-400">
                  No se encontraron enlaces directos para esa consulta. Prueba otro término o pega una URL en la barra superior.
                </div>
              )}
            </div>
          )}

          {/* PAGE READER VIEW (Inside the app!) */}
          {currentEntry.type === 'page' && currentPage && (
            <div data-testid="web-inapp-reader" className="space-y-3">
              {/* Sub-bar for Reader vs Iframe Mode */}
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/30 px-2.5 py-1 rounded-full truncate">
                    {currentPage.domain}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateHistoryTo(Math.max(0, historyIdx - 1))}
                    className="text-[11px] font-semibold text-slate-300 hover:text-white underline"
                  >
                    Volver a resultados
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="inline-flex bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                    <button
                      type="button"
                      data-testid="reader-mode-clean"
                      onClick={() => setReaderMode('reader')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition ${
                        readerMode === 'reader'
                          ? 'bg-sky-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Modo Lector</span>
                    </button>
                    <button
                      type="button"
                      data-testid="reader-mode-iframe"
                      onClick={() => setReaderMode('iframe')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition ${
                        readerMode === 'iframe'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Marco Web</span>
                    </button>
                  </div>

                  <a
                    href={currentPage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir página original en pestaña nueva"
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10.5px] font-semibold text-slate-200 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline">Original</span>
                  </a>
                </div>
              </div>

              {isLoadingPage ? (
                <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                  <span>Cargando contenido web en el navegador interno...</span>
                </div>
              ) : readerMode === 'iframe' ? (
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-white">
                  <div className="bg-slate-900 px-3 py-1.5 text-[10.5px] text-amber-200 border-b border-slate-800">
                    Si el sitio bloquea marcos embebidos por seguridad, cambia a <strong>Modo Lector</strong> arriba para leerlo y navegar por sus enlaces sin salir de la app.
                  </div>
                  <iframe
                    src={currentPage.url}
                    title={currentPage.title}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    className="w-full h-[56vh] bg-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Readable Article Body */}
                  <article className="lg:col-span-2 rounded-2xl bg-slate-950/85 border border-slate-800 p-4 sm:p-6 space-y-3">
                    <h3 className="text-base sm:text-lg font-extrabold text-amber-200 leading-snug">
                      {currentPage.title}
                    </h3>
                    {currentPage.description && (
                      <p className="text-xs sm:text-sm text-sky-200/90 italic border-l-2 border-sky-400 pl-3">
                        {currentPage.description}
                      </p>
                    )}

                    {pageError && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200 space-y-1.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>Aviso del sitio</span>
                        </div>
                        <p>{pageError}</p>
                      </div>
                    )}

                    {currentPage.blocks.length > 0 ? (
                      <div className="space-y-3 pt-1">
                        {currentPage.blocks.map((block, idx) =>
                          block.type === 'heading' ? (
                            <h4
                              key={idx}
                              className="text-sm sm:text-base font-bold text-white pt-2 border-t border-slate-800/70"
                            >
                              {block.text}
                            </h4>
                          ) : (
                            <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                              {block.text}
                            </p>
                          )
                        )}
                      </div>
                    ) : !pageError ? (
                      <p className="text-xs text-slate-400">
                        Este sitio carga su contenido de forma dinámica. Puedes explorar sus enlaces en el panel derecho o cambiar a <strong>Marco Web</strong>.
                      </p>
                    ) : null}
                  </article>

                  {/* Clickable In-Page Links to Continue Browsing Inside the App */}
                  <aside className="rounded-2xl bg-slate-950/85 border border-slate-800 p-4 space-y-2.5 h-fit">
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-sky-400" />
                      <span>Navegar enlaces de esta página ({currentPage.links.length})</span>
                    </div>
                    {currentPage.links.length === 0 ? (
                      <p className="text-[11px] text-slate-400">
                        No se detectaron enlaces internos adicionales en este documento.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[48vh] overflow-y-auto pr-1">
                        {currentPage.links.map((lnk, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => void openUrlInsideApp(lnk.url, true)}
                            className="w-full text-left px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-400/40 transition flex items-start justify-between gap-2 group"
                          >
                            <span className="text-[11px] font-medium text-slate-200 group-hover:text-sky-200 line-clamp-2">
                              {lnk.text}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300 shrink-0 mt-0.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </aside>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
