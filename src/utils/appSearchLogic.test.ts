import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSearchText,
  buildAppSearchIndex,
  searchIndexedAppContent,
  buildGeminiSearchContext,
} from './appSearchLogic';
import {
  LANGUAGES_CATALOG,
  LESSONS_DATABASE,
  VOCABULARY_QUIZ_BANK,
} from '../data/languages';
import { CulturalMyth } from '../types';

const SAMPLE_MYTHS: CulturalMyth[] = [
  {
    id: 'myth-cantuna',
    category: 'leyenda',
    title: 'Cantuña y el Atrio de San Francisco',
    culturalOrigin: 'Leyenda Tradicional de Quito (Sierra Andina)',
    region: 'ecuador-sierra',
    coverImage: '🏛️⛪',
    readTimeMin: 8,
    summary: 'La hazaña de Francisco Cantuña en Quito colonial sin entregar su alma.',
    illustratedStory: [
      {
        scene: 1,
        title: 'Capítulo I',
        text: 'Texto de prueba',
        glossaryTerms: [
          {
            word: 'Ayni',
            language: 'Kichwa',
            meaning: 'Ley cósmica de reciprocidad',
            pronunciation: '[ay-ni]',
          },
        ],
        illustrationPrompt: 'Prompt',
        illustrationStyle: 'Oil',
      },
    ],
    videoExperience: {
      videoTitle: 'Cantuña',
      durationSec: 45,
      synopsis: 'Sinopsis',
      subtitles: [],
      triviaQuestion: {
        question: '¿Pregunta?',
        options: ['A', 'B'],
        correctIndex: 0,
        explanation: 'Explicación',
      },
    },
    isLockedForFree: false,
  },
  {
    id: 'myth-etsa',
    category: 'mito',
    title: 'Etsa y Arutam en la Selva Amazónica',
    culturalOrigin: 'Mitología Shuar y Achuar',
    region: 'ecuador-oriente',
    coverImage: '🌿🦅',
    readTimeMin: 7,
    summary: 'Mito cosmogónico amazónico de Etsa, el sol guerrero y Arutam.',
    illustratedStory: [],
    videoExperience: {
      videoTitle: 'Etsa',
      durationSec: 40,
      synopsis: 'Sinopsis',
      subtitles: [],
      triviaQuestion: {
        question: '¿Pregunta?',
        options: ['A', 'B'],
        correctIndex: 0,
        explanation: 'Explicación',
      },
    },
    isLockedForFree: true,
  },
];

const TEST_INDEX = buildAppSearchIndex({
  languages: LANGUAGES_CATALOG,
  lessonsByLanguage: LESSONS_DATABASE,
  vocabByLanguage: VOCABULARY_QUIZ_BANK,
  myths: SAMPLE_MYTHS,
});

test('normalizeSearchText folds accents and apostrophes cleanly', () => {
  assert.equal(normalizeSearchText("Tsáfiki & Cha'palaa!"), 'tsafiki chapalaa');
  assert.equal(normalizeSearchText('  Cantuña   Quito  '), 'cantuna quito');
});

test('searchIndexedAppContent finds all Ecuadorian languages including newly added ones', () => {
  const tsafikiHits = searchIndexedAppContent(TEST_INDEX, 'Tsáfiki');
  assert.ok(tsafikiHits.length > 0);
  assert.equal(tsafikiHits[0].languageCode, 'tsafiki');

  const chapalaaHits = searchIndexedAppContent(TEST_INDEX, 'chapalaa');
  assert.ok(chapalaaHits.some(h => h.languageCode === 'chapalaa'));
});

test('searchIndexedAppContent finds legends, myths, lessons, and chess rules', () => {
  const cantunaHits = searchIndexedAppContent(TEST_INDEX, 'Cantuña');
  assert.ok(cantunaHits.some(h => h.targetTab === 'myths' && h.mythId === 'myth-cantuna'));

  const etsaHits = searchIndexedAppContent(TEST_INDEX, 'Etsa Arutam');
  assert.ok(etsaHits.some(h => h.targetTab === 'myths' && h.mythId === 'myth-etsa'));

  const chessHits = searchIndexedAppContent(TEST_INDEX, 'jaque mate ajedrez');
  assert.ok(chessHits.some(h => h.targetTab === 'chess'));
});

test('buildGeminiSearchContext formats compact grounded snippets for the API', () => {
  const hits = searchIndexedAppContent(TEST_INDEX, 'Kichwa buenos dias');
  const snippets = buildGeminiSearchContext(hits, 4);
  assert.ok(snippets.length > 0 && snippets.length <= 4);
  assert.ok(snippets[0].title.length > 0);
  assert.ok(snippets[0].excerpt.length > 0);
});
