// Workout content: content/exercises.json + content/routines.json.
//
// exercises.json  { "exercises": [ { id, name {de,en}, description {de,en}, images: [ { src, alt {de,en} } ] (2–4) } ] }
// routines.json   { "days": {
//                     "1"…"23": { "moderate": Routine, "recovery": Routine },   Routine = { name {de,en}, exercises: [ { id, amount {de,en} } ] }
//                     "24":     { "day24": { name {de,en}, cards: [ { name, story, move, easier, harder } ] } }   (each {de,en})
//                 } }
// Days without content are allowed until launch (reported as missing); anything else that's wrong is an error.

import { LANGS, MODES } from './storage.js';

const LAST_DAY = 24;
const DAY24_CARD_FIELDS = ['name', 'story', 'move', 'easier', 'harder'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Checks content. `imageExists(src)` (optional) checks image files, e.g. on disk.
 * Returns { errors: string[], missingDays: number[] }. Never throws on bad content.
 */
export function validateContent({ exercises, routines }, { imageExists } = {}) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);

  function text(where, value) {
    if (!isObject(value)) { err(where, 'must be an object with "de" and "en"'); return; }
    for (const lang of LANGS) {
      if (typeof value[lang] !== 'string' || !value[lang].trim()) err(`${where}.${lang}`, 'missing or empty translation');
    }
    for (const key of Object.keys(value)) if (!LANGS.includes(key)) err(`${where}.${key}`, 'unknown language');
  }
  function onlyKeys(where, obj, allowed) {
    for (const key of Object.keys(obj)) if (!allowed.includes(key)) err(`${where}.${key}`, 'unknown field');
  }

  // Exercises
  const ids = new Set();
  if (!isObject(exercises) || !Array.isArray(exercises.exercises)) {
    err('exercises.json', 'must be { "exercises": [ … ] }');
  } else {
    exercises.exercises.forEach((ex, i) => {
      const where = `exercises.json exercise ${typeof ex?.id === 'string' ? `"${ex.id}"` : `#${i + 1}`}`;
      if (!isObject(ex)) { err(where, 'must be an object'); return; }
      onlyKeys(where, ex, ['id', 'name', 'description', 'images']);
      if (typeof ex.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ex.id)) err(where, 'id must be lowercase letters, digits and dashes');
      else if (ids.has(ex.id)) err(where, 'duplicate id');
      else ids.add(ex.id);
      text(`${where} name`, ex.name);
      text(`${where} description`, ex.description);
      if (!Array.isArray(ex.images) || ex.images.length < 2 || ex.images.length > 4) {
        err(where, 'needs 2–4 images');
        return;
      }
      ex.images.forEach((img, k) => {
        const w = `${where} image ${k + 1}`;
        if (!isObject(img)) { err(w, 'must be an object'); return; }
        onlyKeys(w, img, ['src', 'alt']);
        if (typeof img.src !== 'string' || !/^img\/exercises\/[a-z0-9-]+\.svg$/.test(img.src)) err(w, 'src must be img/exercises/<name>.svg');
        else if (imageExists && !imageExists(img.src)) err(w, `file not found: ${img.src}`);
        text(`${w} alt`, img.alt);
      });
    });
  }

  // Routines
  const missingDays = [];
  if (!isObject(routines) || !isObject(routines.days)) {
    err('routines.json', 'must be { "days": { … } }');
    return { errors, missingDays };
  }
  for (const key of Object.keys(routines.days)) {
    const d = Number(key);
    if (!Number.isInteger(d) || d < 1 || d > LAST_DAY || String(d) !== key) err(`routines.json day "${key}"`, 'days must be "1"–"24"');
  }
  for (let d = 1; d <= LAST_DAY; d += 1) {
    const day = routines.days[d];
    const where = `routines.json day ${d}`;
    if (day === undefined) { missingDays.push(d); continue; }
    if (!isObject(day)) { err(where, 'must be an object'); continue; }

    if (d === LAST_DAY) {
      onlyKeys(where, day, ['day24']);
      const r = day.day24;
      if (!isObject(r)) { err(where, 'needs "day24"'); continue; }
      onlyKeys(`${where} day24`, r, ['name', 'cards']);
      text(`${where} day24 name`, r.name);
      if (!Array.isArray(r.cards) || r.cards.length === 0) { err(`${where} day24`, 'needs at least one card'); continue; }
      r.cards.forEach((card, k) => {
        const w = `${where} day24 card ${k + 1}`;
        if (!isObject(card)) { err(w, 'must be an object'); return; }
        onlyKeys(w, card, DAY24_CARD_FIELDS);
        for (const f of DAY24_CARD_FIELDS) text(`${w} ${f}`, card[f]);
      });
      continue;
    }

    onlyKeys(where, day, MODES);
    for (const mode of MODES) {
      const r = day[mode];
      const w = `${where} ${mode}`;
      if (!isObject(r)) { err(w, 'missing (every day with content needs both modes)'); continue; }
      onlyKeys(w, r, ['name', 'exercises']);
      text(`${w} name`, r.name);
      if (!Array.isArray(r.exercises) || r.exercises.length === 0) { err(w, 'needs at least one exercise'); continue; }
      r.exercises.forEach((step, k) => {
        const ws = `${w} exercise ${k + 1}`;
        if (!isObject(step)) { err(ws, 'must be an object'); return; }
        onlyKeys(ws, step, ['id', 'amount']);
        if (!ids.has(step.id)) err(ws, `unknown exercise id "${step.id}"`);
        text(`${ws} amount`, step.amount);
      });
    }
  }
  return { errors, missingDays };
}

/** "2–8, 10, 12–23" */
export function formatDayList(days) {
  const parts = [];
  for (let i = 0; i < days.length; i += 1) {
    let j = i;
    while (j + 1 < days.length && days[j + 1] === days[j] + 1) j += 1;
    parts.push(i === j ? `${days[i]}` : `${days[i]}–${days[j]}`);
    i = j;
  }
  return parts.join(', ');
}

/** Throws with every problem listed if the content is invalid; otherwise returns a lookup API. */
export function createContent(data) {
  const { errors } = validateContent(data);
  if (errors.length) throw new Error(`Invalid content:\n${errors.join('\n')}`);
  const byId = new Map(data.exercises.exercises.map((ex) => [ex.id, ex]));
  const days = data.routines.days;
  return {
    hasDay: (day) => days[day] !== undefined,
    /** Day 1–23: { name, exercises: [ { id, name, description, images, amount } ] } in one language, or null if not authored yet. */
    routine(day, mode, lang) {
      const r = days[day]?.[mode];
      if (!r) return null;
      return {
        name: r.name[lang],
        exercises: r.exercises.map(({ id, amount }) => {
          const ex = byId.get(id);
          return {
            id,
            name: ex.name[lang],
            description: ex.description[lang],
            images: ex.images.map((img) => ({ src: img.src, alt: img.alt[lang] })),
            amount: amount[lang],
          };
        }),
      };
    },
    /** Day 24: { name, cards: [ { name, story, move, easier, harder } ] } in one language, or null. */
    day24(lang) {
      const r = days[LAST_DAY]?.day24;
      if (!r) return null;
      return {
        name: r.name[lang],
        cards: r.cards.map((c) => Object.fromEntries(DAY24_CARD_FIELDS.map((f) => [f, c[f][lang]]))),
      };
    },
  };
}

let cache = null;
/** Loads, validates and caches both content files (relative to the page). */
export function loadContent(base = 'content/') {
  cache ||= (async () => {
    const get = async (name) => {
      const res = await fetch(`${base}${name}`);
      if (!res.ok) throw new Error(`Could not load ${base}${name} (${res.status})`);
      return res.json();
    };
    const [exercises, routines] = await Promise.all([get('exercises.json'), get('routines.json')]);
    return createContent({ exercises, routines });
  })();
  cache.catch(() => { cache = null; }); // a failed load can be retried
  return cache;
}
