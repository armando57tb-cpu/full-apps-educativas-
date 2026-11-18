import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeNavigableUrl,
  isSafePublicHttpUrl,
  extractReadableHtmlContent,
  dedupeWebSearchResults,
} from './webBrowserLogic';

test('normalizeNavigableUrl handles domains cleanly and blocks unsafe schemes', () => {
  assert.equal(normalizeNavigableUrl('es.wikipedia.org/wiki/Kichwa'), 'https://es.wikipedia.org/wiki/Kichwa');
  assert.equal(normalizeNavigableUrl('https://openlibrary.org/works/OL123W'), 'https://openlibrary.org/works/OL123W');
  assert.equal(normalizeNavigableUrl('javascript:alert(1)'), null);
  assert.equal(normalizeNavigableUrl('cultura kichwa ecuador'), null);
});

test('isSafePublicHttpUrl blocks private and loopback targets', () => {
  assert.equal(isSafePublicHttpUrl('https://es.wikipedia.org/wiki/Quito'), true);
  assert.equal(isSafePublicHttpUrl('http://localhost:3000/api'), false);
  assert.equal(isSafePublicHttpUrl('http://127.0.0.1:8080'), false);
  assert.equal(isSafePublicHttpUrl('http://192.168.1.10'), false);
  assert.equal(isSafePublicHttpUrl('http://169.254.169.254/latest/meta-data'), false);
});

test('extractReadableHtmlContent parses headings, paragraphs, and resolves relative links cleanly', () => {
  const sampleHtml = `
    <html>
      <head>
        <title>Idioma Kichwa &amp; Cultura</title>
        <meta name="description" content="Lengua ancestral andina del Ecuador" />
        <script>console.log("ignore me")</script>
      </head>
      <body>
        <h1>Idioma Kichwa Unificado</h1>
        <p>El kichwa ecuatoriano es una lengua viva hablada en la Sierra y Amazonía del Ecuador.</p>
        <a href="/wiki/Ecuador">Ecuador</a>
        <a href="javascript:void(0)">Ignorar JS</a>
      </body>
    </html>
  `;

  const parsed = extractReadableHtmlContent(sampleHtml, 'https://es.wikipedia.org/wiki/Kichwa');
  assert.equal(parsed.title, 'Idioma Kichwa & Cultura');
  assert.equal(parsed.description, 'Lengua ancestral andina del Ecuador');
  assert.equal(parsed.blocks.length, 2);
  assert.equal(parsed.blocks[0].type, 'heading');
  assert.equal(parsed.links.length, 1);
  assert.equal(parsed.links[0].url, 'https://es.wikipedia.org/wiki/Ecuador');
});

test('dedupeWebSearchResults removes duplicate URLs cleanly', () => {
  const list = dedupeWebSearchResults([
    {
      id: '1',
      title: 'Doc 1',
      url: 'https://es.wikipedia.org/wiki/Quito/',
      domain: 'es.wikipedia.org',
      category: 'web',
      sourceName: 'Wikipedia',
      snippet: 'A',
    },
    {
      id: '2',
      title: 'Doc 1 Dup',
      url: 'https://es.wikipedia.org/wiki/Quito',
      domain: 'es.wikipedia.org',
      category: 'web',
      sourceName: 'Google Search',
      snippet: 'B',
    },
  ]);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, '1');
});
