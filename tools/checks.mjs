// Content checks, run by tools/build.py before it builds. Exits with an error (and the build stops)
// when the content breaks a rule the audit set, so a gap can't come back without anyone noticing:
//   1. every level from A1 to C1 has at least MIN lessons (Grammar Studio areas plus Tense Studio tenses),
//   2. at B2 and above, a typed gap's bracket hint is at most two words (the base verb or a word count),
//      so the hint doesn't make the decision the lesson is testing,
//   3. every lesson named in a guided-path unit exists, and its level is not above the unit's level,
//   4. unseen practice sentences (px), where a lesson has them, number at least 6 and never repeat
//      a sentence shown on the lesson page.
// Warnings (printed, build continues): lessons that are in no path unit.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const MIN = 8, LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const AREAS = { sentences: "SX", modals: "MX", conditionals: "CX", passive: "PX", patterns: "VX", nouns: "NX", adj: "AX", preps: "RX", writing: "WX" };
const files = Object.keys(AREAS).map((a) => "lessons/" + a + ".js").concat(["lessons/px.js", "plus/pathdata.js"]);
const ctx = vm.createContext({});
vm.runInContext(files.map((f) => readFileSync(join(SRC, f), "utf8")).join("\n;\n"), ctx, { filename: "content-checks" });
const lv2 = readFileSync(join(SRC, "app.js"), "utf8").match(/var LV2=(\[[^\]]*\])/);
if (!lv2) throw new Error("checks: LV2 (the tense levels) not found in src/app.js");
const LV2 = JSON.parse(lv2[1]);

const errors = [], warnings = [];
const count = {}, used = {};
LEVELS.concat("C2").forEach((l) => (count[l] = 0));
LV2.forEach((l) => count[l]++);
const clean = (t) => String(t).replace(/\[\[|\]\]/g, "").replace(/[.!?]+$/, "").trim().toLowerCase();
for (const a in AREAS) ctx[AREAS[a]].forEach((c, i) => {
  const id = a + ":" + i;
  count[c.lv] = (count[c.lv] || 0) + 1;
  if (c.lv >= "B2") (c.gp || []).forEach((g) => {
    const m = String(g[0]).match(/\(([^)]*)\)\s*$/);
    if (m && m[1].trim().split(/\s+/).length > 2) errors.push(`${id} (${c.lv}) "${c.t}": the hint "(${m[1]})" says more than the base verb. At B2 and above, put the meaning in the sentence.`);
  });
  if (c.px) {
    if (c.px.length < 6) errors.push(`${id} "${c.t}": px has ${c.px.length} sentences; it needs at least 6.`);
    const shown = new Set([].concat(c.ex || [], c.nt || [], (c.ms || []).flatMap((m) => [m[0], m[1]]), ((c.dl || {}).ln || []).map((l) => l[1])).map(clean));
    c.px.forEach((t) => { if (shown.has(clean(t))) errors.push(`${id} "${c.t}": px sentence is already on the page: ${t}`); });
  }
});
for (const a in AREAS) ctx[AREAS[a]].forEach((c, i) => { if (!c.px) warnings.push(`${a}:${i} "${c.t}" has no unseen practice sentences (px) in src/lessons/px.js.`); });
LEVELS.forEach((l) => { if (count[l] < MIN) errors.push(`Level ${l} has only ${count[l]} lessons (at least ${MIN} needed).`); });

ctx.PTU.forEach((u, ui) => u[3].forEach((r) => {
  used[r] = 1;
  let l = null;
  if (r.startsWith("t:")) l = LV2[+r.slice(2)];
  else if (r.startsWith("g:")) { const [, a, k] = r.split(":"); const c = AREAS[a] && ctx[AREAS[a]][+k]; if (c) l = c.lv; }
  else if (r.startsWith("k:")) return;
  if (!l) errors.push(`Path unit ${ui + 1} "${u[1]}": ${r} does not exist.`);
  else if (l > u[0]) errors.push(`Path unit ${ui + 1} "${u[1]}" (${u[0]}): ${r} is ${l}, above the unit's level.`);
}));
for (const a in AREAS) ctx[AREAS[a]].forEach((c, i) => { if (!used["g:" + a + ":" + i]) warnings.push(`g:${a}:${i} "${c.t}" (${c.lv}) is in no path unit.`); });
LV2.forEach((l, i) => { if (!used["t:" + i]) warnings.push(`t:${i} (${l}) is in no path unit.`); });

warnings.forEach((w) => console.warn("warning: " + w));
if (errors.length) { console.error(errors.map((e) => "error: " + e).join("\n")); process.exit(1); }
console.log("Content checks passed: " + LEVELS.map((l) => l + " " + count[l]).join(", ") + " lessons.");
