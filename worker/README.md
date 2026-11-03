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
5. **Add the rate limit.** In the Worker, open *Settings* > *Bindings* > *Add* > *Rate limiting*, name it `RL`, limit 5, period 60 seconds, and save. The Worker refuses to mark without it, so nobody can use up your free allowance.
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

If learners see "Teacher feedback isn't set up for this task yet", a task's wording changed on the site after the Worker was last pasted. Run `python3 tools/build.py` and paste the new `feedback-worker.js` into Cloudflare.

## Change the rubric

Edit `src/plus/rubric.js`, then run `python3 tools/build.py`. That rebuilds the site and `feedback-worker.js`; paste the new Worker code into Cloudflare again. Do the same whenever you add a lesson or change the wording of a writing or speaking task. Building the Worker needs [Node.js](https://nodejs.org/), which reads the task list from the lesson files (`tools/tasks.mjs`).
