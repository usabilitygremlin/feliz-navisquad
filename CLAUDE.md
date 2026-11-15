# Feliz Navisquad

A mobile-first Advent calendar with a 10-minute bodyweight workout every day (1–24 December 2026), in German and English. Hosted on GitHub Pages and shared on LinkedIn. **Must be live by 1 December 2026.**

## Sources of truth (read before you start an issue)

- `docs/decisions.md`: the product decisions (PRD summary). If code and this file disagree, the file wins. If the file is unclear, ask; don't guess.
- `docs/prototype.html`: the approved clickable prototype, a single throwaway file. **Port from it; don't reinvent.** Layout numbers, colours, copy, animations and edge cases (missed days, day 24, reduced motion) are already decided there. Open it in a browser; its "Prototype controls" simulate dates and progress.
- `docs/tokens.json`: design tokens (colours, type, spacing, radii, shadows). Every colour in the UI comes from here.

## Stack rules

- Plain HTML, CSS and JavaScript (ES modules). **No build step, no framework, no npm runtime dependencies.**
- Content is JSON in `content/`. Illustrations are SVG files in `img/`.
- Fonts: Figtree, self-hosted (woff2) in `fonts/`. Icons: Lucide, as inline SVG (copy the paths you need into `js/icons.js`).
- Local dev: `python3 -m http.server 8000` in the repo root, then open http://localhost:8000.
- Tests: `node --test` (Node 20+, built-in runner, no dependencies) for pure logic in `js/` (dates, storage, layout, content validation). DOM code is checked manually in the browser.
- `scripts/validate-content.mjs` must pass before any content change is merged.

## Target structure

```
index.html            single page, all screens rendered by JS (app.html until the calendar issue swaps it in)
css/                  tokens.css (from docs/tokens.json), base.css, one file per screen
js/                   main.js, router, dates.js, storage.js, i18n.js, screens/*.js, icons.js
content/              exercises.json, routines.json, strings.de.json, strings.en.json
img/                  exercises/*.svg, elves/*.svg, santa/*.svg, og-image.png
fonts/                Figtree woff2 + OFL licence
scripts/              validate-content.mjs
docs/                 decisions.md, prototype.html, tokens.json (not part of the site)
```

## Working rules

- Simple beats complex. Make surgical changes: touch only what the issue needs.
- Fail fast: throw a clear error on invalid content or a broken precondition instead of rendering something half-right.
- Fix root causes, not symptoms.
- One issue = one branch = one PR. The PR description contains `Closes #<n>` and ticks off the issue's acceptance criteria.
- Every user-facing string lives in `content/strings.*.json`, in **both** DE and EN. Check every German string on a 360 px wide viewport; German is the longest.
- Dates use the device's local time. Day *n* opens at 00:00 local time on *n* December 2026. Past days stay open.
- Dev date override: `?date=2026-12-24` works **only on localhost / 127.0.0.1**, never on the live site.
- Storage: `localStorage`, keys prefixed `fn-` (`fn-done`: day numbers in loading order; `fn-modes`: mode per day; `fn-lang`). If storage is unavailable, the app still works and shows the note from the prototype.
- Accessibility: WCAG AA contrast (tokens are already checked), visible focus, every gesture has a tap/keyboard alternative, `prefers-reduced-motion` removes snowfall and flights (end states instantly).
- Tone (all copy): about showing up, consistency and how movement feels. **Never** tie exercise to food, calories or "earning" anything.
- Red (#EF8F86) is only for errors in the UI. Santa red (#B5473C) is illustration only.
- Don't invent exercises, routines or illustrations. Content is authored outside the repo and delivered as files; until then use the day-1 content ported from the prototype.
