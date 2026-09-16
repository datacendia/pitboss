#!/usr/bin/env python3
"""Build Fullstory Pit Boss.

Two outputs from one set of sources, side by side in the repo root so both
share the same CSS, JS and data files:

  index.html       A complete HTML document. This is what gets served —
                   by Netlify, by a local web server, or by double-clicking
                   it. It carries the doctype and <meta charset> that keep
                   the browser in standards mode and decode the data files
                   as UTF-8.

  artifact.html    The same content with NO doctype, <html>, <head> or
                   <body>, because the Artifact publisher supplies those.
                   This is the file passed to the Artifact tool. Never
                   serve it: with no doctype a browser falls into quirks
                   mode, and with no charset it decodes the data files as
                   windows-1252, mangling every dash, arrow and £.

Module numbers in the navigation are generated at runtime from document
order, so `data-nav` in the sources carries only the name. Reordering the
ORDER list below is all that is needed to renumber the whole curriculum.

Usage:  python build.py
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')

# Document order. This is the curriculum sequence.
ORDER = [
    'p0.html',      # Start here
    'p1a.html',     # Part I — capture, install, identity, events
    'p1b.html',     # Part I — privacy, replay, segments, funnels, signals, APIs, admin
    'p2.html',      # Part II — the client's data
    'p3.html',      # Part III — framework, archetypes, discovery, training, health
    'ptpl.html',    # Part III — deliverable templates
    'p4a.html',     # Part III generator + Part IV requirements library
    'pexp.html',    # Part IV — from insight to experiment
    'pkb.html',     # Part V — the nine build patterns
    'p4b.html',     # Part V KPI encyclopedia + Part VI drills, coach, glossary
    'pdrill.html',  # Part VI — segment composition drills
    'plab.html',    # Part VI — the hands-on lab
    'pfw.html',     # Close — your first week
    'psrc.html',    # Close — sources & confidence
    'p5.html',      # Close — running it locally
    'p9.html',      # closing tags + script includes
]

# Head for the served build only. The Artifact publisher supplies its own
# head, favicon and title, so none of this belongs in artifact.html.
DOCUMENT_HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="A training platform for teaching Fullstory to gaming, gambling and casino clients: 35 modules, 153 KPIs each with a build recipe, 35 worked client requirements, deliverable templates, a hands-on lab and a spaced-repetition drill deck.">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#E7EAE4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101410" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="Fullstory Pit Boss">
<meta property="og:description" content="Teaching Fullstory to gaming, gambling and casino clients — 35 modules, 153 KPIs with build recipes, onboarding playbooks and a hands-on lab.">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ctext y=%27.9em%27 font-size=%2790%27%3E%F0%9F%8E%B2%3C/text%3E%3C/svg%3E">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
"""


def strip_nav_numbers(html):
    """data-nav="12. The verticals" -> data-nav="The verticals"."""
    return re.sub(r'(data-nav=")\s*\d+\.\s*', r'\1', html)


def main():
    parts = []
    for name in ORDER:
        path = os.path.join(SRC, name)
        if not os.path.exists(path):
            sys.exit('missing source: ' + path)
        parts.append(io.open(path, encoding='utf-8').read())

    body = strip_nav_numbers('\n'.join(parts))

    io.open(os.path.join(ROOT, 'artifact.html'), 'w', encoding='utf-8').write(body)
    io.open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(
        DOCUMENT_HEAD + body + '\n</body>\n</html>\n')

    views = len(re.findall(r'<section class="view"', body))
    print('built %d modules, %d KB -> index.html (served) + artifact.html (published)'
          % (views, len(body) // 1024))


if __name__ == '__main__':
    main()
