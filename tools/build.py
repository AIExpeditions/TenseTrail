#!/usr/bin/env python3
"""Build TenseTrail into one self-contained HTML file.

Reads src/index.html and replaces every /*@include path*/ marker with the
file it names (relative to src/), recursively. Writes docs/index.html,
which GitHub Pages can serve and which can be published as a Claude artifact.

Usage: python3 tools/build.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "docs" / "index.html"
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


if __name__ == "__main__":
    main()
