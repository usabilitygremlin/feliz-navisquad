// Route stub for the mode choice and workout. Replaced by "Mode choice screen" (#9) and
// "Exercise cards" (#10). Until then it lets you finish a day in either mode, which
// triggers the done moment on the calendar.

import { icon } from '../icons.js';
import { finishDay } from './calendar.js';

const MODE_ICON = { moderate: 'flame', recovery: 'leaf' };

export function renderModeStub(root, view, app) {
  const { i18n } = app;
  const finish = (mode) => `<button class="fn-btn fn-btn--${mode}" data-act="finish" data-mode="${mode}">${icon(MODE_ICON[mode])}${i18n.t(mode)} · ${i18n.t('finish')}</button>`;
  root.innerHTML = `
    <div class="fn-page">
      <button class="fn-link" data-act="home">${icon('arrow-left')}${i18n.t('calendar')}</button>
      <p class="fn-meta">${i18n.t('day', { day: view.day })} · ${i18n.formatDay(view.day)}</p>
      <h1 class="fn-page__title">${i18n.t('feelQ')}</h1>
      ${view.day < 24 ? finish('moderate') + finish('recovery') : ''}
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.dataset.act === 'home') app.go({ name: 'calendar', focusDay: view.day });
    if (el.dataset.act === 'finish') {
      finishDay(app, view.day, el.dataset.mode);
      app.go({ name: 'calendar', focusDay: view.day });
    }
  };
  root.querySelector('.fn-link').focus({ preventScroll: true });
}
