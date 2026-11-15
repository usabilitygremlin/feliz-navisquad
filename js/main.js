// Entry point: load strings, set up storage, language and routes, show the calendar.

import { currentDate } from './dates.js';
import { createStorage } from './storage.js';
import { createI18n, loadStrings } from './i18n.js';
import { loadContent } from './content.js';
import { createRouter } from './router.js';
import { icon } from './icons.js';
import { renderCalendar } from './screens/calendar.js';
import { renderMode } from './screens/mode.js';
import { renderWorkoutStub } from './screens/workout-stub.js';
import { renderDay24Intro } from './screens/day24.js';
import { renderTakeoff } from './screens/takeoff.js';

const root = document.getElementById('screen');

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Fail fast, but visibly: without strings there is no translated message, so show the raw error.
function showError(err, i18n) {
  const title = i18n ? i18n.t('errTitle') : 'Something went wrong';
  const body = i18n ? `<p class="fn-notice__body">${i18n.t('errBody')}</p>` : '';
  const retry = i18n ? i18n.t('retry') : 'Try again';
  root.innerHTML = `<div class="fn-page fn-page--centred">
      <div class="fn-notice fn-notice--error" role="alert">
        <p class="fn-notice__title">${icon('circle-alert')}${escapeHtml(title)}</p>${body}
        <p class="fn-meta">${escapeHtml(err.message)}</p>
      </div>
      <button class="fn-btn fn-btn--primary" data-act="retry">${icon('refresh-cw')}${escapeHtml(retry)}</button>
    </div>`;
  root.onkeydown = null;
  root.onclick = (e) => { if (e.target.closest('[data-act="retry"]')) location.reload(); };
}

async function start() {
  let i18n = null;
  try {
    const storage = createStorage();
    const [strings, content] = await Promise.allSettled([loadStrings(), loadContent()]);
    if (strings.status === 'rejected') throw strings.reason;
    i18n = createI18n({ strings: strings.value, storage });
    if (content.status === 'rejected') throw content.reason; // invalid content: fail fast, translated error
    // pending: the present that waits to be thrown onto the sleigh (done moment), or null.
    const app = { storage, i18n, content: content.value, now: () => currentDate(location), pending: null };
    const router = createRouter(root, {
      calendar: renderCalendar, mode: renderMode, day24: renderDay24Intro, workout: renderWorkoutStub, takeoff: renderTakeoff,
    }, app);
    app.go = (view) => {
      if (view.name !== 'calendar') app.pending = null; // leaving the calendar loads it anyway
      try { router.go(view); } catch (err) { showError(err, i18n); throw err; }
    };
    app.go({ name: 'calendar' });
    // Coming back to an open tab on a later day: redraw with the new date.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && router.view?.name === 'calendar') app.go(router.view);
    });
  } catch (err) {
    showError(err, i18n);
    throw err;
  }
}

start();
