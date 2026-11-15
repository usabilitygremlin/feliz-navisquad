// Short message at the bottom of the screen (ported from the prototype's toast).
// The live region (#toast in index.html) sits outside #screen, so it survives re-renders.

import { icon } from './icons.js';

const VISIBLE_MS = 3000; // --dur-toast-visible
let timer;

/** Shows `message` (plain text) with a Lucide icon for a few seconds and announces it. */
export function toast(iconName, message) {
  const el = document.getElementById('toast');
  if (!el) throw new Error('Toast region #toast is missing from index.html');
  el.innerHTML = `<div class="fn-toast">${icon(iconName)}<span></span></div>`;
  el.querySelector('span').textContent = message;
  el.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('show'), VISIBLE_MS);
}

/** Hides the toast right away (e.g. its text is in the old language after a switch). */
export function hideToast() {
  clearTimeout(timer);
  document.getElementById('toast')?.classList.remove('show');
}
