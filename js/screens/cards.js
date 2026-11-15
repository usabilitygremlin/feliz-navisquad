// The workout: one card per exercise, swipeable, with Next/Back buttons and no timer
// (ported from the prototype's renderCards, onTrackScroll, updateCta and goToCard).
// The last card's button is "Done for today": it saves the day and goes to the done moment
// (days 1–23) or the take-off (day 24). Leaving earlier doesn't mark the day done.

import { LAST_DAY } from '../dates.js';
import { icon } from '../icons.js';
import { finishDay, reducedMotion } from './calendar.js';

const MODE_ICON = { moderate: 'flame', recovery: 'leaf', day24: 'star' };

function cardsFor(app, day, mode) {
  const { content, i18n } = app;
  if (day === LAST_DAY) {
    const r = content.day24(i18n.lang);
    if (!r) throw new Error('No content for day 24 yet');
    return { name: r.name, cards: r.cards.map((c) => ({ title: c.name, story: c.story, amount: c.move, easier: c.easier, harder: c.harder, images: [] })) };
  }
  const r = content.routine(day, mode, i18n.lang);
  if (!r) throw new Error(`No ${mode} routine for day ${day} yet`);
  return { name: r.name, cards: r.exercises.map((ex) => ({ title: ex.name, desc: ex.description, amount: ex.amount, images: ex.images })) };
}

/** view: { name: 'workout', day, mode } (mode is ignored for day 24). */
export function renderCards(root, view, app) {
  const { i18n } = app;
  const { day } = view;
  const mode = day === LAST_DAY ? 'day24' : view.mode;
  const { name, cards } = cardsFor(app, day, mode);
  const n = cards.length;
  let index = 0;

  const badge = `<span class="fn-badge fn-badge--${mode}">${icon(MODE_ICON[mode])}${mode === 'day24' ? i18n.t('d24Badge') : i18n.t(mode)}</span>`;
  const html = cards.map((c, i) => {
    const imgs = c.images.length
      ? `<div class="img-area img-area--${mode} n${c.images.length}">${c.images.map((img) => `<div class="img-slot"><img src="${img.src}" alt="${img.alt}"></div>`).join('')}</div>` : '';
    const dots = cards.map((_, k) => `<span class="fn-dot${k <= i ? ' fn-dot--on' : ''}"></span>`).join('');
    return `<section class="card" aria-label="${i18n.t('of', { current: i + 1, total: n })}"${i ? ' aria-hidden="true"' : ''}>
        ${imgs}
        <h2 class="ex-name">${c.title}</h2>
        ${c.story ? `<p class="story">${c.story}</p>` : ''}
        ${c.desc ? `<p class="fn-desc">${c.desc}</p>` : ''}
        <div class="card-foot"><span class="amt amt--${mode}">${c.amount}</span>
          <span class="fn-dots fn-dots--${mode}" aria-hidden="true">${dots}<span class="fn-meta">${i18n.t('of', { current: i + 1, total: n })}</span></span></div>
        ${c.easier ? `<div class="opts"><div><strong>${i18n.t('easier')}</strong>${c.easier}</div><div><strong>${i18n.t('harder')}</strong>${c.harder}</div></div>` : ''}
      </section>`;
  }).join('');

  root.innerHTML = `
    <div class="cards">
      <div class="card-top"><button class="fn-link card-top__back" data-act="back">${icon('arrow-left')}${i18n.t('day', { day })}</button>${badge}</div>
      <div class="track" tabindex="0" role="group" aria-label="${name}">${html}</div>
      <div class="card-cta">
        <button class="fn-btn fn-btn--secondary card-back" data-act="prev" aria-label="${i18n.t('prevCard')}">${icon('arrow-left')}</button>
        <button class="fn-btn fn-btn--${mode} fn-btn--block card-next" data-act="next"></button>
      </div>
      <p class="fn-sr-only" aria-live="polite"></p>
    </div>`;

  const track = root.querySelector('.track');
  const next = root.querySelector('.card-next');
  const prev = root.querySelector('.card-back');
  const live = root.querySelector('[aria-live]');

  function update(announce) {
    const last = index === n - 1;
    next.innerHTML = last ? `${icon('check')}${i18n.t('finish')}` : `${i18n.t('next')}${icon('arrow-right')}`;
    next.dataset.act = last ? 'finish' : 'next';
    const wasFocused = document.activeElement === prev;
    prev.disabled = index === 0;
    if (wasFocused && prev.disabled) next.focus({ preventScroll: true }); // don't drop focus on a disabled button
    // Only the current card is exposed to screen readers; the others are off screen.
    [...track.children].forEach((card, k) => card.toggleAttribute('aria-hidden', k !== index));
    if (announce) live.textContent = `${i18n.t('of', { current: index + 1, total: n })} · ${cards[index].title}`;
  }
  // Buttons and arrow keys set the card right away; the scroll only follows.
  function goTo(i) {
    const target = Math.max(0, Math.min(n - 1, i));
    if (target !== index) { index = target; update(true); }
    track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
  const back = () => app.go(day === LAST_DAY ? { name: 'day24' } : { name: 'mode', day, pick: mode });

  // Swiping: the card that has snapped into view becomes current.
  let settle = null;
  track.addEventListener('scroll', () => {
    clearTimeout(settle);
    settle = setTimeout(() => {
      if (!track.isConnected || !track.clientWidth) return; // screen already left
      const i = Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / track.clientWidth)));
      if (i !== index) { index = i; update(true); }
    }, 80); // after smooth scrolling and snapping settle, so a button press isn't undone mid-way
  }, { passive: true });

  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') back();
    if (act === 'prev') goTo(index - 1);
    if (act === 'next') goTo(index + 1);
    if (act === 'finish') {
      finishDay(app, day, mode === 'day24' ? undefined : mode);
      app.go(day === LAST_DAY ? { name: 'celebration' } : { name: 'calendar', focusDay: day });
    }
  };
  root.onkeydown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    if (e.key === 'Escape') { e.preventDefault(); back(); }
  };

  update(false);
  track.focus({ preventScroll: true });
}

// Keep the current card in place when the window size changes.
globalThis.addEventListener?.('resize', () => {
  const track = document.querySelector('.cards .track');
  if (!track) return;
  const i = [...track.children].findIndex((c) => !c.hasAttribute('aria-hidden'));
  track.scrollLeft = Math.max(0, i) * track.clientWidth;
});
