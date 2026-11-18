import React, { useState } from 'react';
import { UserProfile, LanguageCode } from '../types';
import { CULTURAL_MYTHS } from '../data/myths';
import { playChime } from '../utils/audioSpeech';
import { LuffyAvatar } from './GoogleIcons';
import { GoogleAdSenseBanner } from './GoogleAdSenseBanner';
import { ProfileStatsSection } from './ProfileStatsSection';
import {
  Flame,
  Award,
  Crown,
  BookOpen,
  LogOut,
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Users,
  Cloud,
  RefreshCw,
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenFreemium: () => void;
  onOpenCertificateModal: (languageCode: LanguageCode, level: string) => void;
  onSelectMyth: (mythId: string) => void;
  onOpenAuth: () => void;
  onOpenSecurity: () => void;
  onLogout: () => void;
  onSyncCloudNow?: () => Promise<boolean>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onOpenFreemium,
  onOpenCertificateModal,
  onSelectMyth,
  onOpenAuth,
  onOpenSecurity,
  onLogout,
  onSyncCloudNow,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const savedMyths = CULTURAL_MYTHS.filter(m => user.savedMythIds.includes(m.id));
  const isJonathan =
    user.displayName.toUpperCase().includes('JONATHAN') || user.email.includes('armando');

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    playChime('click');
    try {
      const firestoreSynced = onSyncCloudNow ? await onSyncCloudNow() : false;
      setSyncNotice(
        firestoreSynced
          ? 'Respaldo sincronizado en Google Cloud Firestore y bóveda local.'
          : 'Progreso respaldado en tu bóveda cifrada de cuenta.'
      );
      playChime('success');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          {/* Avatar with Google badge */}
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-sky-400/70"
              />
            ) : isJonathan ? (
              <LuffyAvatar className="w-16 h-16 shadow-lg border-2 border-amber-400" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-sky-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-amber-300">
                  {user.displayName.charAt(0)}
                </div>
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#202124] border border-[#5f6368] flex items-center justify-center text-[10px] shadow"
              title="Autenticado con Firebase Google"
            >
              <span className="font-black text-blue-400">G</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base font-extrabold text-white">{user.displayName}</h2>
              {user.isPro ? (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-amber-300" /> PRO VITALICIO
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700 px-2 py-0.5 rounded-full">
                  PLAN GRATUITO
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{user.email}</div>
            <div className="text-[11px] text-sky-300 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protegido por Google Play Protect & Biometría</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="flex flex-wrap items-center sm:items-end justify-center gap-2">
          {!user.isPro && (
            <button
              onClick={onOpenFreemium}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Desbloquear Pro ($1.25)</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenSecurity();
              playChime('click');
            }}
            className="px-3 py-1.5 bg-sky-900/60 hover:bg-sky-800 border border-sky-600 text-sky-200 text-xs rounded-xl flex items-center gap-1.5 transition"
            title="Ajustar PIN, Biometría y 2FA"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Seguridad</span>
          </button>

          <button
            onClick={() => {
              onOpenAuth();
              playChime('click');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition"
            title="Cambiar a otra cuenta de Google mediante Firebase"
          >
            <Users className="w-3.5 h-3.5 text-sky-300" />
            <span>Cambiar Cuenta Google</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              playChime('click');
            }}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 text-red-300 text-xs rounded-xl flex items-center gap-1.5 transition"
            title="Cerrar la sesión de Firebase"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center space-y-1">
          <div className="text-xs text-slate-400 font-medium">Racha Activa</div>
          <div className="text-xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span>{user.streakDays} días</span>
          </div>
          <div className="text-[10px] text-slate-400">¡Fuego del conocimiento!</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center space-y-1">
          <div className="text-xs text-slate-400 font-medium">Experiencia XP</div>
          <div className="text-xl font-extrabold text-sky-300 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>{user.xp} XP</span>
          </div>
          <div className="text-[10px] text-slate-400">Nivel Intercultural</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center space-y-1">
          <div className="text-xs text-slate-400 font-medium">Ajedrez ELO</div>
          <div className="text-xl font-extrabold text-amber-300 flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{user.chessStats.elo}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {user.chessStats.wins}V - {user.chessStats.draws}E - {user.chessStats.losses}D
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-center space-y-1">
          <div className="text-xs text-slate-400 font-medium">Chakanas</div>
          <div className="text-xl font-extrabold text-yellow-300 flex items-center justify-center gap-1">
            <span>💎</span>
            <span>{user.chakanas}</span>
          </div>
          <div className="text-[10px] text-slate-400">Moneda pedagógica</div>
        </div>
      </div>

      {/* Recharts Daily XP Progress Statistics Section */}
      <ProfileStatsSection user={user} />

      {/* Cloud Sync Vault Card */}
      <div className="bg-slate-900/85 border border-sky-500/35 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>Nube de Cuenta • Todo Guardado Automáticamente</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {user.username ? `@${user.username} • ` : ''}
              {user.completedLessonIds.length} lecciones • {user.certificates.length} certificados •{' '}
              {(user.adUnlockedMythIds || []).length} videos desbloqueados con anuncios
            </p>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Respaldar en Nube'}</span>
          </button>
        </div>

        {syncNotice && (
          <div className="text-xs text-sky-200 bg-sky-950/60 border border-sky-500/40 rounded-xl px-3 py-2">
            {syncNotice}
          </div>
        )}
      </div>

      {/* Google AdSense Placement */}
      <GoogleAdSenseBanner
        user={user}
        slotName="Perfil y Certificados"
        format="horizontal"
        onOpenFreemium={onOpenFreemium}
      />

      {/* Certificates Shelf */}
      <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Estantería de Certificados Obtenidos</span>
            </h3>
            <p className="text-xs text-slate-300">
              Certificaciones oficiales de suficiencia lingüística validadas con código QR.
            </p>
          </div>

          <button
            onClick={() => onOpenCertificateModal(user.currentLanguage || 'kichwa', 'Principiante A1')}
            className="text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 px-2.5 py-1 rounded-lg transition"
          >
            + Emitir Nuevo
          </button>
        </div>

        {user.certificates.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 text-center space-y-2">
            <div className="text-3xl">📜</div>
            <div className="text-xs text-white font-semibold">Aún no has generado ningún certificado oficial.</div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Completa los módulos diarios o pulsa el botón para emitir tu certificado en tu idioma activo.
            </p>
            <button
              onClick={() => onOpenCertificateModal(user.currentLanguage || 'kichwa', 'Principiante A1')}
              className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
            >
              Generar Certificado A1
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
                    <span>{cert.level}</span>
                    <span className="font-mono text-sky-300">{cert.verificationCode}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{cert.language}</h4>
                  <div className="text-[11px] text-slate-300">{cert.grade}</div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">{cert.issueDate}</span>
                  <button
                    onClick={() => onOpenCertificateModal(cert.languageCode, cert.level)}
                    className="text-amber-300 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Ver / Imprimir</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Myths and Legends Library */}
      <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Biblioteca de Leyendas Favoritas ({savedMyths.length})</span>
        </h3>

        {savedMyths.length === 0 ? (
          <div className="text-xs text-slate-400 italic p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
            Aún no has marcado mitos favoritos. Explora el catálogo cultural y pulsa la estrella (★).
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedMyths.map(myth => (
              <div
                key={myth.id}
                onClick={() => onSelectMyth(myth.id)}
                className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-amber-400/60 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{myth.coverImage}</span>
                  <div>
                    <div className="font-bold text-xs text-white">{myth.title}</div>
                    <div className="text-[10px] text-slate-300">{myth.culturalOrigin}</div>
                  </div>
                </div>
                <span className="text-xs text-amber-400">➔</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
