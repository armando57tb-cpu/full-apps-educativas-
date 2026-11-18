import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { UserProfile } from '../types';
import { buildDailyXpChartData, DailyXpPoint } from '../utils/profileStatsLogic';
import { BarChart3, TrendingUp, Calendar, Award, Zap } from 'lucide-react';

interface ProfileStatsSectionProps {
  user: UserProfile;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyXpPoint; value: number }>;
}

const DailyXpTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl bg-slate-950/95 border border-sky-400/40 px-3 py-2 shadow-xl text-xs">
      <div className="font-bold text-white flex items-center gap-1.5">
        <span>{point.fullDate}</span>
        {point.isToday && (
          <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
            Hoy
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between gap-4">
        <span className="text-slate-300">XP ganado:</span>
        <span className="font-extrabold text-sky-300">+{point.xp} XP</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
        <span>Acumulado período:</span>
        <span className="font-semibold text-amber-300">{point.cumulativeXp} XP</span>
      </div>
    </div>
  );
};

export const ProfileStatsSection: React.FC<ProfileStatsSectionProps> = ({ user }) => {
  const [daysRange, setDaysRange] = useState<7 | 14>(7);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const stats = useMemo(
    () =>
      buildDailyXpChartData({
        dailyXpHistory: user.dailyXpHistory,
        totalXp: user.xp,
        daysCount: daysRange,
      }),
    [user.dailyXpHistory, user.xp, daysRange]
  );

  const yDomainMax = useMemo(() => {
    const maxVal = Math.max(...stats.series.map(d => d.xp), 50);
    return Math.ceil(maxVal * 1.2);
  }, [stats.series]);

  return (
    <section
      data-testid="profile-statistics-section"
      aria-label="Estadísticas de aprendizaje diario"
      className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md space-y-4"
    >
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Estadísticas • Progreso Diario de Aprendizaje</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            XP ganado por día en lecciones, práctica oral, chat IA y partidas de ajedrez.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Range toggle: 7d vs 14d */}
          <div className="inline-flex bg-slate-950/80 border border-slate-700 rounded-xl p-0.5">
            <button
              type="button"
              data-testid="stats-range-7d"
              onClick={() => setDaysRange(7)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                daysRange === 7
                  ? 'bg-sky-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              7 días
            </button>
            <button
              type="button"
              data-testid="stats-range-14d"
              onClick={() => setDaysRange(14)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                daysRange === 14
                  ? 'bg-sky-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              14 días
            </button>
          </div>

          {/* Chart style toggle: Area vs Bars */}
          <div className="inline-flex bg-slate-950/80 border border-slate-700 rounded-xl p-0.5">
            <button
              type="button"
              data-testid="stats-chart-area"
              onClick={() => setChartType('area')}
              aria-label="Gráfico de área"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                chartType === 'area'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Área</span>
            </button>
            <button
              type="button"
              data-testid="stats-chart-bar"
              onClick={() => setChartType('bar')}
              aria-label="Gráfico de barras"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                chartType === 'bar'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Barras</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/75 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>XP de Hoy</span>
          </div>
          <div className="text-base sm:text-lg font-black text-sky-300 mt-0.5">
            +{stats.todayXp} XP
          </div>
        </div>

        <div className="bg-slate-950/75 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Total ({daysRange}d)</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
            {stats.xpInRange} XP
          </div>
        </div>

        <div className="bg-slate-950/75 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400">Promedio Diario</div>
          <div className="text-base sm:text-lg font-black text-white mt-0.5">
            {stats.dailyAverage} XP/d
          </div>
        </div>

        <div className="bg-slate-950/75 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Mejor Día</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-200 mt-0.5 truncate">
            {stats.bestDayXp > 0 ? `${stats.bestDayXp} XP` : '0 XP'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">{stats.bestDayLabel}</div>
        </div>
      </div>

      {/* Recharts Daily XP Chart Container */}
      <div
        data-testid="recharts-xp-chart-container"
        className="w-full h-60 sm:h-64 bg-slate-950/70 border border-slate-800 rounded-2xl p-2 sm:p-3"
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={stats.series} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="xpDailyAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} />
                  <stop offset="65%" stopColor="#fbbf24" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.22)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yDomainMax]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DailyXpTooltip />} />
              <Area
                type="monotone"
                dataKey="xp"
                name="XP ganado"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#xpDailyAreaFill)"
                activeDot={{ r: 5, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={stats.series} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.22)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yDomainMax]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DailyXpTooltip />} cursor={{ fill: 'rgba(56,189,248,0.08)' }} />
              <Bar
                dataKey="xp"
                name="XP ganado"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {stats.series.map(entry => (
                  <Cell
                    key={entry.dateKey}
                    fill={entry.isToday ? '#fbbf24' : '#38bdf8'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {stats.xpInRange === 0 && (
        <p className="text-[11px] text-slate-400 text-center">
          Completa tu primera lección diaria, práctica oral, chat con IA o partida de ajedrez para ver crecer tu historial de XP por día.
        </p>
      )}
    </section>
  );
};
