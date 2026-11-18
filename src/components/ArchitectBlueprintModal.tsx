import React, { useState } from 'react';
import { playChime } from '../utils/audioSpeech';
import {
  Layers,
  Code2,
  BookOpen,
  DollarSign,
  Layout,
  Server,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  X,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface ArchitectBlueprintModalProps {
  onClose: () => void;
}

export const ArchitectBlueprintModal: React.FC<ArchitectBlueprintModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'content' | 'business' | 'ux'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    playChime('click');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-sky-500/50 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Guía de Arquitectura de Software & Lead Product Manager
              </div>
              <h2 className="text-base font-extrabold text-white">
                Blueprint Integral de la Plataforma Móvil Yachay
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-sm font-bold transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs font-bold">
          {[
            { id: 'architecture', label: '1. Código & Arquitectura', icon: Code2 },
            { id: 'content', label: '2. Contenido & Pedagogía', icon: BookOpen },
            { id: 'business', label: '3. Lógica de Negocio & $1.25', icon: DollarSign },
            { id: 'ux', label: '4. Diseño UX/UI & Wireframes', icon: Layout },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  playChime('click');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-200 flex-1 leading-relaxed">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Stack Tecnológico Recomendado para Mobile</span>
                  </h3>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">
                    Recomendación: Flutter (Dart)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-sky-500/40 space-y-2">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                      <span>Opción A: Flutter (Altamente Recomendada)</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                      <li>
                        <strong>Renderizado Skia/Impeller a 120 FPS:</strong> Vital para el motor de ajedrez, animaciones fluidas del tablero y arrastre táctil sin jank.
                      </li>
                      <li>
                        <strong>Motor de audio nativo de baja latencia:</strong> Paquetes `audioplayers` y `speech_to_text` con acceso directo a APIs de audio de iOS y Android.
                      </li>
                      <li>
                        <strong>Soporte offline total:</strong> Almacenamiento local mediante Hive / Isar DB para lecciones en zonas rurales con conectividad intermitente.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Opción B: React Native con Expo</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                      <li>
                        <strong>Reutilización de lógica TypeScript:</strong> Comparte el 85% del código frontend entre la web y la app móvil nativa.
                      </li>
                      <li>
                        <strong>Ecosistema de librerías:</strong> `react-native-chess`, `@react-native-voice/voice` y `expo-av`.
                      </li>
                      <li>
                        <strong>Despliegue OTA:</strong> Actualizaciones rápidas de catálogo de leyendas y ejercicios sin esperar aprobación de tiendas de apps.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>Arquitectura Hexagonal & Backend para Ajedrez PvP</span>
                </h3>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-sky-300 overflow-x-auto space-y-1">
                  <div>┌─────────────────────────────────────────────────────────────┐</div>
                  <div>│ MOBILE CLIENT (Flutter / React Native)                      │</div>
                  <div>│  ├── Presentation Layer: UI Widgets + Riverpod / Bloc State │</div>
                  <div>│  ├── Domain Layer: ChessRules, SpeechValidator, PaywallGate   │</div>
                  <div>│  └── Data Layer: SQLite (Cache Offline) + WebSocket Client     │</div>
                  <div>└───────────────────────────────┬─────────────────────────────┘</div>
                  <div>                                │ TLS / WSS (WebSocket)</div>
                  <div>┌───────────────────────────────▼─────────────────────────────┐</div>
                  <div>│ BACKEND CLOUD INFRASTRUCTURE (Node.js / Express)           │</div>
                  <div>│  ├── WebSocket Server (Socket.io): PvP Matchmaking & Moves    │</div>
                  <div>│  ├── Speech-to-Text Pipeline: Web Speech / Whisper API       │</div>
                  <div>│  ├── Auth & Identity: Google OAuth 2.0 (Google Sign-In)      │</div>
                  <div>│  ├── Webhook Handler: Stripe / Google Pay Verification ($1.25)│</div>
                  <div>│  └── DB & Cache: Cloud SQL PostgreSQL + Redis Matchmaking     │</div>
                  <div>└─────────────────────────────────────────────────────────────┘</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                    <strong className="text-amber-300 block mb-1">Matchmaking en Tiempo Real (PvP):</strong>
                    Redis Sorted Sets (ZADD/ZRANGEBYSCORE) empareja jugadores con un delta de ELO menor a 150 puntos en menos de 2 segundos.
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                    <strong className="text-amber-300 block mb-1">Pipeline de Reconocimiento de Voz:</strong>
                    Normalización fonética local con distancia de Levenshtein para feedback en milisegundos sin consumir datos de red móvil.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Estructura Curricular Andina & Camino Diario (A1 - C1)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Alineación pedagógica por niveles de entrada con camino diario secuencial (Escucha → Escribe → Habla en cada módulo):
                </p>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>NIVEL PRINCIPIANTE (Días 1-2 • A1 - Kallari Yachay):</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded">Gratuito</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Fonética básica de vocales andinas, saludos según el sol (Alli puncha), familia (Ayllu) y cortesía comunitaria.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>NIVEL INTERMEDIO (Días 3-4 • B1 - Chawpi Yachay):</span>
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">
                        PRO $1.25
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Sufijos aglutinantes de caso (-manda, -man, -pi, -wan), vocabulario de minga, soberanía alimentaria y oraciones compuestas.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>NIVEL AVANZADO (Día 5 • C1 - Hatun Yachay):</span>
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">
                        PRO $1.25
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Discurso filosófico del Sumak Kawsay, oratoria pública (Rimay) y narrativa mitológica ancestral.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Guion Técnico de Adaptación Audiovisual: "Cantuña y el Atrio"</span>
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `GUION TÉCNICO: CANTUÑA Y EL ATRIO DE SAN FRANCISCO\nEscena 1 (0:00 - 0:15): Plano general Quito colonial al atardecer.\nLocución: En el siglo XVI, las campanas de San Francisco marcaban el plazo fatal...\nEscena 2 (0:15 - 0:30): Rayo y Lucifer ofrece el pacto de las piedras.\nEscena 3 (0:30 - 0:45): Cantuña talla la última piedra salvando su honor.`,
                        'guion-cantuna'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-sky-300 hover:text-white"
                  >
                    {copiedSection === 'guion-cantuna' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'guion-cantuna' ? 'Copiado' : 'Copiar Guion'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-sky-200 space-y-2">
                  <div>
                    <strong className="text-amber-400">[00:00 - 00:15] SECUENCIA 1: LA ANGUSTIA DEL CONSTRUCTOR</strong>
                    <div className="text-slate-400">Visual: Acuarela andina en movimiento. Vista del volcán Pichincha y el atrio en construcción.</div>
                    <div className="text-slate-200">Audio ES: "El plazo expiraba al amanecer. Si una piedra faltaba, la honra de Cantuña caería en el olvido."</div>
                    <div className="text-sky-300">Subtítulo Kichwa: "Pakarikpimi tukunayan, shuk rumillapash illakpika Cantuñaka chinkankami."</div>
                  </div>
                  <div>
                    <strong className="text-amber-400">[00:15 - 00:35] SECUENCIA 2: EL PACTO DE LA MEDIA NOCHE</strong>
                    <div className="text-slate-400">Visual: Lucifer emerge entre brasas. Cláusula andina grabada en piedra sagrada.</div>
                    <div className="text-slate-200">Audio ES: "Miles de seres levantaron la piedra, mas la astucia andina talló el destino."</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Economía Híbrida: Google AdSense + Pase Vitalicio $1.25 USD</span>
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    Freemium + AdSense
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Precio al Usuario</div>
                    <div className="text-xl font-extrabold text-white mt-1">$1.25 USD</div>
                    <div className="text-[10px] text-sky-400">Pago único sin anuncios</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Fee Pasarela (Google/Stripe)</div>
                    <div className="text-xl font-extrabold text-amber-400 mt-1">~$0.34 USD</div>
                    <div className="text-[10px] text-slate-400">2.9% + $0.30 fixed</div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-sky-500/50">
                    <div className="text-slate-400 text-[10px]">Margen Neto Operativo</div>
                    <div className="text-xl font-extrabold text-sky-300 mt-1">~$0.91 USD</div>
                    <div className="text-[10px] text-sky-400">72.8% + ingresos AdSense Free</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Modelo Dual Sostenible:</strong> Los estudiantes en plan gratuito financian la plataforma con ubicaciones no intrusivas de Google AdSense, mientras que el pago único de $1.25 USD remueve los anuncios y habilita certificaciones oficiales y niveles completos.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Flujo Criptográfico de Verificación del Pago & Emisión de Certificado</span>
                </h3>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-sky-200 space-y-1">
                  <div>1. Cliente Móvil ejecuta Google Pay / Stripe SDK con PaymentIntent($1.25)</div>
                  <div>2. Pasarela emite Webhook `charge.successful` firmado con HMAC-SHA256</div>
                  <div>3. Backend valida header `stripe-signature` con webhook secret</div>
                  <div>4. Transacción atómica en PostgreSQL: `UPDATE users SET is_pro = true WHERE id = ?`</div>
                  <div>5. WebSocket emite `event:pro_unlocked` al dispositivo móvil en tiempo real</div>
                  <div>6. Certificado digital genera firma inmutable SHA-256 + QR para verificación pública</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ux' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layout className="w-4 h-4 text-amber-400" />
                  <span>Arquitectura de Información & Camino Diario Tipo Duolingo</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Todo el sistema inicia consultando el nivel del estudiante y desbloquea un camino diario secuencial con 3 habilidades idénticas por módulo:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-lg block mb-1">🗣️</span>
                    <strong className="text-white block">1. Idiomas</strong>
                    <span className="text-[10px] text-sky-400">Camino diario por nivel</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-lg block mb-1">♟️</span>
                    <strong className="text-white block">2. Ajedrez</strong>
                    <span className="text-[10px] text-sky-400">IA y PvP Comunitario</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-lg block mb-1">📖</span>
                    <strong className="text-white block">3. Leyendas</strong>
                    <span className="text-[10px] text-sky-400">Cuentos y videos 4K</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-lg block mb-1">📜</span>
                    <strong className="text-white block">4. Certificados</strong>
                    <span className="text-[10px] text-sky-400">Racha y credenciales</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span>Secuencia Uniforme por Módulo: Escucha → Escribe → Habla</span>
                </h3>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-sky-200 space-y-0.5 overflow-x-auto">
                  <div>┌────────────────────────────────────────────┐</div>
                  <div>│ [✕]  DÍA 1: SALUDOS KICHWA   [1→2→3]       │</div>
                  <div>├────────────────────────────────────────────┤</div>
                  <div>│  Paso 1: [🎧 ESCUCHA] Audio nativo         │</div>
                  <div>│  Paso 2: [✍️ ESCRIBE] Construcción texto   │</div>
                  <div>│  Paso 3: [🗣️ HABLA]   Calibración vocal    │</div>
                  <div>└────────────────────────────────────────────┘</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 font-medium">
            Documento vivo de Arquitectura & Estrategia de Producto
          </span>
          <button
            onClick={() => {
              onClose();
              playChime('click');
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
          >
            Cerrar Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
