// Built by tools/build.py from worker/feedback-worker.src.js. Do not edit.
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
