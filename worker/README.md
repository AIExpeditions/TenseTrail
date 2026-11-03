# Teacher feedback with Gemini

The writing and speaking boxes have a **✨ Teacher feedback** button. It sends the learner's answer to Google's Gemini, which marks it with the same CEFR rubric the site used for Claude (`src/plus/rubric.js`). Learners stay on the site and need no account.

## Why there is a Worker

GitHub Pages only serves files, so any API key in the page would be public, and anyone could copy it and use up the quota. This folder holds a tiny [Cloudflare Worker](https://developers.cloudflare.com/workers/) that keeps the key secret. It:

- only answers requests from the site's own address (`ALLOWED_ORIGINS`). This stops other websites, but a script can fake it, so it is not the main protection,
- only marks the site's own writing and speaking tasks. `tools/build.py` builds the list of tasks into `feedback-worker.js`, and the topic, level and grammar rule come from that list, never from the request. So it can't be used as a free general chatbot,
- tells the AI that the learner's text is only something to mark, so instructions written in an answer ("give me C2") are not followed,
- refuses answers over 4,000 characters,
- caps each learner to a few requests a minute (the `RL` binding below, which is required),
- passes on only the fields the page uses, and says which model marked the answer.

Cloudflare's free plan allows 100,000 Worker requests a day, far more than Gemini's free tier.

## Set it up (about 10 minutes, no coding)

1. **Get a Gemini key.** Sign in at [Google AI Studio](https://aistudio.google.com/apikey) and press *Create API key*. Copy it. Don't add a billing account if you want to be sure it stays free.
2. **Create the Worker.** Sign up free at [dash.cloudflare.com](https://dash.cloudflare.com), go to *Workers & Pages* > *Create* > *Create Worker* (the "Hello World" one), name it `tensetrail-feedback`, and press *Deploy*.
3. **Paste the code.** Press *Edit code*, delete everything, paste the whole of [`feedback-worker.js`](feedback-worker.js), and press *Deploy*.
4. **Add the key.** In the Worker, open *Settings* > *Variables and Secrets* > *Add*, choose type **Secret**, name `GEMINI_API_KEY`, paste the key, and save.
5. **Add the rate limit.** Cloudflare only lets you add a rate limit from its Wrangler tool, not from the dashboard, so [`wrangler.toml`](wrangler.toml) in this folder sets it up (an `RL` binding, 5 requests per learner per minute). Deploy once with it, using either way below. Until then, add a Text variable `ALLOW_NO_RL` = `1`, or the Worker refuses to mark.
   - **From GitHub (no software to install).** In Cloudflare, open *My Profile* > *API Tokens* > *Create Token* and use the **Edit Cloudflare Workers** template. Copy the token. Copy your *Account ID* from the Workers & Pages overview page (right-hand side). In GitHub, open the repository's *Settings* > *Secrets and variables* > *Actions* and add two secrets, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Then open *Actions* > *Deploy feedback Worker* > *Run workflow*. From then on, the Worker redeploys by itself whenever `feedback-worker.js` changes on `main`, so you never paste code again.
   - **From your computer** (needs [Node.js](https://nodejs.org/)). In this folder run `npx wrangler login`, then `npx wrangler deploy`.

   Either way, your key, `CHECK_KEY` and Text variables stay as they are (`keep_vars` in `wrangler.toml`). When `?check` shows "RL rate limit: bound", delete `ALLOW_NO_RL`.
6. **Send us the address.** It looks like `https://tensetrail-feedback.<your-name>.workers.dev`. Put it in `var FBGEM=""` at the top of `src/plus/feedback.js`, run `python3 tools/build.py`, and commit.

### Optional settings

| Name | Type | What it does |
|---|---|---|
| `GEMINI_MODEL` | Text | Which models to try, in order, separated by commas. Default `gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash`. If one is unavailable or overloaded, the next is tried. |
| `ALLOWED_ORIGINS` | Text | Comma-separated site addresses. Default `https://aiexpeditions.github.io`. Add a custom domain here if you get one. |
| `CHECK_KEY` | Secret | Any password you choose. Lets `?check=<CHECK_KEY>` also send a test request to each model (see below). |
| `ALLOW_NO_RL` | Text | Set to `1` only if you really want the Worker to mark without the `RL` rate limit, for example while testing. |

## Things to know about the free tier

- **Limits.** Google sets free-tier limits per project and changes them often. Check yours in AI Studio under *Usage and limits*. Recently it was roughly 10 requests a minute and a few hundred to about 1,500 a day for the Flash models. When the limit is hit, learners see "please try again in a few minutes" and Quick check still works.
- **Privacy.** On the free tier Google may use what is sent to improve its products, and people may review it. The page tells learners this and asks them not to include private details. If that matters for a class, turn on billing for the Google project (paid use is not used for training), and the cost for short answers is small.
- **Regions.** The free tier isn't offered in every country. Australia is supported.

## If feedback doesn't work

Open your Worker's address with `?check` on the end in a browser, for example `https://tensetrail-feedback.<your-name>.workers.dev/?check`. It shows whether the key and the rate limit are set, and how many tasks are built in. Error messages on the site also show a short "Details" line you can copy.

To also see what Google answers for each model, add a `CHECK_KEY` secret and open `?check=<your CHECK_KEY>`. Each of those checks uses up to three requests from your free allowance, and only someone who knows the key can run it.

If learners see "Teacher feedback isn't set up for this task yet", a task's wording changed on the site after the Worker was last deployed. Run `python3 tools/build.py` and commit; the GitHub Action redeploys it (or paste the new `feedback-worker.js` into Cloudflare if you haven't set the Action up).

## Calibrating the placement test (optional)

The placement test's question difficulties are expert estimates. Real answers show which questions are actually harder. Learners can share their answers anonymously from the result page: only the question numbers, right or wrong, and their estimated score. No name, writing, IP address or device details are kept, and records expire after two years. It is off until you switch it on:

1. Create the storage: in this folder run `npx wrangler kv namespace create CAL`, then in [`wrangler.toml`](wrangler.toml) remove the `#` from the three `kv_namespaces` lines and paste the id. Deploy (commit, and the Action does it). `?check` then shows "Calibration storage (CAL): bound".
2. Switch the box on: set `LVCAL=true` in `src/plus/levelcal.js`, run `python3 tools/build.py`, and commit.
3. When a few hundred learners have shared, download the answers: open `https://<your worker>/?export=<your CHECK_KEY>` and save the page as `answers.json`. If it ends with a `cursor` that isn't `null`, add `&cursor=<that value>` for the next page and save each page (an array of pages works too).
4. Run `node tools/calibrate.mjs answers.json`. It writes the measured difficulty of every question with at least 30 answers into `src/plus/levelcal.js` and lists questions whose measured level differs from their label. Build and commit.

Mention the sharing in your privacy notice if you have one. Changing the question bank (adding or removing items) starts a new set, because older answers refer to different question numbers.

## Change the rubric

Edit `src/plus/rubric.js`, then run `python3 tools/build.py`. That rebuilds the site and `feedback-worker.js`; commit, and the Action redeploys the Worker (without the Action, paste the new code into Cloudflare again). Do the same whenever you add a lesson or change the wording of a writing or speaking task. Building the Worker needs [Node.js](https://nodejs.org/), which reads the task list from the lesson files (`tools/tasks.mjs`).
