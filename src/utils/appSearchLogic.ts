import {
  CulturalMyth,
  LanguageCode,
  LanguageInfo,
  Lesson,
  VocabularyVoiceQuestion,
} from '../types';

export type SearchHitTargetTab = 'languages' | 'chess' | 'myths' | 'profile';
export type SearchHitKind =
  | 'Idioma'
  | 'Lección'
  | 'Vocabulario'
  | 'Leyenda'
  | 'Mito'
  | 'Ajedrez'
  | 'Perfil';

export interface AppSearchHit {
  id: string;
  kind: SearchHitKind;
  title: string;
  subtitle: string;
  excerpt: string;
  targetTab: SearchHitTargetTab;
  languageCode?: LanguageCode;
  mythId?: string;
  score?: number;
}

export interface AppSearchContextSnippet {
  title: string;
  kind: string;
  subtitle: string;
  excerpt: string;
}

export interface AppSearchSources {
  languages: LanguageInfo[];
  lessonsByLanguage: Record<LanguageCode, Lesson[]>;
  vocabByLanguage: Record<LanguageCode, VocabularyVoiceQuestion[]>;
  myths: CulturalMyth[];
}

export interface IndexedSearchEntry {
  hit: AppSearchHit;
  normalizedTitle: string;
  normalizedBody: string;
}

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STATIC_MODULE_ENTRIES: AppSearchHit[] = [
  {
    id: 'module-chess-ai',
    kind: 'Ajedrez',
    title: 'Ajedrez & IA con Detección de Jaque Mate',
    subtitle: 'Motor legal chess.js • Bot Estratégico • PvP',
    excerpt:
      'Juega ajedrez contra la IA (Aprendiz, Estratega o Gran Maestro) o en modo 2 jugadores. Detecta automáticamente jaque, jaque mate y tablas usando chess.js y suma ELO.',
    targetTab: 'chess',
  },
  {
    id: 'module-profile-certs',
    kind: 'Perfil',
    title: 'Mi Perfil, Certificados y Nube Firebase',
    subtitle: 'Progreso sincronizado • Certificados QR • Plan PRO',
    excerpt:
      "Consulta tu XP, racha diaria, ELO de ajedrez, certificados digitales por idioma (Kichwa, Shuar, Achuar, Tsáfiki, Cha'palaa, Awapit, Inglés y Francés) y cambia de cuenta Google.",
    targetTab: 'profile',
  },
];

export function buildAppSearchIndex(sources: AppSearchSources): IndexedSearchEntry[] {
  const entries: IndexedSearchEntry[] = [];

  // 1. Languages catalog (8 languages)
  for (const lang of sources.languages) {
    const hit: AppSearchHit = {
      id: `lang-${lang.code}`,
      kind: 'Idioma',
      title: `${lang.name} (${lang.nativeName})`,
      subtitle: `${lang.category === 'ancestral' ? 'Idioma del Ecuador' : 'Idioma Global'} • ${lang.region}`,
      excerpt: lang.description,
      targetTab: 'languages',
      languageCode: lang.code,
    };
    entries.push({
      hit,
      normalizedTitle: normalizeSearchText(`${lang.name} ${lang.nativeName} ${lang.code}`),
      normalizedBody: normalizeSearchText(`${lang.region} ${lang.description} idiomas ecuador`),
    });
  }

  // 2. Daily lessons across all languages (40 lessons)
  for (const [langCode, lessons] of Object.entries(sources.lessonsByLanguage) as [
    LanguageCode,
    Lesson[],
  ][]) {
    const langInfo = sources.languages.find(l => l.code === langCode);
    for (const lesson of lessons) {
      const exerciseSample = lesson.exercises
        .slice(0, 3)
        .map(ex => `${ex.instruction} ${ex.targetPhrase} (${ex.translation})`)
        .join(' • ');
      const hit: AppSearchHit = {
        id: `lesson-${lesson.id}`,
        kind: 'Lección',
        title: `Día ${lesson.dayNumber}: ${lesson.title}`,
        subtitle: `${langInfo?.name || langCode} • ${lesson.moduleLevel} • +${lesson.xpReward} XP`,
        excerpt: `${lesson.culturalConcept} ${exerciseSample}`,
        targetTab: 'languages',
        languageCode: langCode,
      };
      entries.push({
        hit,
        normalizedTitle: normalizeSearchText(
          `${lesson.title} ${langInfo?.name || langCode} dia ${lesson.dayNumber}`
        ),
        normalizedBody: normalizeSearchText(
          `${lesson.description} ${lesson.culturalConcept} ${exerciseSample}`
        ),
      });
    }
  }

  // 3. Vocabulary quiz bank
  for (const [langCode, questions] of Object.entries(sources.vocabByLanguage) as [
    LanguageCode,
    VocabularyVoiceQuestion[],
  ][]) {
    const langInfo = sources.languages.find(l => l.code === langCode);
    for (const q of questions) {
      const hit: AppSearchHit = {
        id: `vocab-${q.id}`,
        kind: 'Vocabulario',
        title: q.promptEs,
        subtitle: `${langInfo?.name || langCode} • Voz: "${q.targetPhrase}" (${q.phoneticGuide})`,
        excerpt: `${q.meaningHint}. Respuestas aceptadas: ${q.acceptablePhrases.join(', ')}. ${q.pronunciationTip}`,
        targetTab: 'languages',
        languageCode: langCode,
      };
      entries.push({
        hit,
        normalizedTitle: normalizeSearchText(`${q.promptEs} ${q.targetPhrase} ${langInfo?.name || ''}`),
        normalizedBody: normalizeSearchText(
          `${q.acceptablePhrases.join(' ')} ${q.meaningHint} ${q.phoneticGuide} ${q.pronunciationTip} ${q.category}`
        ),
      });
    }
  }

  // 4. Leyendas & Mitos + Glossary terms
  for (const myth of sources.myths) {
    const glossaryWords = myth.illustratedStory
      .flatMap(ch => ch.glossaryTerms.map(g => `${g.word} (${g.meaning})`))
      .slice(0, 5)
      .join(', ');
    const hit: AppSearchHit = {
      id: myth.id,
      kind: myth.category === 'mito' ? 'Mito' : 'Leyenda',
      title: myth.title,
      subtitle: `${myth.culturalOrigin} • ${myth.readTimeMin} min lectura`,
      excerpt: `${myth.summary}${glossaryWords ? ` Glosario: ${glossaryWords}.` : ''}`,
      targetTab: 'myths',
      mythId: myth.id,
    };
    entries.push({
      hit,
      normalizedTitle: normalizeSearchText(`${myth.title} ${myth.category}`),
      normalizedBody: normalizeSearchText(
        `${myth.culturalOrigin} ${myth.summary} ${myth.region} ${glossaryWords}`
      ),
    });
  }

  // 5. Static app features (Chess & Profile)
  for (const mod of STATIC_MODULE_ENTRIES) {
    entries.push({
      hit: mod,
      normalizedTitle: normalizeSearchText(mod.title),
      normalizedBody: normalizeSearchText(`${mod.subtitle} ${mod.excerpt}`),
    });
  }

  return entries;
}

export function searchIndexedAppContent(
  entries: IndexedSearchEntry[],
  query: string,
  limit: number = 8
): AppSearchHit[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery.split(' ').filter(t => t.length >= 2);
  const scored: { hit: AppSearchHit; score: number }[] = [];

  for (const entry of entries) {
    let score = 0;

    if (entry.normalizedTitle === normalizedQuery) {
      score += 120;
    } else if (entry.normalizedTitle.includes(normalizedQuery)) {
      score += 75;
    } else if (entry.normalizedBody.includes(normalizedQuery)) {
      score += 40;
    }

    let matchedTokenCount = 0;
    for (const token of tokens) {
      if (entry.normalizedTitle.includes(token)) {
        score += 24;
        matchedTokenCount++;
      } else if (entry.normalizedBody.includes(token)) {
        score += 11;
        matchedTokenCount++;
      }
    }

    if (tokens.length > 1 && matchedTokenCount === tokens.length) {
      score += 25;
    }

    if (score > 0) {
      if (
        entry.hit.kind === 'Idioma' ||
        entry.hit.kind === 'Leyenda' ||
        entry.hit.kind === 'Mito' ||
        entry.hit.kind === 'Ajedrez'
      ) {
        score += 6;
      }
      scored.push({ hit: { ...entry.hit, score }, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.hit);
}

export function buildGeminiSearchContext(
  hits: AppSearchHit[],
  maxItems: number = 6
): AppSearchContextSnippet[] {
  return hits.slice(0, maxItems).map(hit => ({
    title: hit.title,
    kind: hit.kind,
    subtitle: hit.subtitle,
    excerpt: hit.excerpt.slice(0, 260),
  }));
}
