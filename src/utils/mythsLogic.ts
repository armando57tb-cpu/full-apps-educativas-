import { CulturalMyth, NarrativeCategory } from '../types';

export type CategoryFilter = 'todos' | NarrativeCategory;

export interface MythsFilterOptions {
  categoryFilter: CategoryFilter;
  regionFilter: string;
}

export interface PartitionedNarratives {
  legends: CulturalMyth[];
  mythsList: CulturalMyth[];
  totalCount: number;
}

/**
 * Filters cultural narratives by category ('leyenda' | 'mito' | 'todos') and region,
 * then partitions them into two strictly separated arrays: legends and myths.
 */
export function filterAndPartitionNarratives(
  items: CulturalMyth[],
  { categoryFilter, regionFilter }: MythsFilterOptions
): PartitionedNarratives {
  const filtered = items.filter(item => {
    const matchesRegion = regionFilter === 'todos' || item.region === regionFilter;
    const matchesCategory = categoryFilter === 'todos' || item.category === categoryFilter;
    return matchesRegion && matchesCategory;
  });

  const legends = filtered.filter(item => item.category === 'leyenda');
  const mythsList = filtered.filter(item => item.category === 'mito');

  return {
    legends,
    mythsList,
    totalCount: filtered.length,
  };
}

/**
 * Counts narratives by category optionally scoped to a specific region filter.
 */
export function getNarrativeCategoryCounts(
  items: CulturalMyth[],
  regionFilter: string = 'todos'
): { all: number; legends: number; myths: number } {
  const regionScoped = items.filter(
    item => regionFilter === 'todos' || item.region === regionFilter
  );

  const legends = regionScoped.filter(item => item.category === 'leyenda').length;
  const myths = regionScoped.filter(item => item.category === 'mito').length;

  return {
    all: regionScoped.length,
    legends,
    myths,
  };
}

/**
 * Determines whether a user can access a myth/legend without paying Pro,
 * either because it is free, the user is Pro, or the user unlocked it by watching an ad.
 */
export function isNarrativeUnlocked(
  myth: Pick<CulturalMyth, 'id' | 'isLockedForFree'>,
  user: { isPro?: boolean; adUnlockedMythIds?: string[] }
): boolean {
  if (!myth.isLockedForFree) return true;
  if (user.isPro) return true;
  return Array.isArray(user.adUnlockedMythIds) && user.adUnlockedMythIds.includes(myth.id);
}

/**
 * Returns updated adUnlockedMythIds array without duplicates after watching a rewarded ad.
 */
export function grantAdVideoUnlock(
  currentUnlockedIds: string[] | undefined,
  mythId: string
): string[] {
  const existing = Array.isArray(currentUnlockedIds) ? currentUnlockedIds : [];
  if (existing.includes(mythId)) return existing;
  return [...existing, mythId];
}

/**
 * Clamps a carousel slide index cleanly within valid bounds.
 */
export function clampCarouselIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

/**
 * Steps a carousel index forward (+1) or backward (-1) with wrap-around.
 */
export function stepCarouselIndex(
  currentIndex: number,
  delta: 1 | -1,
  length: number
): number {
  if (length <= 0) return 0;
  return (currentIndex + delta + length) % length;
}
