import React, { useState } from 'react';
import { UserProfile } from '../types';
import { GoogleGLogo } from './GoogleIcons';
import { playChime } from '../utils/audioSpeech';
import {
  AlertCircle,
  ArrowLeft,
  Cloud,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Wifi,
  Battery,
} from 'lucide-react';

interface GoogleSignInSheetProps {
  isAuthenticated: boolean;
  currentAccount: UserProfile;
  onGoogleCloudLogin: () => Promise<{ ok: boolean; error?: string }>;
  onLogout: () => Promise<void> | void;
  onClose?: () => void;
  isStartupEntry?: boolean;
}

export const GoogleSignInSheet: React.FC<GoogleSignInSheetProps> = ({
  isAuthenticated,
  currentAccount,
  onGoogleCloudLogin,
  onLogout,
  onClose,
  isStartupEntry = false,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCloudBusy, setIsCloudBusy] = useState<boolean>(false);

  const handleGooglePopupSignIn = async () => {
    setErrorMessage('');
    setIsCloudBusy(true);
    playChime('click');
    try {
      const res = await onGoogleCloudLogin();
      if (!res.ok && res.error) {
        playChime('error');
        setErrorMessage(res.error);
      } else if (res.ok) {
        playChime('success');
      }
    } finally {
      setIsCloudBusy(false);
    }
  };

  const handleSignOutClick = async () => {
    setErrorMessage('');
    setIsCloudBusy(true);
    playChime('click');
    try {
      await onLogout();
    } finally {
      setIsCloudBusy(false);
    }
  };

  return (
    <div
      data-testid="firebase-auth-gate"
      className="fixed inset-0 z-50 bg-[#0d1017]/95 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Bar */}
      <div className="w-full px-5 py-2.5 flex items-center justify-between text-xs text-white/90 z-20 shrink-0 font-medium tracking-tight bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
          <span>Yachay &amp; Raíces</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-sky-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            Firebase Cloud
          </span>
          <Wifi className="w-3.5 h-3.5 text-white" />
          <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 font-mono text-[11px] font-bold">
            <Battery className="w-3.5 h-3.5 fill-amber-300" />
            <span>99%</span>
          </div>
        </div>
      </div>

      {/* Ambient Backdrop */}
      <div className="absolute inset-0 top-9 bottom-10 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#172554]/80 to-[#020617]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-amber-500/12 blur-3xl" />
      </div>

      {/* Firebase Google Sign-In Card */}
      <div className="relative z-20 w-full max-w-md mx-auto my-auto px-4 py-4">
        <div
          className="w-full rounded-[28px] bg-slate-900/90 backdrop-blur-2xl text-slate-100 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_25px_50px_-12px_rgba(0,0,0,0.85)] overflow-hidden animate-modal-enter"
        >
          <div className="pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1 bg-white/25 rounded-full" />
          </div>

          <div className="pt-4 pb-3 text-center space-y-2 px-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center">
              <GoogleGLogo className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-bold text-sky-300 tracking-wider block uppercase">
              Acceso con Firebase
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isAuthenticated ? 'Cuenta Google Conectada' : 'Bienvenido a Yachay & Raíces'}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAuthenticated
                ? 'Cambia a otra cuenta de Google o cierra tu sesión cuando lo necesites.'
                : 'Inicia sesión con tu cuenta de Google para guardar idiomas, XP, ajedrez, certificados y videos en la nube.'}
            </p>
          </div>

          <div className="p-5 sm:p-6 pt-2 space-y-4">
            {/* Active Firebase User Summary (shown when changing accounts or signing out) */}
            {isAuthenticated && (
              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center gap-3">
                {currentAccount.avatarUrl ? (
                  <img
                    src={currentAccount.avatarUrl}
                    alt={currentAccount.displayName}
                    className="w-11 h-11 rounded-full object-cover border border-amber-400/60 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-sky-400 text-slate-950 flex items-center justify-center font-black text-base shrink-0">
                    {currentAccount.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">
                      {currentAccount.displayName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 shrink-0">
                      Activa
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 truncate">{currentAccount.email}</div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Single Firebase Google Auth CTA */}
            <button
              type="button"
              data-testid="firebase-google-login-btn"
              onClick={handleGooglePopupSignIn}
              disabled={isCloudBusy}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 shadow-xl transition active:scale-[0.99] disabled:opacity-60"
            >
              {isCloudBusy ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-700 shrink-0" />
              ) : (
                <GoogleGLogo className="w-5 h-5 shrink-0" />
              )}
              <span>
                {isCloudBusy
                  ? 'Conectando con Google...'
                  : isAuthenticated
                  ? 'Cambiar de cuenta Google'
                  : 'Inicio por cuenta Google'}
              </span>
            </button>

            {/* Sign Out & Back actions when already logged in */}
            {isAuthenticated && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  data-testid="firebase-logout-btn"
                  onClick={handleSignOutClick}
                  disabled={isCloudBusy}
                  className="py-2.5 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Cerrar sesión</span>
                </button>

                {!isStartupEntry && onClose && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      playChime('click');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a la app</span>
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>Respaldo automático en la nube de Firebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="relative z-20 w-full px-5 py-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 bg-black/30 border-t border-white/5">
        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
        <span>Autenticación directa con Google OAuth • Firebase</span>
      </div>
    </div>
  );
};
