// Strings live in content/strings.<lang>.json. Values are plain text with {placeholders};
// nested objects group related strings (look them up as "state.locked").

import { openDate } from './dates.js';
import { LANGS } from './storage.js';

export { LANGS };
const LOCALES = { de: 'de-DE', en: 'en-GB' };

/** Saved language if any, else the browser language (German if it starts with "de"), else English. */
export function pickLang(saved, browserLanguage) {
  if (LANGS.includes(saved)) return saved;
  return String(browserLanguage || '').toLowerCase().startsWith('de') ? 'de' : 'en';
}

/** Look up `key` (dotted path) and fill its {placeholders} from `params`. Throws on anything missing. */
export function translate(strings, key, params = {}) {
  const value = key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), strings);
  if (typeof value !== 'string') throw new Error(`Missing string "${key}"`);
  return value.replace(/\{(\w+)\}/g, (_, name) => {
    if (!(name in params)) throw new Error(`String "${key}" needs the parameter {${name}}`);
    return String(params[name]);
  });
}

/** "7 December" / "7. Dezember". */
export function formatDay(day, lang) {
  return openDate(day).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long' });
}

/** Fetch both string files (relative to the page). */
export async function loadStrings(base = 'content/') {
  const entries = await Promise.all(LANGS.map(async (lang) => {
    const url = `${base}strings.${lang}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
    return [lang, await res.json()];
  }));
  return Object.fromEntries(entries);
}

/**
 * The app's translator. `storage` is from js/storage.js; switching language saves it and
 * updates <html lang>.
 */
export function createI18n({ strings, storage, browserLanguage = globalThis.navigator?.language }) {
  for (const lang of LANGS) if (!strings[lang]) throw new Error(`Strings for "${lang}" are missing`);
  let lang = pickLang(storage.lang, browserLanguage);
  const applyLang = () => { if (globalThis.document) document.documentElement.lang = lang; };
  applyLang();
  return {
    get lang() { return lang; },
    setLang(value) {
      storage.setLang(value); // validates
      lang = value;
      applyLang();
    },
    t: (key, params) => translate(strings[lang], key, params),
    formatDay: (day) => formatDay(day, lang),
  };
}
