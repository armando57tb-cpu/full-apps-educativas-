import React, { useState } from 'react';
import { CertificateData, LanguageCode, UserProfile } from '../types';
import { generateCertificate, checkFreemiumAccess } from '../utils/pedagogyLogic';
import { playChime } from '../utils/audioSpeech';
import confetti from 'canvas-confetti';
import { Award, Download, Printer, ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

interface CertificateModalProps {
  user: UserProfile;
  languageCode: LanguageCode;
  level: string;
  onClose: () => void;
  onOpenFreemium: () => void;
  onSaveCertificate: (cert: CertificateData) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  user,
  languageCode,
  level,
  onClose,
  onOpenFreemium,
  onSaveCertificate,
}) => {
  const languageNames: Record<LanguageCode, string> = {
    kichwa: 'Kichwa Unificado (Runashimi)',
    shuar: 'Shuar Chicham (Nación Shuar)',
    achuar: 'Achuar Chicham (Nación Achuar)',
    tsafiki: 'Tsáfiki (Nacionalidad Tsáchila)',
    chapalaa: "Cha'palaa (Nacionalidad Chachi)",
    awapit: 'Awapit (Nacionalidad Awá)',
    en: 'Inglés Global & Pensamiento Estratégico',
    fr: 'Francés Intercultural',
  };

  const [studentName, setStudentName] = useState<string>(user.displayName || 'Estudiante Yachay');
  const [cert, setCert] = useState<CertificateData>(() =>
    generateCertificate(studentName, languageNames[languageCode] || 'Kichwa Unificado', languageCode, level)
  );

  const handleUpdateName = (newName: string) => {
    setStudentName(newName);
    setCert(generateCertificate(newName, languageNames[languageCode], languageCode, level));
  };

  const handleDownload = () => {
    const access = checkFreemiumAccess(user.isPro, 'certificate_download');
    if (!access.allowed) {
      onOpenFreemium();
      return;
    }

    onSaveCertificate(cert);
    playChime('success');
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {
      // ignore
    }

    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto">
        {/* Modal Top Bar */}
        <div className="bg-slate-950/90 p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Certificación Digital Oficial Verificable</h3>
          </div>
          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Customizable Name Input */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs text-slate-200 font-medium">Nombre completo en el certificado:</label>
            <input
              type="text"
              value={studentName}
              onChange={e => handleUpdateName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* High Fidelity Certificate Parchment Canvas */}
          <div
            id="certificate-print-area"
            className="bg-gradient-to-b from-amber-50 via-stone-100 to-amber-100 text-stone-900 rounded-xl p-6 sm:p-8 border-4 border-amber-600/60 shadow-2xl relative overflow-hidden"
          >
            {/* Ornamental Andean Border corners */}
            <div className="absolute top-2 left-2 text-amber-700 text-xs font-mono select-none">✦ ═══ ✦</div>
            <div className="absolute top-2 right-2 text-amber-700 text-xs font-mono select-none">✦ ═══ ✦</div>
            <div className="absolute bottom-2 left-2 text-amber-700 text-xs font-mono select-none">✦ ═══ ✦</div>
            <div className="absolute bottom-2 right-2 text-amber-700 text-xs font-mono select-none">✦ ═══ ✦</div>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-amber-800 font-extrabold text-[11px] tracking-widest uppercase">
                <span>REPÚBLICA DEL ECUADOR</span> • <span>CONSEJO INTERCULTURAL</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900 uppercase">
                Certificado de Suficiencia Lingüística
              </h2>
              <div className="text-xs font-serif italic text-stone-700">
                Se otorga el presente reconocimiento oficial a:
              </div>
            </div>

            {/* Recipient Name */}
            <div className="text-center my-4 py-2 border-b-2 border-amber-700/40">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-950 tracking-wide">
                {cert.studentName}
              </span>
            </div>

            {/* Accreditation details */}
            <div className="text-center text-xs text-stone-800 max-w-md mx-auto leading-relaxed">
              Por haber completado y aprobado satisfactoriamente todos los módulos de microaprendizaje en{' '}
              <strong className="text-amber-900 font-bold">{cert.language}</strong>, demostrando dominio en las tres
              competencias fundamentales: <span className="underline font-semibold">Escucha Nativa</span>,{' '}
              <span className="underline font-semibold">Pronunciación Calibrada</span> y{' '}
              <span className="underline font-semibold">Construcción Sintáctica</span>.
            </div>

            {/* Signatures & Seal Grid */}
            <div className="mt-6 pt-4 border-t border-amber-800/20 grid grid-cols-3 gap-2 items-center text-center text-[10px]">
              {/* Academic Sign */}
              <div>
                <div className="font-serif italic font-bold text-amber-900 border-b border-stone-400 pb-0.5">
                  Dra. Luzmila Cotacachi
                </div>
                <div className="text-stone-600 mt-0.5">Dir. Lingüística Andina</div>
              </div>

              {/* Gold Andean Chakana Seal */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full bg-amber-50 rounded-full flex flex-col items-center justify-center text-[8px] font-black text-amber-900 border border-amber-600">
                    <span>✦ CHAKANA ✦</span>
                    <span className="text-[6px]">OFICIAL</span>
                  </div>
                </div>
              </div>

              {/* Verifiable QR Code box */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white border border-stone-400 p-1 flex items-center justify-center rounded shadow-xs">
                  {/* Styled SVG QR representation */}
                  <svg viewBox="0 0 24 24" className="w-full h-full text-stone-900">
                    <rect x="2" y="2" width="6" height="6" fill="currentColor" />
                    <rect x="16" y="2" width="6" height="6" fill="currentColor" />
                    <rect x="2" y="16" width="6" height="6" fill="currentColor" />
                    <rect x="10" y="4" width="4" height="2" fill="currentColor" />
                    <rect x="4" y="10" width="2" height="4" fill="currentColor" />
                    <rect x="10" y="10" width="4" height="4" fill="currentColor" />
                    <rect x="16" y="12" width="6" height="2" fill="currentColor" />
                    <rect x="12" y="16" width="2" height="6" fill="currentColor" />
                    <rect x="16" y="18" width="6" height="4" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-mono text-[7px] text-stone-600 mt-0.5 tracking-tighter">
                  {cert.verificationCode}
                </span>
              </div>
            </div>

            {/* Issue date and integrity */}
            <div className="mt-3 text-[9px] text-stone-500 text-center font-mono">
              Fecha de emisión: {cert.issueDate} • Verificación criptográfica con hash SHA-256
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Código: <strong className="font-mono text-amber-300">{cert.verificationCode}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition"
              >
                {!user.isPro ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{user.isPro ? 'Descargar / Imprimir Certificado' : 'Descargar con Pro ($1.25)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
