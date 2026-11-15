// Day-24 intro: "Santa's sleigh run" (ported from the prototype's renderDay24Intro).
// Start leads to the day-24 routine (stub until "Exercise cards", #10).

import { LAST_DAY } from '../dates.js';
import { icon } from '../icons.js';

export function renderDay24Intro(root, view, app) {
  const { i18n, storage } = app;
  const done = storage.isDone(LAST_DAY);
  root.innerHTML = `
    <div class="d24">
      <button class="fn-link" data-act="home">${icon('arrow-left')}${i18n.t('calendar')}</button>
      <div class="d24__body">
        <p class="fn-meta">${i18n.t('day', { day: LAST_DAY })} · ${i18n.formatDay(LAST_DAY)}</p>
        <h1 class="d24__title">${i18n.t('d24Title')}</h1>
        ${done ? `<p class="d24__badge"><span class="fn-badge fn-badge--done">${icon('check')}${i18n.t('doneBadge')}</span></p>` : ''}
        <div class="fn-tile d24__tile">
          <div class="d24__head">
            <span class="d24__ic">${icon('star')}</span>
            <div><p class="d24__name">${i18n.t('d24Badge')}</p><p class="fn-meta">${i18n.t('d24Meta')}</p></div>
          </div>
          <p class="d24__line">${i18n.t('d24Line')}</p>
          <button class="fn-btn fn-btn--day24 fn-btn--block" data-act="start">${i18n.t('start')}</button>
        </div>
        ${done ? `<button class="fn-btn fn-btn--secondary fn-btn--block d24__replay" data-act="replay">${icon('refresh-cw')}${i18n.t('replay')}</button>` : ''}
        <p class="fn-health">${icon('info')}<span>${i18n.t('healthText')}</span></p>
      </div>
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'home') app.go({ name: 'calendar', focus: done ? undefined : '.fn-snowbank [data-act="ride"]' });
    if (act === 'start') app.go({ name: 'workout', day: LAST_DAY });
    if (act === 'replay') app.go({ name: 'takeoff' });
  };
  root.querySelector('.fn-link').focus({ preventScroll: true });
}
