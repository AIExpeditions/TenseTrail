# TenseTrail

An English grammar website for adult learners (A1 to C1), set in everyday Adelaide and Australian life.

## What's here

| Path | What it is |
|---|---|
| `src/index.html` | Page shell: head, navigation and include markers |
| `src/styles.css` | All styles, including dark mode and reduced motion |
| `src/app.js` | Routing, pages, Tense Studio, the lesson engine and audio |
| `src/voices.js` | Accent choice and studio voices (Kokoro in a web worker) |
| `src/lessons/*.js` | Lesson content for each open grammar area (one file per area) |
| `src/plus/rubric.js` | The CEFR rubric used for AI teacher feedback |
| `src/plus/teachers.js` | Teacher hub: lesson finder, attendance register (saved in the browser, with CSV, print and backup files), tools |
| `src/plus/teachplan.js` | Teacher notes, lesson plans, review and marking sheets, learner result codes, problem reports |
| `worker/` | Small Cloudflare Worker that keeps the AI keys secret (Groq, Gemini, Workers AI) ([setup](worker/README.md)) |
| `tools/build.py` | Joins everything into one self-contained file, and builds the Worker |
| `tests/` | Worker tests and browser tests (main flows and an accessibility scan) |
| `docs/index.html` | The built site. GitHub Pages serves this folder |
| `notes/` | Project brief and research on the lesson format |

## Build

```
python3 tools/build.py
```

This writes `docs/index.html`. Commit the built file with your source changes so the live site updates. It also rebuilds `worker/feedback-worker.js`, which needs [Node.js](https://nodejs.org/) to read the list of writing and speaking tasks. If a task's wording changed, the Worker needs redeploying: the GitHub Action in `.github/workflows/deploy-worker.yml` does it on push once its Cloudflare secrets are set, or paste the new code by hand ([how](worker/README.md)).

## Test

```
npm ci
npx playwright install chromium
python3 tools/build.py
npm test
```

`npm test` runs two sets of tests, and both need the build first:

- `tests/worker.test.mjs` checks the feedback Worker with fake AI providers. It covers unknown tasks, other sites, the rate limit, the daily cap, falling back between providers, revise mode and the calibration endpoints.
- `tests/site.test.mjs` opens the built site in Chromium with a fake Worker. It covers practice (second tries, shuffling, fading, no-audio), the keyboard (tabs, the sentence builder, search, the menu), the placement test, AI feedback, and sideways scrolling on a phone. It also runs an [axe-core](https://github.com/dequelabs/axe-core) WCAG 2.2 AA scan of the main pages in light and dark, on desktop and on a phone, and fails on any serious or critical problem.

The same tests run on every pull request (`.github/workflows/test.yml`). The check also fails if `docs/index.html` or `worker/feedback-worker.js` was not rebuilt after a source change. Only the Worker tests need nothing installed: `node --test tests/worker.test.mjs`.

## Add a grammar area

1. Create `src/lessons/<area>.js` with three arrays: concepts, mini lessons and generator scenes (copy the shape of `modals.js`).
2. Add an `/*@include lessons/<area>.js*/` line next to the others in `src/app.js`.
3. Register the area in the `XA` table in `src/app.js`, and set `sx:1` on its entry in the grammar map (`GC`), with item names that match the lesson titles.
4. Build, run `npm test`, and open `docs/index.html` in a browser.

## Known limits

- Audio has an accent choice (Australian, British, American) in the 🔊 menu. British and American can use studio voices: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0) running in the browser through [kokoro-js](https://www.npmjs.com/package/kokoro-js), about 90 MB downloaded once. Australian uses the best Australian voice on the device, because no free open model speaks Australian English yet.
- Progress is saved in each learner's browser only.
- The attendance register is saved in each teacher's browser only. Teachers move it between computers with a backup file. Every record has an id and an update time, and deletions are kept as tombstones, so syncing through the Worker can be added later without changing the layout.
- Teacher feedback on writing and speaking uses free AI tiers (Groq first, then Google Gemini, then Cloudflare Workers AI) through the Worker in `worker/`. It stays hidden until the Worker is deployed and its address is set in `src/plus/feedback.js`. See [worker/README.md](worker/README.md) for limits and privacy.
- Lessons, answer keys and video picks were written and checked by Claude. A teacher should review them.
