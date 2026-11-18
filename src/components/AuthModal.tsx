import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playChime } from '../utils/audioSpeech';
import { ShieldCheck, UserPlus, LogIn, Check, X } from 'lucide-react';

interface AuthModalProps {
  currentAccount: UserProfile;
  savedAccounts: UserProfile[];
  onSelectAccount: (account: UserProfile) => void;
  onAddNewAccount: (name: string, email: string, provider: 'google' | 'apple') => void;
  onClose?: () => void;
  isMandatoryLogin?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentAccount,
  savedAccounts,
  onSelectAccount,
  onAddNewAccount,
  onClose,
  isMandatoryLogin = false,
}) => {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [newAccountEmail, setNewAccountEmail] = useState<string>('');
  const [authProvider, setAuthProvider] = useState<'google' | 'apple'>('google');

  const handleCreateAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    const finalEmail = newAccountEmail.trim() || `${newAccountName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    onAddNewAccount(newAccountName.trim(), finalEmail, authProvider);
    playChime('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-center border-b border-slate-800 relative">
          {!isMandatoryLogin && onClose && (
            <button
              onClick={() => {
                onClose();
                playChime('click');
              }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-sky-400 p-0.5 shadow-lg mb-2 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-300 text-xl">
              ✦
            </div>
          </div>

          <h2 className="text-lg font-black text-white">Gestión de Cuentas & Acceso</h2>
          <p className="text-xs text-slate-300 mt-1">
            Inicia sesión con Google Sign-In, cuenta iCloud / Apple o cambia de perfil educativo.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {!isAddingNew ? (
            <>
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Cuentas Guardadas en este Dispositivo:
                </span>

                <div className="space-y-2">
                  {savedAccounts.map(account => {
                    const isCurrent = account.id === currentAccount.id;
                    return (
                      <button
                        key={account.id}
                        onClick={() => {
                          onSelectAccount(account);
                          playChime('click');
                        }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-amber-300 font-bold text-sm">
                            {account.displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white flex items-center gap-1.5">
                              <span>{account.displayName}</span>
                              {account.isPro && (
                                <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 rounded font-black">
                                  PRO
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{account.email}</div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Activa
                          </span>
                        ) : (
                          <span className="text-[10px] text-sky-400 font-semibold hover:underline">
                            Seleccionar ➔
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ingresar con Otra Cuenta de Google / iCloud</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateAndLogin} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Vincular Nueva Cuenta</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[11px] text-sky-400 hover:underline"
                >
                  ← Volver a la lista
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthProvider('google')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                    authProvider === 'google'
                      ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-blue-400 font-black">G</span>
                  <span>Google Sign-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthProvider('apple')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                    authProvider === 'apple'
                      ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <span> iCloud / Apple</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-200">Nombre completo:</label>
                <input
                  type="text"
                  placeholder="Ej: Maria Quishpe o Armando TB"
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-200">Correo electrónico:</label>
                <input
                  type="email"
                  placeholder={authProvider === 'google' ? 'usuario@gmail.com' : 'usuario@icloud.com'}
                  value={newAccountEmail}
                  onChange={e => setNewAccountEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Continuar con esta Cuenta</span>
              </button>
            </form>
          )}

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Datos locales y progreso aislados individualmente por cuenta.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
