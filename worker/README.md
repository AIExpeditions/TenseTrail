# Teacher feedback with Gemini

The writing and speaking boxes have a **✨ Teacher feedback** button. It sends the learner's answer to Google's Gemini, which marks it with the same CEFR rubric the site used for Claude (`src/plus/rubric.js`). Learners stay on the site and need no account.

## Why there is a Worker

GitHub Pages only serves files, so any API key in the page would be public, and anyone could copy it and use up the quota. This folder holds a tiny [Cloudflare Worker](https://developers.cloudflare.com/workers/) that keeps the key secret. It:

- only answers requests from the site's own address (`ALLOWED_ORIGINS`),
- builds the marking prompt itself, so it can't be used as a free general chatbot,
- refuses answers over 4,000 characters,
- can cap each learner to a few requests a minute (optional `RL` binding below).

Cloudflare's free plan allows 100,000 Worker requests a day, far more than Gemini's free tier.

## Set it up (about 10 minutes, no coding)

1. **Get a Gemini key.** Sign in at [Google AI Studio](https://aistudio.google.com/apikey) and press *Create API key*. Copy it. Don't add a billing account if you want to be sure it stays free.
2. **Create the Worker.** Sign up free at [dash.cloudflare.com](https://dash.cloudflare.com), go to *Workers & Pages* > *Create* > *Create Worker* (the "Hello World" one), name it `tensetrail-feedback`, and press *Deploy*.
3. **Paste the code.** Press *Edit code*, delete everything, paste the whole of [`feedback-worker.js`](feedback-worker.js), and press *Deploy*.
4. **Add the key.** In the Worker, open *Settings* > *Variables and Secrets* > *Add*, choose type **Secret**, name `GEMINI_API_KEY`, paste the key, and save.
5. **Send us the address.** It looks like `https://tensetrail-feedback.<your-name>.workers.dev`. Put it in `var FBGEM=""` at the top of `src/plus/feedback.js`, run `python3 tools/build.py`, and commit.

### Optional settings

| Name | Type | What it does |
|---|---|---|
| `GEMINI_MODEL` | Text | Which models to try, in order, separated by commas. Default `gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash`. If one is unavailable or overloaded, the next is tried. |
| `ALLOWED_ORIGINS` | Text | Comma-separated site addresses. Default `https://aiexpeditions.github.io`. Add a custom domain here if you get one. |
| `RL` | Rate limiting binding | Caps requests per learner. In *Settings* > *Bindings* > *Add* > *Rate limiting*, name it `RL`, limit 5, period 60 seconds. |

## Things to know about the free tier

- **Limits.** Google sets free-tier limits per project and changes them often. Check yours in AI Studio under *Usage and limits*. Recently it was roughly 10 requests a minute and a few hundred to about 1,500 a day for the Flash models. When the limit is hit, learners see "please try again in a few minutes" and Quick check still works.
- **Privacy.** On the free tier Google may use what is sent to improve its products, and people may review it. The page tells learners this and asks them not to include private details. If that matters for a class, turn on billing for the Google project (paid use is not used for training), and the cost for short answers is small.
- **Regions.** The free tier isn't offered in every country. Australia is supported.

## If feedback doesn't work

Open your Worker's address with `?check` on the end in a browser, for example `https://tensetrail-feedback.<your-name>.workers.dev/?check`. It shows whether the key is set and what Google answers for each model, with how long each took. Error messages on the site also show a short "Details" line you can copy.

Each check uses up to three requests from your free allowance, so only open it when you need it.

## Change the rubric

Edit `src/plus/rubric.js`, then run `python3 tools/build.py`. That rebuilds the site and `feedback-worker.js`; paste the new Worker code into Cloudflare again.
