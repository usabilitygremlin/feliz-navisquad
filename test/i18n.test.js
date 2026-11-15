import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pickLang, translate, formatDay, createI18n } from '../js/i18n.js';
import { createStorage } from '../js/storage.js';

const load = (lang) => JSON.parse(readFileSync(new URL(`../content/strings.${lang}.json`, import.meta.url), 'utf8'));
const strings = { de: load('de'), en: load('en') };

// Flatten to { "state.locked": "…" }.
function flat(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);
}
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('every key exists in both languages', () => {
  const de = new Map(flat(strings.de));
  const en = new Map(flat(strings.en));
  assert.deepEqual([...de.keys()].filter((k) => !en.has(k)), [], 'keys only in German');
  assert.deepEqual([...en.keys()].filter((k) => !de.has(k)), [], 'keys only in English');
});

test('every string is non-empty text with the same placeholders in both languages', () => {
  const en = new Map(flat(strings.en));
  for (const [key, de] of flat(strings.de)) {
    assert.equal(typeof de, 'string', `de ${key}`);
    assert.equal(typeof en.get(key), 'string', `en ${key}`);
    assert.ok(de.trim() && en.get(key).trim(), `empty string: ${key}`);
    assert.deepEqual(placeholders(de), placeholders(en.get(key)), `placeholders differ: ${key}`);
  }
});

test('copy never ties exercise to food, calories or earning', () => {
  const words = /\b(calorie|kalorie|kcal|burn|verbrenn|earn|verdien|cookie|keks|plätzchen|treat|food|essen)/i;
  for (const lang of ['de', 'en']) {
    for (const [key, value] of flat(strings[lang])) assert.doesNotMatch(value, words, `${lang} ${key}`);
  }
});

test('translate fills placeholders and resolves nested keys', () => {
  assert.equal(translate(strings.en, 'statusOpen', { day: 7, count: 4 }), 'Present 7 is waiting · 4 loaded');
  assert.equal(translate(strings.de, 'statusAfter', { count: 20 }), 'Frohe Weihnachten · 20 von 23 Geschenken geladen');
  assert.equal(translate(strings.de, 'state.missed'), 'liegt im Schnee, noch nicht geladen');
});

test('translate fails loudly on a missing key or parameter', () => {
  assert.throws(() => translate(strings.en, 'nope'), /Missing string "nope"/);
  assert.throws(() => translate(strings.en, 'state'), /Missing string "state"/);
  assert.throws(() => translate(strings.en, 'statusOpen', { day: 7 }), /needs the parameter \{count\}/);
});

test('language: saved choice wins, else the browser language, else English', () => {
  assert.equal(pickLang('en', 'de-DE'), 'en');
  assert.equal(pickLang(null, 'de-AT'), 'de');
  assert.equal(pickLang(null, 'DE'), 'de');
  assert.equal(pickLang(null, 'en-US'), 'en');
  assert.equal(pickLang(null, 'fr-FR'), 'en');
  assert.equal(pickLang(null, undefined), 'en');
});

test('switching language is stored', () => {
  const storage = createStorage(null);
  const i18n = createI18n({ strings, storage, browserLanguage: 'de-DE' });
  assert.equal(i18n.lang, 'de');
  assert.equal(i18n.t('menu'), 'Menü');
  i18n.setLang('en');
  assert.equal(i18n.t('menu'), 'Menu');
  assert.equal(storage.lang, 'en');
  assert.throws(() => i18n.setLang('fr'), TypeError);
  assert.equal(i18n.lang, 'en');
});

test('dates are formatted per language', () => {
  assert.equal(formatDay(7, 'en'), '7 December');
  assert.equal(formatDay(7, 'de'), '7. Dezember');
});
