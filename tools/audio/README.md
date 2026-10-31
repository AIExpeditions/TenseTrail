# Recorded audio (British studio voices)

All site audio is British English. Every fixed line the site speaks is recorded in advance with the Kokoro-82M model (Apache 2.0) and shipped as MP3 bundles in `docs/aud/` (not in git; published with the artifact). The player is `src/plus/audio.js`; anything not recorded falls back to live in-browser Kokoro, then the device voice.

Voices: women `bf_emma` (second woman `bf_isabella`), men `bm_george` (second man `bm_fable`). Key = `voice|text` (trimmed), id = `apH(key)` in `audio.js`.

## When you add or change any spoken content
1. Build the site: `python3 tools/build.py`, serve `docs/` on :8765.
2. Collect lines: `node tools/audio/crawl.mjs` (clicks every audio button on every route, records `voice|text` and a group per route into `groups.json`). Add new routes or data-driven lines there if a feature speaks text that no button exposes. Conversation Studio: `node tools/audio/cvjobs.mjs` (2 fixed seeds per tense, scene and level).
3. Make jobs for keys that have no MP3 yet, then `python3 tools/audio/gen.py jobs.json` (needs `pip install kokoro-onnx soundfile`, `kokoro-v1.0.onnx` from the kokoro-onnx GitHub release, `voices.npz` built from the kokoro-js voice .bin files, and ffmpeg). About 45 lines a minute on 4 CPU cores.
4. `node tools/audio/bundle.mjs docs/aud` writes `uk-<group>.N.mp3` bundles (about 1.2 MB each) and `ix.json`.
5. Publish the `aud/` files with the artifact (keep the `kokoro/` files for the live fallback).

Rules: British accent only; one man and one woman in every conversation, each with the matching voice; every Play button must use the shared Pause/Stop control (`apCtlOn` in `audio.js`).
