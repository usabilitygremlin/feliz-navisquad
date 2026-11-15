// Calendar: the sleigh in the snow at night (ported from the prototype's renderCalendar,
// sleighHtml, giftSvg, firSvg, ELF, flakes, finishDay, throwGift, puffAt and the pointer
// handlers). Day 24's ride (#7) is a separate issue. The ⋯ menu is in menu.js.

import { LAST_DAY, daysUntilStart, phase } from '../dates.js';
import { GIFT, MISSED_SCALE, TODAY_POS, flick, sceneLayout, statusLine, throwDuration } from '../scene.js';
import { icon } from '../icons.js';
import { handleMenuAction, menuHtml } from './menu.js';

const reducedMotion = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function flakes(n, o) {
  const r = Math.random;
  let out = '';
  for (let i = 0; i < n; i += 1) {
    const size = (o.min + r() * o.range).toFixed(1);
    out += `<div class="fn-flake" style="left:${(r() * 100).toFixed(1)}%;width:${size}px;height:${size}px;`
      + `opacity:${(o.op + r() * o.opRange).toFixed(2)};--dx:${((r() - 0.5) * 50).toFixed(0)}px;`
      + `animation-duration:${(o.dur + r() * o.durRange).toFixed(1)}s;animation-delay:-${(r() * 14).toFixed(1)}s"></div>`;
  }
  return out;
}

// Present colours: [box, ribbon]. Loaded and ready presents take the colour of the mode done that day.
const MODE_GIFT = {
  moderate: ['var(--elf-moderate)', 'var(--character-white)'],
  recovery: ['var(--elf-recovery)', 'var(--character-white)'],
};
function giftColors(day, state, modes) {
  if (state === 'today') return ['var(--moonlight)', 'var(--ink-secondary)'];
  if (state === 'missed') return ['var(--window-missed)', 'var(--window-missed-frame)'];
  return MODE_GIFT[modes[day] || (day % 2 ? 'moderate' : 'recovery')];
}

function giftSvg(i18n, modes, day, x, y, state, rot = 0) {
  const [c, r] = giftColors(day, state, modes);
  const { w, h } = GIFT;
  const ready = state === 'ready';
  const label = ready ? i18n.t('readyLabel', { day }) : `${i18n.t('day', { day })}, ${i18n.t(`state.${state}`)}`;
  const glow = state === 'today' || ready
    ? `<circle class="glow" cx="${x + w / 2}" cy="${y + h / 2}" r="34" fill="var(--moonlight)" opacity=".16"/>` : '';
  return `<g class="gift gift-${state}"${ready ? '' : ' data-act="open"'} data-day="${day}" role="button" tabindex="0" aria-label="${label}"${rot ? ` transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"` : ''}>
      ${glow}<rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}"/>
      <rect x="${x + w / 2 - 3}" y="${y}" width="6" height="${h}" fill="${r}"/><rect x="${x}" y="${y + h * 0.42}" width="${w}" height="4" fill="${r}"/>
      <path d="M${x + w / 2} ${y} q-8 -8 -11 -2 q4 4 11 2 q8 -8 11 -2 q-4 4 -11 2" fill="${r}"/>
      <circle cx="${x + w - 8}" cy="${y + h - 8}" r="7.5" fill="var(--character-white)"/>
      <text x="${x + w - 8}" y="${y + h - 5}" text-anchor="middle" font-family="Figtree, sans-serif" font-weight="800" font-size="9" fill="var(--sky)">${day}</text></g>`;
}

function throwHint(i18n, x, y) {
  const cx = x + GIFT.w / 2;
  return `<g class="throw-hint" aria-hidden="true"><path d="M${cx} ${y - 14} l0 -22 M${cx - 7} ${y - 29} l7 -7 l7 7" fill="none" stroke="var(--moonlight)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${cx}" y="${y - 46}" text-anchor="middle" font-family="Figtree, sans-serif" font-weight="700" font-size="12" fill="var(--moonlight)">${i18n.t('swipeHint')}</text></g>`;
}

const FIRS = [[20, 300, 96], [52, 300, 64], [334, 296, 104], [300, 300, 70]];
function firSvg(x, base, h) {
  let out = '';
  for (let i = 0; i < 3; i += 1) {
    const top = base - h + i * h * 0.26;
    const bot = base - h * 0.62 + i * h * 0.3;
    const ww = h * 0.55 * (0.55 + i * 0.25);
    out += `<path d="M${x} ${top} L${x + ww / 2} ${bot} L${x - ww / 2} ${bot} Z" fill="var(--scene-fir)"/>`;
  }
  return out;
}

// The Moderate elf (bauble style) standing next to today's present.
const ELF = `<g class="sl-elf" transform="translate(-10 0)" aria-hidden="true"><ellipse cx="342" cy="436" rx="11" ry="2.6" fill="var(--scene-shadow)" opacity=".14"/>
    <path d="M338.4 429.9 L337.9 436 M345.6 429.9 L346.1 436" stroke="var(--elf-fir-deep)" stroke-width="3" stroke-linecap="round"/>
    <path d="M331.8 419.7 Q326.7 423.8 329.8 427.8 M352.2 419.7 Q357.3 413.6 355.3 408.5" fill="none" stroke="var(--elf-fir)" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="342" cy="421.2" r="10.2" fill="var(--elf-fir)"/><rect x="334.4" y="410" width="15.3" height="3.6" rx="1.7" fill="var(--elf-moderate)"/>
    <circle cx="342" cy="404.9" r="6.3" fill="var(--character-skin)"/><circle cx="339.8" cy="404.4" r="1.1" fill="var(--character-ink)"/><circle cx="344.2" cy="404.4" r="1.1" fill="var(--character-ink)"/>
    <path d="M335.7 401.8 Q340 386 351.2 389.1 Q345.1 394.2 348.3 401.8 Z" fill="var(--elf-fir)"/><circle cx="351.7" cy="389.1" r="2" fill="var(--character-bell)"/></g>`;

function sleighSvg(i18n, L, modes, pending) {
  const pile = L.loaded
    .filter((d) => d !== pending?.day)
    .map((d) => giftSvg(i18n, modes, d, ...L.pos[d], 'done')).join('');
  let ground = L.missed.map((d, i) => {
    const [x, y] = L.pos[d];
    return `<g transform="translate(${x} ${y}) scale(${MISSED_SCALE}) translate(${-x} ${-y})">${giftSvg(i18n, modes, d, x, y, 'missed', i % 2 ? 4 : -4)}</g>`;
  }).join('');
  if (L.today !== null) ground += giftSvg(i18n, modes, L.today, ...L.pos[L.today], 'today');
  if (pending) ground += giftSvg(i18n, modes, pending.day, ...pending.from, 'ready') + throwHint(i18n, ...pending.from);
  return `<svg class="sl-svg" viewBox="0 140 360 360" preserveAspectRatio="xMidYMax meet" role="group" aria-label="${i18n.t('tagline')}">
      <path d="M-200 330 Q180 296 560 330 L560 520 L-200 520 Z" fill="var(--track)"/>
      ${FIRS.map(([x, b, h]) => firSvg(x, b, h)).join('')}
      <g class="sl-ride">
        <path d="M52 362 L262 362 Q300 362 302 322 L302 300 L272 300 L272 324 Q272 338 256 338 L52 338 Z" fill="var(--santa-red)"/>
        <path d="M44 384 L272 384 Q310 384 310 358" fill="none" stroke="var(--brass)" stroke-width="5" stroke-linecap="round"/>
        <path d="M84 362 L84 384 M232 362 L232 384" stroke="var(--brass)" stroke-width="4"/>
        <g class="pile">${pile}</g>
      </g>
      <g class="ground">${ground}</g>
      ${ELF}
      <g class="puff"></g>
    </svg>`;
}

function countdown(i18n, now) {
  const days = daysUntilStart(now);
  const line = days <= 1 ? i18n.t('preCountTomorrow') : i18n.t('preCount', { days });
  return `<div class="pre-note" role="status"><div class="pre-days">${days}</div>
      <div class="pre-title">${i18n.t('preTitle')}</div><div class="fn-meta">${line}</div></div>`;
}

/**
 * A workout is finished: the day counts as done right away (saved). If it's newly done
 * (days 1–23), its present waits where it lay, in its mode colour, to be thrown onto the
 * sleigh (`app.pending`). Leaving the calendar drops `pending`; the present is loaded anyway.
 */
export function finishDay(app, day, mode) {
  const from = sceneLayout(app.now(), { done: app.storage.done }).pos[day] || [...TODAY_POS];
  const isNew = app.storage.markDone(day, day < LAST_DAY ? mode : undefined);
  app.pending = isNew && day < LAST_DAY ? { day, from } : null;
}

function puffAt(root, cx, cy) {
  const puff = root.querySelector('.puff');
  if (!puff) return;
  for (let i = 0; i < 9; i += 1) {
    const ang = Math.PI * (1 + i / 8);
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 3); c.setAttribute('fill', 'var(--ink)');
    puff.appendChild(c);
    c.animate([{ transform: 'translate(0,0)', opacity: 0.8 }, { transform: `translate(${Math.cos(ang) * 22}px, ${Math.sin(ang) * 12}px)`, opacity: 0 }],
      { duration: 600, easing: 'ease-out', fill: 'forwards' }).onfinish = () => c.remove();
  }
}

/** Throw the waiting present onto the sleigh. It always lands; a stronger flick only makes a higher arc. */
function throwGift(root, app, g, dx, dy, power) {
  if (!app.pending || g.dataset.thrown) return; // never double-load
  g.dataset.thrown = '1';
  const { day, from } = app.pending;
  const to = sceneLayout(app.now(), { done: app.storage.done }).pos[day];
  const reduced = reducedMotion();
  let landed = false;
  const land = () => {
    if (landed) return;
    landed = true;
    if (app.pending?.day !== day || !g.isConnected) return; // left the calendar mid-flight: already loaded
    app.pending = null;
    app.go({ name: 'calendar', focusDay: day });
    if (reduced) return;
    puffAt(root, to[0] + GIFT.w / 2, to[1] + GIFT.h);
    root.querySelector('.sl-elf')?.animate(
      [{ transform: 'translate(-10px,0)' }, { transform: 'translate(-10px,-10px)', offset: 0.3 }, { transform: 'translate(-10px,0)' }],
      { duration: 600, easing: 'ease-out' },
    );
  };
  if (reduced) { land(); return; } // no flight: it appears on the sleigh

  root.querySelector('.throw-hint')?.remove();
  const tx = to[0] - from[0];
  const ty = to[1] - from[1];
  const lift = 50 + 70 * Math.min(1, power);
  const duration = throwDuration(power);
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = 'center';
  const a = g.animate([
    { transform: `translate(${dx}px, ${dy}px) rotate(0deg)` },
    { transform: `translate(${(dx + tx) * 0.5}px, ${Math.min(dy, ty) - lift}px) rotate(-18deg)`, offset: 0.5 },
    { transform: `translate(${tx}px, ${ty - 6}px) rotate(4deg)`, offset: 0.86 },
    { transform: `translate(${tx}px, ${ty + 3}px) rotate(0deg)`, offset: 0.94 },
    { transform: `translate(${tx}px, ${ty}px) rotate(0deg)` },
  ], { duration, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' });
  a.onfinish = land;
  setTimeout(land, duration + 200); // safety net if onfinish doesn't fire (tab hidden etc.)
}

// Drag on the ready present (pointer events cover touch, pen and mouse).
let drag = null;

function bindThrow(root, app) {
  root.onpointerdown = (e) => {
    const g = e.target.closest?.('.gift-ready');
    if (!g) return;
    e.preventDefault();
    try { g.setPointerCapture(e.pointerId); } catch { /* lost or synthetic pointer: root listeners still track it */ }
    const k = 1 / g.ownerSVGElement.getScreenCTM().a; // screen px -> scene units
    drag = { g, x0: e.clientX, y0: e.clientY, k, dx: 0, dy: 0, moved: false, hist: [[performance.now(), 0]] };
  };
  root.onpointermove = (e) => {
    if (!drag) return;
    drag.dx = (e.clientX - drag.x0) * drag.k;
    drag.dy = (e.clientY - drag.y0) * drag.k;
    if (Math.hypot(drag.dx, drag.dy) > 4) drag.moved = true;
    drag.g.style.transform = `translate(${drag.dx}px, ${Math.min(drag.dy, 16)}px)`;
    drag.hist.push([performance.now(), drag.dy]);
    if (drag.hist.length > 6) drag.hist.shift();
  };
  const end = () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    const [t0, y0] = d.hist[0];
    const [t1, y1] = d.hist[d.hist.length - 1];
    const vy = (y1 - y0) / Math.max(1, t1 - t0); // units per ms, negative = upwards
    const f = flick({ moved: d.moved, dy: d.dy, vy });
    if (f.throw) { throwGift(root, app, d.g, d.moved ? d.dx : 0, d.moved ? Math.min(d.dy, 16) : 0, f.power); return; }
    d.g.animate([{ transform: d.g.style.transform }, { transform: 'translate(0px, 0px)' }], { duration: 250, easing: 'ease-out' });
    d.g.style.transform = '';
  };
  root.onpointerup = end;
  root.onpointercancel = end;
}

// Esc closes the menu wherever focus is (also on <body> after a tap on plain text).
let escape = null;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && escape && document.querySelector('.fn-menu')) { e.preventDefault(); escape(); }
});

/**
 * Renders the calendar into `root`. Focus goes to `view.focus` (a selector, used by the menu),
 * else to the ready present (unless the menu is open), else to `view.focusDay`
 * (e.g. coming back from that present). `view.menu` / `view.section`: see menu.js.
 */
export function renderCalendar(root, view, app) {
  const { i18n, storage } = app;
  const now = app.now();
  const progress = { done: storage.done };
  const modes = storage.modes;
  const pending = app.pending ?? null;
  const L = sceneLayout(now, progress);
  const status = statusLine(now, progress, pending?.day ?? null);

  root.innerHTML = `
    <div class="fn-scene cal">
      <div class="snowlayer" aria-hidden="true">${reducedMotion() ? '' : flakes(26, { min: 2, range: 3, op: 0.2, opRange: 0.3, dur: 7, durRange: 7 })}</div>
      ${sleighSvg(i18n, L, modes, pending)}
      ${phase(now) === 'pre' ? countdown(i18n, now) : ''}
      ${storage.available ? '' : `<div class="storage-note">${icon('info')}<span>${i18n.t('storageNote')}</span></div>`}
      <button class="fn-menu-btn" data-act="menu" aria-label="${i18n.t('menu')}" aria-haspopup="dialog"
        aria-expanded="${Boolean(view.menu)}"${view.menu ? ' aria-controls="menu"' : ''}>${icon('ellipsis')}</button>
      ${menuHtml(view, i18n, now)}
      <div class="fn-snowbank">
        <p class="fn-snowbank__tagline">${i18n.t('tagline')}</p>
        <p class="fn-snowbank__status">${i18n.t(status.key, status.params)}</p>
      </div>
    </div>`;

  const open = (el) => app.go({ name: 'mode', day: Number(el.dataset.day) });
  root.onclick = (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || handleMenuAction(el, view, app)) return;
    if (el.dataset.act === 'open') open(el);
  };
  escape = view.menu ? () => app.go({ name: 'calendar', focus: '.fn-menu-btn' }) : null;
  root.onkeydown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const ready = e.target.closest?.('.gift-ready');
    const el = ready || e.target.closest?.('[data-act="open"]');
    if (!el) return;
    e.preventDefault();
    if (ready) throwGift(root, app, ready, 0, 0, 0.3);
    else open(el);
  };
  bindThrow(root, app);

  const focus = (view.focus && root.querySelector(view.focus))
    || (!view.menu && root.querySelector('.gift-ready'))
    || (view.focusDay && root.querySelector(`.gift[data-day="${view.focusDay}"]`));
  focus?.focus({ preventScroll: true });
}
