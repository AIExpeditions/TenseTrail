// Prints the feedback task list as JSON: {"<task text>": {"topic","level","rule"}}.
// Run by tools/build.py, which builds the result into worker/feedback-worker.js.
// Loads only data files (lessons, skills data) and src/plus/fbtasks.js in an empty sandbox.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const files = [
  "lessons/sentences.js", "lessons/modals.js", "lessons/conditionals.js", "lessons/passive.js",
  "lessons/patterns.js", "lessons/nouns.js", "lessons/adj.js", "lessons/preps.js", "lessons/writing.js",
  "plus/skilldata.js", "plus/pathdata.js", "plus/fbtasks.js",
];
const code = files.map((f) => readFileSync(join(SRC, f), "utf8")).join("\n;\n");
const ctx = vm.createContext({});
vm.runInContext(code + "\n;var __out = fbTaskList();", ctx, { filename: "feedback-tasks" });

const map = {};
for (const t of ctx.__out) {
  if (typeof t.task != "string" || !t.task.trim()) throw new Error("A feedback task has no text: " + JSON.stringify(t));
  const v = { topic: t.topic || "", level: t.level || "", rule: t.rule || "" };
  const old = map[t.task];
  if (old && JSON.stringify(old) != JSON.stringify(v)) throw new Error("Two feedback tasks share the same text but differ: " + t.task);
  map[t.task] = v;
}
process.stdout.write(JSON.stringify(map));
