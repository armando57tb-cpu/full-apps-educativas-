import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePracticeLanguage,
  getStarterDialogueForLanguage,
  parseTutorJsonResponse,
  getGrammarBadgeMeta,
  trimPracticeHistory,
  PracticeChatMessage,
} from './aiPracticeLogic';

test('normalizePracticeLanguage maps shuar to shuar and other codes to kichwa', () => {
  assert.equal(normalizePracticeLanguage('shuar'), 'shuar');
  assert.equal(normalizePracticeLanguage('kichwa'), 'kichwa');
  assert.equal(normalizePracticeLanguage('tsafiki'), 'kichwa');
  assert.equal(normalizePracticeLanguage('en'), 'kichwa');
});

test('getStarterDialogueForLanguage provides native greeting and prompts for kichwa and shuar', () => {
  const kichwa = getStarterDialogueForLanguage('kichwa');
  assert.ok(kichwa.greetingNative.includes('Alli puncha'));
  assert.ok(kichwa.quickPrompts.length >= 3);

  const shuar = getStarterDialogueForLanguage('shuar');
  assert.ok(shuar.greetingNative.includes('Chichamjai'));
  assert.ok(shuar.quickPrompts.length >= 3);
});

test('parseTutorJsonResponse parses structured Gemini JSON and handles markdown fences safely', () => {
  const raw = `\`\`\`json
  {
    "replyNative": "Allillami kani, yupaychani!",
    "replyEs": "Estoy muy bien, ¡gracias!",
    "grammarStatus": "correcta",
    "grammarFeedback": "Uso correcto del sufijo validador -mi en allillami.",
    "correctedPhrase": "",
    "pronunciationGuide": "[a-lli-lla-mi ka-ni]",
    "nextPromptEs": "Pregúntale de dónde es."
  }
  \`\`\``;
  const parsed = parseTutorJsonResponse(raw);
  assert.ok(parsed);
  assert.equal(parsed.grammarStatus, 'correcta');
  assert.equal(parsed.replyNative, 'Allillami kani, yupaychani!');
  assert.equal(parseTutorJsonResponse('not-json'), null);
});

test('getGrammarBadgeMeta and trimPracticeHistory behave predictably', () => {
  assert.equal(getGrammarBadgeMeta('correcta').label, 'Gramática correcta');
  assert.equal(getGrammarBadgeMeta('con_sugerencias').label, 'Corrección sugerida');
  assert.equal(getGrammarBadgeMeta('consulta_es').label, 'Equivalencia / Traducción');

  const msgs: PracticeChatMessage[] = Array.from({ length: 12 }, (_, idx) => ({
    id: `m-${idx}`,
    role: idx % 2 === 0 ? 'assistant' : 'user',
    text: `Msg ${idx}`,
  }));
  const trimmed = trimPracticeHistory(msgs, 6);
  assert.equal(trimmed.length, 6);
  assert.equal(trimmed[0].text, 'Msg 6');
});
