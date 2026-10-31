#!/usr/bin/env python3
"""Build TenseTrail into one self-contained HTML file.

Reads src/index.html and replaces every /*@include path*/ marker with the
file it names (relative to src/), recursively. Writes docs/index.html,
which GitHub Pages can serve and which can be published as a Claude artifact.
Also writes worker/feedback-worker.js (the Gemini feedback proxy) from
worker/feedback-worker.src.js, so it uses the same rubric as the site.

Usage: python3 tools/build.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "docs" / "index.html"
WORKER_SRC = ROOT / "worker" / "feedback-worker.src.js"
WORKER_OUT = ROOT / "worker" / "feedback-worker.js"
MARKER = re.compile(r"/\*@include ([\w./-]+)\*/\n")


def expand(text, seen=()):
    def sub(m):
        path = (SRC / m.group(1)).resolve()
        if SRC not in path.parents:
            raise SystemExit(f"include outside src/: {m.group(1)}")
        if path in seen:
            raise SystemExit(f"include loop: {m.group(1)}")
        return expand(path.read_text(encoding="utf-8"), seen + (path,))
    return MARKER.sub(sub, text)


def main():
    html = expand((SRC / "index.html").read_text(encoding="utf-8"))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Built {OUT.relative_to(ROOT)} ({len(html.encode()) // 1024} KB)")
    if WORKER_SRC.exists():
        js = "// Built by tools/build.py from worker/feedback-worker.src.js. Do not edit.\n"
        js += expand(WORKER_SRC.read_text(encoding="utf-8"))
        WORKER_OUT.write_text(js, encoding="utf-8")
        print(f"Built {WORKER_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
