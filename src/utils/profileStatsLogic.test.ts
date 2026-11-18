import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLocalDateKey,
  recordDailyXpEarned,
  mergeDailyXpHistory,
  buildDailyXpChartData,
} from './profileStatsLogic';

test('formatLocalDateKey produces YYYY-MM-DD string', () => {
  const d = new Date(2026, 10, 18, 9, 30, 0); // Nov 18, 2026
  assert.equal(formatLocalDateKey(d), '2026-11-18');
});

test('recordDailyXpEarned accumulates XP on today without erasing previous days', () => {
  const ref = new Date(2026, 10, 18, 10, 0, 0);
  const step1 = recordDailyXpEarned({ '2026-11-17': 40 }, 25, ref);
  assert.deepEqual(step1, { '2026-11-17': 40, '2026-11-18': 25 });

  const step2 = recordDailyXpEarned(step1, 15, ref);
  assert.deepEqual(step2, { '2026-11-17': 40, '2026-11-18': 40 });
});

test('mergeDailyXpHistory preserves highest XP per calendar date', () => {
  const merged = mergeDailyXpHistory(
    { '2026-11-16': 50, '2026-11-18': 30 },
    { '2026-11-17': 65, '2026-11-18': 80 }
  );
  assert.deepEqual(merged, {
    '2026-11-16': 50,
    '2026-11-17': 65,
    '2026-11-18': 80,
  });
});

test('buildDailyXpChartData builds 7-day and 14-day series with accurate totals and averages', () => {
  const ref = new Date(2026, 10, 18, 12, 0, 0);
  const summary = buildDailyXpChartData({
    dailyXpHistory: {
      '2026-11-15': 35,
      '2026-11-17': 90,
      '2026-11-18': 45,
    },
    totalXp: 170,
    daysCount: 7,
    referenceDate: ref,
  });

  assert.equal(summary.series.length, 7);
  assert.equal(summary.series[6].dateKey, '2026-11-18');
  assert.equal(summary.series[6].isToday, true);
  assert.equal(summary.todayXp, 45);
  assert.equal(summary.xpInRange, 170);
  assert.equal(summary.bestDayXp, 90);
  assert.equal(summary.activeDays, 3);
  assert.equal(summary.dailyAverage, Math.round(170 / 7));

  const summary14 = buildDailyXpChartData({
    dailyXpHistory: {},
    totalXp: 50,
    daysCount: 14,
    referenceDate: ref,
  });
  assert.equal(summary14.series.length, 14);
  assert.equal(summary14.todayXp, 50);
  assert.equal(summary14.xpInRange, 50);
});
