// Built by tools/build.py from worker/feedback-worker.src.js. Do not edit.
/* TenseTrail teacher feedback proxy (Cloudflare Worker, free plan).
 The site is static, so it cannot keep an API key secret. This Worker keeps the Gemini key
 as a Cloudflare secret, builds the marking prompt itself (so it cannot be used as a general
 chatbot), and only answers requests from the site's own address.

 Settings (Cloudflare dashboard > Worker > Settings > Variables and Secrets):
   GEMINI_API_KEY   secret, required. A free key from https://aistudio.google.com/apikey
   GEMINI_MODEL     optional. One model name, or several separated by commas to try in order.
                    Defaults to gemini-flash-latest, gemini-2.5-flash, gemini-flash-lite-latest.
   ALLOWED_ORIGINS  optional, comma separated. Defaults to https://aiexpeditions.github.io
 Optional binding: a Rate Limiting binding named RL (see worker/README.md) caps requests per learner.
 Test page: open the Worker's address with ?check on the end in a browser. It sends one tiny
 request to each model and shows what Google answered (the key itself is never shown).

 Do not edit worker/feedback-worker.js by hand: tools/build.py writes it from this file and
 src/plus/rubric.js, which holds the rubric. */
/* ---- The CEFR marking rubric (one source of truth) ----
 Used by the site for Claude feedback and copied into worker/feedback-worker.js by tools/build.py,
 so the Gemini proxy builds exactly the same prompt on the server. c = {task, topic, level, rule};
 sp = true for a speech transcript; t = the learner's text. Keep this plain ES5 with no site globals. */
function fbRubric(c,sp,t){
 return["You are an experienced English teacher (CELTA and DELTA qualified) and a trained Cambridge speaking and writing examiner in Adelaide, Australia. Mark a learner's "+(sp?"SPOKEN answer. It is an automatic speech-recognition transcript, so ignore punctuation, capital letters and obvious recognition errors, and do not comment on pronunciation, which you cannot hear":"WRITTEN answer")+".",
 "Context: "+(c.topic?"lesson topic \""+c.topic+"\"":"general task")+(c.level?", learner working at about "+c.level:"")+".",c.rule?"Grammar point of the lesson: "+c.rule:"","Task given to the learner: "+c.task,
 "Mark against these CEFR-based analytic criteria, giving each a CEFR level (A1, A2, B1, B2, C1 or C2):",
 "1. Task: Does it answer the task fully, with relevant ideas and enough detail?",
 "2. Grammatical accuracy: How many errors, and do they block meaning? A2 = frequent basic errors; B1 = good control of familiar structures, errors with complex ones; B2 = few errors that do not cause misunderstanding; C1 = consistently high accuracy.",
 "3. Grammatical range: Simple sentences only (A1-A2), some linking and subordination (B1), a range of complex structures (B2), flexible and natural use (C1+).",
 "4. Vocabulary: Basic everyday words (A2), enough to talk about familiar topics (B1), good range with some precise and less common words (B2), wide range with idiomatic and collocational control (C1+).",
 "5. "+(sp?"Coherence and fluency (from the transcript only: linking, organisation, fillers and restarts if visible)":"Organisation: Linking words, paragraphing, logical order")+".",
 "Strict rules:",
 "- Base every judgement only on the learner's text. Do not invent errors.",
 "- Each correction must copy the learner's words EXACTLY in \"quote\" (a short continuous phrase from their text, same spelling) and give the corrected phrase in \"fix\".",
 "- Australian English is correct: do not change Australian spelling or vocabulary (colour, organise, arvo, footy).",
 "- If the text has fewer than 25 words, set \"overall\" to null and explain that the sample is too short to estimate a level.",
 "- Be warm and encouraging, but honest. Write for a learner at this level: short, clear sentences.",
 "- Give at most 8 corrections, the most important first. Give exactly 2 strengths and 2 specific next steps.",
 "- \"rewrite\" is a natural improved version that keeps the learner's ideas, written about one level higher.",
 c.rule?"- In \"target\", say whether the learner used the lesson's grammar point and whether it was correct, quoting it.":"- Set \"target\" to null.",
 "Reply with JSON only, in exactly this shape:",
 '{"overall":"B1","confidence":"low|medium|high","summary":"one or two sentences","criteria":[{"name":"Task","level":"B1","note":"one sentence with evidence"},{"name":"Grammatical accuracy","level":"","note":""},{"name":"Grammatical range","level":"","note":""},{"name":"Vocabulary","level":"","note":""},{"name":"'+(sp?"Coherence and fluency":"Organisation")+'","level":"","note":""}],"target":{"used":true,"correct":true,"note":"","quotes":[""]},"corrections":[{"quote":"","fix":"","why":"","type":"grammar|vocabulary|spelling|punctuation|word order|style"}],"strengths":["",""],"next":["",""],"rewrite":""}',
 "Learner's "+(sp?"transcript":"text")+" (between the lines):","-----",t,"-----"].filter(Boolean).join("\n")}
var MAXT = 4000, MAXF = 1500;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function reply(body, status, origin) {
  var h = cors(origin);
  h["Content-Type"] = "application/json";
  return new Response(JSON.stringify(body), { status: status, headers: h });
}
function str(v, n) { return typeof v == "string" ? v.slice(0, n) : ""; }
function models(env) {
  return (env.GEMINI_MODEL || "gemini-flash-latest,gemini-2.5-flash,gemini-flash-lite-latest").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
}
/* One call to Gemini. Returns {ok, text} or {ok:false, status, msg}. */
async function gemini(env, model, prompt, think) {
  var cfg = { responseMimeType: "application/json", temperature: 0.3 };
  if (think) cfg.thinkingConfig = { thinkingBudget: 1024 };
  var r;
  try {
    r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: cfg }),
      signal: AbortSignal.timeout(40000)
    });
  } catch (e) { return { ok: false, status: 0, msg: e && e.name == "TimeoutError" ? "Google took longer than 40 seconds" : "Could not reach Google: " + (e && e.message) }; }
  var raw = await r.text(), data = {};
  try { data = JSON.parse(raw); } catch (e) {}
  if (!r.ok) return { ok: false, status: r.status, msg: ((data.error || {}).message || raw).slice(0, 300) };
  var c = (data.candidates || [])[0] || {};
  var parts = (c.content || {}).parts || [];
  var text = parts.filter(function (p) { return p.text && !p.thought; }).map(function (p) { return p.text; }).join("");
  if (!text) return { ok: false, status: 200, msg: "Empty answer (finishReason " + (c.finishReason || ((data.promptFeedback || {}).blockReason) || "unknown") + ")" };
  return { ok: true, text: text };
}
/* Try each model in turn; retry once without the thinking setting if a model rejects it. */
async function ask(env, prompt) {
  var last = null, list = models(env), t0 = Date.now();
  for (var i = 0; i < list.length; i++) {
    var g = await gemini(env, list[i], prompt, true);
    if (!g.ok && g.status == 400 && /think/i.test(g.msg)) g = await gemini(env, list[i], prompt, false);
    if (g.ok) { g.model = list[i]; return g; }
    last = g; last.model = list[i];
    if (g.status == 400 || g.status == 401 || g.status == 403) break; /* bad key or request: other models won't help */
    if (Date.now() - t0 > 45000) break; /* keep the learner's wait under about 90 seconds */
  }
  return last;
}
async function check(env) {
  var lines = ["TenseTrail feedback Worker check", "", "GEMINI_API_KEY: " + (env.GEMINI_API_KEY ? "set (" + env.GEMINI_API_KEY.length + " characters)" : "MISSING. Add it under Settings > Variables and Secrets as a Secret."), ""];
  if (env.GEMINI_API_KEY) for (var m of models(env)) {
    var t = Date.now(), g = await gemini(env, m, 'Reply with this JSON only: {"ok":true}', true);
    if (!g.ok && g.status == 400 && /think/i.test(g.msg)) g = await gemini(env, m, 'Reply with this JSON only: {"ok":true}', false);
    lines.push(m + ": " + (g.ok ? "OK" : "FAILED, HTTP " + g.status + ": " + g.msg) + " (" + ((Date.now() - t) / 1000).toFixed(1) + "s)");
  }
  lines.push("", "Allowed sites: " + (env.ALLOWED_ORIGINS || "https://aiexpeditions.github.io"));
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export default {
  async fetch(req, env) {
    var allowed = (env.ALLOWED_ORIGINS || "https://aiexpeditions.github.io").split(",").map(function (s) { return s.trim(); });
    var origin = req.headers.get("Origin") || "";
    if (req.method == "GET" && new URL(req.url).searchParams.has("check")) return check(env);
    if (allowed.indexOf(origin) < 0) return new Response("Forbidden", { status: 403 });
    if (req.method == "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (req.method != "POST") return reply({ error: "method" }, 405, origin);
    if (!env.GEMINI_API_KEY) return reply({ error: "upstream", detail: "GEMINI_API_KEY is not set on the Worker" }, 503, origin);

    if (env.RL) {
      var ip = req.headers.get("CF-Connecting-IP") || "anon";
      var rl = await env.RL.limit({ key: ip });
      if (!rl.success) return reply({ error: "rate_limited" }, 429, origin);
    }

    var b;
    try { b = await req.json(); } catch (e) { return reply({ error: "bad_request" }, 400, origin); }
    var text = str(b && b.text, MAXT + 1).trim();
    if (!text) return reply({ error: "bad_request" }, 400, origin);
    if (text.length > MAXT) return reply({ error: "too_long" }, 413, origin);
    var ctx = { task: str(b.task, MAXF), topic: str(b.topic, 200), level: str(b.level, 10), rule: str(b.rule, MAXF) };
    var prompt = fbRubric(ctx, !!b.speech, text);

    var g = await ask(env, prompt);
    if (!g.ok) {
      var code = g.status == 429 ? "rate_limited" : g.status == 0 && /longer/.test(g.msg) ? "timeout" : "upstream";
      return reply({ error: code, detail: g.model + ": HTTP " + g.status + " " + g.msg }, code == "rate_limited" ? 429 : 502, origin);
    }
    var out;
    try {
      out = JSON.parse(g.text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ""));
    } catch (e) { return reply({ error: "invalid_json", detail: g.model }, 502, origin); }
    return reply(out, 200, origin);
  }
};
