# Feliz Navisquad

A mobile-first Advent calendar (1–24 December 2026) with a 10-minute bodyweight workout each day, in German and English: help the elves load Santa's sleigh, one present per day. Plain HTML, CSS and JavaScript with JSON content: no build step, no dependencies. Hosted on GitHub Pages.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/app.html (the app) or http://localhost:8000 (the public placeholder). On localhost you can simulate a date with `?date=2026-12-24`.

## Tests

```sh
node --test
```

Needs Node 20+. Uses the built-in test runner, so there's nothing to install.

Product decisions, the approved prototype and design tokens are in [`docs/`](docs/). Contributor rules are in [`CLAUDE.md`](CLAUDE.md).
