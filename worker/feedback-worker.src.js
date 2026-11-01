/* TenseTrail teacher feedback proxy (Cloudflare Worker, free plan).
 The site is static, so it cannot keep an API key secret. This Worker keeps the Gemini key
 as a Cloudflare secret, builds the marking prompt itself (so it cannot be used as a general
 chatbot), and only answers requests from the site's own address.

 Settings (Cloudflare dashboard > Worker > Settings > Variables and Secrets):
   GEMINI_API_KEY   secret, required. A free key from https://aistudio.google.com/apikey
   GEMINI_MODEL     optional. One model name, or several separated by commas to try in order.
                    Defaults to gemini-flash-lite-latest, gemini-flash-latest, gemini-3.5-flash (fastest first).
   ALLOWED_ORIGINS  optional, comma separated. Defaults to https://aiexpeditions.github.io
 Optional binding: a Rate Limiting binding named RL (see worker/README.md) caps requests per learner.
 Test page: open the Worker's address with ?check on the end in a browser. It sends one tiny
 request to each model and shows what Google answered (the key itself is never shown).

 Do not edit worker/feedback-worker.js by hand: tools/build.py writes it from this file and
 src/plus/rubric.js, which holds the rubric. */
/*@include plus/rubric.js*/
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
  return (env.GEMINI_MODEL || "gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
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
