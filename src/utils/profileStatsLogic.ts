export interface DailyXpPoint {
  dateKey: string;
  label: string;
  fullDate: string;
  xp: number;
  cumulativeXp: number;
  isToday: boolean;
}

export interface DailyXpSummary {
  series: DailyXpPoint[];
  xpInRange: number;
  dailyAverage: number;
  todayXp: number;
  bestDayLabel: string;
  bestDayXp: number;
  activeDays: number;
}

const SPANISH_SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SPANISH_SHORT_MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

/**
 * Formats a Date into a stable YYYY-MM-DD local calendar key.
 */
export function formatLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retains only valid YYYY-MM-DD -> non-negative number entries up to maxDays most recent.
 */
export function pruneDailyXpHistory(
  history: Record<string, number> | undefined,
  maxDays: number = 30
): Record<string, number> {
  if (!history || typeof history !== 'object') return {};
  const validEntries = Object.entries(history)
    .filter(
      ([key, val]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof val === 'number' && Number.isFinite(val) && val >= 0
    )
    .sort(([a], [b]) => a.localeCompare(b));

  const sliced = validEntries.slice(-maxDays);
  const out: Record<string, number> = {};
  for (const [k, v] of sliced) {
    out[k] = Math.round(v);
  }
  return out;
}

/**
 * Adds newly earned XP to today's date bucket without losing earlier days.
 */
export function recordDailyXpEarned(
  history: Record<string, number> | undefined,
  xpDelta: number,
  nowDate: Date = new Date()
): Record<string, number> {
  const clean = pruneDailyXpHistory(history, 30);
  if (!Number.isFinite(xpDelta) || xpDelta <= 0) {
    return clean;
  }
  const todayKey = formatLocalDateKey(nowDate);
  const nextVal = (clean[todayKey] || 0) + Math.round(xpDelta);
  return pruneDailyXpHistory({ ...clean, [todayKey]: nextVal }, 30);
}

/**
 * Merges local and cloud daily XP maps by taking the highest recorded XP per date.
 */
export function mergeDailyXpHistory(
  localHistory?: Record<string, number>,
  cloudHistory?: Record<string, number>
): Record<string, number> {
  const merged: Record<string, number> = {};
  const cleanLocal = pruneDailyXpHistory(localHistory, 30);
  const cleanCloud = pruneDailyXpHistory(cloudHistory, 30);

  for (const [key, val] of Object.entries(cleanLocal)) {
    merged[key] = Math.max(merged[key] || 0, val);
  }
  for (const [key, val] of Object.entries(cleanCloud)) {
    merged[key] = Math.max(merged[key] || 0, val);
  }
  return pruneDailyXpHistory(merged, 30);
}

/**
 * Builds a chronological Recharts-ready series of XP earned per day over 7 or 14 days.
 */
export function buildDailyXpChartData(params: {
  dailyXpHistory?: Record<string, number>;
  totalXp: number;
  daysCount?: 7 | 14;
  referenceDate?: Date;
}): DailyXpSummary {
  const daysCount = params.daysCount === 14 ? 14 : 7;
  const refDate = params.referenceDate ? new Date(params.referenceDate) : new Date();
  refDate.setHours(12, 0, 0, 0);

  const cleanHistory = pruneDailyXpHistory(params.dailyXpHistory, 30);
  const todayKey = formatLocalDateKey(refDate);

  const trackedTotal = Object.values(cleanHistory).reduce((acc, v) => acc + v, 0);
  const effectiveTodayFallback =
    trackedTotal === 0 && params.totalXp > 0 ? Math.round(params.totalXp) : 0;

  const series: DailyXpPoint[] = [];
  let cumulative = 0;

  for (let offset = daysCount - 1; offset >= 0; offset--) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - offset);
    const key = formatLocalDateKey(d);
    const isToday = key === todayKey;

    const rawXp = cleanHistory[key] ?? 0;
    const xp = isToday && rawXp === 0 && effectiveTodayFallback > 0 ? effectiveTodayFallback : rawXp;
    cumulative += xp;

    const shortDay = SPANISH_SHORT_DAYS[d.getDay()];
    const dayNum = d.getDate();
    const monthName = SPANISH_SHORT_MONTHS[d.getMonth()];

    series.push({
      dateKey: key,
      label: daysCount <= 7 ? `${shortDay} ${dayNum}` : `${dayNum} ${monthName}`,
      fullDate: `${shortDay}, ${dayNum} de ${monthName} ${d.getFullYear()}`,
      xp,
      cumulativeXp: cumulative,
      isToday,
    });
  }

  const xpInRange = series.reduce((sum, item) => sum + item.xp, 0);
  const dailyAverage = Math.round(xpInRange / series.length);
  const todayPoint = series[series.length - 1];
  const activeDays = series.filter(p => p.xp > 0).length;

  let bestPoint = series[0];
  for (const point of series) {
    if (point.xp >= bestPoint.xp) {
      bestPoint = point;
    }
  }

  return {
    series,
    xpInRange,
    dailyAverage,
    todayXp: todayPoint?.xp ?? 0,
    bestDayLabel: bestPoint.xp > 0 ? bestPoint.label : 'Sin registros aún',
    bestDayXp: bestPoint.xp,
    activeDays,
  };
}
