// Progress and language, saved per device in localStorage (keys prefixed fn-).
//   fn-done  : JSON array of day numbers in loading order (= order on the sleigh)
//   fn-modes : JSON object { "<day>": "moderate" | "recovery" } for days 1–23
//   fn-lang  : "de" | "en"
// If localStorage is unavailable (private mode, blocked, quota), everything still works
// for this visit from memory, and `available` is false so the UI can show the note.

export const KEYS = Object.freeze({ done: 'fn-done', modes: 'fn-modes', lang: 'fn-lang' });
export const MODES = Object.freeze(['moderate', 'recovery']);
export const LANGS = Object.freeze(['de', 'en']);
const LAST_DAY = 24;

const isDay = (d) => Number.isInteger(d) && d >= 1 && d <= LAST_DAY;

function memoryBackend() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

function probe(backend) {
  try {
    if (!backend) return false;
    backend.setItem('fn-probe', '1');
    backend.removeItem('fn-probe');
    return true;
  } catch {
    return false;
  }
}

function defaultBackend() {
  try { return globalThis.localStorage; } catch { return undefined; } // access itself can throw (SecurityError)
}

function readJson(backend, key, fallback) {
  try {
    const raw = backend.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Stored data comes from an older version or a hand-edited browser: keep what is valid, drop the rest.
function cleanDone(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isDay))];
}
function cleanModes(value) {
  const out = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for (const [k, m] of Object.entries(value)) {
    const d = Number(k);
    if (isDay(d) && d < LAST_DAY && MODES.includes(m)) out[d] = m;
  }
  return out;
}

export function createStorage(backend = defaultBackend()) {
  const available = probe(backend);
  const memory = memoryBackend();
  const source = available ? backend : memory;

  let done = cleanDone(readJson(source, KEYS.done, []));
  let modes = cleanModes(readJson(source, KEYS.modes, {}));
  let lang = (() => { try { const v = source.getItem(KEYS.lang); return LANGS.includes(v) ? v : null; } catch { return null; } })();

  // Write-through; if a write fails later (e.g. quota), the in-memory state stays correct.
  let writable = available;
  function write(key, value) {
    if (!writable) return;
    try { backend.setItem(key, value); } catch { writable = false; }
  }

  return {
    /** false when progress can't be saved in this browser (show the storage note). */
    get available() { return writable; },

    /** Finished days in loading order. */
    get done() { return [...done]; },

    /** Mode per finished day 1–23, e.g. { 3: 'recovery' }. */
    get modes() { return { ...modes }; },

    isDone(day) { return done.includes(day); },

    /**
     * Mark a day as done. Counts once per day: re-doing a day keeps its place in the loading order
     * and only updates its mode. Days 1–23 need a mode; day 24 (the sleigh run) has none.
     * Returns true if the day was newly loaded.
     */
    markDone(day, mode) {
      if (!isDay(day)) throw new RangeError(`Day must be an integer from 1 to ${LAST_DAY}, got ${day}`);
      if (day < LAST_DAY && !MODES.includes(mode)) throw new TypeError(`Mode must be one of ${MODES.join(', ')}, got ${mode}`);
      if (day === LAST_DAY && mode !== undefined) throw new TypeError(`Day ${LAST_DAY} has no mode, got ${mode}`);
      const isNew = !done.includes(day);
      if (isNew) done = [...done, day];
      if (day < LAST_DAY) modes = { ...modes, [day]: mode };
      write(KEYS.done, JSON.stringify(done));
      write(KEYS.modes, JSON.stringify(modes));
      return isNew;
    },

    /** Saved language, or null if the user never picked one. */
    get lang() { return lang; },

    setLang(value) {
      if (!LANGS.includes(value)) throw new TypeError(`Language must be one of ${LANGS.join(', ')}, got ${value}`);
      lang = value;
      write(KEYS.lang, value);
    },
  };
}
