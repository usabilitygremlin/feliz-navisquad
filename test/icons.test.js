import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icon, ICON_NAMES } from '../js/icons.js';

test('every icon is a decorative 24×24 outline SVG with 2 px stroke', () => {
  assert.ok(ICON_NAMES.length > 0);
  for (const name of ICON_NAMES) {
    const svg = icon(name);
    assert.match(svg, /^<svg class="fn-icon" viewBox="0 0 24 24" /, name);
    assert.match(svg, /stroke-width="2"/, name);
    assert.match(svg, /aria-hidden="true"/, name);
    assert.match(svg, /<(path|circle|rect|line) /, name);
    assert.ok(svg.endsWith('</svg>'), name);
  }
});

test('the icons the prototype uses are all there', () => {
  for (const name of ['ellipsis', 'x', 'globe', 'info', 'lock', 'heart', 'flame', 'leaf', 'star',
    'check', 'arrow-left', 'arrow-right', 'circle-alert', 'snowflake', 'refresh-cw']) {
    assert.ok(ICON_NAMES.includes(name), name);
  }
});

test('an unknown icon name throws', () => {
  assert.throws(() => icon('nope'), /Unknown icon "nope"/);
});
