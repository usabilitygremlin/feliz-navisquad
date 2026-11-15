// The ⋯ menu on the calendar (ported from the prototype's renderCalendar menu part):
// language, About, "Still in the workshop" shelf, health note.
// Its state lives in the calendar view: { menu: true, section: 'about' | 'workshop' | 'health' | null }.

import { lockedDays } from '../dates.js';
import { icon } from '../icons.js';
import { LANGS } from '../i18n.js';
import { hideToast, toast } from '../toast.js';

const SECTIONS = [
  { id: 'about', icon: 'info', label: 'about' },
  { id: 'workshop', icon: 'lock', label: 'workshop' },
  { id: 'health', icon: 'heart', label: 'health' },
];

function shelfHtml(i18n, now) {
  const days = lockedDays(now);
  if (!days.length) return `<p class="fn-menu__text">${i18n.t('workshopEmpty')}</p>`;
  return `<div class="shelf">${days.map((d) => `<button data-act="shelf" data-day="${d}"
      aria-label="${i18n.t('day', { day: d })}, ${i18n.t('opensOn', { date: i18n.formatDay(d) })}"><b>${d}</b>${i18n.t('shelfDate', { day: d })}</button>`).join('')}</div>`;
}

function sectionBody(id, i18n, now) {
  if (id === 'about') return `<p class="fn-menu__text">${i18n.t('aboutText')}</p>`;
  if (id === 'health') return `<p class="fn-menu__text">${i18n.t('healthText')}</p>`;
  return shelfHtml(i18n, now);
}

/** The menu panel for `view` (empty string when the menu is closed). */
export function menuHtml(view, i18n, now) {
  if (!view.menu) return '';
  const sections = SECTIONS.map(({ id, icon: ic, label }) => {
    const open = view.section === id;
    return `<button class="fn-menu__item" data-act="menu-section" data-section="${id}"
        aria-expanded="${open}" aria-controls="menu-${id}">${icon(ic)}${i18n.t(label)}</button>
      <div id="menu-${id}"${open ? '' : ' hidden'}>${open ? sectionBody(id, i18n, now) : ''}</div>`;
  }).join('');
  return `<div class="menu-wrap"><div class="fn-menu" id="menu" role="dialog" aria-labelledby="menu-title">
      <div class="fn-menu__head"><span id="menu-title">Feliz Navisquad</span>
        <button class="fn-link" data-act="menu-close" aria-label="${i18n.t('close')}">${icon('x')}</button></div>
      <div class="fn-menu__item fn-menu__item--static">${icon('globe')}<span id="menu-lang">${i18n.t('language')}</span>
        <span class="fn-toggle" role="group" aria-labelledby="menu-lang">${LANGS.map((l) => `<button data-act="lang" data-lang="${l}"
          lang="${l}" aria-pressed="${i18n.lang === l}">${l.toUpperCase()}</button>`).join('')}</span></div>
      ${sections}
    </div></div>`;
}

/**
 * Handles a click on a menu control `el` (any [data-act] element). Returns true if it was one.
 * Every change re-renders the calendar via app.go and says which element gets focus afterwards.
 */
export function handleMenuAction(el, view, app) {
  const act = el.dataset.act;
  const calendar = (extra) => app.go({ name: 'calendar', ...extra });
  switch (act) {
    case 'menu':
      calendar(view.menu ? { focus: '.fn-menu-btn' } : { menu: true, section: null, focus: '[data-act="menu-close"]' });
      return true;
    case 'menu-close':
      calendar({ focus: '.fn-menu-btn' });
      return true;
    case 'menu-section': {
      const id = el.dataset.section;
      calendar({ menu: true, section: view.section === id ? null : id, focus: `[data-section="${id}"]` });
      return true;
    }
    case 'lang':
      app.i18n.setLang(el.dataset.lang);
      hideToast();
      calendar({ menu: true, section: view.section, focus: `[data-lang="${el.dataset.lang}"]` });
      return true;
    case 'shelf': {
      const day = Number(el.dataset.day);
      toast('lock', app.i18n.t('opensOn', { date: app.i18n.formatDay(day) }));
      return true;
    }
    default:
      return false;
  }
}
