import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, KEYS } from '../js/storage.js';

function fakeLocalStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
  };
}

test('done days are stored in loading order with their mode', () => {
  const ls = fakeLocalStorage();
  const s = createStorage(ls);
  assert.equal(s.available, true);
  assert.equal(s.markDone(5, 'moderate'), true);
  assert.equal(s.markDone(2, 'recovery'), true); // a missed day loaded late goes on top
  assert.deepEqual(s.done, [5, 2]);
  assert.deepEqual(s.modes, { 5: 'moderate', 2: 'recovery' });
  assert.equal(ls.data.get(KEYS.done), '[5,2]');
  assert.deepEqual(JSON.parse(ls.data.get(KEYS.modes)), { 2: 'recovery', 5: 'moderate' });
  assert.ok(s.isDone(2));
  assert.ok(!s.isDone(3));
});

test('re-doing a loaded day keeps its position and counts once', () => {
  const s = createStorage(fakeLocalStorage());
  s.markDone(1, 'moderate');
  s.markDone(2, 'moderate');
  s.markDone(3, 'recovery');
  assert.equal(s.markDone(1, 'recovery'), false);
  assert.deepEqual(s.done, [1, 2, 3]);
  assert.equal(s.modes[1], 'recovery'); // the present takes the colour of the latest mode
});

test('progress survives a reload', () => {
  const ls = fakeLocalStorage();
  const first = createStorage(ls);
  first.markDone(4, 'recovery');
  first.markDone(24);
  first.setLang('de');
  const second = createStorage(ls);
  assert.deepEqual(second.done, [4, 24]);
  assert.deepEqual(second.modes, { 4: 'recovery' });
  assert.equal(second.lang, 'de');
});

test('day 24 has no mode; days 1–23 need one', () => {
  const s = createStorage(fakeLocalStorage());
  s.markDone(24);
  assert.deepEqual(s.modes, {});
  assert.throws(() => s.markDone(24, 'moderate'), TypeError);
  assert.throws(() => s.markDone(3), TypeError);
  assert.throws(() => s.markDone(3, 'hard'), TypeError);
  assert.throws(() => s.markDone(0, 'moderate'), RangeError);
  assert.throws(() => s.markDone(25, 'moderate'), RangeError);
});

test('language is null until picked, then stored; invalid values throw', () => {
  const ls = fakeLocalStorage();
  const s = createStorage(ls);
  assert.equal(s.lang, null);
  s.setLang('en');
  assert.equal(ls.data.get(KEYS.lang), 'en');
  assert.throws(() => s.setLang('fr'), TypeError);
  assert.equal(s.lang, 'en');
});

test('works from memory when localStorage is unavailable', () => {
  const blocked = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('SecurityError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  for (const backend of [blocked, null]) {
    const s = createStorage(backend);
    assert.equal(s.available, false);
    s.markDone(1, 'moderate');
    s.markDone(1, 'recovery');
    s.setLang('de');
    assert.deepEqual(s.done, [1]);
    assert.equal(s.modes[1], 'recovery');
    assert.equal(s.lang, 'de');
  }
});

test('a failing write (e.g. quota) flips available and keeps the state in memory', () => {
  const ls = fakeLocalStorage();
  const s = createStorage(ls);
  ls.setItem = () => { throw new Error('QuotaExceededError'); };
  s.markDone(6, 'moderate');
  assert.equal(s.available, false);
  assert.deepEqual(s.done, [6]);
});

test('corrupt or foreign stored data is cleaned, not fatal', () => {
  const s = createStorage(fakeLocalStorage({
    [KEYS.done]: '[3, 3, "4", 0, 25, 1.5, 7]',
    [KEYS.modes]: '{"3":"moderate","7":"hard","24":"moderate","x":"recovery"}',
    [KEYS.lang]: 'fr',
  }));
  assert.deepEqual(s.done, [3, 7]);
  assert.deepEqual(s.modes, { 3: 'moderate' });
  assert.equal(s.lang, null);

  const broken = createStorage(fakeLocalStorage({ [KEYS.done]: '{not json', [KEYS.modes]: '[1,2]' }));
  assert.deepEqual(broken.done, []);
  assert.deepEqual(broken.modes, {});
});

test('returned lists are copies', () => {
  const s = createStorage(fakeLocalStorage());
  s.markDone(1, 'moderate');
  s.done.push(9);
  s.modes[9] = 'recovery';
  assert.deepEqual(s.done, [1]);
  assert.deepEqual(s.modes, { 1: 'moderate' });
});
