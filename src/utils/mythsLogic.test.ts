import test from 'node:test';
import assert from 'node:assert/strict';
import { CulturalMyth } from '../types';
import {
  filterAndPartitionNarratives,
  getNarrativeCategoryCounts,
  isNarrativeUnlocked,
  grantAdVideoUnlock,
  clampCarouselIndex,
  stepCarouselIndex,
} from './mythsLogic';

const makeNarrative = (
  id: string,
  category: 'leyenda' | 'mito',
  region: CulturalMyth['region'],
  isLockedForFree = false
): CulturalMyth => ({
  id,
  category,
  title: `${category} ${id}`,
  culturalOrigin: 'Origen cultural',
  region,
  coverImage: category === 'mito' ? '🌌' : '📜',
  readTimeMin: 6,
  summary: 'Resumen de prueba',
  illustratedStory: [],
  videoExperience: {
    videoTitle: 'Video de prueba',
    durationSec: 30,
    synopsis: 'Sinopsis',
    subtitles: [],
    triviaQuestion: {
      question: '¿Pregunta?',
      options: ['A', 'B'],
      correctIndex: 0,
      explanation: 'Explicación',
    },
  },
  isLockedForFree,
});

const SAMPLE_CATALOG: CulturalMyth[] = [
  makeNarrative('l1', 'leyenda', 'ecuador-sierra', false),
  makeNarrative('l2', 'leyenda', 'ecuador-costa', false),
  makeNarrative('l3', 'leyenda', 'ecuador-costa', true),
  makeNarrative('l4', 'leyenda', 'ecuador-sierra', true),
  makeNarrative('l5', 'leyenda', 'internacional', true),
  makeNarrative('m1', 'mito', 'ecuador-sierra', false),
  makeNarrative('m2', 'mito', 'ecuador-oriente', true),
  makeNarrative('m3', 'mito', 'ecuador-oriente', true),
  makeNarrative('m4', 'mito', 'ecuador-sierra', true),
  makeNarrative('m5', 'mito', 'internacional', true),
];

test('getNarrativeCategoryCounts tallies leyendas and mitos accurately per region', () => {
  const allCounts = getNarrativeCategoryCounts(SAMPLE_CATALOG, 'todos');
  assert.equal(allCounts.legends, 5);
  assert.equal(allCounts.myths, 5);
  assert.equal(allCounts.all, 10);

  const orienteCounts = getNarrativeCategoryCounts(SAMPLE_CATALOG, 'ecuador-oriente');
  assert.equal(orienteCounts.legends, 0);
  assert.equal(orienteCounts.myths, 2);
  assert.equal(orienteCounts.all, 2);
});

test('filterAndPartitionNarratives isolates leyendas from mitos accurately', () => {
  const onlyLegends = filterAndPartitionNarratives(SAMPLE_CATALOG, {
    categoryFilter: 'leyenda',
    regionFilter: 'todos',
  });
  assert.equal(onlyLegends.legends.length, 5);
  assert.equal(onlyLegends.mythsList.length, 0);
  assert.ok(onlyLegends.legends.every(item => item.category === 'leyenda'));

  const onlyMyths = filterAndPartitionNarratives(SAMPLE_CATALOG, {
    categoryFilter: 'mito',
    regionFilter: 'todos',
  });
  assert.equal(onlyMyths.legends.length, 0);
  assert.equal(onlyMyths.mythsList.length, 5);
  assert.ok(onlyMyths.mythsList.every(item => item.category === 'mito'));
});

test('filterAndPartitionNarratives combines region and category filters cleanly', () => {
  const sierraBoth = filterAndPartitionNarratives(SAMPLE_CATALOG, {
    categoryFilter: 'todos',
    regionFilter: 'ecuador-sierra',
  });
  assert.equal(sierraBoth.legends.length, 2);
  assert.equal(sierraBoth.mythsList.length, 2);
  assert.equal(sierraBoth.totalCount, 4);

  const emptyOrienteLegends = filterAndPartitionNarratives(SAMPLE_CATALOG, {
    categoryFilter: 'leyenda',
    regionFilter: 'ecuador-oriente',
  });
  assert.equal(emptyOrienteLegends.legends.length, 0);
  assert.equal(emptyOrienteLegends.mythsList.length, 0);
  assert.equal(emptyOrienteLegends.totalCount, 0);
});

test('isNarrativeUnlocked and grantAdVideoUnlock unlock PRO videos after watching an ad', () => {
  const lockedNarrative = SAMPLE_CATALOG[2]; // isLockedForFree = true
  const freeNarrative = SAMPLE_CATALOG[0]; // isLockedForFree = false

  assert.equal(isNarrativeUnlocked(freeNarrative, { isPro: false, adUnlockedMythIds: [] }), true);
  assert.equal(isNarrativeUnlocked(lockedNarrative, { isPro: false, adUnlockedMythIds: [] }), false);
  assert.equal(isNarrativeUnlocked(lockedNarrative, { isPro: true, adUnlockedMythIds: [] }), true);

  const unlockedOnce = grantAdVideoUnlock([], lockedNarrative.id);
  const unlockedTwice = grantAdVideoUnlock(unlockedOnce, lockedNarrative.id);
  assert.deepEqual(unlockedTwice, [lockedNarrative.id]);
  assert.equal(
    isNarrativeUnlocked(lockedNarrative, { isPro: false, adUnlockedMythIds: unlockedTwice }),
    true
  );
});

test('carousel index helpers clamp and wrap cleanly for myths and legends', () => {
  assert.equal(clampCarouselIndex(-2, 9), 0);
  assert.equal(clampCarouselIndex(12, 9), 8);
  assert.equal(clampCarouselIndex(0, 0), 0);

  assert.equal(stepCarouselIndex(0, -1, 9), 8);
  assert.equal(stepCarouselIndex(8, 1, 9), 0);
  assert.equal(stepCarouselIndex(3, 1, 9), 4);
  assert.equal(stepCarouselIndex(0, 1, 0), 0);
});
