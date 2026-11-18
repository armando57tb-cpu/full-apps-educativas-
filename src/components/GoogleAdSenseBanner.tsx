import React, { useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Crown, ExternalLink, Info } from 'lucide-react';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface GoogleAdSenseBannerProps {
  user: UserProfile;
  slotName: string;
  slotId?: string;
  format?: 'horizontal' | 'infeed';
  onOpenFreemium: () => void;
}

const ADSENSE_SCRIPT_ID = 'yachay-google-adsense-script';

export const GoogleAdSenseBanner: React.FC<GoogleAdSenseBannerProps> = ({
  user,
  slotName,
  slotId,
  format = 'horizontal',
  onOpenFreemium,
}) => {
  const insRef = useRef<HTMLModElement | null>(null);
  const publisherClient = (import.meta.env.VITE_ADSENSE_CLIENT || '').trim();
  const configuredSlot = (slotId || import.meta.env.VITE_ADSENSE_SLOT || '').trim();
  const isLiveAdSenseConfigured = publisherClient.startsWith('ca-pub-') && configuredSlot.length > 0;

  useEffect(() => {
    if (user.isPro || !isLiveAdSenseConfigured) return;

    try {
      if (!document.getElementById(ADSENSE_SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = ADSENSE_SCRIPT_ID;
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
          publisherClient
        )}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      if (insRef.current && !insRef.current.getAttribute('data-adsbygoogle-status')) {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch {
      // Ad blockers or preview sandboxes may block external ad scripts safely
    }
  }, [user.isPro, isLiveAdSenseConfigured, publisherClient, configuredSlot]);

  if (user.isPro) {
    return null;
  }

  return (
    <aside
      aria-label={`Publicidad Google AdSense - ${slotName}`}
      data-testid={`adsense-unit-${slotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-3 sm:p-3.5 shadow-sm"
    >
      {/* Top Disclosure Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200 uppercase tracking-wider">
            Anuncio
          </span>
          <span className="font-semibold text-sky-300">Google AdSense</span>
          <span className="hidden sm:inline text-slate-500">• {slotName}</span>
        </div>

        <button
          type="button"
          onClick={onOpenFreemium}
          className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold transition"
          title="Eliminar anuncios y desbloquear todos los módulos por $1.25 USD"
        >
          <Crown className="w-3 h-3" />
          <span>Quitar anuncios ($1.25)</span>
        </button>
      </div>

      {/* Live AdSense Slot or Policy-Compliant Preview Container */}
      {isLiveAdSenseConfigured ? (
        <div className="w-full min-h-[90px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/60">
          <ins
            ref={insRef}
            className="adsbygoogle block w-full"
            data-ad-client={publisherClient}
            data-ad-slot={configuredSlot}
            data-ad-format={format === 'horizontal' ? 'horizontal' : 'auto'}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-900 border border-slate-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300 font-black text-sm flex items-center justify-center shrink-0">
              Ad
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>Becas y Recursos Educativos Interculturales</span>
                <ExternalLink className="w-3 h-3 text-sky-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-300/90 mt-0.5 leading-snug">
                Espacio patrocinado por red Google AdSense para sostener lecciones gratuitas de Kichwa y Shuar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <Info className="w-3 h-3 text-sky-400" />
              <span>AdSense {format === 'horizontal' ? 'Banner' : 'In-Feed'}</span>
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
