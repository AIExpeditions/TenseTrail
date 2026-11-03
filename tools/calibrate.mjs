// Calibrates the placement test from the anonymous answers learners chose to share.
// Usage: node tools/calibrate.mjs answers.json [min-answers-per-item, default 30]
//   answers.json: one or more pages saved from the Worker's export
//   (https://<worker address>/?export=<CHECK_KEY>, then &cursor=... for the next page while "cursor" is not null),
//   either a single page {"records":[...]} or an array of pages or records.
// It fits the same 3PL model the test uses (a = 1.4, c = 0.25), alternating between each learner's ability
// and each item's difficulty, and writes src/plus/levelcal.js with the measured difficulty of every item
// that has enough answers. Items with fewer answers keep the estimate from their level label.
// Then run python3 tools/build.py. It also prints the items whose measured level differs from their label.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const [file, minArg] = process.argv.slice(2);
if (!file) { console.error("Usage: node tools/calibrate.mjs answers.json [min-answers-per-item]"); process.exit(1); }
const MIN = +minArg || 30, A = 1.4, C = 0.25;

const ctx = vm.createContext({});
vm.runInContext(readFileSync(join(SRC, "plus/levelbank.js"), "utf8"), ctx);
const LVI = ctx.LVI;
const lvb = readFileSync(join(SRC, "plus/level.js"), "utf8").match(/var LVB=(\{[^}]*\})/);
const LVB = Function("return " + lvb[1])();
const LVCUT = [[-3.2, "Pre-A1"], [-2, "A1"], [-.8, "A2"], [.4, "B1"], [1.6, "B2"], [2.8, "C1"], [99, "C2"]];
const level = (b) => LVCUT.find((c) => b < c[0])[1];

// starting difficulties: the same rule as level.js (level label, spread within +-0.3)
const groups = {};
LVI.forEach((it, i) => (groups[it.l + it.s] = groups[it.l + it.s] || []).push(i));
const b0 = [];
Object.values(groups).forEach((a) => a.forEach((ix, j) => (b0[ix] = LVB[LVI[ix].l] + (a.length > 1 ? -.3 + .6 * j / (a.length - 1) : 0))));

let raw = JSON.parse(readFileSync(file, "utf8"));
const pages = Array.isArray(raw) ? raw : [raw];
const recs = pages.flatMap((p) => (p && p.records ? p.records : [p])).filter((r) => r && Array.isArray(r.r) && r.v == LVI.length);
console.log(`${recs.length} usable answer sets (bank of ${LVI.length} items; sets from an older bank are skipped).`);
if (!recs.length) process.exit(0);

const P = (th, b) => C + (1 - C) / (1 + Math.exp(-A * (th - b)));
const grid = []; for (let x = -5; x <= 5.001; x += .05) grid.push(Math.round(x * 100) / 100);
const ll = (pairs, f) => pairs.reduce((s, [x, ok]) => { const p = Math.min(.999, Math.max(.001, f(x))); return s + Math.log(ok ? p : 1 - p); }, 0);

const byItem = {}; recs.forEach((r, k) => r.r.forEach(([i, ok]) => (byItem[i] = byItem[i] || []).push([k, ok])));
let b = b0.slice(), th = recs.map((r) => r.th);
for (let it = 0; it < 6; it++) {
  // items: maximum likelihood with a weak pull towards the label (prior N(b0, 1))
  Object.keys(byItem).forEach((i) => { if (byItem[i].length < MIN) return;
    const pairs = byItem[i].map(([k, ok]) => [th[k], ok]);
    b[i] = grid.reduce((best, g) => { const v = ll(pairs, (t) => P(t, g)) - (g - b0[i]) ** 2 / 2; return v > best[1] ? [g, v] : best; }, [0, -Infinity])[0]; });
  // learners: maximum likelihood with the test's prior N(0, 1.4)
  th = recs.map((r) => grid.reduce((best, g) => { const v = ll(r.r.map(([i, ok]) => [b[i], ok]), (bi) => P(g, bi)) - g * g / (2 * 1.96); return v > best[1] ? [g, v] : best; }, [0, -Infinity])[0]);
}
const out = {}, moved = [];
Object.keys(byItem).forEach((i) => { if (byItem[i].length < MIN) return; out[i] = Math.round(b[i] * 100) / 100;
  if (level(b[i]) != LVI[i].l) moved.push(`  item ${i} (${LVI[i].s}, labelled ${LVI[i].l}): measured ${out[i]} = ${level(b[i])}, ${byItem[i].length} answers. "${LVI[i].q.slice(0, 60)}"`); });
const n = Object.keys(out).length;
writeFileSync(join(SRC, "plus/levelcal.js"), readFileSync(join(SRC, "plus/levelcal.js"), "utf8").replace(/LVBCAL=\{[^}]*\}/, "LVBCAL=" + JSON.stringify(out)));
console.log(`Measured ${n} of ${LVI.length} items (each with at least ${MIN} answers); wrote src/plus/levelcal.js.`);
if (moved.length) console.log("Items whose measured level differs from their label (check the content):\n" + moved.join("\n"));
