// Calendar dates. Everything uses the device's local time.
// Day n opens at 00:00 local time on n December 2026; past days stay open.

export const YEAR = 2026;
export const LAST_DAY = 24;
const DECEMBER = 11; // JS months are 0-based

function assertDay(day) {
  if (!Number.isInteger(day) || day < 1 || day > LAST_DAY) {
    throw new RangeError(`Day must be an integer from 1 to ${LAST_DAY}, got ${day}`);
  }
}

/** Local midnight on which day `day` opens. */
export function openDate(day) {
  assertDay(day);
  return new Date(YEAR, DECEMBER, day, 0, 0, 0, 0);
}

/** The day whose present is "today" (1–24), or null before 1 Dec and after 24 Dec. */
export function todayDoor(now) {
  const isAdvent = now.getFullYear() === YEAR && now.getMonth() === DECEMBER && now.getDate() <= LAST_DAY;
  return isAdvent ? now.getDate() : null;
}

/** 'pre' before 1 Dec 00:00, 'advent' from 1 to 24 Dec, 'after' from 25 Dec 00:00. */
export function phase(now) {
  if (now < openDate(1)) return 'pre';
  return todayDoor(now) === null ? 'after' : 'advent';
}

/** Whole calendar days from `now`'s date until 1 Dec (1 on 30 Nov, 0 from 1 Dec on). */
export function daysUntilStart(now) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const start = Date.UTC(YEAR, DECEMBER, 1);
  return Math.max(0, Math.round((start - today) / 864e5));
}

/**
 * State of one day: 'locked' (future), 'done' (loaded), 'today' (open, not done) or 'missed' (past, not done).
 * `progress.done` is the list of finished days (as stored by js/storage.js).
 */
export function winState(day, now, progress) {
  assertDay(day);
  if (now < openDate(day)) return 'locked';
  if (progress.done.includes(day)) return 'done';
  return day === todayDoor(now) ? 'today' : 'missed';
}

const DEV_HOSTS = new Set(['localhost', '127.0.0.1']);
const DEV_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

/**
 * Dev-only date override: `?date=2026-12-24` (noon local time) or `?date=2026-11-30T23:59`.
 * Returns a Date on localhost / 127.0.0.1, otherwise null (the parameter is ignored on the live site).
 * Throws on a malformed value so a typo doesn't silently show today.
 */
export function devDateOverride({ hostname, search }) {
  if (!DEV_HOSTS.has(hostname)) return null;
  const value = new URLSearchParams(search).get('date');
  if (value === null) return null;
  const m = DEV_DATE.exec(value);
  if (!m) throw new Error(`Invalid ?date="${value}". Use YYYY-MM-DD or YYYY-MM-DDTHH:MM.`);
  const [y, mo, d, h = '12', mi = '00'] = m.slice(1);
  const date = new Date(+y, +mo - 1, +d, +h, +mi);
  if (date.getMonth() !== +mo - 1 || date.getDate() !== +d || date.getHours() !== +h || date.getMinutes() !== +mi) {
    throw new Error(`Invalid ?date="${value}": no such date or time.`);
  }
  return date;
}

/** The app's "now": the dev override on localhost if given, else the device clock. */
export function currentDate(location = globalThis.location, clock = () => new Date()) {
  return (location && devDateOverride(location)) || clock();
}
