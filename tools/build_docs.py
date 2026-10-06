#!/usr/bin/env python3
"""Build the localized Help pages in docs/ from the plain website-docs source.

Usage:
    python3 tools/build_docs.py [path/to/website-docs]

The source folder contains one <lang>/index.html per language with a <header>
and a series of <section> blocks. This script wraps that content in the site's
navbar, table of contents and footer. Nav and footer labels come from
translations.js so they always match the main page.
"""

import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Documents/BackupFlow/website-docs"
OUT = ROOT / "docs"
SITE_URL = "https://backupflow.netlify.app"

# Stable anchors, in source section order (identical across languages).
SECTION_IDS = [
    "what-you-need",
    "first-backup",
    "automatic-backups",
    "deleted-files",
    "background",
    "history",
    "extra-protection",
    "troubleshooting",
    "privacy",
    "help",
]

TOC_LABEL = {
    "en": "On this page", "tr": "Bu sayfada", "de": "Auf dieser Seite", "fr": "Sur cette page",
    "es": "En esta página", "ru": "На этой странице", "ar": "في هذه الصفحة", "zh": "本页内容",
    "ko": "이 페이지에서", "ja": "このページの内容", "pt": "Nesta página", "hi": "इस पेज पर",
}


def load_site_strings():
    """Read languages and labels from translations.js via Node."""
    script = (
        "global.window={};require('./translations.js');"
        "const o={languages:window.BF_LANGUAGES,t:{}};"
        "for(const l of window.BF_LANGUAGES){const t=window.BF_TRANSLATIONS[l.code];"
        "o.t[l.code]={nav:t.nav,footer:t.footer,misc:t.misc};}"
        "process.stdout.write(JSON.stringify(o));"
    )
    raw = subprocess.check_output(["node", "-e", script], cwd=ROOT)
    return json.loads(raw)


def parse_source(lang):
    text = (SOURCE / lang / "index.html").read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", text, re.S).group(1).strip()
    description = re.search(r'<meta name="description" content="(.*?)">', text, re.S).group(1)
    header = re.search(r"<header>(.*?)</header>", text, re.S).group(1)
    h1 = re.search(r"<h1>(.*?)</h1>", header, re.S).group(1).strip()
    lead = re.search(r'<p class="lead">(.*?)</p>', header, re.S).group(1).strip()
    sections = re.findall(r"<section>(.*?)</section>", text, re.S)
    if len(sections) != len(SECTION_IDS):
        raise SystemExit(f"{lang}: expected {len(SECTION_IDS)} sections, found {len(sections)}")
    parsed = []
    for sid, body in zip(SECTION_IDS, sections):
        m = re.search(r"<h2>(.*?)</h2>", body, re.S)
        parsed.append((sid, m.group(1).strip(), body.strip()))
    return title, description, h1, lead, parsed


def indent(block, spaces):
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else "" for line in block.splitlines())


def render_page(lang, meta, strings, languages):
    title, description, h1, lead, sections = parse_source(lang)
    nav, footer = strings["nav"], strings["footer"]
    home = "../../index.html"

    def lang_option(l):
        current = l["code"] == lang
        active = " active" if current else ""
        selected = 'aria-selected="true"' if current else 'aria-selected="false"'
        return (
            f'                            <li role="presentation"><a role="option" class="lang-option{active}" {selected} '
            f'href="../{l["code"]}/" hreflang="{l["code"]}" lang="{l["code"]}" data-lang-code="{l["code"]}">'
            f'<span class="lang-flag">{l["flag"]}</span><span class="lang-name">{l["name"]}</span></a></li>'
        )

    lang_options = "\n".join(lang_option(l) for l in languages)
    alternates = "\n".join(
        f'        <link rel="alternate" hreflang="{l["code"]}" href="{SITE_URL}/docs/{l["code"]}/" />'
        for l in languages
    )
    toc = "\n".join(
        f'                        <li><a href="#{sid}">{h2}</a></li>' for sid, h2, _ in sections
    )
    body = "\n\n".join(
        f'                    <section id="{sid}" class="docs-section">\n{indent(content, 24)}\n                    </section>'
        for sid, _, content in sections
    )

    return f"""<!doctype html>
<html lang="{lang}" dir="{meta["dir"]}">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content="{description}" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="canonical" href="{SITE_URL}/docs/{lang}/" />
{alternates}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
        />
        <link rel="stylesheet" href="../../styles.css" />
        <link rel="stylesheet" href="../docs.css" />
        <link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
    </head>
    <body class="docs-body">
        <a href="#docs-content" class="skip-link">{html.escape(strings["misc"]["skipLink"])}</a>
        <nav class="navbar">
            <div class="nav-container">
                <a class="nav-logo" href="{home}">
                    <span class="logo-icon">
                        <img src="../../web_logo.png" alt="" class="logo-image" />
                    </span>
                    <span class="logo-text">BackupFlow</span>
                </a>
                <div class="nav-menu" id="nav-menu">
                    <a class="nav-link" href="{home}#features">{nav["features"]}</a>
                    <a class="nav-link" href="{home}#pricing">{nav["pricing"]}</a>
                    <a class="nav-link" href="{home}#support">{nav["support"]}</a>
                    <div class="lang-switcher" id="lang-switcher">
                        <button
                            type="button"
                            class="lang-toggle"
                            id="lang-toggle"
                            aria-haspopup="listbox"
                            aria-expanded="false"
                            aria-controls="lang-menu"
                        >
                            <span class="lang-flag">{meta["flag"]}</span>
                            <span class="lang-code">{lang.upper()}</span>
                            <svg class="lang-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        <ul class="lang-menu" id="lang-menu" role="listbox" aria-label="{html.escape(strings["misc"]["langLabel"])}">
{lang_options}
                        </ul>
                    </div>
                    <a class="nav-link download-btn" href="https://apps.apple.com/app/backupflow/id6753620051" target="_blank" rel="noopener noreferrer">{nav["download"]}</a>
                </div>
                <button
                    type="button"
                    class="nav-toggle"
                    aria-label="{html.escape(strings["misc"]["toggleNav"])}"
                    aria-controls="nav-menu"
                    aria-expanded="false"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>

        <main id="docs-content" class="docs-page">
            <div class="container">
                <header class="docs-hero">
                    <h1>{h1}</h1>
                    <p class="docs-lead">{lead}</p>
                </header>

                <div class="docs-layout">
                    <aside class="docs-toc" aria-labelledby="docs-toc-title">
                        <p class="docs-toc-title" id="docs-toc-title">{TOC_LABEL[lang]}</p>
                        <ol>
{toc}
                        </ol>
                    </aside>

                    <article class="docs-content">
{body}
                    </article>
                </div>
            </div>
        </main>

        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <div class="logo-icon">
                                <img src="../../web_logo.png" alt="" class="logo-image" />
                            </div>
                            <span class="logo-text">BackupFlow</span>
                        </div>
                        <p class="footer-description">{footer["desc"]}</p>
                    </div>
                    <div class="footer-links">
                        <div class="footer-column">
                            <h4>{footer["supportHeading"]}</h4>
                            <a href="./">{footer["docs"]}</a>
                            <a href="../../privacy-policy.html">{footer["privacy"]}</a>
                            <a href="mailto:tamersavasci@icloud.com">{footer["contact"]}</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 BackupFlow. {footer["copyright"]}</p>
                </div>
            </div>
        </footer>

        <script src="../docs.js"></script>
    </body>
</html>
"""


def render_index(languages):
    picker = "\n".join(
        f'                <li><a href="{l["code"]}/" lang="{l["code"]}" hreflang="{l["code"]}">'
        f'<span class="lang-flag">{l["flag"]}</span> {l["name"]}</a></li>'
        for l in languages
    )
    codes = json.dumps([l["code"] for l in languages])
    return f"""<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BackupFlow Help</title>
        <link rel="canonical" href="{SITE_URL}/docs/" />
        <script>
            // Open the Help page in the language chosen on the main site, else the browser language.
            (function () {{
                var supported = {codes};
                var langs = [];
                try {{
                    langs.push(localStorage.getItem("bf_lang") || "");
                }} catch (e) {{
                    /* localStorage unavailable */
                }}
                langs = langs.concat(navigator.languages || [navigator.language || "en"]);
                for (var i = 0; i < langs.length; i++) {{
                    var code = (langs[i] || "").toLowerCase().split("-")[0];
                    if (supported.indexOf(code) !== -1) {{
                        location.replace(code + "/");
                        return;
                    }}
                }}
            }})();
        </script>
        <link rel="stylesheet" href="../styles.css" />
        <link rel="stylesheet" href="docs.css" />
        <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
    </head>
    <body class="docs-body">
        <main class="docs-page">
            <div class="container">
                <header class="docs-hero">
                    <h1>BackupFlow Help</h1>
                    <p class="docs-lead">Choose your language</p>
                </header>
                <ul class="docs-picker">
{picker}
                </ul>
            </div>
        </main>
    </body>
</html>
"""


def main():
    data = load_site_strings()
    languages = data["languages"]
    for meta in languages:
        lang = meta["code"]
        target = OUT / lang / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_page(lang, meta, data["t"][lang], languages), encoding="utf-8")
    (OUT / "index.html").write_text(render_index(languages), encoding="utf-8")
    print(f"Built {len(languages)} help pages in {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
