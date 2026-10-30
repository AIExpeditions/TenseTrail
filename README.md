# TenseTrail

An English grammar website for adult learners (A1 to C1), set in everyday Adelaide and Australian life.

## What's here

| Path | What it is |
|---|---|
| `src/index.html` | Page shell: head, navigation and include markers |
| `src/styles.css` | All styles, including dark mode and reduced motion |
| `src/app.js` | Routing, pages, Tense Studio, the lesson engine and audio |
| `src/lessons/*.js` | Lesson content for each open grammar area (one file per area) |
| `tools/build.py` | Joins everything into one self-contained file |
| `docs/index.html` | The built site. GitHub Pages serves this folder |
| `notes/` | Project brief and research on the lesson format |

## Build

```
python3 tools/build.py
```

This writes `docs/index.html`. Commit the built file with your source changes so the live site updates.

## Add a grammar area

1. Create `src/lessons/<area>.js` with three arrays: concepts, mini lessons and generator scenes (copy the shape of `modals.js`).
2. Add an `/*@include lessons/<area>.js*/` line next to the others in `src/app.js`.
3. Register the area in the `XA` table in `src/app.js`, and set `sx:1` on its entry in the grammar map (`GC`), with item names that match the lesson titles.
4. Build and open `docs/index.html` in a browser.

## Known limits

- Audio uses the browser's built-in voices, so quality depends on the device.
- Progress is saved in each learner's browser only.
- Lessons, answer keys and video picks were written and checked by Claude. A teacher should review them.
