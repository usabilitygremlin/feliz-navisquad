# Feliz Navisquad – product decisions (as of 15 Nov 2026)

Copied from the PRD, which lives in the owner's Claude project and isn't reachable from here. If something isn't covered here or in `prototype.html`, ask the owner.

## Basics
- Name / repo: **Feliz Navisquad** (`feliz-navisquad`). Final name must be fixed before the link is shared (1 Dec): renaming the repo breaks its GitHub Pages URL (no redirect).
- Audience: owner + 2–3 friends; public on GitHub Pages, shared on LinkedIn (link preview only).
- Content: bodyweight only; two modes per day: **Recovery** (stretching/yoga) and **Moderate**.
- Story: the elves train and load Santa's sleigh all December; on the 24th the boss (Santa) shows up for his once-a-year workout, the sleigh run.
- Deadline: live by 1 Dec 2026. Content authoring: Claude drafts, owner reviews (outside the repo).

## Calendar: "Load the sleigh"
- Main screen = Santa's red sleigh in the snow at night. Every finished day (1–23) = a numbered present loaded onto the sleigh; the pile grows through December. **Only 23 presents.**
- Pile: 23 slots in rows of 6–5–5–4–3, filled in **loading order** (newest on top), so a late-loaded missed present goes on top, never into a gap. Present colour = mode done that day (Moderate #D8783A, Recovery #8E84C4). Presents ~36 × 30 units.
- Missed day (past, not done): its present lies in the snow beside the sleigh (up to 3 rows of 7, 80 % size, slightly tilted), still tappable and loadable.
- Today: the present glows (moonlight, soft pulse) next to an elf; tapping it opens the mode choice.
- Re-opening: tap any loaded or missed present → mode choice. Re-doing a loaded day doesn't move it.
- Future days are NOT on the main screen: "Still in the workshop" shelf inside the menu (⋯): grid of locked days with date; tap → "Opens on …" toast; text when empty.
- **Done moment = throw the present onto the sleigh:** after the workout, back on the main screen, the present waits in its mode colour with a "Swipe up" hint; swipe up / flick throws it. It can't fail (any upward flick lands; a stronger flick = higher arc, ~0.9–1.2 s, small bounce, snow puff, elf hops). The workout already counts when it's finished; throwing is only the ritual (leaving the screen loads it anyway). Alternatives: tap the present, or Enter/Space. Reduced motion: no flight, it appears on the sleigh. Status: "Present 14 is ready · swipe it onto the sleigh" → "Present 14 loaded · see you tomorrow".
- **Day 24 is not a present but the ride:** a big bauble Santa stands in front of the sleigh, cut off at the bottom by the snow bank, waving; the sleigh pulses with a soft brass outline. Snow bank that day: "Santa is here" / "Der Weihnachtsmann ist da" and a brass button "Tap to ride" / "Tippen zum Losfahren" (no tagline). Button, Santa or sleigh (or Enter) starts the day-24 routine. When done, the sleigh takes off with Santa on board. Missed day 24 (e.g. opened on 27 Dec): Santa keeps waiting. After Christmas: "Merry Christmas · N of 23 presents loaded".
- All-24 finale: the full sleigh with Santa on board takes off up and to the right, then "24 of 24".
- Pre-December: countdown to door 1.
- Copy: tagline "Help the elves load the sleigh" / "Hilf den Elfen, den Schlitten zu beladen"; About text tells the story.

## Mode choice
- Question "How does your body feel today?" / "Wie fühlt sich dein Körper heute an?"; answers "Ready to move" / "Bereit für Bewegung" (Moderate) and "Rather stretch out" / "Lieber dehnen" (Recovery).
- Two-way segmented switch under one square (1:1) illustration. Nothing selected at first (neutral "waiting" elf); a pick changes picture and accent colour, shows routine name / exercises / 10 min, and reveals Start. Illustration hidden on small phones (≤ ~380 × 700). Neutral image area #DDE3EA.

## Workout
- Day view: ~5 swipeable cards (name, description, 2–4 stick-figure images); no timer.
- Exercise library of ~30–40 moves; 46 regular routines (23 days × 2 modes).
- Day 24: one special routine, "Santa's sleigh run" (story cards, easier/harder option per card, ~12–15 min).
- Celebration (day 24): **sleigh across the moon**: the loaded sleigh (reindeer leading, left → right) crosses a full moon while snow falls, then the message (~3 s). Short, skippable, replayable. Reduced motion: static.

## Illustrations
- Elves on days 1–23, one per mode: Moderate elf (scarf and hat band #D8783A), Recovery elf (#8E84C4). Santa only on day 24 (#B5473C / #6E2A27).
- Shared head and accessories: face, pointy ears, skin #E2B38F, fir-green hat #4E7A5F (dark #2F4A3A) with brass bell, mode-coloured scarf; Santa: red hat with pompom, beard, moustache, belt.
- **Bauble style** (round body, short rounded arms, no elbows): mode choice, sleigh scene, day-24 Santa, celebrations.
- **Stick figures**: exercise cards, 2–4 images per exercise, side views where needed.

## Behaviour
- Doors date-locked by device local time; past days stay open; dev override local only.
- Progress per device via localStorage; no accounts or backend. "Done" counts once per day (either mode). Stored in loading order, plus the mode per day.
- Language: DE + EN; default follows the browser; switch in the menu (⋯).
- Mobile-first. Plain HTML/CSS/JS + JSON content, no build step.
- Motion: constant light snowfall; denser for celebrations. Reduced motion: no snow, end states instantly.
- Tone: focus on showing up, consistency and how movement feels; never tie exercise to food, calories or "earning" anything.

## Visual language
- Goals: cozy, sporty/motivating, Scandinavian design.
- No title / app bar on the calendar; round menu button (⋯) top right → language, About, workshop shelf, health note. "Feliz Navisquad" in the browser tab, link preview and menu header.
- Context on the snow bank at the bottom: line 1 tagline, line 2 status. Text #1C2733 on snow (5.9:1).
- Background: night sky, dim hill and fir trees, light snowfall, ground #93A3B4, caps #B4C0CC. No moon on the main screen.
- Theme "winter night" (all pairs checked against WCAG AA):
  - Sky #1C2733, surfaces #26364A, moonlight #D3DCE6 (today, primary buttons, navigation), text #EEF1F3 / #A3B1BE / #8C9CAB / #C4CDD6.
  - Moderate clementine #EDB07F (text on it #2B1A0E, tint #F1E6DC); Recovery lavender #C5BFE0 (#221E36, tint #E6E3F0).
  - Done sage #8BA790; day 24 brass #C9B27C (text #2E2B22); celebration candle cream #E6D3A6; error #EF8F86 on #2E2F3B.
  - Red only for errors in the UI; Santa red is illustration.
- Typography: Figtree only, self-hosted. Icons: Lucide (outline, 2 px), inline SVG. Shapes: soft (16 px cards, pill buttons).

## Still open
- German label for Recovery mode ("Dehnachten" is a candidate).
- Empty upper sky on tall phones (scene sits at the bottom).
- Santa is small inside the take-off finale.
