// Day 24 is done: the celebration (decided 15 Nov). First the loaded sleigh takes off from the
// snow with Santa on board (prototype's renderFinale), then it crosses the full moon left → right,
// reindeer leading, while snow falls (prototype's renderSleigh), then the message: "24 of 24"
// when all days are done, otherwise "Sleigh run complete". It plays once after finishing day 24.
// Tap the scene or press Esc to skip to the end picture; reduced motion shows it straight away.

import { LAST_DAY } from '../dates.js';
import { sceneLayout } from '../scene.js';
import { flakes, reducedMotion, sleighSvg } from './calendar.js';

// Silhouette of the loaded sleigh with two reindeer in front, in sky colour against the moon
// (the prototype's stand-in).
function moonSleigh() {
  const deer = (x) => `<g transform="translate(${x},0)"><ellipse cx="14" cy="22" rx="12" ry="6"/><path d="M24 19l6-8 3 1-5 9z"/>`
    + '<path d="M30 11l-2-6M30 11l4-5M31 8l3-1" stroke="var(--sky)" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
    + '<path d="M6 26l-4 8M10 27l-1 8M18 27l2 8M22 25l5 7" stroke="var(--sky)" stroke-width="2" stroke-linecap="round"/></g>';
  return `<svg class="moon-sleigh" viewBox="0 0 170 50" fill="var(--sky)" aria-hidden="true">
      ${deer(96)}${deer(132)}
      <path d="M40 30L96 22" stroke="var(--sky)" stroke-width="1.5"/>
      <path d="M8 18h34l4 14H14q-8 0-6-14z"/><rect x="18" y="8" width="16" height="11" rx="2"/>
      <path d="M4 38h46q6 0 8-5" stroke="var(--sky)" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
}

export function renderCelebration(root, view, app) {
  const { i18n, storage } = app;
  const progress = { done: storage.done };
  const all = progress.done.length === LAST_DAY;
  const L = sceneLayout(app.now(), progress);
  const [title, msg, tone] = all ? ['finaleTitle', 'finaleMsg', 'candle'] : ['sleighTitle', 'sleighMsg', 'brass'];

  root.innerHTML = `
    <div class="fn-scene celebration" data-act="skip">
      <div class="snowlayer" aria-hidden="true">${reducedMotion() ? '' : flakes(30, { min: 2, range: 3, op: 0.25, opRange: 0.35, dur: 6, durRange: 5 })}</div>
      <div class="cel-ground" aria-hidden="true">${sleighSvg(i18n, L, storage.modes, null, { takeoff: true })}</div>
      <div class="cel-moon" aria-hidden="true"><div class="moon"></div>${moonSleigh()}</div>
      <div class="cel-msg" role="status"><h1 class="c-title c-title--${tone}">${i18n.t(title)}</h1><p>${i18n.t(msg)}</p></div>
      <button class="fn-btn fn-btn--primary bottom-cta" data-act="home">${i18n.t('backToCal')}</button>
    </div>`;

  const scene = root.querySelector('.celebration');
  const skip = () => scene.classList.add('end');
  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'home') app.go({ name: 'calendar' });
    else if (act === 'skip') skip();
  };
  root.onkeydown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); skip(); }
  };
  root.querySelector('.bottom-cta').focus({ preventScroll: true });
}
