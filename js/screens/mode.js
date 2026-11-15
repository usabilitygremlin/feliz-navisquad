// Mode choice: "How does your body feel today?" (ported from the prototype's renderModeSwitch,
// applyPick and fitModes; the switch is the decided version). Nothing is picked at first
// (waiting elves); a pick changes the elf, the accent colour, shows the routine and reveals Start.

import { icon } from '../icons.js';
import { MODES } from '../storage.js';

const MODE_ICON = { moderate: 'flame', recovery: 'leaf' };
const ART = { neutral: 'img/elves/neutral.svg', moderate: 'img/elves/moderate.svg', recovery: 'img/elves/recovery.svg' };

/**
 * Sizes the square illustration so the screen fills the height (prototype's fitModes).
 * Hidden by CSS on small phones; hidden here too if there's less than 72 px for it.
 */
function fitArt(root) {
  const body = root.querySelector('.mode__body');
  const img = body?.querySelector('.mode-img');
  if (!img) return;
  img.classList.remove('none');
  if (getComputedStyle(img).display === 'none') return; // small phone: hidden by CSS
  body.style.setProperty('--art', '0px');
  const used = [...body.children].reduce((h, c) => h + c.offsetHeight + parseFloat(getComputedStyle(c).marginTop), 0);
  const room = body.clientHeight - parseFloat(getComputedStyle(body).paddingTop) - used;
  const tile = img.parentElement;
  const inner = tile.clientWidth - 2 * parseFloat(getComputedStyle(tile).paddingLeft);
  const art = Math.floor(Math.min(room - 8, inner));
  if (art < 72) { img.classList.add('none'); return; } // too small to read as a picture
  body.style.setProperty('--art', `${art}px`);
}
globalThis.addEventListener?.('resize', () => {
  const root = document.getElementById('screen');
  if (root?.querySelector('.mode')) fitArt(root);
});

/** Updates the screen for `pick` (null = nothing picked) without re-rendering, so the switch can animate. */
function applyPick(root, app, day, pick) {
  const { i18n, content } = app;
  const sw = root.querySelector('.switch');
  sw.dataset.pick = pick || '';
  sw.querySelectorAll('[role="radio"]').forEach((b, i) => {
    b.setAttribute('aria-checked', String(b.dataset.mode === pick));
    b.tabIndex = (pick ? b.dataset.mode === pick : i === 0) ? 0 : -1; // roving tabindex
  });
  const art = root.querySelector('.mode-art');
  art.className = `mode-art img-area--${pick || 'neutral'}`;
  const img = art.querySelector('img');
  img.src = ART[pick || 'neutral'];
  img.alt = i18n.t(`elfAlt.${pick || 'neutral'}`);

  const info = root.querySelector('.pick-info');
  if (pick) {
    const r = content.routine(day, pick, i18n.lang);
    info.innerHTML = r
      ? `<p class="pick-routine pick-routine--${pick}">${icon(MODE_ICON[pick])}<b>${r.name}</b></p>
         <p class="fn-meta">${i18n.t('modeMeta', { mode: i18n.t(pick), count: r.exercises.length })}</p>`
      : `<div class="fn-notice fn-notice--error" role="alert"><p class="fn-notice__title">${icon('circle-alert')}${i18n.t('errTitle')}</p>
         <p class="fn-notice__body">${i18n.t('errBody')}</p></div>`;
  } else {
    info.innerHTML = `<p class="fn-meta">${i18n.t('pickHint')}</p>`;
  }
  const start = root.querySelector('.pick-start');
  const ready = Boolean(pick && content.routine(day, pick, i18n.lang));
  start.className = `fn-btn fn-btn--block pick-start${ready ? ` fn-btn--${pick}` : ' is-hidden'}`;
  start.dataset.mode = pick || '';
  start.disabled = !ready;
}

/** view: { name: 'mode', day, pick? } */
export function renderMode(root, view, app) {
  const { i18n, storage } = app;
  const { day } = view;
  let pick = MODES.includes(view.pick) ? view.pick : null;
  const opt = (m) => `<button role="radio" aria-checked="false" data-mode="${m}">${icon(MODE_ICON[m])}${i18n.t(`feel.${m}`)}</button>`;

  root.innerHTML = `
    <div class="mode">
      <button class="fn-link" data-act="home">${icon('arrow-left')}${i18n.t('calendar')}</button>
      <div class="mode__body">
        <p class="fn-meta">${i18n.t('day', { day })} · ${i18n.formatDay(day)}</p>
        <h1 class="mode__title" id="feel-q">${i18n.t('feelQ')}</h1>
        ${storage.isDone(day) ? `<p class="mode__badge"><span class="fn-badge fn-badge--done">${icon('check')}${i18n.t('doneBadge')}</span></p>` : ''}
        <div class="fn-tile mode-tile">
          <div class="mode-img"><div class="mode-art"><img alt=""></div></div>
          <div class="switch" role="radiogroup" aria-labelledby="feel-q"><span class="thumb"></span>${opt('moderate')}${opt('recovery')}</div>
          <div class="pick-info" aria-live="polite"></div>
          <button class="fn-btn fn-btn--block pick-start" data-act="start">${i18n.t('start')}</button>
        </div>
        <p class="fn-health">${icon('info')}<span>${i18n.t('healthText')}</span></p>
      </div>
    </div>`;

  const set = (m, focus) => {
    pick = m;
    applyPick(root, app, day, pick);
    if (focus) root.querySelector(`.switch [data-mode="${m}"]`).focus();
  };
  root.onclick = (e) => {
    const el = e.target.closest('[data-act], [role="radio"]');
    if (!el) return;
    if (el.getAttribute('role') === 'radio') set(el.dataset.mode, false);
    else if (el.dataset.act === 'home') app.go({ name: 'calendar', focusDay: day });
    else if (el.dataset.act === 'start' && pick) app.go({ name: 'workout', day, mode: pick });
  };
  // Radio group: arrows move (and pick), Space/Enter pick the focused option.
  root.onkeydown = (e) => {
    const radio = e.target.closest?.('[role="radio"]');
    if (!radio) return;
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); set('moderate', true); }
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); set('recovery', true); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set(radio.dataset.mode, true); }
  };

  applyPick(root, app, day, pick);
  fitArt(root);
  root.querySelector('.fn-link').focus({ preventScroll: true });
}
