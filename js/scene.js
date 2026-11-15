// Calendar scene layout and status line (pure logic, ported from the prototype's
// slotPos, missedPos, layout and statusLine). Coordinates are in the scene's SVG
// units (viewBox 0 140 360 360).

import { LAST_DAY, phase, todayDoor, winState } from './dates.js';

export const GIFT = Object.freeze({ w: 36, h: 30 });
/** 23 slots on the sleigh, bottom row first. */
export const ROWS = Object.freeze([6, 5, 5, 4, 3]);
export const SLOTS = ROWS.reduce((a, b) => a + b, 0);
/** Where today's present waits, next to the elf. */
export const TODAY_POS = Object.freeze([276, 400]);
/** Missed presents lie in the snow at 80 % size. */
export const MISSED_SCALE = 0.8;

/** Top-left corner of slot `i` (0 = first loaded) on the sleigh. */
export function slotPos(i) {
  if (!Number.isInteger(i) || i < 0 || i >= SLOTS) throw new RangeError(`Slot must be 0–${SLOTS - 1}, got ${i}`);
  let row = 0;
  let k = i;
  while (k >= ROWS[row]) { k -= ROWS[row]; row += 1; }
  const n = ROWS[row];
  const cx = 170;
  return [cx - (n * (GIFT.w + 4) - 4) / 2 + k * (GIFT.w + 4), 298 - row * (GIFT.h + 3)];
}

/** Top-left corner of the `i`-th missed present in the snow: rows of 7, left of today's present. */
export function missedPos(i) {
  return [8 + (i % 7) * 35, 396 + Math.floor(i / 7) * 31];
}

/**
 * What the scene shows at `now` for `progress` ({ done: [...] } in loading order):
 * loaded days 1–23 (on the sleigh, in loading order), missed days 1–23 (in the snow, by day),
 * today's day if it waits (1–23 only; day 24 is the ride) and the position of each.
 */
export function sceneLayout(now, progress) {
  const loaded = progress.done.filter((d) => d !== LAST_DAY);
  const missed = [];
  for (let d = 1; d < LAST_DAY; d += 1) if (winState(d, now, progress) === 'missed') missed.push(d);
  const td = todayDoor(now);
  const today = td !== null && td !== LAST_DAY && winState(td, now, progress) === 'today' ? td : null;

  const pos = {};
  loaded.forEach((d, i) => { pos[d] = slotPos(i); });
  missed.forEach((d, i) => { pos[d] = missedPos(i); });
  if (today !== null) pos[today] = [...TODAY_POS];
  return { loaded, missed, today, pos };
}

/**
 * Line 2 on the snow bank as { key, params } for i18n.
 * `pending` is the day whose present waits to be thrown (done moment), if any.
 */
export function statusLine(now, progress, pending = null) {
  const { done } = progress;
  const p = phase(now);
  if (p === 'pre') return { key: 'statusPre', params: {} };
  if (p === 'after') {
    return done.includes(LAST_DAY)
      ? { key: 'statusAfter', params: { count: done.filter((d) => d !== LAST_DAY).length } }
      : { key: 'status24Open', params: {} };
  }
  const today = todayDoor(now);
  if (pending === today) return { key: 'statusReady', params: { day: today } };
  if (today === LAST_DAY && !done.includes(LAST_DAY)) return { key: 'status24Open', params: {} };
  if (done.includes(today)) {
    return today === LAST_DAY ? { key: 'status24Done', params: {} } : { key: 'statusDone', params: { day: today } };
  }
  return { key: 'statusOpen', params: { day: today, count: done.length } };
}
