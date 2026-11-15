import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDate, todayDoor, phase, daysUntilStart, winState, devDateOverride, currentDate } from '../js/dates.js';

// All dates are local time, like on the device.
const at = (month, day, h = 12, min = 0, year = 2026) => new Date(year, month - 1, day, h, min);
const none = { done: [] };

test('day n opens at 00:00 local time on n December 2026', () => {
  assert.deepEqual(openDate(1), new Date(2026, 11, 1, 0, 0));
  assert.deepEqual(openDate(24), new Date(2026, 11, 24, 0, 0));
  assert.throws(() => openDate(0), RangeError);
  assert.throws(() => openDate(25), RangeError);
  assert.throws(() => openDate(1.5), RangeError);
});

test('30 Nov 23:59 is still before the start; 1 Dec 00:00 opens day 1', () => {
  const lastMinute = at(11, 30, 23, 59);
  assert.equal(phase(lastMinute), 'pre');
  assert.equal(todayDoor(lastMinute), null);
  assert.equal(winState(1, lastMinute, none), 'locked');
  assert.equal(daysUntilStart(lastMinute), 1);

  const midnight = at(12, 1, 0, 0);
  assert.equal(phase(midnight), 'advent');
  assert.equal(todayDoor(midnight), 1);
  assert.equal(winState(1, midnight, none), 'today');
  assert.equal(winState(2, midnight, none), 'locked');
  assert.equal(daysUntilStart(midnight), 0);
});

test('countdown counts whole calendar days', () => {
  assert.equal(daysUntilStart(at(11, 15, 0, 1)), 16);
  assert.equal(daysUntilStart(at(11, 15, 23, 59)), 16);
  assert.equal(daysUntilStart(at(11, 29)), 2);
  assert.equal(daysUntilStart(at(12, 20)), 0);
});

test('past days stay open: missed until done, then done', () => {
  const dec7 = at(12, 7);
  assert.equal(winState(3, dec7, none), 'missed');
  assert.equal(winState(3, dec7, { done: [3] }), 'done');
  assert.equal(winState(7, dec7, none), 'today');
  assert.equal(winState(7, dec7, { done: [7] }), 'done');
  assert.equal(winState(8, dec7, none), 'locked');
});

test('day 24 not done is still missed (Santa waits) on 27 Dec', () => {
  const dec27 = at(12, 27);
  assert.equal(phase(dec27), 'after');
  assert.equal(todayDoor(dec27), null);
  assert.equal(winState(24, dec27, none), 'missed');
  assert.equal(winState(24, dec27, { done: [24] }), 'done');
  assert.equal(winState(10, dec27, none), 'missed');
});

test('24 Dec is day 24; 25 Dec 00:00 is after Christmas', () => {
  assert.equal(todayDoor(at(12, 24, 23, 59)), 24);
  assert.equal(winState(24, at(12, 24, 23, 59), none), 'today');
  assert.equal(phase(at(12, 25, 0, 0)), 'after');
});

test('other years: before 2026 everything is locked, after it everything is past', () => {
  assert.equal(phase(at(12, 5, 12, 0, 2025)), 'pre');
  assert.equal(winState(5, at(12, 5, 12, 0, 2025), none), 'locked');
  assert.equal(todayDoor(at(12, 5, 12, 0, 2027)), null);
  assert.equal(winState(5, at(12, 5, 12, 0, 2027), none), 'missed');
});

test('winState rejects invalid days', () => {
  assert.throws(() => winState(0, at(12, 1), none), RangeError);
  assert.throws(() => winState('3', at(12, 1), none), RangeError);
});

test('date override works on localhost and 127.0.0.1', () => {
  assert.deepEqual(devDateOverride({ hostname: 'localhost', search: '?date=2026-12-24' }), at(12, 24, 12, 0));
  assert.deepEqual(devDateOverride({ hostname: '127.0.0.1', search: '?date=2026-11-30T23:59' }), at(11, 30, 23, 59));
  assert.equal(devDateOverride({ hostname: 'localhost', search: '' }), null);
});

test('date override is ignored when the host is not localhost / 127.0.0.1', () => {
  for (const hostname of ['usabilitygremlin.github.io', 'localhost.example.com', '192.168.1.20', '::1', '']) {
    assert.equal(devDateOverride({ hostname, search: '?date=2026-12-24' }), null, hostname);
    assert.equal(devDateOverride({ hostname, search: '?date=nonsense' }), null, hostname);
  }
  const clock = () => at(11, 15);
  assert.deepEqual(currentDate({ hostname: 'usabilitygremlin.github.io', search: '?date=2026-12-24' }, clock), at(11, 15));
  assert.deepEqual(currentDate({ hostname: 'localhost', search: '?date=2026-12-24' }, clock), at(12, 24));
});

test('a malformed override on localhost fails loudly', () => {
  for (const value of ['24.12.2026', '2026-12-32', '2026-02-30', '2026-12-24T25:00', '2026-1-5']) {
    assert.throws(() => devDateOverride({ hostname: 'localhost', search: `?date=${value}` }), /Invalid \?date/, value);
  }
});

test('lockedDays lists the days that are still in the workshop', async () => {
  const { lockedDays } = await import('../js/dates.js');
  assert.equal(lockedDays(at(11, 15)).length, 24);
  assert.deepEqual(lockedDays(at(12, 21)), [22, 23, 24]);
  assert.deepEqual(lockedDays(at(12, 23, 23, 59)), [24]);
  assert.deepEqual(lockedDays(at(12, 24, 0, 0)), []);
  assert.deepEqual(lockedDays(at(12, 27)), []);
});
