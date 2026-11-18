import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playChime } from '../utils/audioSpeech';
import confetti from 'canvas-confetti';
import { Crown, Check, ShieldCheck, CreditCard, Lock, Sparkles, X } from 'lucide-react';

interface FreemiumModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const FreemiumModal: React.FC<FreemiumModalProps> = ({
  onClose,
  onUpgradeSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'gpay' | 'card'>('gpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 4242');

  const handlePay = () => {
    setIsProcessing(true);
    playChime('click');

    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess();
      playChime('success');
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#0ea5e9', '#6366f1', '#ffffff'],
        });
      } catch {
        // ignore
      }
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-5 text-slate-950 text-center relative">
          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 flex items-center justify-center text-xs font-bold"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg mb-2">
            <Crown className="w-6 h-6 fill-amber-400" />
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight">Pase Vitalicio Yachay Pro</h2>
          <div className="text-xs font-bold opacity-90 mt-0.5">
            Acceso ilimitado, sin anuncios AdSense, ajedrez PvP y leyendas
          </div>

          <div className="mt-3 inline-flex items-baseline gap-1 bg-slate-950/90 text-amber-300 px-4 py-1.5 rounded-full font-mono font-bold shadow-md">
            <span className="text-2xl font-black">$1.25</span>
            <span className="text-xs text-slate-300 uppercase">USD / Pago Único</span>
          </div>
        </div>

        {/* Benefits Comparison Grid */}
        <div className="p-5 space-y-4">
          <div className="space-y-2.5 text-xs">
            {[
              { text: 'Desbloqueo de todos los niveles diarios (Intermedio B1 y Avanzado C1)' },
              { text: 'Experiencia 100% libre de anuncios de Google AdSense' },
              { text: 'Modo Multijugador Online (PvP) de Ajedrez con Matchmaking' },
              { text: 'Catálogo completo de Mitos & Leyendas en Video 4K subtitulado' },
              { text: 'Emisión y descarga ilimitada de Certificados Oficiales con QR' },
              { text: 'Soporte a la preservación de lenguas indígenas del Ecuador' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-100">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Payment Gateways */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Método de Pago Seguro (Cifrado 256-bit):
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setPaymentMethod('gpay')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMethod === 'gpay'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                    : 'bg-slate-800/70 border-slate-700 text-slate-200'
                }`}
              >
                <span>Google Pay</span>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                    : 'bg-slate-800/70 border-slate-700 text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tarjeta Crédito / Débito</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-1.5 pt-1">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="Número de tarjeta"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Validando transacción bancaria...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pagar $1.25 USD y Desbloquear de por Vida</span>
              </>
            )}
          </button>

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 font-medium">
            <Lock className="w-3 h-3 text-sky-400" />
            <span>Pago único y definitivo. Sin suscripciones recurrentes ni cobros sorpresa.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
