export type WebSourceCategory = 'all' | 'academic' | 'books' | 'web';

export interface WebSearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  category: 'academic' | 'books' | 'web';
  sourceName: string;
  snippet: string;
  authors?: string;
  year?: string;
  openAccess?: boolean;
}

export interface ReadablePageBlock {
  type: 'heading' | 'paragraph';
  text: string;
}

export interface ReadablePageLink {
  text: string;
  url: string;
}

export interface ReadableWebPage {
  url: string;
  domain: string;
  title: string;
  description: string;
  blocks: ReadablePageBlock[];
  links: ReadablePageLink[];
}

/**
 * Validates and normalizes a user-typed URL or bare domain for in-app navigation.
 */
export function normalizeNavigableUrl(rawInput: string): string | null {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return null;

  // Reject dangerous schemes explicitly
  if (/^(javascript|data|vbscript|file|blob):/i.test(trimmed)) {
    return null;
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    // Must look like a hostname (contains a dot and no spaces)
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(candidate)) {
      return null;
    }
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * SSRF safety check: permits only public internet hosts (blocks loopback, private, and link-local IPs).
 */
export function isSafePublicHttpUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (!host) return false;
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }
    if (host === '::1' || host === '0:0:0:0:0:0:0:1') return false;

    const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const a = Number(ipv4Match[1]);
      const b = Number(ipv4Match[2]);
      if (a === 127 || a === 10 || a === 0) return false;
      if (a === 169 && b === 254) return false;
      if (a === 192 && b === 168) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractHostname(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code > 0 ? String.fromCharCode(code) : '';
    });
}

function stripTags(htmlFragment: string): string {
  return decodeHtmlEntities(htmlFragment.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts fetched HTML into structured readable headings, paragraphs, and resolved clickable links
 * so the user can keep browsing inside the app even on sites that disallow iframes.
 */
export function extractReadableHtmlContent(html: string, baseUrl: string): ReadableWebPage {
  const safeHtml = html || '';
  const domain = extractHostname(baseUrl);

  const titleMatch = safeHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : domain || 'Página Web';

  const descMatch =
    safeHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i) ||
    safeHtml.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["'][^>]*>/i);
  const description = descMatch ? stripTags(descMatch[1]) : '';

  // Remove non-content tags before extracting readable blocks and links
  const cleanedBody = safeHtml
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const blocks: ReadablePageBlock[] = [];
  const seenText = new Set<string>();
  const blockRegex = /<(h1|h2|h3|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = blockRegex.exec(cleanedBody)) !== null && blocks.length < 48) {
    const tag = blockMatch[1].toLowerCase();
    const text = stripTags(blockMatch[2]);
    if (!text || text.length < (tag === 'p' || tag === 'li' ? 28 : 4)) continue;
    if (seenText.has(text)) continue;
    seenText.add(text);
    blocks.push({
      type: tag.startsWith('h') ? 'heading' : 'paragraph',
      text,
    });
  }

  const links: ReadablePageLink[] = [];
  const seenUrls = new Set<string>();
  const linkRegex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch: RegExpExecArray | null;

  while ((linkMatch = linkRegex.exec(cleanedBody)) !== null && links.length < 24) {
    const rawHref = decodeHtmlEntities(linkMatch[1].trim());
    const label = stripTags(linkMatch[2]);
    if (!rawHref || !label || label.length < 3) continue;
    try {
      const resolved = new URL(rawHref, baseUrl).toString();
      if (!isSafePublicHttpUrl(resolved)) continue;
      if (resolved === baseUrl || seenUrls.has(resolved)) continue;
      seenUrls.add(resolved);
      links.push({
        text: label.slice(0, 110),
        url: resolved,
      });
    } catch {
      // ignore invalid link URLs
    }
  }

  return {
    url: baseUrl,
    domain,
    title: title || domain,
    description,
    blocks,
    links,
  };
}

/**
 * Deduplicates web/academic/book search results by normalized URL.
 */
export function dedupeWebSearchResults(results: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  const out: WebSearchResult[] = [];
  for (const item of results) {
    const key = item.url.replace(/\/+$/, '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
