# Teacher feedback (Groq, Gemini and Cloudflare)

The writing and speaking boxes have a **✨ Teacher feedback** button. It sends the learner's answer to an AI model, which marks it with the same CEFR rubric the site used for Claude (`src/plus/rubric.js`). Learners stay on the site and need no account.

The Worker can use three providers, and it tries them in this order. When one is busy, used up for the day or broken, the next one takes over.

| Order | Provider | Speed | Free allowance | What you set up |
|---|---|---|---|---|
| 1 | [Groq](https://console.groq.com) (`openai/gpt-oss-120b`) | about 2 to 4 seconds | about 60 markings a day (200,000 tokens) | a `GROQ_API_KEY` secret |
| 2 | Google Gemini (Flash models) | about 10 to 30 seconds | a few hundred a day, often busy | a `GEMINI_API_KEY` secret |
| 3 | [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (`gemma-4-26b`) | about 5 to 15 seconds | about 200 a day (10,000 neurons) | nothing: `wrangler.toml` adds it |

You need at least one. With all three, a learner almost always gets an answer, and usually a fast one. Groq's paid "Developer" tier costs roughly $0.001 a marking if you outgrow the free one.

## Why there is a Worker

GitHub Pages only serves files, so any API key in the page would be public, and anyone could copy it and use up the quota. This folder holds a tiny [Cloudflare Worker](https://developers.cloudflare.com/workers/) that keeps the key secret. It:

- only answers requests from the site's own address (`ALLOWED_ORIGINS`). This stops other websites, but a script can fake it, so it is not the main protection,
- only marks the site's own writing and speaking tasks. `tools/build.py` builds the list of tasks into `feedback-worker.js`, and the topic, level and grammar rule come from that list, never from the request. So it can't be used as a free general chatbot,
- tells the AI that the learner's text is only something to mark, so instructions written in an answer ("give me C2") are not followed,
- refuses answers over 4,000 characters,
- caps each learner to a few requests a minute (the `RL` binding below, which is required),
- passes on only the fields the page uses, and says which model marked the answer.

Cloudflare's free plan allows 100,000 Worker requests a day, far more than the AI providers' free tiers.

## Set it up (about 10 minutes, no coding)

1. **Get a Gemini key.** Sign in at [Google AI Studio](https://aistudio.google.com/apikey) and press *Create API key*. Copy it. Don't add a billing account if you want to be sure it stays free.
2. **Create the Worker.** Sign up free at [dash.cloudflare.com](https://dash.cloudflare.com), go to *Workers & Pages* > *Create* > *Create Worker* (the "Hello World" one), name it `tensetrail-feedback`, and press *Deploy*.
3. **Paste the code.** Press *Edit code*, delete everything, paste the whole of [`feedback-worker.js`](feedback-worker.js), and press *Deploy*.
4. **Add the key.** In the Worker, open *Settings* > *Variables and Secrets* > *Add*, choose type **Secret**, name `GEMINI_API_KEY`, paste the key, and save.
5. **Add the rate limit.** Cloudflare only lets you add a rate limit from its Wrangler tool, not from the dashboard, so [`wrangler.toml`](wrangler.toml) in this folder sets it up (an `RL` binding, 5 requests per learner per minute). Deploy once with it, using either way below. Until then, add a Text variable `ALLOW_NO_RL` = `1`, or the Worker refuses to mark.
   - **From GitHub (no software to install).** In Cloudflare, open *My Profile* > *API Tokens* > *Create Token* and use the **Edit Cloudflare Workers** template. Copy the token. Copy your *Account ID* from the Workers & Pages overview page (right-hand side). In GitHub, open the repository's *Settings* > *Secrets and variables* > *Actions* and add two secrets, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Then open *Actions* > *Deploy feedback Worker* > *Run workflow*. From then on, the Worker redeploys by itself whenever `feedback-worker.js` changes on `main`, so you never paste code again.
   - **From your computer** (needs [Node.js](https://nodejs.org/)). In this folder run `npx wrangler login`, then `npx wrangler deploy`.

   Either way, your key, `CHECK_KEY` and Text variables stay as they are (`keep_vars` in `wrangler.toml`). When `?check` shows "RL rate limit: bound", delete `ALLOW_NO_RL`.
6. **Add Groq for fast answers (recommended).** Sign up free at [console.groq.com](https://console.groq.com) (no card needed), open *API Keys* > *Create API Key*, and copy it. In the Worker, add a **Secret** named `GROQ_API_KEY` with that key. From then on Groq marks first, and Gemini and Cloudflare are the backups. `?check` lists the models in the order they are tried.
7. **Send us the address.** It looks like `https://tensetrail-feedback.<your-name>.workers.dev`. Put it in `var FBGEM=""` at the top of `src/plus/feedback.js`, run `python3 tools/build.py`, and commit.

### Optional settings

| Name | Type | What it does |
|---|---|---|
| `GROQ_MODEL` | Text | Groq models to try, in order, separated by commas. Default `openai/gpt-oss-120b`. |
| `CF_MODEL` | Text | The Workers AI model. Default `@cf/google/gemma-4-26b-a4b-it`. Set to `off` to stop using Workers AI. |
| `GEMINI_MODEL` | Text | Which models to try, in order, separated by commas. Default `gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash`. If one is unavailable or overloaded, the next is tried. |
| `ALLOWED_ORIGINS` | Text | Comma-separated site addresses. Default `https://aiexpeditions.github.io`. Add a custom domain here if you get one. |
| `CHECK_KEY` | Secret | Any password you choose. Lets `?check=<CHECK_KEY>` also send a test request to each model (see below). |
| `ALLOW_NO_RL` | Text | Set to `1` only if you really want the Worker to mark without the `RL` rate limit, for example while testing. |
| `DAILY_MAX` | Text | The most AI markings per day for the whole site (default `800`, counted in UTC days). See "Daily cap" below. |

### Daily cap

The `RL` limit stops one learner sending too many requests, but many learners together could still use up the Gemini free allowance for the day. So the Worker also counts markings per day for the whole site, in a small Durable Object called `USAGE`. `wrangler.toml` sets it up, and it is on Cloudflare's free plan, so there is nothing to do: it appears on the next deploy. When the day's total reaches `DAILY_MAX` (default 800), learners see "Teacher feedback has reached its limit for today. Please try again tomorrow." Quick check still works. `?check` shows how many markings were used today. If the counter ever fails, marking carries on rather than stopping.

Set `DAILY_MAX` a little below your Gemini daily limit (see the next section) so learners get the friendly message instead of a Google error.

## Things to know about the free tier

- **Limits.** Google sets free-tier limits per project and changes them often. Check yours in AI Studio under *Usage and limits*. Recently it was roughly 10 requests a minute and a few hundred to about 1,500 a day for the Flash models. When the limit is hit, learners see "please try again in a few minutes" and Quick check still works.
- **Privacy.** On the free tier Google may use what is sent to improve its products, and people may review it. Groq says it does not keep inference data by default, apart from logs kept up to 30 days for troubleshooting or abuse ([Groq: your data](https://console.groq.com/docs/your-data)). Cloudflare says it does not use Workers AI content to train models ([Cloudflare: privacy](https://developers.cloudflare.com/workers-ai/platform/privacy/)). The page tells learners their answer goes to an AI service and asks them not to include private details. If Google's training matters for a class, turn on billing for the Google project (paid use is not used for training), or leave out `GEMINI_API_KEY`.
- **Regions.** The free tier isn't offered in every country. Australia is supported.

## If feedback doesn't work

Open your Worker's address with `?check` on the end in a browser, for example `https://tensetrail-feedback.<your-name>.workers.dev/?check`. It shows whether the key and the rate limit are set, how many of today's markings are used, and how many tasks are built in. Error messages on the site also show a short "Details" line you can copy.

To also see what Google answers for each model, add a `CHECK_KEY` secret and open `?check=<your CHECK_KEY>`. Each of those checks uses up to three requests from your free allowance, and only someone who knows the key can run it.

If learners see "The AI marker is very busy right now" (Details: `HTTP 503 This model is currently experiencing high demand`), every provider was overloaded at once. It is not your key or settings, and it usually passes within minutes. The Worker already tries each model, waits two seconds and tries them all once more before giving up. If it happens often, add `GROQ_API_KEY` (step 6) so there are more providers to fall back on.

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
