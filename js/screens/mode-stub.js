// Route stub for the mode choice. Replaced by the "Mode choice screen" issue (#9).

import { icon } from '../icons.js';

export function renderModeStub(root, view, app) {
  const { i18n } = app;
  root.innerHTML = `
    <div class="fn-page">
      <button class="fn-link" data-act="home">${icon('arrow-left')}${i18n.t('calendar')}</button>
      <p class="fn-meta">${i18n.t('day', { day: view.day })} · ${i18n.formatDay(view.day)}</p>
      <h1 class="fn-page__title">${i18n.t('feelQ')}</h1>
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => {
    if (e.target.closest('[data-act="home"]')) app.go({ name: 'calendar', focusDay: view.day });
  };
  root.querySelector('.fn-link').focus({ preventScroll: true });
}
