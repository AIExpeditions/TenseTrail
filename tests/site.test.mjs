/* Browser tests: run with `npm run test:site` (or `npm test`). They open the built docs/index.html in Chromium
   (Playwright), so run `python3 tools/build.py` first. The AI feedback Worker is faked, and every request that
   leaves the local server is blocked, so the tests need no network. On a new machine: `npx playwright install chromium`. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DOCS = path.join(ROOT, "docs");
const AXE = path.join(ROOT, "node_modules/axe-core/axe.min.js");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".onnx": "application/octet-stream" };

let server, base, browser;
before(async () => {
  server = http.createServer(async (req, res) => {
    const p = path.normalize(path.join(DOCS, decodeURIComponent(new URL(req.url, "http://x").pathname)));
    if (!p.startsWith(DOCS)) { res.writeHead(403).end(); return; }
    try {
      const f = p.endsWith(path.sep) ? path.join(p, "index.html") : p;
      const body = await readFile(f);
      res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = "http://127.0.0.1:" + server.address().port + "/";
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

/* The fake Worker. `mode` picks the answer: "ok" (normal marking), or an error code such as "daily_limit". */
const MARK = { overall: "A2", confidence: "medium", summary: "Good start.", criteria: [], target: null,
  corrections: [
    { quote: "He go", hint: "Look at the verb ending for he.", fix: "He goes", why: "third person -s", type: "grammar", cause: "agreement", area: "tenses" },
    { quote: "I can cooking", hint: "What comes after can?", fix: "I can cook", why: "can + base verb", type: "grammar", cause: "verb form", area: "modals" }],
  strengths: ["a", "b"], next: ["c", "d"], rewrite: "He goes.", model: "fake" };

async function open(hash = "#/", { width = 1200, height = 900, theme = "light", worker = "ok", motion = "reduce" } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: motion });
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on("pageerror", (e) => errors.push(e.message));
  /* Block everything that is not our server (fonts, CDNs), then fake the Worker. Later routes win. */
  await page.route((u) => !u.href.startsWith(base), (r) => r.abort());
  await page.route("**/tensetrail-feedback.**", async (r) => {
    const body = r.request().postData() ? JSON.parse(r.request().postData()) : {};
    sent.push({ url: r.request().url(), body });
    const h = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
    if (r.request().method() == "OPTIONS") return r.fulfill({ status: 204, headers: { ...h, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST" } });
    if (worker != "ok") return r.fulfill({ status: 429, headers: h, body: JSON.stringify({ error: worker }) });
    const out = r.request().url().includes("?cal") ? { ok: true }
      : body.mode == "revise" ? { items: [{ n: 1, status: "fixed", note: "Good." }, { n: 2, status: "not yet", note: "Look again." }], summary: "Nice work", model: "fake" }
      : MARK;
    return r.fulfill({ status: 200, headers: h, body: JSON.stringify(out) });
  });
  await page.goto(base + hash);
  await page.waitForFunction(() => typeof window.$ == "function" && document.title.length > 0);
  await page.waitForTimeout(400);
  const nav = async (h) => { await page.evaluate((h) => (location.hash = h), h); await page.waitForTimeout(500); };
  const done = async () => { assert.deepEqual(errors, [], "no script errors"); await ctx.close(); };
  return { page, errors, sent, nav, done };
}

/* ---- Pages load ---- */

const PAGES = ["#/", "#/worksheets", "#/worksheets/grammar", "#/worksheets/grammar/modals", "#/worksheets/grammar/modals/0",
  "#/worksheets/grammar/conditionals/6", "#/worksheets/grammar/studio/3", "#/level", "#/worksheets/reading", "#/worksheets/reading/2",
  "#/worksheets/speaking/2", "#/worksheets/writing/4", "#/worksheets/listening/1", "#/path", "#/about"];

test("every main page renders with a title, a heading and no script errors", async () => {
  const s = await open();
  for (const h of PAGES) {
    await s.nav(h);
    const r = await s.page.evaluate(() => ({ t: document.title, h1: !!document.querySelector("h1"), main: document.querySelector("main, #app")?.textContent.length || 0 }));
    assert.ok(r.t.includes("TenseTrail"), h + " title");
    assert.ok(r.h1, h + " has an h1");
    assert.ok(r.main > 200, h + " has content");
  }
  await s.done();
});

/* ---- Practice ---- */

test("practice: a miss gives a hint and a second try, which does not count as first-try right", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  await page.click("#sxp .btn");
  await page.evaluate(() => { SXS.i = SXS.items.findIndex((x) => x.t == "mc"); sxShow(); });
  const first = await page.evaluate(() => { const it = SXS.items[SXS.i]; return { ans: it.d[2], order: $$(".sxo").map((b) => +b.dataset.j) }; });
  const wrong = first.order.find((j) => j != first.ans);
  await page.click('.sxo[data-j="' + wrong + '"]');
  const miss = await page.evaluate(() => ({ lock: SXS.lock, disabled: $$(".sxo").filter((b) => b.disabled).length, fb: $("#sxf").textContent }));
  assert.equal(miss.lock, 0, "still open for a second try");
  assert.equal(miss.disabled, 1, "only the wrong choice is disabled");
  assert.ok(miss.fb.length > 10, "a hint is shown");
  await page.click('.sxo[data-j="' + first.ans + '"]');
  const res = await page.evaluate(() => SXS.res[SXS.res.length - 1]);
  assert.equal(res.ok, false, "second try is not first-try right");
  assert.equal(res.t2, true);
  await page.click(".sxrw .lnk");
  assert.ok(await page.evaluate(() => !$("#sxrule").hidden && $("#sxrule").textContent.length > 20), "rule panel opens");
  await done();
});

test("practice: answer positions are shuffled", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  const seen = await page.evaluate(() => { const s = {}; for (let n = 0; n < 20; n++) { sxStart(0); SXS.items.forEach((it, i) => { if (it.t == "mc" && i == 0) s[$$(".sxo").findIndex((b) => +b.dataset.j == it.d[2])] = 1; }); } return Object.keys(s).length; });
  assert.ok(seen >= 2, "the right answer moves between starts");
  await done();
});

test("practice: typed answers also get a second try", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  const right = await page.evaluate(() => { sxStart(0); SXS.i = SXS.items.findIndex((x) => x.t == "gp"); sxShow(); return SXS.items[SXS.i].d[1][0]; });
  await page.fill("#sxin", "zzz"); await page.keyboard.press("Enter");
  assert.ok(await page.evaluate(() => !$("#sxin").disabled), "input stays open after a miss");
  await page.fill("#sxin", right); await page.keyboard.press("Enter");
  assert.ok(await page.evaluate(() => SXS.lock == 1));
  await done();
});

test("practice: unit checks give no second try", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  const r = await page.evaluate(() => { sxRun(sxItemsFor(0), "#sxp", "u"); const i = SXS.items.findIndex((x) => x.t == "mc"); SXS.i = i; sxShow(); const it = SXS.items[i]; sxMc((it.d[2] + 1) % it.d[1].length); return SXS.lock; });
  assert.equal(r, 1);
  await done();
});

test("practice: B2+ lessons fade support (tutorial closed, fewer starters, typed items first)", async () => {
  const { page, nav, done } = await open("#/worksheets/grammar/modals");
  const k = await page.evaluate(() => { sxUse("modals"); return SX.findIndex((x) => x.lv >= "B2"); });
  assert.ok(k > 0);
  await nav("#/worksheets/grammar/modals/" + k);
  const lo = await page.evaluate(() => sxItemsFor(0).slice(0, 4).map((x) => x.t).join());
  const r = await page.evaluate((k) => ({ tut: !!$(".sxtut") && !$(".sxtut").open, first: sxItemsFor(k).slice(0, 4).map((x) => x.t).join() }), k);
  assert.ok(r.tut, "worked example starts closed");
  assert.notEqual(r.first, lo, "item order differs from A1");
  await done();
});

test("practice: every lesson in every area builds enough items, with unseen sentences", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  const bad = await page.evaluate(() => { const bad = []; Object.keys(XA).forEach((a) => { sxUse(a); SX.forEach((c, k) => { const it = sxItemsFor(k); if (!c.px || it.length < 17) bad.push(a + ":" + k + ":" + it.length); }); }); sxUse("modals"); return bad; });
  assert.deepEqual(bad, []);
  await done();
});

test("practice: no-audio option swaps listening items and a listening item can be skipped", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  await page.evaluate(() => sxNoAuSet(true));
  assert.ok(await page.evaluate(() => !sxItemsFor(0).some((x) => x.t == "dc")), "no dictation without audio");
  await page.evaluate(() => sxNoAuSet(false));
  const r = await page.evaluate(() => { sxStart(0); const n = SXS.items.length; SXS.i = SXS.items.findIndex((x) => x.t == "dc"); if (SXS.i < 0) return "none"; sxShow(); sxSkipAu(); return [n, SXS.items.length]; });
  assert.notEqual(r, "none");
  assert.ok(r[1] <= r[0]);
  await done();
});

test("practice: spaced review runs on items that are due", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals");
  const n = await page.evaluate(() => { const st = sxLoad(); st.c[0] = { box: 1, due: 0, best: 10, n: 20 }; st.c[5] = { box: 1, due: 0, best: 10, n: 20 }; sxSave(st); sxRevStart(); return SXS.items.length; });
  assert.ok(n > 0);
  await done();
});

test("practice: the end screen offers a retry after a low score", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0", { width: 390, height: 844 });
  await page.click("#sxp .btn");
  await page.evaluate(() => { SXS.ok = 5; SXS.i = SXS.items.length; sxShow(); });
  assert.match(await page.evaluate(() => $("#sxp").textContent), /again|retry|try/i);
  await done();
});

/* ---- Keyboard ---- */

test("keyboard: lesson tabs move with the arrow keys", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  await page.focus("#sxtb0"); await page.keyboard.press("ArrowRight");
  const r = await page.evaluate(() => ({ focus: document.activeElement.id, sel: $("#sxtb1").getAttribute("aria-selected"), panel: !$("#sxpn1").hidden }));
  assert.deepEqual(r, { focus: "sxtb1", sel: "true", panel: true });
  await done();
});

test("keyboard: the sentence builder works without a mouse", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0");
  await page.click("#sxp .btn");
  await page.evaluate(() => { SXS.i = SXS.items.findIndex((x) => x.t == "bd"); sxShow(); });
  const words = await page.evaluate(() => SXS.bk.length);
  assert.ok(words > 1);
  await page.keyboard.press("Tab");
  for (let i = 0; i < words; i++) { await page.keyboard.press("Enter"); await page.waitForTimeout(40); }
  assert.equal(await page.evaluate(() => SXS.an.length), words);
  assert.ok((await page.evaluate(() => $("#sxbds").textContent)).length > 0, "live region announces");
  await done();
});

test("keyboard: Ctrl+K opens search (a lone / does not, WCAG 2.1.4); it is a combobox and keeps focus inside", async () => {
  const { page, done } = await open("#/");
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press("/");
  assert.ok(await page.evaluate(() => $("#srch").hidden), "single-key shortcut stays off");
  await page.keyboard.press("Control+k");
  assert.ok(await page.evaluate(() => !$("#srch").hidden));
  await page.waitForTimeout(100);
  await page.keyboard.type("perfect");
  const r = await page.evaluate(() => { const q = $("#srq"); return [q.getAttribute("role"), q.getAttribute("aria-expanded"), !!document.getElementById(q.getAttribute("aria-controls"))]; });
  assert.deepEqual(r, ["combobox", "true", true]);
  for (let i = 0; i < 30; i++) await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => $("#srch").contains(document.activeElement)), "focus trapped");
  await page.keyboard.press("Escape");
  await done();
});

test("keyboard: the menu closes when focus leaves it", async () => {
  const { page, done } = await open("#/");
  await page.focus("#ddb"); await page.keyboard.press("Enter");
  assert.ok(await page.evaluate(() => $("#dd").classList.contains("open")));
  await page.keyboard.press("Shift+Tab");
  assert.ok(!(await page.evaluate(() => $("#dd").classList.contains("open"))));
  await done();
});

/* ---- Placement test ---- */

test("placement: without audio there are no listening items, and the result explains what was not tested", async () => {
  const { page, done } = await open("#/level");
  await page.evaluate(() => lvSelf());
  await page.check(".sxna input");
  await page.click(".lvsa .sxo");
  const r = await page.evaluate(() => { let n = 0; while (LV && LV.ph == "test" && n < 40) { const it = LVI[LV.cur.i]; if (it.s == "l") return "listening item shown"; lvAns(it.b < 1 ? 0 : -1); n++; } return { lvl: LV.rec.lvl, noau: LV.rec.noau, notTested: $(".lvsk").textContent.includes("Not tested"), recs: $$(".lvrec .rl").length }; });
  assert.notEqual(r, "listening item shown");
  assert.match(r.lvl, /^(Pre-A1|A1|A2|B1|B2|C1|C2)$/);
  assert.ok(r.noau);
  assert.ok(r.notTested);
  assert.ok(r.recs > 0);
  await done();
});

test("placement: number keys answer only when focus is in the question", async () => {
  const { page, done } = await open("#/level");
  await page.click("text=Start the test");
  await page.click("text=Start in the middle");
  for (let i = 0; i < 3; i++) { await page.keyboard.press("1"); await page.waitForTimeout(120); }
  assert.equal(await page.evaluate(() => LV.res.length), 3);
  await page.evaluate(() => document.querySelector(".logo").focus());
  await page.keyboard.press("2");
  assert.equal(await page.evaluate(() => LV.res.length), 3);
  await done();
});

test("placement: weak skills are sent to English Skills, C2 gets a message", async () => {
  const { page, done } = await open("#/level");
  const weak = await page.evaluate(() => lvRecs("B1", [], { sk: { r: [0, 4, 3], l: [1, 3, 2], f: [2, 2, 1.2] } }));
  assert.match(weak, /#\/worksheets\/reading/);
  assert.ok((await page.evaluate(() => lvRecs("C2", [], { sk: {} }))).length > 50);
  await done();
});

test("placement: the share box is off by default and sends only answers when on", async () => {
  const { page, sent, done } = await open("#/level");
  const hidden = await page.evaluate(() => { lvBegin("B1"); while (LV.ph == "test") lvAns(Math.random() < .6 ? 0 : 1); return !$("#lvcal"); });
  assert.ok(hidden);
  await page.evaluate(() => { LVCAL = true; lvResult(); });
  await page.click("#lvcal .btn");
  await page.waitForTimeout(300);
  const cal = sent.find((x) => x.url.includes("?cal"));
  assert.ok(cal, "posted to ?cal");
  assert.deepEqual(Object.keys(cal.body).sort(), ["noau", "r", "th", "v"]);
  await done();
});

/* ---- AI feedback ---- */

test("feedback: hints first, answers hidden, a link to practise, and revise checks earlier corrections", async () => {
  const { page, sent, done } = await open("#/worksheets/grammar/modals/0");
  await page.evaluate(() => { $("#fbt-w").value = "He go to work every day and I can cooking very well. I like my job a lot."; fbIn("w"); fbAI("w"); });
  await page.waitForSelector("#fba-w .fbco li");
  const r = await page.evaluate(() => ({ hint: $("#fba-w .fbco li p").textContent, closed: !$("#fba-w .fbans").open, area: !!$("#fba-w .fbarea"), revise: !!$("#fbrv-w") }));
  assert.match(r.hint, /verb ending/);
  assert.ok(r.closed && r.area && r.revise);
  assert.ok(sent[0].body.task, "sends the task text");
  await page.evaluate(() => { $("#fbt-w").value = "He goes to work every day and I can cook very well. I like my job a lot."; fbRedo("w"); });
  await page.waitForFunction(() => /fixed|Nice work/i.test($("#fbrvo-w")?.textContent || ""));
  assert.equal(sent[sent.length - 1].body.mode, "revise");
  await done();
});

test("feedback: the daily cap shows a clear message", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0", { worker: "daily_limit" });
  await page.evaluate(() => { $("#fbt-w").value = "He go to work every day. I can cooking very well."; fbIn("w"); fbAI("w"); });
  await page.waitForFunction(() => /tomorrow/.test($("#fba-w").textContent));
  await done();
});

test("feedback: per-learner rate limit shows the try-later message", async () => {
  const { page, done } = await open("#/worksheets/grammar/modals/0", { worker: "rate_limited" });
  await page.evaluate(() => { $("#fbt-w").value = "He go to work every day. I can cooking very well."; fbIn("w"); fbAI("w"); });
  await page.waitForFunction(() => /few minutes/.test($("#fba-w").textContent));
  await done();
});

test("feedback: every task the site can send is one the Worker knows", async () => {
  const { page, nav, done } = await open("#/");
  const known = await page.evaluate(() => fbTaskList().map((t) => t.task));
  const units = await page.evaluate(() => PTU.map((_, ui) => ptTkCtx(ui).task));
  for (const t of units) assert.ok(known.includes(t), "path unit task: " + t.slice(0, 50));
  for (const h of ["#/worksheets/grammar/modals/0", "#/worksheets/grammar/conditionals/3", "#/worksheets/reading/0", "#/worksheets/speaking/2", "#/worksheets/writing/4"]) {
    await nav(h);
    const tasks = await page.evaluate(() => Object.keys(FBST).map((k) => FBST[k].ctx && FBST[k].ctx.task).filter(Boolean));
    assert.ok(tasks.length > 0, h);
    for (const t of tasks) assert.ok(known.includes(t), h + ": " + t.slice(0, 50));
  }
  await done();
});

/* ---- Layout ---- */

test("phone: no sideways scrolling, and the reading text stays pinned", async () => {
  const { page, nav, done } = await open("#/", { width: 390, height: 844 });
  for (const h of PAGES) {
    await nav(h);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), h + " scrolls sideways");
  }
  await nav("#/worksheets/reading/2");
  assert.equal(await page.evaluate(() => getComputedStyle($(".skpin")).position), "sticky");
  await done();
});

/* ---- Accessibility (axe-core, WCAG 2.2 A and AA) ---- */

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
async function axe(page) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE });
  return page.evaluate(async (tags) => (await window.axe.run(document, { runOnly: { type: "tag", values: tags } })).violations
    .filter((v) => v.impact == "serious" || v.impact == "critical")
    .map((v) => v.id + ": " + v.nodes.slice(0, 3).map((n) => n.target.join(" ") + " (" + ((n.any[0] || n.all[0] || n.none[0] || {}).message || "") + ")").join("; ")), TAGS);
}

for (const theme of ["light", "dark"]) for (const [w, h] of [[1200, 900], [390, 844]]) {
  test(`accessibility: main pages, ${theme}, ${w}px`, async () => {
    const { page, nav, done } = await open("#/", { width: w, height: h, theme });
    const found = [];
    for (const p of PAGES) { await nav(p); for (const v of await axe(page)) found.push(p + " " + v); }
    assert.deepEqual(found, []);
    await done();
  });
}

test("accessibility: pages in use (practice, feedback, placement result, search)", async () => {
  for (const theme of ["light", "dark"]) {
    const { page, nav, done } = await open("#/worksheets/grammar/modals/0", { theme });
    const found = [];
    const scan = async (what) => { for (const v of await axe(page)) found.push(theme + " " + what + " " + v); };
    await page.click("#sxp .btn"); await scan("practice question");
    await page.evaluate(() => { SXS.i = SXS.items.findIndex((x) => x.t == "mc"); sxShow(); const it = SXS.items[SXS.i]; sxMc((it.d[2] + 1) % it.d[1].length); }); await scan("practice after a miss");
    await page.evaluate(() => { $("#fbt-w").value = "He go to work every day and I can cooking very well. I like my job a lot."; fbIn("w"); fbAI("w"); });
    await page.waitForSelector("#fba-w .fbco li"); await scan("feedback result");
    await nav("#/level");
    await page.evaluate(() => { lvBegin("B1"); }); await page.waitForTimeout(200); await scan("placement question");
    await page.evaluate(() => { while (LV.ph == "test") lvAns(Math.random() < .6 ? 0 : 1); }); await page.waitForTimeout(200); await scan("placement result");
    await page.keyboard.press("Control+k"); await page.keyboard.type("perfect"); await page.waitForTimeout(200); await scan("search");
    assert.deepEqual(found, []);
    await done();
  }
});
