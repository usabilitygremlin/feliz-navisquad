// Day 24 is done: the loaded sleigh takes off up and to the right with Santa on board
// (ported from the prototype's renderFinale). With all 24 days done the message is the
// all-24 finale ("24 of 24"), otherwise "Sleigh run complete".
// Tap the scene or press Esc to skip to the end; reduced motion shows the end picture.

import { LAST_DAY } from '../dates.js';
import { sceneLayout } from '../scene.js';
import { flakes, reducedMotion, sleighSvg } from './calendar.js';

export function renderTakeoff(root, view, app) {
  const { i18n, storage } = app;
  const progress = { done: storage.done };
  const all = progress.done.length === LAST_DAY;
  const L = sceneLayout(app.now(), progress);
  const [title, msg, tone] = all ? ['finaleTitle', 'finaleMsg', 'candle'] : ['sleighTitle', 'sleighMsg', 'brass'];

  root.innerHTML = `
    <div class="fn-scene cal takeoff" data-act="skip">
      <div class="snowlayer" aria-hidden="true">${reducedMotion() ? '' : flakes(26, { min: 2, range: 3, op: 0.2, opRange: 0.3, dur: 7, durRange: 7 })}</div>
      ${sleighSvg(i18n, L, storage.modes, null, { takeoff: true })}
      <div class="sl-msg" role="status"><h1 class="c-title c-title--${tone}">${i18n.t(title)}</h1><p>${i18n.t(msg)}</p></div>
      <button class="fn-btn fn-btn--primary bottom-cta" data-act="home">${i18n.t('backToCal')}</button>
    </div>`;

  const scene = root.querySelector('.takeoff');
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
