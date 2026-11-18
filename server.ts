import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  WebSearchResult,
  WebSourceCategory,
  normalizeNavigableUrl,
  isSafePublicHttpUrl,
  extractHostname,
  extractReadableHtmlContent,
  dedupeWebSearchResults,
} from './src/utils/webBrowserLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

interface SearchContextSnippet {
  title: string;
  kind: string;
  subtitle?: string;
  excerpt: string;
}

interface LanguagePracticeTurn {
  role: 'user' | 'assistant';
  text: string;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error(`Request timed out after ${ms}ms`);
          err.name = 'TimeoutError';
          reject(err);
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function isTransientGeminiError(err: unknown): Promise<boolean> {
  const errMsg = err instanceof Error ? err.message : String(err);
  const status =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : 0;
  return (
    status === 503 ||
    status === 429 ||
    (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) ||
    /"code":\s*(503|429)/.test(errMsg) ||
    /UNAVAILABLE|high demand|RESOURCE_EXHAUSTED|rate limit|quota/i.test(errMsg)
  );
}

async function generateWithBackoff<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 12000,
  maxRetries: number = 1
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err: unknown) {
      lastError = err;
      const transient = await isTransientGeminiError(err);
      if (!transient || attempt === maxRetries) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 650 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function generateWithModelFallback<T>(
  primaryFn: (modelName: string) => Promise<T>,
  fallbackFn?: (modelName: string) => Promise<T>,
  timeoutMs: number = 11000
): Promise<{ result: T; modelUsed: string }> {
  try {
    const result = await withTimeout(primaryFn('gemini-4-hydrogen'), timeoutMs);
    return { result, modelUsed: 'gemini-4-hydrogen' };
  } catch (primaryErr: unknown) {
    const canFallback = await isTransientGeminiError(primaryErr);
    if (!canFallback) {
      throw primaryErr;
    }
    const secondaryRunner = fallbackFn || primaryFn;
    const result = await generateWithBackoff(
      () => secondaryRunner('gemini-3.1-flash-lite'),
      timeoutMs,
      1
    );
    return { result, modelUsed: 'gemini-3.1-flash-lite' };
  }
}

function formatFriendlyGeminiError(err: unknown): { status: number; message: string } {
  if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
    return {
      status: 504,
      message: 'El asistente Gemini tardó demasiado en responder. Intenta nuevamente en un momento.',
    };
  }
  const rawMessage = err instanceof Error ? err.message : 'Error inesperado al consultar Gemini.';
  const status =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
  if (status === 503 || /"code":\s*503|UNAVAILABLE|high demand/i.test(rawMessage)) {
    return {
      status: 503,
      message:
        'El modelo Gemini presenta alta demanda temporal. Pulsa enviar nuevamente en unos segundos.',
    };
  }
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(rawMessage)) {
    return {
      status: 429,
      message: 'Se alcanzó el límite temporal de consultas de Gemini. Intenta nuevamente en un momento.',
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: `No se pudo completar la consulta con Gemini: ${rawMessage}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // AI in-app knowledge & learning search endpoint powered by Gemini
  app.post('/api/ai/search', async (req, res) => {
    const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const snippets: SearchContextSnippet[] = Array.isArray(req.body?.contextSnippets)
      ? req.body.contextSnippets.slice(0, 8)
      : [];

    if (!rawQuery) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Escribe una pregunta o palabra clave para buscar con IA.',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message:
          'El asistente Gemini requiere GEMINI_API_KEY en Settings > Secrets. Puedes usar los resultados directos del catálogo abajo.',
      });
    }

    try {
      const formattedContext =
        snippets.length > 0
          ? snippets
              .map(
                (item, idx) =>
                  `[${idx + 1}] (${item.kind}) ${item.title}${item.subtitle ? ` — ${item.subtitle}` : ''}\n${item.excerpt}`
              )
              .join('\n\n')
          : 'Catálogo general de Yachay & Raíces: 6 idiomas ancestrales del Ecuador (Kichwa Unificado, Shuar Chicham, Achuar Chicham, Tsáfiki, Cha\'palaa, Awapit), 2 idiomas globales (Inglés Global, Francés Intercultural), Ajedrez con IA y detección oficial de jaque mate con chess.js, 18 Leyendas y Mitos con estudio de video IA, y Certificados verificables.';

      const { result: response, modelUsed } = await generateWithModelFallback(
        modelName =>
          ai.models.generateContent({
            model: modelName,
            contents: `Consulta del estudiante: "${rawQuery}"\n\nInformación encontrada en la app Yachay & Raíces:\n${formattedContext}`,
            config: {
              systemInstruction:
                'Eres el guía educativo inteligente dentro de la app ecuatoriana "Yachay & Raíces". Responde en español claro, amigable y conciso (máximo 120 palabras). Ayuda al usuario a encontrar información exacta dentro de la app (idiomas del Ecuador como Kichwa, Shuar, Achuar, Tsáfiki, Cha\'palaa, Awapit; Inglés/Francés; Ajedrez & IA; Mitos y Leyendas; o Certificados y Perfil). Basa tus ejemplos en el contexto proporcionado y sugiere qué sección abrir. Escribe en texto limpio sin usar asteriscos ni sintaxis Markdown.',
              ...(modelName === 'gemini-4-hydrogen'
                ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
                : {}),
            },
          })
      );

      const answer = (response.text ?? '').trim();
      if (!answer) {
        return res.status(502).json({
          error: 'EMPTY_AI_RESPONSE',
          message: 'El modelo no devolvió texto para esta consulta. Intenta reformularla.',
        });
      }

      return res.json({
        answer,
        model: modelUsed,
      });
    } catch (err: unknown) {
      const formatted = formatFriendlyGeminiError(err);
      return res.status(formatted.status).json({
        error: formatted.status === 504 ? 'GEMINI_TIMEOUT' : 'GEMINI_UPSTREAM_ERROR',
        message: formatted.message,
      });
    }
  });

  // Conversational Kichwa / Shuar AI tutor with real-time grammar correction
  app.post('/api/ai/language-practice', async (req, res) => {
    const language = req.body?.language === 'shuar' ? 'shuar' : 'kichwa';
    const userMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history: LanguagePracticeTurn[] = Array.isArray(req.body?.history)
      ? req.body.history.slice(-8)
      : [];

    if (!userMessage) {
      return res.status(400).json({
        error: 'INVALID_MESSAGE',
        message: 'Escribe una frase o pregunta para conversar con el tutor IA.',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message: 'La práctica conversacional con Gemini requiere GEMINI_API_KEY en Settings > Secrets.',
      });
    }

    const targetLanguageLabel =
      language === 'shuar' ? 'Shuar Chicham (Amazonía de Ecuador)' : 'Kichwa Unificado del Ecuador';

    const historyText =
      history.length > 0
        ? history
            .map(h => `${h.role === 'user' ? 'Estudiante' : 'Tutor'}: ${h.text}`)
            .join('\n')
        : '(Inicio de conversación)';

    try {
      const { result: response, modelUsed } = await generateWithModelFallback(modelName =>
        ai.models.generateContent({
          model: modelName,
          contents: `Idioma objetivo: ${targetLanguageLabel}\n\nHistorial reciente:\n${historyText}\n\nMensaje actual del estudiante: "${userMessage}"`,
          config: {
            systemInstruction:
              language === 'shuar'
                ? 'Eres Yachay, un tutor paciente y experto en Shuar Chicham de Ecuador. Mantén una conversación breve y natural en Shuar Chicham (1 o 2 oraciones cortas en replyNative) y evalúa la gramática del mensaje del estudiante en tiempo real. Si el estudiante escribió en Shuar correctamente, marca grammarStatus="correcta" y felicítalo brevemente en grammarFeedback explicando por qué está bien. Si tiene errores de ortografía, sufijos (-jai, -aitjai, naari, etc.) u orden, marca grammarStatus="con_sugerencias", explica con claridad en grammarFeedback y pon la frase corregida en correctedPhrase. Si preguntó en español cómo decir algo, marca grammarStatus="consulta_es", responde en Shuar y da la frase modelo en correctedPhrase.'
                : 'Eres Yachay, un tutor paciente y experto en Kichwa Unificado del Ecuador. Mantén una conversación breve y natural en Kichwa (1 o 2 oraciones cortas en replyNative) y evalúa la gramática del mensaje del estudiante en tiempo real. Si el estudiante escribió en Kichwa correctamente, marca grammarStatus="correcta" y explica brevemente el acierto (sufijos -ka, -mi, -ta, -ni, etc.) en grammarFeedback. Si hay errores ortográficos, de sufijos o de orden SOV, marca grammarStatus="con_sugerencias", explica con amabilidad en grammarFeedback y entrega la frase corregida en correctedPhrase. Si preguntó en español cómo decir algo, marca grammarStatus="consulta_es", responde en Kichwa y pon la frase modelo en correctedPhrase.',
            ...(modelName === 'gemini-4-hydrogen'
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                replyNative: {
                  type: Type.STRING,
                  description: 'Respuesta breve conversacional del tutor en Kichwa o Shuar (1-2 oraciones).',
                },
                replyEs: {
                  type: Type.STRING,
                  description: 'Traducción al español de replyNative.',
                },
                grammarStatus: {
                  type: Type.STRING,
                  description: 'Uno de: correcta, con_sugerencias, consulta_es',
                },
                grammarFeedback: {
                  type: Type.STRING,
                  description: 'Retroalimentación gramatical breve y clara en español (máximo 45 palabras).',
                },
                correctedPhrase: {
                  type: Type.STRING,
                  description: 'Frase corregida o modelo sugerido en el idioma objetivo (vacío si ya está perfecta).',
                },
                pronunciationGuide: {
                  type: Type.STRING,
                  description: 'Guía fonética por sílabas entre corchetes para replyNative.',
                },
                nextPromptEs: {
                  type: Type.STRING,
                  description: 'Sugerencia corta en español de qué responder a continuación.',
                },
              },
              required: ['replyNative', 'replyEs', 'grammarStatus', 'grammarFeedback'],
            },
          },
        })
      );

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        return res.status(502).json({
          error: 'EMPTY_AI_RESPONSE',
          message: 'El tutor IA no devolvió respuesta. Intenta enviar tu mensaje nuevamente.',
        });
      }

      return res.json({
        raw: rawJson,
        model: modelUsed,
      });
    } catch (err: unknown) {
      const formatted = formatFriendlyGeminiError(err);
      return res.status(formatted.status).json({
        error: formatted.status === 504 ? 'GEMINI_TIMEOUT' : 'GEMINI_UPSTREAM_ERROR',
        message: formatted.message,
      });
    }
  });

  // Live Internet, Books & Academic Sources Search (Gemini googleSearch + OpenAlex + Open Library + Wikipedia)
  app.post('/api/web/search', async (req, res) => {
    const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const categoryRaw = req.body?.category;
    const category: WebSourceCategory =
      categoryRaw === 'academic' || categoryRaw === 'books' || categoryRaw === 'web'
        ? categoryRaw
        : 'all';

    if (!rawQuery) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Escribe un tema, libro o artículo académico para buscar en internet.',
      });
    }

    const fetchOpenAlex = async (): Promise<WebSearchResult[]> => {
      if (category !== 'all' && category !== 'academic') return [];
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(
        rawQuery
      )}&per-page=6&select=id,title,publication_year,primary_location,authorships,doi,open_access,abstract_inverted_index`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'YachayRaicesApp/1.0 (mailto:educacion@yachay.ec)' },
        signal: AbortSignal.timeout(5500),
      });
      if (!resp.ok) return [];
      const data = (await resp.json()) as {
        results?: Array<{
          id?: string;
          title?: string;
          publication_year?: number;
          doi?: string;
          open_access?: { is_oa?: boolean; oa_url?: string };
          primary_location?: {
            landing_page_url?: string;
            source?: { display_name?: string };
          };
          authorships?: Array<{ author?: { display_name?: string } }>;
          abstract_inverted_index?: Record<string, number[]>;
        }>;
      };
      const items: WebSearchResult[] = [];
      for (const work of data.results || []) {
        const targetUrl =
          work.open_access?.oa_url ||
          work.primary_location?.landing_page_url ||
          work.doi ||
          work.id;
        if (!targetUrl || !isSafePublicHttpUrl(targetUrl)) continue;

        let abstractText = '';
        if (work.abstract_inverted_index && typeof work.abstract_inverted_index === 'object') {
          const positioned: Array<[number, string]> = [];
          for (const [word, idxs] of Object.entries(work.abstract_inverted_index)) {
            if (Array.isArray(idxs)) {
              for (const pos of idxs) {
                if (pos < 45) positioned.push([pos, word]);
              }
            }
          }
          positioned.sort((a, b) => a[0] - b[0]);
          abstractText = positioned.map(([, w]) => w).join(' ');
        }

        const authors = (work.authorships || [])
          .slice(0, 3)
          .map(a => a.author?.display_name)
          .filter(Boolean)
          .join(', ');

        items.push({
          id: `oa-${items.length}-${Math.abs(targetUrl.length * 31)}`,
          title: (work.title || 'Publicación académica').trim(),
          url: targetUrl,
          domain: extractHostname(targetUrl),
          category: 'academic',
          sourceName: work.primary_location?.source?.display_name || 'OpenAlex',
          snippet:
            abstractText ||
            `Artículo académico indexado en OpenAlex${
              work.primary_location?.source?.display_name
                ? ` • ${work.primary_location.source.display_name}`
                : ''
            }.`,
          authors: authors || undefined,
          year: work.publication_year ? String(work.publication_year) : undefined,
          openAccess: Boolean(work.open_access?.is_oa),
        });
      }
      return items;
    };

    const fetchOpenLibraryBooks = async (): Promise<WebSearchResult[]> => {
      if (category !== 'all' && category !== 'books') return [];
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        rawQuery
      )}&limit=6&fields=key,title,author_name,first_publish_year,subject,ebook_access`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'YachayRaicesApp/1.0' },
        signal: AbortSignal.timeout(5500),
      });
      if (!resp.ok) return [];
      const data = (await resp.json()) as {
        docs?: Array<{
          key?: string;
          title?: string;
          author_name?: string[];
          first_publish_year?: number;
          subject?: string[];
          ebook_access?: string;
        }>;
      };
      const items: WebSearchResult[] = [];
      for (const doc of data.docs || []) {
        if (!doc.key || !doc.title) continue;
        const bookUrl = `https://openlibrary.org${doc.key}`;
        const authors = (doc.author_name || []).slice(0, 3).join(', ');
        const subjects = (doc.subject || []).slice(0, 4).join(' • ');
        items.push({
          id: `ol-${items.length}-${doc.key.replace(/[^a-zA-Z0-9]/g, '')}`,
          title: doc.title.trim(),
          url: bookUrl,
          domain: 'openlibrary.org',
          category: 'books',
          sourceName: 'Open Library',
          snippet: subjects
            ? `Temas del libro: ${subjects}`
            : 'Ficha bibliográfica y disponibilidad de lectura en Open Library.',
          authors: authors || undefined,
          year: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          openAccess: doc.ebook_access === 'public' || doc.ebook_access === 'borrowable',
        });
      }
      return items;
    };

    const fetchWikipediaEs = async (): Promise<WebSearchResult[]> => {
      if (category !== 'all' && category !== 'web') return [];
      const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        rawQuery
      )}&srlimit=5&format=json&utf8=1`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'YachayRaicesApp/1.0 (educacion@yachay.ec)' },
        signal: AbortSignal.timeout(5000),
      });
      if (!resp.ok) return [];
      const data = (await resp.json()) as {
        query?: {
          search?: Array<{ pageid: number; title: string; snippet: string }>;
        };
      };
      const items: WebSearchResult[] = [];
      for (const hit of data.query?.search || []) {
        const pageUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(
          hit.title.replace(/\s+/g, '_')
        )}`;
        const cleanSnippet = (hit.snippet || '').replace(/<[^>]+>/g, '');
        items.push({
          id: `wiki-${hit.pageid}`,
          title: hit.title,
          url: pageUrl,
          domain: 'es.wikipedia.org',
          category: 'web',
          sourceName: 'Wikipedia',
          snippet: cleanSnippet || 'Artículo enciclopédico de consulta libre.',
          openAccess: true,
        });
      }
      return items;
    };

    const synthesizeWebResults = async (
      liveSnippets: WebSearchResult[]
    ): Promise<{
      summary: string | null;
      modelUsed: string | null;
      warning: string | null;
      chunks: WebSearchResult[];
    }> => {
      const ai = getGeminiClient();
      if (!ai) {
        return {
          summary: null,
          modelUsed: null,
          warning:
            'La síntesis IA con Google Search requiere GEMINI_API_KEY en Settings > Secrets. Abajo tienes resultados en vivo de fuentes académicas, libros y enciclopedias.',
          chunks: [],
        };
      }

      const scopeInstruction =
        category === 'academic'
          ? 'Prioriza artículos académicos, universidades, revistas científicas, repositorios (SciELO, Redalyc, OpenAlex) y estudios lingüísticos/históricos.'
          : category === 'books'
          ? 'Prioriza libros, manuales, diccionarios, textos clásicos y bibliotecas digitales (Open Library, Internet Archive, Google Books).'
          : 'Incluye fuentes confiables de internet, libros, enciclopedias y artículos académicos.';

      const contextText =
        liveSnippets.length > 0
          ? liveSnippets
              .slice(0, 6)
              .map(
                (s, i) =>
                  `[${i + 1}] (${s.sourceName}) ${s.title}${s.authors ? ` — ${s.authors}` : ''}${s.year ? ` (${s.year})` : ''}: ${s.snippet}`
              )
              .join('\n')
          : 'Sin resultados bibliográficos previos.';

      try {
        // Prefer real Google Search Grounding on gemini-4-hydrogen; if its grounding quota hits 429/503,
        // automatically run a real Gemini call on gemini-3.1-flash-lite grounded in the live web/book/academic results.
        const { result: response, modelUsed } = await generateWithModelFallback(
          modelName =>
            ai.models.generateContent({
              model: modelName,
              contents: `Investiga en internet en español sobre: "${rawQuery}".\n${scopeInstruction}\nResponde con una síntesis educativa clara y rigurosa (máximo 130 palabras) citando los aspectos clave encontrados sin usar asteriscos Markdown.`,
              config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              },
            }),
          modelName =>
            ai.models.generateContent({
              model: modelName,
              contents: `Tema investigado: "${rawQuery}".\n${scopeInstruction}\nFuentes reales encontradas en OpenAlex, Open Library y Wikipedia:\n${contextText}\n\nRedacta una síntesis educativa clara y útil en español (máximo 120 palabras) integrando estas fuentes sin usar asteriscos Markdown.`,
            }),
          10000
        );

        const groundedChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const chunks: WebSearchResult[] = [];
        groundedChunks.forEach((chunk, idx) => {
          const webInfo = (chunk as { web?: { uri?: string; title?: string } }).web;
          if (webInfo?.uri && isSafePublicHttpUrl(webInfo.uri)) {
            chunks.push({
              id: `gs-${idx}-${Math.abs(webInfo.uri.length * 17)}`,
              title: (webInfo.title || extractHostname(webInfo.uri) || 'Fuente web').trim(),
              url: webInfo.uri,
              domain: extractHostname(webInfo.uri),
              category: category === 'academic' ? 'academic' : category === 'books' ? 'books' : 'web',
              sourceName: 'Google Search',
              snippet: 'Fuente web verificada recuperada mediante Google Search Grounding.',
            });
          }
        });

        return {
          summary: (response.text ?? '').trim() || null,
          modelUsed,
          warning: null,
          chunks,
        };
      } catch (err: unknown) {
        const formatted = formatFriendlyGeminiError(err);
        return {
          summary: null,
          modelUsed: null,
          warning: formatted.message,
          chunks: [],
        };
      }
    };

    try {
      // Fetch live academic, books, and encyclopedic results first (fast ~600-1200ms) so fallback grounding has real context
      const [openAlexRes, booksRes, wikiRes] = await Promise.allSettled([
        fetchOpenAlex(),
        fetchOpenLibraryBooks(),
        fetchWikipediaEs(),
      ]);

      const academicList = openAlexRes.status === 'fulfilled' ? openAlexRes.value : [];
      const bookList = booksRes.status === 'fulfilled' ? booksRes.value : [];
      const wikiList = wikiRes.status === 'fulfilled' ? wikiRes.value : [];

      const livePreCombined: WebSearchResult[] = [];
      const preMax = Math.max(academicList.length, bookList.length, wikiList.length);
      for (let i = 0; i < preMax; i++) {
        if (academicList[i]) livePreCombined.push(academicList[i]);
        if (bookList[i]) livePreCombined.push(bookList[i]);
        if (wikiList[i]) livePreCombined.push(wikiList[i]);
      }

      const geminiData = await synthesizeWebResults(livePreCombined);

      const combinedRaw: WebSearchResult[] = [];
      const maxLen = Math.max(
        academicList.length,
        bookList.length,
        wikiList.length,
        geminiData.chunks.length
      );
      for (let i = 0; i < maxLen; i++) {
        if (academicList[i]) combinedRaw.push(academicList[i]);
        if (bookList[i]) combinedRaw.push(bookList[i]);
        if (wikiList[i]) combinedRaw.push(wikiList[i]);
        if (geminiData.chunks[i]) combinedRaw.push(geminiData.chunks[i]);
      }
      const combined = dedupeWebSearchResults(combinedRaw);

      return res.json({
        query: rawQuery,
        category,
        aiSummary: geminiData.summary,
        aiModel: geminiData.modelUsed,
        aiWarning: geminiData.warning,
        results: combined,
      });
    } catch {
      return res.status(500).json({
        error: 'WEB_SEARCH_FAILED',
        message: 'No se pudo completar la búsqueda en internet en este momento.',
      });
    }
  });

  // In-app web reader endpoint so users read pages and follow links without leaving the app
  app.post('/api/web/read', async (req, res) => {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const normalized = normalizeNavigableUrl(rawUrl);
    if (!normalized || !isSafePublicHttpUrl(normalized)) {
      return res.status(400).json({
        error: 'INVALID_URL',
        message: 'La dirección web ingresada no es válida o no es un sitio público seguro.',
      });
    }

    try {
      const parsedUrl = new URL(normalized);
      const host = parsedUrl.hostname.toLowerCase();

      // Structured JSON fast-path for Open Library books/works (avoids Cloudflare HTML challenge)
      if (
        (host === 'openlibrary.org' || host === 'www.openlibrary.org') &&
        /^\/(works|books)\/[A-Za-z0-9]+/.test(parsedUrl.pathname)
      ) {
        const cleanPath = parsedUrl.pathname.replace(/\/+$/, '');
        const jsonResp = await fetch(`https://openlibrary.org${cleanPath}.json`, {
          headers: { 'User-Agent': 'YachayRaicesApp/1.0' },
          signal: AbortSignal.timeout(7000),
        });
        if (jsonResp.ok) {
          const book = (await jsonResp.json()) as {
            title?: string;
            subtitle?: string;
            description?: string | { value?: string };
            subjects?: string[];
            subject_places?: string[];
            first_publish_date?: string;
            excerpts?: Array<{ excerpt?: string; comment?: string }>;
          };
          const descText =
            typeof book.description === 'string'
              ? book.description
              : book.description?.value || '';
          const blocks: Array<{ type: 'heading' | 'paragraph'; text: string }> = [];
          if (descText) {
            blocks.push({ type: 'heading', text: 'Sinopsis / Descripción del Libro' });
            blocks.push({ type: 'paragraph', text: descText });
          }
          if (Array.isArray(book.excerpts) && book.excerpts.length > 0) {
            blocks.push({ type: 'heading', text: 'Extractos disponibles' });
            for (const ex of book.excerpts.slice(0, 3)) {
              if (ex.excerpt) blocks.push({ type: 'paragraph', text: ex.excerpt });
            }
          }
          if (Array.isArray(book.subjects) && book.subjects.length > 0) {
            blocks.push({ type: 'heading', text: 'Temas y Categorías Bibliográficas' });
            blocks.push({ type: 'paragraph', text: book.subjects.slice(0, 14).join(' • ') });
          }
          if (blocks.length === 0) {
            blocks.push({
              type: 'paragraph',
              text: 'Ficha bibliográfica verificada en Open Library. Puedes consultar ediciones o abrir el enlace original.',
            });
          }
          return res.json({
            page: {
              url: normalized,
              domain: 'openlibrary.org',
              title: book.title || 'Libro en Open Library',
              description:
                book.subtitle ||
                (book.first_publish_date
                  ? `Primera publicación: ${book.first_publish_date}`
                  : 'Registro bibliográfico de Open Library'),
              blocks,
              links: [
                {
                  text: 'Buscar libros relacionados en Open Library',
                  url: `https://openlibrary.org/search?q=${encodeURIComponent(book.title || 'Ecuador')}`,
                },
              ],
            },
          });
        }
      }

      // Structured JSON fast-path for OpenAlex academic papers
      if (host === 'openalex.org' && /^\/W\d+/i.test(parsedUrl.pathname)) {
        const oaResp = await fetch(`https://api.openalex.org/works${parsedUrl.pathname}`, {
          headers: { 'User-Agent': 'YachayRaicesApp/1.0 (mailto:educacion@yachay.ec)' },
          signal: AbortSignal.timeout(7000),
        });
        if (oaResp.ok) {
          const work = (await oaResp.json()) as {
            title?: string;
            publication_year?: number;
            doi?: string;
            cited_by_count?: number;
            authorships?: Array<{ author?: { display_name?: string } }>;
            primary_location?: { landing_page_url?: string; source?: { display_name?: string } };
            abstract_inverted_index?: Record<string, number[]>;
          };
          const authors = (work.authorships || [])
            .map(a => a.author?.display_name)
            .filter(Boolean)
            .join(', ');
          const positioned: Array<[number, string]> = [];
          if (work.abstract_inverted_index) {
            for (const [w, idxs] of Object.entries(work.abstract_inverted_index)) {
              if (Array.isArray(idxs)) {
                for (const p of idxs) positioned.push([p, w]);
              }
            }
            positioned.sort((a, b) => a[0] - b[0]);
          }
          const abstractText = positioned.map(([, w]) => w).join(' ');
          const blocks: Array<{ type: 'heading' | 'paragraph'; text: string }> = [
            { type: 'heading', text: 'Metadatos de la Publicación Académica' },
            {
              type: 'paragraph',
              text: `Autores: ${authors || 'No especificados'} • Año: ${
                work.publication_year || 'N/D'
              } • Revista/Fuente: ${
                work.primary_location?.source?.display_name || 'OpenAlex'
              } • Citas: ${work.cited_by_count ?? 0}`,
            },
          ];
          if (abstractText) {
            blocks.push({ type: 'heading', text: 'Resumen (Abstract)' });
            blocks.push({ type: 'paragraph', text: abstractText });
          }
          const links = [];
          if (work.primary_location?.landing_page_url && isSafePublicHttpUrl(work.primary_location.landing_page_url)) {
            links.push({
              text: 'Leer artículo completo en la fuente editorial',
              url: work.primary_location.landing_page_url,
            });
          }
          if (work.doi && isSafePublicHttpUrl(work.doi)) {
            links.push({ text: `Registro DOI (${work.doi})`, url: work.doi });
          }
          return res.json({
            page: {
              url: normalized,
              domain: 'openalex.org',
              title: work.title || 'Artículo académico en OpenAlex',
              description: `Fuente académica verificada (${work.publication_year || 'OpenAlex'})`,
              blocks,
              links,
            },
          });
        }
      }

      const upstream = await fetch(normalized, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; YachayRaicesReader/1.0)',
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-EC,es;q=0.9,en;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(9000),
      });

      const finalUrl = upstream.url && isSafePublicHttpUrl(upstream.url) ? upstream.url : normalized;
      if (!upstream.ok) {
        return res.status(502).json({
          error: 'UPSTREAM_HTTP_ERROR',
          message: `El sitio (${extractHostname(finalUrl)}) respondió con código ${upstream.status}. Prueba "Marco Web" o abrir el enlace original.`,
        });
      }

      const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('application/pdf')) {
        return res.json({
          page: {
            url: finalUrl,
            domain: extractHostname(finalUrl),
            title: `Documento PDF (${extractHostname(finalUrl)})`,
            description: 'Archivo PDF detectado. Cambia a "Marco Web" arriba para visualizarlo dentro de la app.',
            blocks: [
              {
                type: 'paragraph',
                text: 'Este enlace apunta directamente a un documento PDF académico o libro digital. Selecciona "Marco Web" en la barra superior del lector para cargarlo embebido aquí mismo.',
              },
            ],
            links: [],
          },
        });
      }

      const rawText = await upstream.text();
      const boundedHtml = rawText.slice(0, 350000);
      const parsedPage = extractReadableHtmlContent(boundedHtml, finalUrl);

      // Detect Cloudflare / anti-bot interstitial pages
      if (/verify you are human|verificaci[oó]n de que eres humano|just a moment/i.test(parsedPage.title)) {
        return res.status(502).json({
          error: 'BOT_CHALLENGE_DETECTED',
          message: `${extractHostname(finalUrl)} solicitó verificación humana automática. Cambia a "Marco Web" o ábrelo en la pestaña original.`,
        });
      }

      return res.json({ page: parsedPage });
    } catch {
      return res.status(504).json({
        error: 'READER_FETCH_FAILED',
        message:
          'No se pudo extraer la lectura directa de este servidor (puede bloquear lectores automáticos). Prueba el botón "Marco Web" o regresa a los resultados.',
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: 'NOT_FOUND' });
      }
      return res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yachay & Raíces server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
