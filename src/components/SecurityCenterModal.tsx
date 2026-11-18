import React, { useState } from 'react';
import { UserProfile, UserSecuritySettings } from '../types';
import { playChime } from '../utils/audioSpeech';
import {
  calculateSecurityScore,
  detectDeviceEnvironment,
  verifySecurityPin,
} from '../utils/securityLogic';
import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Smartphone,
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface SecurityCenterModalProps {
  user: UserProfile;
  onUpdateSecurity: (newSettings: UserSecuritySettings) => void;
  onLockAppNow: () => void;
  onClose: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  user,
  onUpdateSecurity,
  onLockAppNow,
  onClose,
}) => {
  const currentSettings = user.security || {
    biometricsEnabled: true,
    twoFactorEnabled: true,
    securityPin: '123456',
    isAppLockActive: true,
    lastLoginDevice: 'Android 14 • Tablet HD',
    lastLoginIp: '190.152.14.88 (Ecuador)',
    lastLoginTimestamp: new Date().toISOString(),
    sessionToken: 'yr_sec_active',
    securityScore: 90,
    failedAttempts: 0,
  };

  const [settings, setSettings] = useState<UserSecuritySettings>(currentSettings);
  const [pinChangeOpen, setPinChangeOpen] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string>('');
  const [pinErrorMsg, setPinErrorMsg] = useState<string>('');

  const score = calculateSecurityScore(settings);
  const deviceInfo = detectDeviceEnvironment();

  const handleToggleBiometrics = () => {
    const next = { ...settings, biometricsEnabled: !settings.biometricsEnabled };
    setSettings(next);
    onUpdateSecurity(next);
    playChime('click');
  };

  const handleToggle2FA = () => {
    const next = { ...settings, twoFactorEnabled: !settings.twoFactorEnabled };
    setSettings(next);
    onUpdateSecurity(next);
    playChime('click');
  };

  const handleToggleAppLock = () => {
    const next = { ...settings, isAppLockActive: !settings.isAppLockActive };
    setSettings(next);
    onUpdateSecurity(next);
    playChime('click');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg('');
    setPinSuccessMsg('');

    if (!verifySecurityPin(currentPinInput, settings.securityPin)) {
      setPinErrorMsg('El PIN actual no es correcto.');
      playChime('error');
      return;
    }

    if (newPinInput.length !== 6 || !/^\d+$/.test(newPinInput)) {
      setPinErrorMsg('El nuevo PIN debe ser de exactamente 6 dígitos numéricos.');
      playChime('error');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinErrorMsg('Los nuevos PINs no coinciden.');
      playChime('error');
      return;
    }

    const next = { ...settings, securityPin: newPinInput };
    setSettings(next);
    onUpdateSecurity(next);
    playChime('success');
    setPinSuccessMsg('¡PIN de seguridad actualizado con éxito!');
    setTimeout(() => {
      setPinChangeOpen(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setPinSuccessMsg('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#202124] text-[#e3e3e3] border border-[#3c4043] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-auto">
        {/* Header */}
        <div className="bg-[#18191b] p-5 border-b border-[#303134] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Centro de Seguridad & Privacidad</h2>
              <p className="text-xs text-[#9aa0a6]">{user.displayName} • {user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="w-8 h-8 rounded-full hover:bg-[#303134] text-[#9aa0a6] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Security Score Banner */}
          <div className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 p-4 rounded-2xl border border-sky-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                Nivel de Protección de la Cuenta
              </span>
              <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                <span>{score}%</span>
                {score >= 85 ? (
                  <span className="text-xs font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/40">
                    Excelente Seguridad
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                    Recomendaciones Pendientes
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9aa0a6]">
                Protegido por Google Play Protect, tokens PKCE y autenticación biométrica FIDO2.
              </p>
            </div>

            <button
              onClick={() => {
                onLockAppNow();
                playChime('click');
              }}
              className="px-3 py-2 bg-[#282a2d] hover:bg-[#333539] border border-[#3c4043] rounded-xl text-xs font-medium text-white flex items-center gap-1.5 transition shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Security Toggles */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-white block">Mecanismos de Autenticación:</span>

            {/* Biometric Toggle */}
            <div className="p-3.5 bg-[#282a2d] border border-[#3c4043] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sensor Biométrico (Huella / Face ID)</div>
                  <div className="text-[11px] text-[#9aa0a6]">
                    Solicitar escaneo de huella al iniciar la app o cambiar de cuenta
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.biometricsEnabled ? 'bg-sky-500' : 'bg-[#3c4043]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.biometricsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2FA Toggle */}
            <div className="p-3.5 bg-[#282a2d] border border-[#3c4043] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Verificación en Dos Pasos (2FA)</div>
                  <div className="text-[11px] text-[#9aa0a6]">
                    Código temporal de Google Authenticator para accesos críticos
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.twoFactorEnabled ? 'bg-sky-500' : 'bg-[#3c4043]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* App Lock on background toggle */}
            <div className="p-3.5 bg-[#282a2d] border border-[#3c4043] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Bloqueo Automático de Pantalla</div>
                  <div className="text-[11px] text-[#9aa0a6]">
                    Requerir credenciales al abrir la app o regresar de segundo plano
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAppLock}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.isAppLockActive ? 'bg-sky-500' : 'bg-[#3c4043]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.isAppLockActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* PIN Settings */}
            <div className="p-3.5 bg-[#282a2d] border border-[#3c4043] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">PIN Cifrado de Respaldo</div>
                    <div className="text-[11px] text-[#9aa0a6]">
                      Código de 6 dígitos para validar pagos o desbloqueos sin biometría
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPinChangeOpen(!pinChangeOpen);
                    playChime('click');
                  }}
                  className="px-3 py-1.5 bg-[#3c4043] hover:bg-[#4d5156] text-xs font-medium text-white rounded-xl transition"
                >
                  {pinChangeOpen ? 'Cancelar' : 'Cambiar PIN'}
                </button>
              </div>

              {pinChangeOpen && (
                <form onSubmit={handleChangePin} className="pt-3 border-t border-[#3c4043] space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#c4c7c5]">PIN Actual:</label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="PIN actual (por defecto 123456)"
                      value={currentPinInput}
                      onChange={e => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full bg-[#1e2022] border border-[#3c4043] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#c4c7c5]">Nuevo PIN (6 dígitos):</label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="Ej: 582910"
                        value={newPinInput}
                        onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        required
                        className="w-full bg-[#1e2022] border border-[#3c4043] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#c4c7c5]">Confirmar Nuevo PIN:</label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="Repite el nuevo PIN"
                        value={confirmPinInput}
                        onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                        required
                        className="w-full bg-[#1e2022] border border-[#3c4043] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {pinErrorMsg && (
                    <div className="p-2 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{pinErrorMsg}</span>
                    </div>
                  )}

                  {pinSuccessMsg && (
                    <div className="p-2 bg-sky-950/40 border border-sky-500/40 text-sky-300 text-xs rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pinSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Guardar Nuevo PIN Cifrado
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Active Device Audit */}
          <div className="bg-[#18191b] rounded-2xl p-4 border border-[#303134] space-y-2">
            <span className="text-xs font-semibold text-white block">Auditoría de Acceso & Dispositivo:</span>

            <div className="space-y-1.5 text-xs text-[#bdc1c6]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#9aa0a6]">
                  <Smartphone className="w-3.5 h-3.5" /> Dispositivo:
                </span>
                <span className="text-white font-medium">{deviceInfo.os} • {deviceInfo.deviceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9aa0a6]">IP de Conexión:</span>
                <span className="font-mono text-white text-[11px]">{settings.lastLoginIp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9aa0a6]">Token de Sesión E2EE:</span>
                <span className="font-mono text-sky-300 text-[10px] truncate max-w-[200px]">
                  {settings.sessionToken || 'yr_sec_active_e2ee'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#18191b] border-t border-[#303134] flex items-center justify-end">
          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-200 font-semibold text-xs rounded-xl transition"
          >
            Aceptar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
