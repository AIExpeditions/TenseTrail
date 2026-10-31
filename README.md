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
| `worker/` | Small Cloudflare Worker that keeps the Gemini key secret ([setup](worker/README.md)) |
| `tools/build.py` | Joins everything into one self-contained file, and builds the Worker |
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

- Audio has an accent choice (Australian, British, American) in the 🔊 menu. British and American can use studio voices: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0) running in the browser through [kokoro-js](https://www.npmjs.com/package/kokoro-js), about 90 MB downloaded once. Australian uses the best Australian voice on the device, because no free open model speaks Australian English yet.
- Progress is saved in each learner's browser only.
- Teacher feedback on writing and speaking uses Google Gemini's free tier through the Worker in `worker/`. It stays hidden until the Worker is deployed and its address is set in `src/plus/feedback.js`. See [worker/README.md](worker/README.md) for limits and privacy.
- Lessons, answer keys and video picks were written and checked by Claude. A teacher should review them.
