# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio website for Srinath Naik Ajmeera, hosted on GitHub Pages at `srinathnaik.com` (configured via `CNAME`). No build system, package manager, or framework — plain HTML, CSS, and JavaScript.

## Local Development

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No build, lint, or test steps exist.

## Architecture

- **Main page**: `index.html` — single-page portfolio with anchor-scrolling sections: `#hero`, `#about`, `#projects`, `#blog`, `#contact`. Uses Inter (Google Fonts), no CSS framework.
- **Secondary pages**: `resources.html` (book library), `teaching.html` (TA discussion slides). Both share the same nav and CSS.
- **CSS**: `static/css/index.css` — all styles, using CSS custom properties (see `:root` block). No external CSS framework on any page.
- **Nav**: Identical sticky nav block duplicated in every HTML file (no templating). Contains links to all main sections plus Resources, Teaching, GitHub, LinkedIn. Mobile hamburger via inline `onclick` toggle.
- **Dynamic content**: `resources.js` builds the book library from a `library` array using jQuery (v1.4.2) and injects HTML into `#miniLibrary` on `resources.html`. The jQuery script is loaded locally from `static/js/`.
- **Static assets**: PDFs in `static/pdfs/`, images in `static/images/`, project reports in `static/projects/`, teaching slides under `static/teaching/`.

## Adding Content

- **New book**: Add an entry to the `library` array in `resources.js`. Each entry needs `topic` and `courses` (array of `{title, author, source}`). `source` is a filename relative to `static/pdfs/`.
- **New project**: Add a `.project-card` anchor in the `#projects` grid in `index.html`. Link to the PDF in `static/projects/`.
- **New page**: Copy the `<nav>` block from an existing page. Add a link to it in every other page's nav.
