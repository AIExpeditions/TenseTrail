/* TenseTrail teacher feedback proxy (Cloudflare Worker, free plan).
 The site is static, so it cannot keep an API key secret. This Worker keeps the Gemini key
 as a Cloudflare secret, builds the marking prompt itself (so it cannot be used as a general
 chatbot), and only answers requests from the site's own address.

 Settings (Cloudflare dashboard > Worker > Settings > Variables and Secrets):
   GEMINI_API_KEY   secret, required. A free key from https://aistudio.google.com/apikey
   GEMINI_MODEL     optional. Defaults to gemini-flash-latest (Google's alias for its newest Flash model).
   ALLOWED_ORIGINS  optional, comma separated. Defaults to https://aiexpeditions.github.io
 Optional binding: a Rate Limiting binding named RL (see worker/README.md) caps requests per learner.

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

export default {
  async fetch(req, env) {
    var allowed = (env.ALLOWED_ORIGINS || "https://aiexpeditions.github.io").split(",").map(function (s) { return s.trim(); });
    var origin = req.headers.get("Origin") || "";
    if (allowed.indexOf(origin) < 0) return new Response("Forbidden", { status: 403 });
    if (req.method == "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (req.method != "POST") return reply({ error: "method" }, 405, origin);
    if (!env.GEMINI_API_KEY) return reply({ error: "not_configured" }, 503, origin);

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

    var model = env.GEMINI_MODEL || "gemini-flash-latest";
    var g;
    try {
      g = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 8192 }
        })
      });
    } catch (e) { return reply({ error: "upstream" }, 502, origin); }
    if (g.status == 429) return reply({ error: "rate_limited" }, 429, origin);
    if (!g.ok) return reply({ error: "upstream", status: g.status }, 502, origin);

    var data = await g.json();
    var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
    var out = parts.filter(function (p) { return p.text && !p.thought; }).map(function (p) { return p.text; }).join("");
    try {
      out = JSON.parse(out.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ""));
    } catch (e) { return reply({ error: "invalid_json" }, 502, origin); }
    return reply(out, 200, origin);
  }
};
