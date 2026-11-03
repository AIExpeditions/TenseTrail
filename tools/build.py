#!/usr/bin/env python3
"""Build TenseTrail into one self-contained HTML file.

Reads src/index.html and replaces every /*@include path*/ marker with the
file it names (relative to src/), recursively. Writes docs/index.html,
which GitHub Pages can serve and which can be published as a Claude artifact.
Also writes worker/feedback-worker.js (the Gemini feedback proxy) from
worker/feedback-worker.src.js, so it uses the same rubric as the site, and builds
in the list of feedback tasks (tools/tasks.mjs, which needs Node.js) so the Worker
only marks tasks the site really sets.

Usage: python3 tools/build.py
"""
import pathlib
import re
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "docs" / "index.html"
WORKER_SRC = ROOT / "worker" / "feedback-worker.src.js"
WORKER_OUT = ROOT / "worker" / "feedback-worker.js"
MARKER = re.compile(r"/\*@include ([\w./-]+)\*/\n")
TASKS = "/*@tasks*/"


def expand(text, seen=()):
    def sub(m):
        path = (SRC / m.group(1)).resolve()
        if SRC not in path.parents:
            raise SystemExit(f"include outside src/: {m.group(1)}")
        if path in seen:
            raise SystemExit(f"include loop: {m.group(1)}")
        return expand(path.read_text(encoding="utf-8"), seen + (path,))
    return MARKER.sub(sub, text)


def feedback_tasks():
    """The site's writing and speaking tasks as JSON, from tools/tasks.mjs."""
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is needed to build the feedback Worker (tools/tasks.mjs). Install it from nodejs.org.")
    out = subprocess.run([node, str(ROOT / "tools" / "tasks.mjs")], capture_output=True, text=True, encoding="utf-8")
    if out.returncode:
        raise SystemExit("tools/tasks.mjs failed:\n" + out.stderr)
    return out.stdout


def main():
    html = expand((SRC / "index.html").read_text(encoding="utf-8"))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Built {OUT.relative_to(ROOT)} ({len(html.encode()) // 1024} KB)")
    if WORKER_SRC.exists():
        js = "// Built by tools/build.py from worker/feedback-worker.src.js. Do not edit.\n"
        js += expand(WORKER_SRC.read_text(encoding="utf-8"))
        if TASKS in js:
            js = js.replace(TASKS, "var FBTASKS = " + feedback_tasks() + ";")
        WORKER_OUT.write_text(js, encoding="utf-8")
        print(f"Built {WORKER_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
