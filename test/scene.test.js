import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slotPos, missedPos, sceneLayout, statusLine, flick, throwDuration, SLOTS, TODAY_POS } from '../js/scene.js';

const at = (month, day, h = 12) => new Date(2026, month - 1, day, h, 0);
const progress = (done = []) => ({ done });

test('23 slots in rows of 6–5–5–4–3, centred, bottom row first', () => {
  assert.equal(SLOTS, 23);
  const rows = {};
  for (let i = 0; i < SLOTS; i += 1) {
    const [x, y] = slotPos(i);
    (rows[y] ||= []).push(x);
  }
  const ys = Object.keys(rows).map(Number).sort((a, b) => b - a);
  assert.deepEqual(ys.map((y) => rows[y].length), [6, 5, 5, 4, 3]);
  assert.deepEqual(ys, [298, 265, 232, 199, 166]);
  for (const y of ys) {
    const xs = rows[y];
    assert.equal(xs[0] + (xs.at(-1) + 36) - 170 * 2, 0, `row at ${y} is centred on x = 170`);
  }
  assert.deepEqual(slotPos(0), [52, 298]);
  assert.throws(() => slotPos(23), RangeError);
});

test('missed presents: rows of 7', () => {
  assert.deepEqual(missedPos(0), [8, 396]);
  assert.deepEqual(missedPos(6), [218, 396]);
  assert.deepEqual(missedPos(7), [8, 427]);
});

test('pile fills in loading order: a late-loaded missed day goes on top, never into a gap', () => {
  const L = sceneLayout(at(12, 7), progress([1, 2, 4, 3]));
  assert.deepEqual(L.loaded, [1, 2, 4, 3]);
  assert.deepEqual(L.pos[3], slotPos(3));
  assert.deepEqual(L.missed, [5, 6]);
  assert.equal(L.today, 7);
  assert.deepEqual(L.pos[7], [...TODAY_POS]);
});

test('30 Nov: nothing on the sleigh, nothing missed, no present today', () => {
  const L = sceneLayout(at(11, 30, 23), progress());
  assert.deepEqual([L.loaded, L.missed, L.today], [[], [], null]);
});

test('today already done: no waiting present', () => {
  const L = sceneLayout(at(12, 7), progress([7]));
  assert.equal(L.today, null);
  assert.deepEqual(L.pos[7], slotPos(0));
});

test('day 24 is never a present: not today, not missed, not in the pile', () => {
  const dec24 = sceneLayout(at(12, 24), progress([24]));
  assert.equal(dec24.today, null);
  assert.deepEqual(dec24.loaded, []);
  const dec27 = sceneLayout(at(12, 27), progress([1, 2]));
  assert.equal(dec27.today, null);
  assert.equal(dec27.missed.length, 21);
  assert.ok(!dec27.missed.includes(24));
});

test('status line covers every prototype variant', () => {
  const s = (now, done, pending) => statusLine(now, progress(done), pending);
  assert.deepEqual(s(at(11, 30, 23)), { key: 'statusPre', params: {} });
  assert.deepEqual(s(at(12, 7), [1, 2]), { key: 'statusOpen', params: { day: 7, count: 2 } });
  assert.deepEqual(s(at(12, 7), [1, 7], 7), { key: 'statusReady', params: { day: 7 } });
  assert.deepEqual(s(at(12, 7), [1, 7]), { key: 'statusDone', params: { day: 7 } });
  assert.deepEqual(s(at(12, 24), [1]), { key: 'status24Open', params: {} });
  assert.deepEqual(s(at(12, 24), [1, 24]), { key: 'status24Done', params: {} });
  assert.deepEqual(s(at(12, 27), [1, 2]), { key: 'status24Open', params: {} });
  assert.deepEqual(s(at(12, 27), [1, 2, 24]), { key: 'statusAfter', params: { count: 2 } });
});

test('throwing never fails: a tap or any upward flick throws, only small/downward drags snap back', () => {
  assert.deepEqual(flick({ moved: false, dy: 0, vy: 0 }), { throw: true, power: 0.3 });
  assert.equal(flick({ moved: true, dy: -31, vy: 0 }).throw, true); // dragged up far enough
  assert.equal(flick({ moved: true, dy: -5, vy: -0.4 }).throw, true); // short but fast flick
  assert.equal(flick({ moved: true, dy: -20, vy: -0.1 }).throw, false); // small slow nudge
  assert.equal(flick({ moved: true, dy: 16, vy: 0.5 }).throw, false); // downward
  assert.equal(flick({ moved: true, dy: -400, vy: -5 }).power, 1); // capped
  assert.equal(flick({ moved: true, dy: -60, vy: -0.1 }).power, 0.5);
});

test('flight takes 0.9–1.2 s, stronger flicks fly longer', () => {
  assert.equal(throwDuration(0), 900);
  assert.equal(throwDuration(0.3), 990);
  assert.equal(throwDuration(1), 1200);
  assert.equal(throwDuration(7), 1200);
  assert.equal(throwDuration(-1), 900);
});
