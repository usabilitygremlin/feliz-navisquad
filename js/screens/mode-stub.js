// Route stubs for the mode choice and the workouts (days 1–23 and day 24). Replaced by
// "Mode choice screen" (#9) and "Exercise cards" (#10). Until then they let you finish a
// day (in either mode), which triggers the done moment or, for day 24, the take-off.

import { icon } from '../icons.js';
import { finishDay } from './calendar.js';

const MODE_ICON = { moderate: 'flame', recovery: 'leaf' };

/** Stub for the day-24 routine ("workout" view): one "Done for today" button, then the take-off. */
export function renderDay24WorkoutStub(root, view, app) {
  const { i18n } = app;
  root.innerHTML = `
    <div class="fn-page">
      <button class="fn-link" data-act="back">${icon('arrow-left')}${i18n.t('d24Title')}</button>
      <p class="fn-meta">${i18n.t('day', { day: 24 })} · ${i18n.formatDay(24)}</p>
      <h1 class="fn-page__title">${i18n.t('d24Title')}</h1>
      ${(() => {
        const r = app.content.day24(i18n.lang);
        return r ? `<ol class="stub-routine">${r.cards.map((c) => `<li><b>${c.name}</b> · ${c.move}</li>`).join('')}</ol>` : '';
      })()}
      <button class="fn-btn fn-btn--day24" data-act="finish">${icon('star')}${i18n.t('finish')}</button>
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') app.go({ name: 'day24' });
    if (act === 'finish') {
      finishDay(app, 24);
      app.go({ name: 'takeoff' });
    }
  };
  root.querySelector('.fn-link').focus({ preventScroll: true });
}

// The day's routine from content/*.json (if authored yet): name, then each exercise with amount and images.
function routineHtml(app, day, mode) {
  const r = app.content.routine(day, mode, app.i18n.lang);
  if (!r) return '';
  const items = r.exercises.map((ex) => `<li data-exercise="${ex.id}"><b>${ex.name}</b> · ${ex.amount}
      <span class="stub-imgs">${ex.images.map((img) => `<img src="${img.src}" alt="${img.alt}" width="72" height="61">`).join('')}</span></li>`).join('');
  return `<section class="stub-routine" data-mode="${mode}"><p class="fn-meta">${app.i18n.t(mode)} · <b>${r.name}</b></p><ul>${items}</ul></section>`;
}

export function renderModeStub(root, view, app) {
  const { i18n } = app;
  const finish = (mode) => `${routineHtml(app, view.day, mode)}<button class="fn-btn fn-btn--${mode}" data-act="finish" data-mode="${mode}">${icon(MODE_ICON[mode])}${i18n.t(mode)} · ${i18n.t('finish')}</button>`;
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
