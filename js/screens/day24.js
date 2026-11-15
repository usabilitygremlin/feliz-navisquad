// Day-24 intro: "Santa's sleigh run" (ported from the prototype's renderDay24Intro).
// Start leads to the day-24 routine (story cards, js/screens/cards.js). The intro only opens
// while day 24 waits (the ride); once it's done there's no replay (decided 15 Nov).

import { LAST_DAY } from '../dates.js';
import { icon } from '../icons.js';

export function renderDay24Intro(root, view, app) {
  const { i18n } = app;
  root.innerHTML = `
    <div class="d24">
      <button class="fn-link" data-act="home">${icon('arrow-left')}${i18n.t('calendar')}</button>
      <div class="d24__body">
        <p class="fn-meta">${i18n.t('day', { day: LAST_DAY })} · ${i18n.formatDay(LAST_DAY)}</p>
        <h1 class="d24__title">${i18n.t('d24Title')}</h1>
        <div class="fn-tile d24__tile">
          <div class="d24__head">
            <span class="d24__ic">${icon('star')}</span>
            <div><p class="d24__name">${i18n.t('d24Badge')}</p><p class="fn-meta">${i18n.t('d24Meta')}</p></div>
          </div>
          <p class="d24__line">${i18n.t('d24Line')}</p>
          <button class="fn-btn fn-btn--day24 fn-btn--block" data-act="start">${i18n.t('start')}</button>
        </div>
        <p class="fn-health">${icon('info')}<span>${i18n.t('healthText')}</span></p>
      </div>
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'home') app.go({ name: 'calendar', focus: '.fn-snowbank [data-act="ride"]' });
    if (act === 'start') app.go({ name: 'workout', day: LAST_DAY });
  };
  root.querySelector('.fn-link').focus({ preventScroll: true });
}
