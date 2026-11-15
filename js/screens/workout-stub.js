// Route stub for the workout ("workout" view: { day, mode }), until "Exercise cards" (#10).
// Lists the routine from content/*.json and has one "Done for today" button, which saves
// the day and leads to the done moment (days 1–23) or the take-off (day 24).

import { icon } from '../icons.js';
import { finishDay } from './calendar.js';

const MODE_ICON = { moderate: 'flame', recovery: 'leaf' };

export function renderWorkoutStub(root, view, app) {
  const { i18n, content } = app;
  const { day, mode } = view;
  const is24 = day === 24;
  let list = '';
  if (is24) {
    const r = content.day24(i18n.lang);
    if (r) list = `<ol class="stub-routine">${r.cards.map((c) => `<li><b>${c.name}</b> · ${c.move}</li>`).join('')}</ol>`;
  } else {
    const r = content.routine(day, mode, i18n.lang);
    if (!r) throw new Error(`No ${mode} routine for day ${day}`);
    list = `<section class="stub-routine" data-mode="${mode}"><p class="fn-meta">${i18n.t(mode)} · <b>${r.name}</b></p><ul>${r.exercises.map((ex) => `<li data-exercise="${ex.id}"><b>${ex.name}</b> · ${ex.amount}
        <span class="stub-imgs">${ex.images.map((img) => `<img src="${img.src}" alt="${img.alt}" width="72" height="61">`).join('')}</span></li>`).join('')}</ul></section>`;
  }
  const back = is24 ? i18n.t('d24Title') : i18n.t('day', { day });
  root.innerHTML = `
    <div class="fn-page">
      <button class="fn-link" data-act="back">${icon('arrow-left')}${back}</button>
      <p class="fn-meta">${i18n.t('day', { day })} · ${i18n.formatDay(day)}</p>
      <h1 class="fn-page__title">${is24 ? i18n.t('d24Title') : i18n.t(mode)}</h1>
      ${list}
      <button class="fn-btn fn-btn--${is24 ? 'day24' : mode}" data-act="finish">${icon(is24 ? 'star' : MODE_ICON[mode])}${i18n.t('finish')}</button>
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') app.go(is24 ? { name: 'day24' } : { name: 'mode', day, pick: mode });
    if (act === 'finish') {
      finishDay(app, day, is24 ? undefined : mode);
      app.go(is24 ? { name: 'takeoff' } : { name: 'calendar', focusDay: day });
    }
  };
  root.querySelector('.fn-link').focus({ preventScroll: true });
}
