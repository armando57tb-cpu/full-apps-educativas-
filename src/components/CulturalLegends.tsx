import React, { useState, useEffect, useRef } from 'react';
import { CulturalMyth, UserProfile } from '../types';
import { CULTURAL_MYTHS } from '../data/myths';
import {
  CategoryFilter,
  filterAndPartitionNarratives,
  getNarrativeCategoryCounts,
  isNarrativeUnlocked,
  grantAdVideoUnlock,
  clampCarouselIndex,
  stepCarouselIndex,
} from '../utils/mythsLogic';
import { speakText, playChime } from '../utils/audioSpeech';
import { GoogleAdSenseBanner } from './GoogleAdSenseBanner';
import {
  BookOpen,
  Film,
  Play,
  Pause,
  Lock,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Upload,
  Link as LinkIcon,
  Video as VideoIcon,
  Trash2,
  AlertCircle,
  Maximize2,
  RotateCcw,
  Sliders,
  Wand2,
  Camera,
  Layers,
  Tv,
  Crown,
} from 'lucide-react';

interface CulturalLegendsProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenFreemium: () => void;
  focusedMythId?: string | null;
  onClearFocusedMyth?: () => void;
}

export const CulturalLegends: React.FC<CulturalLegendsProps> = ({
  user,
  onUpdateUser,
  onOpenFreemium,
  focusedMythId,
  onClearFocusedMyth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('todos');
  const [selectedRegion, setSelectedRegion] = useState<string>('todos');
  const [activeMyth, setActiveMyth] = useState<CulturalMyth | null>(null);
  const [activeFormat, setActiveFormat] = useState<'reader' | 'video' | 'ai-studio' | 'upload'>('reader');

  // Reader state
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<{
    word: string;
    language: string;
    meaning: string;
    pronunciation: string;
  } | null>(null);

  // Video Player state
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [subtitleLang, setSubtitleLang] = useState<'es' | 'kichwa' | 'shuar' | 'en'>('es');
  const [isVoiceNarrationActive, setIsVoiceNarrationActive] = useState<boolean>(true);
  const [selectedTriviaIndex, setSelectedTriviaIndex] = useState<number | null>(null);
  const [triviaChecked, setTriviaChecked] = useState<boolean>(false);

  // AI Video Studio generation state
  const [selectedAiStyle, setSelectedAiStyle] = useState<string>('cinematic');
  const [selectedAiCamera, setSelectedAiCamera] = useState<string>('pan-zoom');
  const [isGeneratingAiClip, setIsGeneratingAiClip] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<number>(0);
  const [activeCustomPrompt, setActiveCustomPrompt] = useState<string>('');
  const [aiGeneratedSuccessNotice, setAiGeneratedSuccessNotice] = useState<string | null>(null);

  // Rewarded Google AdSense Ad Gate state (watch ad to unlock locked videos)
  const [adGate, setAdGate] = useState<{
    myth: CulturalMyth;
    targetFormat: 'reader' | 'video' | 'ai-studio' | 'upload';
  } | null>(null);
  const [adWatchState, setAdWatchState] = useState<'choice' | 'watching' | 'ready'>('choice');
  const [adSecondsRemaining, setAdSecondsRemaining] = useState<number>(5);

  // Custom user uploaded video state
  const [customVideos, setCustomVideos] = useState<
    Record<string, { url: string; fileName: string; type: 'file' | 'link' }>
  >(() => {
    try {
      const saved = localStorage.getItem('yachay_custom_videos_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [inputVideoUrl, setInputVideoUrl] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Video playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVideoPlaying && activeMyth && !customVideos[activeMyth.id]) {
      timer = setInterval(() => {
        setVideoCurrentTime(t => {
          if (t >= activeMyth.videoExperience.durationSec) {
            setIsVideoPlaying(false);
            return activeMyth.videoExperience.durationSec;
          }
          return t + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isVideoPlaying, activeMyth, customVideos, playbackSpeed]);

  // Voice narration in sync with subtitles
  const lastSpokenSubRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isVideoPlaying || !isVoiceNarrationActive || !activeMyth) return;

    const currentSub = activeMyth.videoExperience.subtitles
      .slice()
      .reverse()
      .find(s => videoCurrentTime >= s.timestampSec);

    if (currentSub && currentSub.timestampSec !== lastSpokenSubRef.current) {
      lastSpokenSubRef.current = currentSub.timestampSec;
      const textToSpeak =
        subtitleLang === 'kichwa' && currentSub.kichwa
          ? currentSub.kichwa
          : subtitleLang === 'shuar' && currentSub.shuar
          ? currentSub.shuar
          : subtitleLang === 'en'
          ? currentSub.en
          : currentSub.es;

      const langCode =
        subtitleLang === 'kichwa'
          ? 'kichwa'
          : subtitleLang === 'shuar'
          ? 'shuar'
          : subtitleLang === 'en'
          ? 'en'
          : 'es';

      speakText(textToSpeak, langCode as any);
    }
  }, [videoCurrentTime, isVideoPlaying, isVoiceNarrationActive, subtitleLang, activeMyth]);

  const { legends, mythsList, totalCount } = filterAndPartitionNarratives(CULTURAL_MYTHS, {
    categoryFilter: selectedCategory,
    regionFilter: selectedRegion,
  });
  const categoryCounts = getNarrativeCategoryCounts(CULTURAL_MYTHS, selectedRegion);

  // Carousel tracks & active indices for Leyendas & Mitos
  const legendsTrackRef = useRef<HTMLDivElement | null>(null);
  const mythsTrackRef = useRef<HTMLDivElement | null>(null);
  const [legendSlideIdx, setLegendSlideIdx] = useState<number>(0);
  const [mythSlideIdx, setMythSlideIdx] = useState<number>(0);

  useEffect(() => {
    setLegendSlideIdx(0);
    setMythSlideIdx(0);
    if (legendsTrackRef.current) legendsTrackRef.current.scrollLeft = 0;
    if (mythsTrackRef.current) mythsTrackRef.current.scrollLeft = 0;
  }, [selectedCategory, selectedRegion]);

  // Open narrative directly when navigated from in-app AI Search
  useEffect(() => {
    if (!focusedMythId) return;
    const match = CULTURAL_MYTHS.find(m => m.id === focusedMythId);
    if (match) {
      handleSelectMyth(match, 'reader');
    }
    onClearFocusedMyth?.();
  }, [focusedMythId]);

  const scrollCarouselTo = (
    trackRef: React.RefObject<HTMLDivElement | null>,
    targetIdx: number,
    setIdx: React.Dispatch<React.SetStateAction<number>>,
    totalItems: number
  ) => {
    if (totalItems <= 0) return;
    const clamped = clampCarouselIndex(targetIdx, totalItems);
    setIdx(clamped);
    const track = trackRef.current;
    if (!track) return;
    const targetCard = track.children[clamped] as HTMLElement | undefined;
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    playChime('click');
  };

  // Countdown timer for Rewarded Google AdSense ad
  useEffect(() => {
    if (!adGate || adWatchState !== 'watching') return;
    if (adSecondsRemaining <= 0) {
      const updatedUnlocked = grantAdVideoUnlock(user.adUnlockedMythIds, adGate.myth.id);
      onUpdateUser({
        adUnlockedMythIds: updatedUnlocked,
        xp: user.xp + 15,
      });
      setAdWatchState('ready');
      playChime('success');
      return;
    }

    const timer = setTimeout(() => {
      setAdSecondsRemaining(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [adGate, adWatchState, adSecondsRemaining, user.adUnlockedMythIds, user.xp, onUpdateUser]);

  const openMythContentDirectly = (
    myth: CulturalMyth,
    format: 'reader' | 'video' | 'ai-studio' | 'upload'
  ) => {
    setActiveMyth(myth);
    setActiveFormat(format);
    setCurrentSceneIdx(0);
    setActiveGlossaryTerm(null);
    setIsVideoPlaying(format === 'video');
    setVideoCurrentTime(0);
    setSelectedTriviaIndex(null);
    setTriviaChecked(false);
    setUploadSuccessMsg(null);
    setAiGeneratedSuccessNotice(null);
    setActiveCustomPrompt(myth.videoExperience.aiPromptUsed || '');
    playChime('click');
  };

  const handleSelectMyth = (myth: CulturalMyth, format: 'reader' | 'video' | 'ai-studio' | 'upload') => {
    if (!isNarrativeUnlocked(myth, user)) {
      setAdGate({ myth, targetFormat: format });
      setAdWatchState('choice');
      setAdSecondsRemaining(5);
      playChime('click');
      return;
    }

    openMythContentDirectly(myth, format);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeMyth || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);

    const updated = {
      ...customVideos,
      [activeMyth.id]: {
        url: objectUrl,
        fileName: file.name,
        type: 'file' as const,
      },
    };

    setCustomVideos(updated);
    try {
      localStorage.setItem('yachay_custom_videos_v2', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setUploadSuccessMsg(`¡Video "${file.name}" cargado exitosamente! Listo para reproducir.`);
    setActiveFormat('video');
    playChime('success');
  };

  const handleLinkSave = () => {
    if (!activeMyth || !inputVideoUrl.trim()) return;

    const updated = {
      ...customVideos,
      [activeMyth.id]: {
        url: inputVideoUrl.trim(),
        fileName: 'Enlace de video en línea',
        type: 'link' as const,
      },
    };

    setCustomVideos(updated);
    try {
      localStorage.setItem('yachay_custom_videos_v2', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setUploadSuccessMsg('¡Enlace de video guardado exitosamente!');
    setInputVideoUrl('');
    setActiveFormat('video');
    playChime('success');
  };

  const handleRemoveCustomVideo = () => {
    if (!activeMyth) return;
    const next = { ...customVideos };
    delete next[activeMyth.id];
    setCustomVideos(next);
    try {
      localStorage.setItem('yachay_custom_videos_v2', JSON.stringify(next));
    } catch {
      // ignore
    }
    setUploadSuccessMsg(null);
    playChime('click');
  };

  // AI Video Studio generation simulation
  const handleGenerateAiVideoClip = () => {
    if (isGeneratingAiClip || !activeMyth) return;
    setIsGeneratingAiClip(true);
    setGenerationStage(1);
    playChime('bell');

    setTimeout(() => {
      setGenerationStage(2);
    }, 900);

    setTimeout(() => {
      setGenerationStage(3);
    }, 1800);

    setTimeout(() => {
      setIsGeneratingAiClip(false);
      setGenerationStage(0);
      setAiGeneratedSuccessNotice(
        `¡Clip de video generado con éxito con estilo ${selectedAiStyle.toUpperCase()} y encuadre ${selectedAiCamera}!`
      );
      playChime('success');
      setActiveFormat('video');
      setIsVideoPlaying(true);
      setVideoCurrentTime(0);
    }, 2800);
  };

  const currentCustomVideo = activeMyth ? customVideos[activeMyth.id] : null;

  // Subtitle matching
  const currentSubtitle = activeMyth?.videoExperience.subtitles
    .slice()
    .reverse()
    .find(s => videoCurrentTime >= s.timestampSec);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderNarrativeCard = (myth: CulturalMyth, isCarouselSlide: boolean = false) => {
    const isUnlocked = isNarrativeUnlocked(myth, user);
    const isLocked = !isUnlocked;
    const isAdUnlocked =
      myth.isLockedForFree && !user.isPro && (user.adUnlockedMythIds || []).includes(myth.id);
    const hasCustomVideo = !!customVideos[myth.id];
    const hasAiVideo = !!myth.videoExperience.aiVideoAssetUrl;
    const isMyth = myth.category === 'mito';

    return (
      <div
        key={myth.id}
        data-testid={`narrative-card-${myth.id}`}
        className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
          isCarouselSlide
            ? 'w-[86%] sm:w-[48%] lg:w-[46%] xl:w-[32%] shrink-0 snap-start'
            : ''
        } ${
          isLocked
            ? 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
            : isMyth
            ? 'bg-slate-900/90 border-sky-500/35 hover:border-sky-400/70 shadow-lg'
            : 'bg-slate-900/90 border-amber-500/35 hover:border-amber-400/70 shadow-lg'
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${
                  isMyth
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                {isMyth ? 'Mito' : 'Leyenda'}
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 whitespace-nowrap">
                {myth.culturalOrigin}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {hasCustomVideo ? (
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap">
                  <VideoIcon className="w-3 h-3 shrink-0" /> Propio
                </span>
              ) : hasAiVideo ? (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" /> Video IA
                </span>
              ) : null}

              {isLocked ? (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Lock className="w-3 h-3 shrink-0" /> PRO / Anuncio
                </span>
              ) : isAdUnlocked ? (
                <span className="text-[10px] text-indigo-200 bg-indigo-500/25 border border-indigo-400/40 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  Desbloqueado c/ Anuncio
                </span>
              ) : (
                <span className="text-[10px] text-sky-200 bg-sky-500/15 border border-sky-400/30 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  Acceso Libre
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl border border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow-sm overflow-hidden relative ${
                isMyth
                  ? 'bg-gradient-to-tr from-indigo-950 to-sky-700/60'
                  : 'bg-gradient-to-tr from-indigo-900 to-amber-700/60'
              }`}
            >
              {myth.videoExperience.aiVideoAssetUrl ? (
                <img
                  src={myth.videoExperience.aiVideoAssetUrl}
                  alt={myth.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{myth.coverImage}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{myth.title}</h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                {myth.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            ⏱️ {myth.readTimeMin} min lectura • {myth.illustratedStory.length} capítulos
          </span>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {isLocked ? (
              <>
                <button
                  onClick={() => handleSelectMyth(myth, 'video')}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Ver con Anuncio</span>
                </button>
                <button
                  onClick={() => handleSelectMyth(myth, 'reader')}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Leer</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSelectMyth(myth, 'reader')}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Leer</span>
                </button>

                <button
                  onClick={() => handleSelectMyth(myth, 'video')}
                  className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-2.5 py-1.5 rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Ver Video IA</span>
                </button>

                <button
                  onClick={() => handleSelectMyth(myth, 'ai-studio')}
                  aria-label={`Estudio de Video IA para ${myth.title}`}
                  className="flex items-center gap-1 bg-sky-900/70 hover:bg-sky-800 text-sky-200 border border-sky-700/60 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
                  title="Estudio de Video IA"
                >
                  <Wand2 className="w-3.5 h-3.5 text-sky-300" />
                  <span className="hidden sm:inline">Estudio IA</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header & Category/Region Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-md space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Patrimonio Cultural &amp; Memoria Oral del Ecuador y del Mundo
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>Leyendas y Mitos Separados por Categoría</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Explora por separado relatos folclóricos e históricos (Leyendas) y cosmogonías ancestrales de origen (Mitos) con lectura, glosario y video IA.
            </p>
          </div>
        </div>

        {/* Category Separation Tabs */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoría narrativa">
          <button
            role="tab"
            aria-selected={selectedCategory === 'todos'}
            onClick={() => {
              setSelectedCategory('todos');
              playChime('click');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition flex items-center gap-1.5 ${
              selectedCategory === 'todos'
                ? 'bg-indigo-500/25 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span>📚 Todas</span>
            <span className="bg-slate-950/80 text-slate-200 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {categoryCounts.all}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={selectedCategory === 'leyenda'}
            onClick={() => {
              setSelectedCategory('leyenda');
              playChime('click');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition flex items-center gap-1.5 ${
              selectedCategory === 'leyenda'
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-slate-800/70 text-amber-300 border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <span>📜 Leyendas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                selectedCategory === 'leyenda'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-950/80 text-amber-300'
              }`}
            >
              {categoryCounts.legends}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={selectedCategory === 'mito'}
            onClick={() => {
              setSelectedCategory('mito');
              playChime('click');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition flex items-center gap-1.5 ${
              selectedCategory === 'mito'
                ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-sm'
                : 'bg-slate-800/70 text-sky-300 border-sky-500/30 hover:bg-slate-800'
            }`}
          >
            <span>🌌 Mitos</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                selectedCategory === 'mito'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-950/80 text-sky-300'
              }`}
            >
              {categoryCounts.myths}
            </span>
          </button>
        </div>

        {/* Region Filters */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
          {[
            { id: 'todos', label: 'Todos los Orígenes' },
            { id: 'ecuador-sierra', label: '🏔️ Sierra Ecuatoriana' },
            { id: 'ecuador-costa', label: '🌊 Costa / Ría' },
            { id: 'ecuador-oriente', label: '🌿 Amazonía Ancestral' },
            { id: 'internacional', label: '🌐 Internacional' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedRegion(f.id);
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedRegion === f.id
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-xs'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Filter State */}
      {totalCount === 0 && (
        <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-6 text-center space-y-2.5">
          <p className="text-sm font-bold text-white">
            No hay relatos en esta combinación de categoría y región.
          </p>
          <p className="text-xs text-slate-400">
            Prueba cambiar la categoría o volver a ver todos los orígenes culturales.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSelectedRegion('todos');
              playChime('click');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
          >
            Mostrar todas las Leyendas y Mitos
          </button>
        </div>
      )}

      {/* SECTION 1: LEYENDAS CAROUSEL */}
      {legends.length > 0 && (
        <section
          aria-label="Carrusel de Leyendas"
          data-testid="legends-section"
          className="space-y-3 animate-section-enter"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/35 rounded-2xl px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">📜</span>
                <h3 className="text-sm sm:text-base font-extrabold text-amber-300">
                  Carrusel de Leyendas Históricas y Populares
                </h3>
                <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  {legends.length} {legends.length === 1 ? 'leyenda' : 'leyendas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Desliza horizontalmente o usa las flechas para explorar ciudades, conventos y tradición oral.
              </p>
            </div>

            {legends.length > 1 && (
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-[11px] font-mono font-bold text-amber-200 bg-slate-950/70 border border-slate-700 px-2.5 py-1 rounded-full">
                  {clampCarouselIndex(legendSlideIdx, legends.length) + 1} / {legends.length}
                </span>
                <button
                  type="button"
                  data-testid="legends-carousel-prev"
                  aria-label="Leyenda anterior"
                  onClick={() =>
                    scrollCarouselTo(
                      legendsTrackRef,
                      stepCarouselIndex(legendSlideIdx, -1, legends.length),
                      setLegendSlideIdx,
                      legends.length
                    )
                  }
                  className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 flex items-center justify-center transition active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  data-testid="legends-carousel-next"
                  aria-label="Siguiente leyenda"
                  onClick={() =>
                    scrollCarouselTo(
                      legendsTrackRef,
                      stepCarouselIndex(legendSlideIdx, 1, legends.length),
                      setLegendSlideIdx,
                      legends.length
                    )
                  }
                  className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 flex items-center justify-center shadow-md transition active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={legendsTrackRef}
            data-testid="legends-carousel-track"
            onScroll={e => {
              const el = e.currentTarget;
              const firstChild = el.children[0] as HTMLElement | undefined;
              if (!firstChild || firstChild.offsetWidth <= 0) return;
              const approxIdx = Math.round(el.scrollLeft / (firstChild.offsetWidth + 16));
              setLegendSlideIdx(clampCarouselIndex(approxIdx, legends.length));
            }}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
          >
            {legends.map(item => renderNarrativeCard(item, true))}
          </div>

          {legends.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5" role="group" aria-label="Paginación de leyendas">
              {legends.map((item, idx) => {
                const isActive = clampCarouselIndex(legendSlideIdx, legends.length) === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Ir a leyenda ${idx + 1}: ${item.title}`}
                    onClick={() => scrollCarouselTo(legendsTrackRef, idx, setLegendSlideIdx, legends.length)}
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? 'w-6 bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Mid-Catalog Google AdSense Placement */}
      {legends.length > 0 && mythsList.length > 0 && (
        <GoogleAdSenseBanner
          user={user}
          slotName="Entre Leyendas y Mitos"
          format="horizontal"
          onOpenFreemium={onOpenFreemium}
        />
      )}

      {/* SECTION 2: MITOS CAROUSEL */}
      {mythsList.length > 0 && (
        <section
          aria-label="Carrusel de Mitos"
          data-testid="myths-section"
          className="space-y-3 animate-section-enter"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-500/15 via-indigo-950/60 to-slate-900 border border-sky-500/35 rounded-2xl px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">🌌</span>
                <h3 className="text-sm sm:text-base font-extrabold text-sky-300">
                  Carrusel de Mitos Ancestrales y Cosmogónicos
                </h3>
                <span className="text-[11px] font-mono font-bold bg-sky-500/20 text-sky-200 border border-sky-400/40 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  {mythsList.length} {mythsList.length === 1 ? 'mito' : 'mitos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Desliza horizontalmente para descubrir orígenes sagrados de montañas, selvas, ríos y sabiduría humana.
              </p>
            </div>

            {mythsList.length > 1 && (
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-[11px] font-mono font-bold text-sky-200 bg-slate-950/70 border border-slate-700 px-2.5 py-1 rounded-full">
                  {clampCarouselIndex(mythSlideIdx, mythsList.length) + 1} / {mythsList.length}
                </span>
                <button
                  type="button"
                  data-testid="myths-carousel-prev"
                  aria-label="Mito anterior"
                  onClick={() =>
                    scrollCarouselTo(
                      mythsTrackRef,
                      stepCarouselIndex(mythSlideIdx, -1, mythsList.length),
                      setMythSlideIdx,
                      mythsList.length
                    )
                  }
                  className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-sky-500 hover:text-slate-950 text-sky-300 border border-sky-500/40 flex items-center justify-center transition active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  data-testid="myths-carousel-next"
                  aria-label="Siguiente mito"
                  onClick={() =>
                    scrollCarouselTo(
                      mythsTrackRef,
                      stepCarouselIndex(mythSlideIdx, 1, mythsList.length),
                      setMythSlideIdx,
                      mythsList.length
                    )
                  }
                  className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 border border-sky-300 flex items-center justify-center shadow-md transition active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={mythsTrackRef}
            data-testid="myths-carousel-track"
            onScroll={e => {
              const el = e.currentTarget;
              const firstChild = el.children[0] as HTMLElement | undefined;
              if (!firstChild || firstChild.offsetWidth <= 0) return;
              const approxIdx = Math.round(el.scrollLeft / (firstChild.offsetWidth + 16));
              setMythSlideIdx(clampCarouselIndex(approxIdx, mythsList.length));
            }}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3"
          >
            {mythsList.map(item => renderNarrativeCard(item, true))}
          </div>

          {mythsList.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5" role="group" aria-label="Paginación de mitos">
              {mythsList.map((item, idx) => {
                const isActive = clampCarouselIndex(mythSlideIdx, mythsList.length) === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Ir a mito ${idx + 1}: ${item.title}`}
                    onClick={() => scrollCarouselTo(mythsTrackRef, idx, setMythSlideIdx, mythsList.length)}
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? 'w-6 bg-sky-400 shadow-sm shadow-sky-400/50'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Google AdSense Placement */}
      <GoogleAdSenseBanner
        user={user}
        slotName="Catálogo de Leyendas y Mitos"
        format="infeed"
        onOpenFreemium={onOpenFreemium}
      />

      {/* FULL MYTH MODAL VIEWER */}
      {activeMyth && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="bg-slate-950/90 p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      activeMyth.category === 'mito'
                        ? 'bg-sky-500/25 text-sky-300'
                        : 'bg-amber-500/25 text-amber-300'
                    }`}
                  >
                    {activeMyth.category === 'mito' ? 'Mito' : 'Leyenda'}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    {activeMyth.culturalOrigin}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">{activeMyth.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => {
                      setActiveFormat('reader');
                      setIsVideoPlaying(false);
                      playChime('click');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                      activeFormat === 'reader' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Lectura</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFormat('video');
                      setIsVideoPlaying(true);
                      playChime('click');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                      activeFormat === 'video' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    <span>Video IA</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFormat('ai-studio');
                      setIsVideoPlaying(false);
                      playChime('click');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                      activeFormat === 'ai-studio' ? 'bg-sky-500 text-slate-950' : 'text-sky-300'
                    }`}
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Estudio IA</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFormat('upload');
                      setIsVideoPlaying(false);
                      playChime('click');
                    }}
                    className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                      activeFormat === 'upload' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                    title="Subir archivo o enlace de video propio"
                  >
                    <Upload className="w-3 h-3" />
                    <span className="hidden sm:inline">Subir</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveMyth(null);
                    setIsVideoPlaying(false);
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      try {
                        window.speechSynthesis.cancel();
                      } catch {
                        // ignore
                      }
                    }
                    playChime('click');
                  }}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {activeFormat === 'reader' && (
                <div className="space-y-4">
                  {activeMyth.illustratedStory[currentSceneIdx] && (
                    <div className="space-y-3.5">
                      <div className="bg-gradient-to-r from-indigo-950 via-amber-950/50 to-slate-900 border border-slate-700 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
                        <div className="text-3xl mb-1">{activeMyth.coverImage}</div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                          Capítulo {currentSceneIdx + 1} de {activeMyth.illustratedStory.length}
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {activeMyth.illustratedStory[currentSceneIdx].title}
                        </h4>
                        <div className="text-[11px] text-slate-300 italic">
                          Estilo visual: {activeMyth.illustratedStory[currentSceneIdx].illustrationStyle}
                        </div>
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4 sm:p-6 text-slate-100 text-xs sm:text-sm leading-relaxed space-y-2 text-justify">
                        <p>{activeMyth.illustratedStory[currentSceneIdx].text}</p>
                      </div>

                      {/* Interactive Native Glossary */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Glosario Interactivo Ancestral (Toca para escuchar):</span>
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {activeMyth.illustratedStory[currentSceneIdx].glossaryTerms.map((term, tIdx) => (
                            <button
                              key={tIdx}
                              onClick={() => {
                                setActiveGlossaryTerm(term);
                                speakText(term.word, 'kichwa');
                              }}
                              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>{term.word}</span>
                              <span className="text-[10px] opacity-75">({term.language})</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {activeGlossaryTerm && (
                        <div className="p-3.5 bg-slate-800/85 border border-sky-500/50 rounded-xl text-xs space-y-1 animate-fade-in shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-amber-300 text-sm">
                              {activeGlossaryTerm.word}
                            </span>
                            <span className="font-mono text-[10px] text-sky-300">
                              Fonética: {activeGlossaryTerm.pronunciation}
                            </span>
                          </div>
                          <div className="text-slate-100">{activeGlossaryTerm.meaning}</div>
                        </div>
                      )}

                      {/* Scene Navigation */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        <button
                          onClick={() => {
                            if (currentSceneIdx > 0) {
                              setCurrentSceneIdx(prev => prev - 1);
                              setActiveGlossaryTerm(null);
                              playChime('click');
                            }
                          }}
                          disabled={currentSceneIdx === 0}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 text-slate-200 disabled:opacity-30 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Capítulo Anterior</span>
                        </button>

                        <span className="text-xs text-slate-300 font-mono">
                          {currentSceneIdx + 1} / {activeMyth.illustratedStory.length}
                        </span>

                        <button
                          onClick={() => {
                            if (currentSceneIdx < activeMyth.illustratedStory.length - 1) {
                              setCurrentSceneIdx(prev => prev + 1);
                              setActiveGlossaryTerm(null);
                              playChime('click');
                            }
                          }}
                          disabled={currentSceneIdx >= activeMyth.illustratedStory.length - 1}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30 transition"
                        >
                          <span>Siguiente Capítulo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeFormat === 'video' && (
                <div className="space-y-4">
                  {currentCustomVideo ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-sky-300 bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-800/40">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-sky-400" />
                          <span>
                            Reproduciendo tu video subido: <strong>{currentCustomVideo.fileName}</strong>
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCustomVideo}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Quitar
                        </button>
                      </div>

                      <div className="aspect-video bg-black rounded-2xl overflow-hidden border-2 border-sky-500 shadow-2xl flex items-center justify-center">
                        {currentCustomVideo.type === 'file' ||
                        currentCustomVideo.url.endsWith('.mp4') ||
                        currentCustomVideo.url.endsWith('.webm') ? (
                          <video
                            src={currentCustomVideo.url}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <iframe
                            src={currentCustomVideo.url}
                            title="Video de leyenda"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl flex flex-col justify-between group">
                        {activeMyth.videoExperience.aiVideoAssetUrl ? (
                          <div className="absolute inset-0 overflow-hidden">
                            <img
                              src={activeMyth.videoExperience.aiVideoAssetUrl}
                              alt={activeMyth.title}
                              className={`w-full h-full object-cover transition-transform duration-[18000ms] ease-out ${
                                isVideoPlaying ? 'scale-115 translate-x-2 -translate-y-1' : 'scale-100'
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center">
                            <div className="text-6xl mb-2">{activeMyth.coverImage}</div>
                          </div>
                        )}

                        <div className="relative z-10 p-3 flex items-center justify-between text-xs text-white">
                          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-bold text-amber-300">
                              {activeMyth.videoExperience.videoTitle}
                            </span>
                            <span className="text-[10px] text-sky-300 font-mono">
                              • Motor Gemini Veo AI
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIsVoiceNarrationActive(!isVoiceNarrationActive);
                                playChime('click');
                              }}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 backdrop-blur-md border transition ${
                                isVoiceNarrationActive
                                  ? 'bg-sky-600/80 text-white border-sky-400'
                                  : 'bg-black/60 text-slate-400 border-white/10'
                              }`}
                              title="Activar/Desactivar narración de voz"
                            >
                              {isVoiceNarrationActive ? (
                                <Volume2 className="w-3.5 h-3.5" />
                              ) : (
                                <VolumeX className="w-3.5 h-3.5" />
                              )}
                              <span>Voz</span>
                            </button>

                            {/* Subtitle Language Switcher */}
                            <div className="flex items-center bg-black/70 backdrop-blur-md rounded-full p-0.5 border border-white/10 text-[10px] font-bold">
                              {(['es', 'kichwa', 'shuar', 'en'] as const).map(lang => (
                                <button
                                  key={lang}
                                  onClick={() => {
                                    setSubtitleLang(lang);
                                    playChime('click');
                                  }}
                                  className={`px-2 py-0.5 rounded-full transition uppercase ${
                                    subtitleLang === lang
                                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                                      : 'text-stone-300 hover:text-white'
                                  }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 3. Subtitles Overlay (Synchronized with timeline) */}
                        <div className="relative z-10 px-4 py-2 mx-auto max-w-xl text-center">
                          <div className="bg-black/80 backdrop-blur-md border border-amber-400/50 px-4 py-2 rounded-2xl shadow-xl space-y-0.5 animate-in fade-in duration-300">
                            <p className="text-xs sm:text-sm font-bold text-amber-300 leading-snug">
                              {subtitleLang === 'es' && (currentSubtitle?.es || '...')}
                              {subtitleLang === 'kichwa' &&
                                (currentSubtitle?.kichwa || currentSubtitle?.es || '...')}
                              {subtitleLang === 'shuar' &&
                                (currentSubtitle?.shuar || currentSubtitle?.es || '...')}
                              {subtitleLang === 'en' && (currentSubtitle?.en || '...')}
                            </p>
                            <span className="text-[9px] text-sky-300 font-mono tracking-wider uppercase block">
                              Subtítulo: {subtitleLang.toUpperCase()} • Tiempo: {formatTime(videoCurrentTime)}
                            </span>
                          </div>
                        </div>

                        {/* 4. Bottom Scrubber and Player Controls */}
                        <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
                              {formatTime(videoCurrentTime)}
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={activeMyth.videoExperience.durationSec}
                              value={videoCurrentTime}
                              onChange={e => setVideoCurrentTime(Number(e.target.value))}
                              className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-slate-400 w-8">
                              {formatTime(activeMyth.videoExperience.durationSec)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-white">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setIsVideoPlaying(!isVideoPlaying);
                                  playChime('click');
                                }}
                                className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition shadow-md"
                              >
                                {isVideoPlaying ? (
                                  <Pause className="w-4 h-4 fill-slate-950" />
                                ) : (
                                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setVideoCurrentTime(0);
                                  setIsVideoPlaying(true);
                                  playChime('click');
                                }}
                                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                                title="Reiniciar Video"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setPlaybackSpeed(prev => (prev === 1 ? 1.25 : prev === 1.25 ? 0.75 : 1));
                                  playChime('click');
                                }}
                                className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[10px] font-bold text-amber-300"
                              >
                                {playbackSpeed}x
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveFormat('ai-studio')}
                                className="flex items-center gap-1 text-[11px] font-bold bg-sky-900/60 hover:bg-sky-800 border border-sky-600/50 px-2.5 py-1 rounded-xl text-sky-200 transition"
                              >
                                <Wand2 className="w-3.5 h-3.5 text-sky-300" />
                                <span>Ajustar Prompt IA</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Trivia Question */}
                      {activeMyth.videoExperience.triviaQuestion && (
                        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>Pregunta de Sabiduría Cultural:</span>
                          </div>
                          <p className="font-semibold text-white">
                            {activeMyth.videoExperience.triviaQuestion.question}
                          </p>

                          <div className="space-y-1.5">
                            {activeMyth.videoExperience.triviaQuestion.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setSelectedTriviaIndex(oIdx);
                                  setTriviaChecked(true);
                                  playChime(
                                    oIdx === activeMyth.videoExperience.triviaQuestion.correctIndex
                                      ? 'success'
                                      : 'error'
                                  );
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition ${
                                  triviaChecked &&
                                  oIdx === activeMyth.videoExperience.triviaQuestion.correctIndex
                                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                                    : triviaChecked && selectedTriviaIndex === oIdx
                                    ? 'bg-red-500/20 border-red-400 text-red-200'
                                    : selectedTriviaIndex === oIdx
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                    : 'bg-slate-950/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>

                          {triviaChecked && (
                            <p className="text-[11px] text-sky-300 italic pt-1">
                              💡 {activeMyth.videoExperience.triviaQuestion.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FORMAT 3: AI VIDEO STUDIO */}
              {activeFormat === 'ai-studio' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 border border-sky-500/50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Wand2 className="w-4 h-4 text-sky-400" />
                        <span>Generador y Estudio de Video IA</span>
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded-full border border-sky-500/40">
                        Veo • Imagen 4K
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Personaliza el estilo cinematográfico, encuadre de cámara y prompt de generación para sintetizar clips de video en alta fidelidad de esta leyenda ancestral.
                    </p>
                  </div>

                  {aiGeneratedSuccessNotice && (
                    <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-400 text-sky-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                      <span>{aiGeneratedSuccessNotice}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Estilo Visual de Generación IA:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'cinematic', label: '🎬 Cine 4K' },
                        { id: 'watercolor', label: '🎨 Acuarela Andina' },
                        { id: 'baroque', label: '🏛️ Barroco Quiteño' },
                        { id: 'amazon', label: '🌿 Mítico Shuar' },
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setSelectedAiStyle(st.id);
                            playChime('click');
                          }}
                          className={`p-2.5 rounded-xl border font-bold text-center transition ${
                            selectedAiStyle === st.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-xs'
                              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      <span>Movimiento y Dinamismo de Cámara:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'pan-zoom', label: '🎥 Pan & Zoom Lento' },
                        { id: 'wide-angle', label: '🌄 Plano General Épico' },
                        { id: 'close-up', label: '🔍 Primer Plano Expresivo' },
                      ].map(cam => (
                        <button
                          key={cam.id}
                          onClick={() => {
                            setSelectedAiCamera(cam.id);
                            playChime('click');
                          }}
                          className={`p-2 rounded-xl border text-center font-semibold text-[11px] transition ${
                            selectedAiCamera === cam.id
                              ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {cam.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Prompt de Video Cinemático IA:
                    </label>
                    <textarea
                      value={activeCustomPrompt}
                      onChange={e => setActiveCustomPrompt(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleGenerateAiVideoClip}
                      disabled={isGeneratingAiClip}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition active:scale-98 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>
                        {isGeneratingAiClip
                          ? 'Generando Video Cinemático con IA...'
                          : '🎬 Generar Nuevo Clip de Video IA'}
                      </span>
                    </button>

                    {isGeneratingAiClip && (
                      <div className="mt-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center space-y-2">
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-700"
                            style={{ width: `${generationStage * 33}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-amber-300 animate-pulse">
                          {generationStage === 1 && 'Paso 1: Analizando narrativa ancestral y mitología oral...'}
                          {generationStage === 2 && 'Paso 2: Sintetizando fotogramas clave y composición 4K...'}
                          {generationStage === 3 && 'Paso 3: Renderizando partículas, iluminación volumétrica y subtítulos...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FORMAT 4: UPLOAD OR LINK OWN VIDEO */}
              {activeFormat === 'upload' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      Sube tu Propio Video o Vincula una Producción Audiovisual
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Si has creado o grabado tu propia dramatización, documental o animación sobre{' '}
                      <strong>{activeMyth.title}</strong>, puedes cargar tu archivo local MP4/WebM o ingresar el enlace de YouTube/Vimeo.
                    </p>
                  </div>

                  {uploadSuccessMsg && (
                    <div className="p-3 bg-sky-950/60 border border-sky-500/60 rounded-xl text-xs text-sky-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-2 p-4 bg-slate-800/40 border border-slate-700 rounded-2xl">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Opción 1: Seleccionar archivo de video desde tu dispositivo (MP4, WebM):</span>
                    </span>

                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-slate-800/40 border border-slate-700 rounded-2xl">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-sky-400" />
                      <span>Opción 2: Pegar enlace de video en línea (YouTube, Vimeo, Cloud):</span>
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={inputVideoUrl}
                        onChange={e => setInputVideoUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                      />
                      <button
                        onClick={handleLinkSave}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REWARDED GOOGLE ADSENSE MODAL (WATCH AD TO UNLOCK LOCKED VIDEO/STORY) */}
      {adGate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Desbloquear video con anuncio Google AdSense"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-sky-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto">
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                  Opción Gratuita con Anuncio • Google AdSense
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {adGate.myth.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdGate(null);
                  setAdWatchState('choice');
                  playChime('click');
                }}
                aria-label="Cerrar diálogo de anuncio"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {adWatchState === 'choice' && (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Este relato y su video cinematográfico IA forman parte del catálogo extendido.
                    Elige cómo quieres desbloquearlo y guardarlo en tu cuenta en la nube:
                  </p>

                  {/* Option 1: Watch Sponsored Ad */}
                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500 text-slate-950 px-2 py-0.5 rounded-full">
                          Gratis con Anuncio
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">
                          Ver Anuncio Patrocinado Google AdSense (5 seg)
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Desbloquea el Video IA completo, capítulos ilustrados y glosario para esta
                          cuenta (+15 XP).
                        </p>
                      </div>
                      <Tv className="w-6 h-6 text-sky-400 shrink-0" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAdSecondsRemaining(5);
                        setAdWatchState('watching');
                        playChime('click');
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Ver Anuncio y Desbloquear Video Gratis</span>
                    </button>
                  </div>

                  {/* Option 2: Pro $1.25 */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>Pase Vitalicio Sin Anuncios ($1.25 USD)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Elimina todos los anuncios AdSense y abre los 18 relatos de por vida.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAdGate(null);
                        onOpenFreemium();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition"
                    >
                      Ir a Pro $1.25
                    </button>
                  </div>
                </>
              )}

              {adWatchState === 'watching' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                      Anuncio Recompensado • {adSecondsRemaining}s
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Monetización Google AdSense
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-1000"
                      style={{ width: `${((5 - adSecondsRemaining) / 5) * 100}%` }}
                    />
                  </div>

                  <GoogleAdSenseBanner
                    user={user}
                    slotName="Video Recompensado"
                    format="infeed"
                    onOpenFreemium={() => {
                      setAdGate(null);
                      onOpenFreemium();
                    }}
                  />

                  <p className="text-[11px] text-slate-300 text-center">
                    Tu video se desbloqueará automáticamente al finalizar el anuncio...
                  </p>
                </div>
              )}

              {adWatchState === 'ready' && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 rounded-full bg-sky-500/20 border-2 border-sky-400 text-sky-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">
                      ¡Video Desbloqueado con Éxito! (+15 XP)
                    </h4>
                    <p className="text-xs text-slate-300">
                      Se guardó en tu cuenta en la nube para volver a verlo cuando quieras.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const chosen = adGate;
                      setAdGate(null);
                      setAdWatchState('choice');
                      openMythContentDirectly(chosen.myth, chosen.targetFormat);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Film className="w-4 h-4" />
                    <span>Abrir {adGate.targetFormat === 'reader' ? 'Lectura Ilustrada' : 'Video IA'} Ahora</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
