import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateFiles } from '../scripts/validate-content.mjs';
import { createContent, formatDayList, validateContent } from '../js/content.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../content/${name}`, import.meta.url), 'utf8'));
const real = () => ({ exercises: load('exercises.json'), routines: load('routines.json') });
const errorsOf = (mutate) => {
  const data = real();
  mutate(data);
  return validateContent(data).errors;
};

test('the content in the repo is valid (same check as scripts/validate-content.mjs)', () => {
  const { errors, missingDays } = validateFiles();
  assert.deepEqual(errors, []);
  assert.ok(!missingDays.includes(1), 'day 1 has content');
  assert.ok(!missingDays.includes(24), 'day 24 has content');
});

test('day 1 resolves from JSON in both modes and languages', () => {
  const c = createContent(real());
  const mod = c.routine(1, 'moderate', 'en');
  assert.equal(mod.name, 'Wake-up');
  assert.deepEqual(mod.exercises.map((e) => e.id), ['lunge', 'plank', 'march', 'squat', 'pushup']);
  assert.equal(mod.exercises[0].name, 'Reverse lunge');
  assert.equal(mod.exercises[0].amount, '3 × 16');
  assert.equal(mod.exercises[0].images.length, 2);
  assert.match(mod.exercises[0].images[0].alt, /^Step 1/);
  const rec = c.routine(1, 'recovery', 'de');
  assert.equal(rec.name, 'Sanfter Start');
  assert.equal(rec.exercises[0].name, 'Kindhaltung');
  assert.equal(c.routine(2, 'moderate', 'en'), null);
  assert.equal(c.day24('en').cards.length, 5);
  assert.equal(c.day24('de').cards[0].name, 'Den Schlitten beladen');
});

test('a broken exercise reference is an error', () => {
  const errors = errorsOf((d) => { d.routines.days[1].moderate.exercises[0].id = 'burpee'; });
  assert.deepEqual(errors, ['routines.json day 1 moderate exercise 1: unknown exercise id "burpee"']);
});

test('a missing or empty translation is an error', () => {
  assert.deepEqual(errorsOf((d) => { delete d.exercises.exercises[0].name.de; }),
    ['exercises.json exercise "cat-cow" name.de: missing or empty translation']);
  assert.deepEqual(errorsOf((d) => { d.routines.days[1].recovery.exercises[2].amount.en = ' '; }),
    ['routines.json day 1 recovery exercise 3 amount.en: missing or empty translation']);
  assert.deepEqual(errorsOf((d) => { d.routines.days[24].day24.cards[1].harder = { de: 'x' }; }),
    ['routines.json day 24 day24 card 2 harder.en: missing or empty translation']);
});

test('a day with content needs both modes', () => {
  assert.deepEqual(errorsOf((d) => { delete d.routines.days[1].recovery; }),
    ['routines.json day 1 recovery: missing (every day with content needs both modes)']);
});

test('images: 2–4 per exercise, in img/exercises/, and the files must exist', () => {
  assert.deepEqual(errorsOf((d) => { d.exercises.exercises[0].images.pop(); }), ['exercises.json exercise "cat-cow": needs 2–4 images']);
  assert.deepEqual(errorsOf((d) => { d.exercises.exercises[0].images[0].src = 'https://example.com/a.png'; }),
    ['exercises.json exercise "cat-cow" image 1: src must be img/exercises/<name>.svg']);
  const data = real();
  data.exercises.exercises[0].images[0].src = 'img/exercises/nope.svg';
  assert.deepEqual(validateContent(data, { imageExists: (src) => src !== 'img/exercises/nope.svg' }).errors,
    ['exercises.json exercise "cat-cow" image 1: file not found: img/exercises/nope.svg']);
});

test('typos are caught: unknown fields, modes, days and duplicate ids', () => {
  assert.deepEqual(errorsOf((d) => { d.routines.days[1].moderat = d.routines.days[1].moderate; }), ['routines.json day 1.moderat: unknown field']);
  assert.deepEqual(errorsOf((d) => { d.routines.days['25'] = {}; }), ['routines.json day "25": days must be "1"–"24"']);
  assert.deepEqual(errorsOf((d) => { d.exercises.exercises.push({ ...d.exercises.exercises[0] }); }), ['exercises.json exercise "cat-cow": duplicate id']);
  assert.deepEqual(errorsOf((d) => { d.exercises.exercises[0].descripton = d.exercises.exercises[0].description; }),
    ['exercises.json exercise "cat-cow".descripton: unknown field']);
});

test('missing days are reported, not errors', () => {
  const data = real();
  delete data.routines.days[24];
  const { errors, missingDays } = validateContent(data);
  assert.deepEqual(errors, []);
  assert.ok(missingDays.includes(24));
  assert.equal(formatDayList([2, 3, 4, 7, 9, 10, 24]), '2–4, 7, 9–10, 24');
});

test('createContent fails fast on invalid content', () => {
  const data = real();
  data.routines.days[1].moderate.exercises[0].id = 'burpee';
  assert.throws(() => createContent(data), /Invalid content:\nroutines.json day 1 moderate exercise 1: unknown exercise id "burpee"/);
});

test('the script passes on the repo and exits non-zero with a clear message on broken content', () => {
  const script = fileURLToPath(new URL('../scripts/validate-content.mjs', import.meta.url));
  const ok = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  assert.match(ok, /✔ Content is valid\.\n {2}Days without content yet: 2–23/);

  const dir = mkdtempSync(join(tmpdir(), 'fn-content-'));
  try {
    const data = real();
    data.routines.days[1].moderate.exercises[0].id = 'burpee';
    delete data.exercises.exercises[0].description.en;
    mkdirSync(join(dir, 'content'));
    writeFileSync(join(dir, 'content', 'exercises.json'), JSON.stringify(data.exercises));
    writeFileSync(join(dir, 'content', 'routines.json'), JSON.stringify(data.routines));
    const run = spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /✖ Content is invalid \(\d+ problems\):/);
    assert.match(run.stderr, /routines.json day 1 moderate exercise 1: unknown exercise id "burpee"/);
    assert.match(run.stderr, /exercises.json exercise "cat-cow" description.en: missing or empty translation/);
    assert.match(run.stderr, /file not found: img\/exercises\/cat-cow-1.svg/); // images aren't in the temp copy
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
