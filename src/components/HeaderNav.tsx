import React from 'react';
import { UserProfile } from '../types';
import {
  Flame,
  Crown,
  Layers,
  LogOut,
  Smartphone,
  Tablet,
  Monitor,
  ShieldCheck,
  Search,
  Sparkles,
  Globe,
} from 'lucide-react';

export type DeviceViewportMode = 'responsive' | 'phone' | 'tablet';

interface HeaderNavProps {
  user: UserProfile;
  currentTab: 'languages' | 'chess' | 'myths' | 'profile';
  onSelectTab: (tab: 'languages' | 'chess' | 'myths' | 'profile') => void;
  onOpenFreemium: () => void;
  onOpenBlueprint: () => void;
  onOpenAuth: () => void;
  onOpenSecurity: () => void;
  onOpenAiSearch: () => void;
  onOpenWebBrowser: () => void;
  viewportMode: DeviceViewportMode;
  onChangeViewportMode: (mode: DeviceViewportMode) => void;
}

const NAV_TABS: {
  id: 'languages' | 'chess' | 'myths' | 'profile';
  icon: string;
  label: string;
}[] = [
  { id: 'languages', icon: '🗣️', label: 'Idiomas' },
  { id: 'chess', icon: '♟️', label: 'Ajedrez & IA' },
  { id: 'myths', icon: '📖', label: 'Mitos & Leyendas' },
  { id: 'profile', icon: '👤', label: 'Mi Perfil' },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  user,
  currentTab,
  onSelectTab,
  onOpenFreemium,
  onOpenBlueprint,
  onOpenAuth,
  onOpenSecurity,
  onOpenAiSearch,
  onOpenWebBrowser,
  viewportMode,
  onChangeViewportMode,
}) => {
  return (
    <header className="bg-slate-950/90 text-white border-b border-white/10 sticky top-0 z-30 shadow-lg backdrop-blur-xl">
      {/* Row 1: App Icon + AI Search trigger on the left, utility controls cleanly on the right */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-2 pb-1.5 flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('languages')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-sky-400 p-0.5 shadow-md flex items-center justify-center shrink-0 focus:outline-none active:scale-95 transition"
            title="Ir al inicio de Yachay & Raíces"
            aria-label="Ir al inicio de Yachay & Raíces"
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
              <img src="/favicon.svg" alt="Yachay" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
            </div>
          </button>

          {/* AI Search Trigger */}
          <button
            type="button"
            data-testid="open-ai-search-btn"
            onClick={onOpenAiSearch}
            aria-label="Buscar información con IA en la app"
            title="Buscar palabras, leyendas, mitos o ayuda con IA"
            className="flex items-center gap-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span className="hidden sm:inline">Buscar IA</span>
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
          </button>

          {/* Integrated Web, Books & Academic Sources Browser Trigger */}
          <button
            type="button"
            data-testid="open-web-browser-btn"
            onClick={onOpenWebBrowser}
            aria-label="Navegar por internet, libros y fuentes académicas dentro de la app"
            title="Buscar y navegar por internet, libros y fuentes académicas sin salir de la app"
            className="flex items-center gap-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/45 text-indigo-200 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span className="hidden sm:inline">Web y Libros</span>
          </button>
        </div>

        {/* User Stats & Device Controls */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs shrink-0">
          {/* Streak Flame */}
          <div
            className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-1.5 sm:px-2 py-1 rounded-full text-amber-300 font-bold whitespace-nowrap"
            title={`Racha activa de ${user.streakDays} días consecutivos`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{user.streakDays}d</span>
          </div>

          {/* Freemium Status */}
          {user.isPro ? (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 px-2 sm:px-2.5 py-1 rounded-full text-amber-300 font-bold text-[11px] whitespace-nowrap">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>PRO</span>
            </div>
          ) : (
            <button
              onClick={onOpenFreemium}
              aria-label="Desbloquear acceso total por $1.25 USD"
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-2 sm:px-2.5 py-1 rounded-full shadow-sm text-[11px] transition-transform active:scale-95 whitespace-nowrap"
              title="Desbloquear acceso total por $1.25 USD"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>$1.25</span>
            </button>
          )}

          {/* Device Preview Switcher (Phone / Tablet / Responsive) */}
          <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={() => onChangeViewportMode('phone')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                viewportMode === 'phone'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Simular pantalla de Celular (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Celular</span>
            </button>

            <button
              onClick={() => onChangeViewportMode('tablet')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                viewportMode === 'tablet'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Simular pantalla de Tableta (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Tablet</span>
            </button>

            <button
              onClick={() => onChangeViewportMode('responsive')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                viewportMode === 'responsive'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Modo Fluido 100% Adaptable"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Fluido</span>
            </button>
          </div>

          {/* Security Center */}
          <button
            onClick={onOpenSecurity}
            aria-label="Seguridad"
            className="flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] font-semibold transition shadow-xs"
            title="Privacidad y estado de sesión"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Seguridad</span>
          </button>

          {/* Architect Blueprint & PM Button */}
          <button
            onClick={onOpenBlueprint}
            aria-label="Blueprint Arq"
            className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-slate-200 p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] font-semibold transition shadow-xs"
            title="Ver documentación técnica de Arquitectura"
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Blueprint Arq</span>
          </button>

          {/* Firebase Google Account / Logout / Switch Trigger */}
          <button
            onClick={onOpenAuth}
            aria-label={`Cuenta ${user.displayName} - Cambiar cuenta Google o cerrar sesión`}
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-xl border transition shadow-xs ${
              currentTab === 'profile'
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800'
            }`}
            title="Cambiar cuenta Google o cerrar sesión"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-amber-400/50"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-xs shrink-0">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden sm:block max-w-[115px] truncate">
              <span className="text-[11px] font-bold block truncate leading-none">
                {user.displayName}
              </span>
              <span className="text-[9px] text-sky-300 font-medium block truncate leading-none mt-0.5">
                Cuenta Google
              </span>
            </div>
            <LogOut className="w-3 h-3 text-slate-400 hover:text-red-400 transition hidden sm:inline" />
          </button>
        </div>
      </div>

      {/* Row 2: Separated App Brand Title Row below icons so it never mixes with utility icons */}
      <div
        data-testid="header-brand-title-row"
        className="max-w-6xl mx-auto px-3 sm:px-4 pb-1.5 pt-1 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-1"
      >
        <button
          type="button"
          onClick={() => onSelectTab('languages')}
          className="text-left focus:outline-none group flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5"
        >
          <span className="font-extrabold text-sm sm:text-base tracking-wide leading-none">
            <span className="text-amber-400">YACHAY</span>{' '}
            <span className="text-sky-200">&amp; RAÍCES</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-tight leading-none">
            Idiomas • Ajedrez • Leyendas
          </span>
        </button>
      </div>

      {/* iOS Liquid Glass Rectangular Capsule Navigation Dock */}
      <nav
        aria-label="Secciones principales"
        className="px-2 sm:px-4 py-2 border-t border-white/[0.06] flex items-center justify-center"
      >
        <div
          data-testid="liquid-glass-nav"
          className="relative w-full sm:w-auto grid grid-cols-4 sm:inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-[20px] sm:rounded-[22px] bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.32),inset_0_-1px_1px_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.45)]"
        >
          {/* Specular top liquid-glass sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/45 to-transparent"
          />

          {NAV_TABS.map(tab => {
            const isActive = currentTab === tab.id;
            const mobileShortLabel =
              tab.id === 'chess'
                ? 'Ajedrez'
                : tab.id === 'myths'
                ? 'Leyendas'
                : tab.label;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`nav-tab-${tab.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-[14px] sm:rounded-[15px] text-[10.5px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-[0.97] min-w-0 ${
                  isActive
                    ? 'bg-gradient-to-b from-white/25 via-sky-300/18 to-white/10 text-white border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_14px_rgba(56,189,248,0.28)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent'
                }`}
              >
                <span aria-hidden="true" className="text-sm sm:text-xs leading-none">{tab.icon}</span>
                <span className="sm:hidden truncate max-w-full">{mobileShortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
