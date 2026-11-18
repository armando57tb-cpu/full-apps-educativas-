import { LanguageCode } from '../types';

export interface SpeechRecognitionSession {
  stop: () => void;
  abort: () => void;
}

export interface SpeechRecognitionCallbacks {
  onInterim?: (transcript: string) => void;
  onResult: (transcript: string, alternatives: string[]) => void;
  onError: (errorCode: string, message: string) => void;
  onEnd?: () => void;
}

type SpeechRecConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionConstructor(): SpeechRecConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecConstructor;
    webkitSpeechRecognition?: SpeechRecConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

/**
 * Resolves the closest acoustic STT locale.
 * Note: Browsers lack dedicated 'qu-EC' or 'jiv-EC' Web Speech models,
 * so 'es-EC' (Ecuadorian Spanish) provides the closest phonetic recognition,
 * which is then evaluated via our Kichwa/Shuar phonetic matcher.
 */
export function resolveSpeechLocale(langCode: LanguageCode): string {
  switch (langCode) {
    case 'en':
      return 'en-US';
    case 'fr':
      return 'fr-FR';
    case 'kichwa':
    case 'shuar':
    case 'achuar':
    case 'tsafiki':
    case 'chapalaa':
    case 'awapit':
    default:
      return 'es-EC';
  }
}

export function mapSpeechErrorToSpanish(errorCode: string): string {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Permiso de micrófono denegado. Habilita el micrófono en tu navegador o usa la entrada alternativa de prueba.';
    case 'audio-capture':
      return 'No se detectó ningún micrófono conectado en este dispositivo.';
    case 'no-speech':
      return 'No se escuchó voz clara. Intenta hablar más cerca del micrófono.';
    case 'network':
      return 'El servicio de reconocimiento de voz requiere conexión activa a internet.';
    case 'aborted':
      return 'Grabación cancelada.';
    default:
      return 'No pudimos capturar tu voz en este entorno. Puedes reintentar o usar la práctica asistida.';
  }
}

/**
 * Starts a Web Speech API recognition session with interim results and multiple alternatives
 */
export function startBrowserSpeechRecognition(
  langCode: LanguageCode,
  callbacks: SpeechRecognitionCallbacks
): SpeechRecognitionSession | null {
  const SpeechRec = getSpeechRecognitionConstructor();
  if (!SpeechRec) {
    callbacks.onError(
      'unsupported',
      'Tu navegador actual no soporta reconocimiento de voz nativo (Web Speech API). Usa Chrome/Edge/Android o la evaluación asistida.'
    );
    return null;
  }

  let finished = false;
  let lastTranscript = '';
  let lastAlternatives: string[] = [];

  try {
    const recognition = new SpeechRec();
    recognition.lang = resolveSpeechLocale(langCode);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      const alts: string[] = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const primary = res[0]?.transcript || '';
        if (res.isFinal) {
          finalText += primary;
          for (let j = 0; j < res.length; j++) {
            const t = res[j]?.transcript?.trim();
            if (t && !alts.includes(t)) alts.push(t);
          }
        } else {
          interim += primary;
        }
      }

      if (interim) {
        lastTranscript = interim;
        callbacks.onInterim?.(interim.trim());
      }

      if (finalText.trim()) {
        finished = true;
        lastTranscript = finalText.trim();
        lastAlternatives = alts.length > 0 ? alts : [lastTranscript];
        callbacks.onResult(lastTranscript, lastAlternatives);
      }
    };

    recognition.onerror = (event: any) => {
      if (finished) return;
      finished = true;
      const code = event?.error || 'unknown';
      callbacks.onError(code, mapSpeechErrorToSpanish(code));
    };

    recognition.onend = () => {
      if (!finished) {
        finished = true;
        if (lastTranscript.trim()) {
          callbacks.onResult(
            lastTranscript.trim(),
            lastAlternatives.length > 0 ? lastAlternatives : [lastTranscript.trim()]
          );
        } else {
          callbacks.onEnd?.();
        }
      } else {
        callbacks.onEnd?.();
      }
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
      abort: () => {
        finished = true;
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      },
    };
  } catch {
    callbacks.onError(
      'init-failed',
      'No se pudo inicializar el sensor de voz del navegador. Usa la evaluación asistida.'
    );
    return null;
  }
}
