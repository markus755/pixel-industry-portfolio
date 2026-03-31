## Purpose

Short, practical guidance for AI coding agents working on the `pixel-industry-portfolio` static site.
Keep advice focused on discoverable patterns and the exact files you should edit.

## Big picture
- **Type:** Static portfolio website (plain HTML/CSS/JS, images). No frontend framework or build tool.
- **Primary entry points:** `index.html`, `contact.html`, `about.html`, `projects/`, `css/styles.css`.
- **Shared fragments:** `header.html` and `footer.html` are loaded dynamically via `fetch()` into every page.

## How the site is organized

### Pages
- Root-level HTML files (`index.html`, `contact.html`, `about.html`, `imprint.html`, `privacy.html`)
- Detailed project pages under `projects/`

### Assets
- Per-project images under `images/<project_name>/` (thumbnails use `_thumb` suffix, e.g. `01_thumb.jpg`)
- Videos under `videos/`

### Styles
- `css/styles.css` — single global stylesheet
- Uses **CSS Custom Properties** for colors and spacing (defined in `:root`). Always use the existing variables instead of hardcoded values.
- Dark mode is handled via `@media (prefers-color-scheme: dark)` overriding the CSS variables — not via separate rules.
- Animations respect `@media (prefers-reduced-motion: reduce)`.

### JavaScript (modular, load order matters)
Scripts are loaded in this order in every HTML file:
1. `js/navigation.js` — mobile menu, header scroll behavior, dark mode icons, about-page tab navigation
2. `js/animations.js` — IntersectionObserver fade/slide animations, scroll position save/restore
3. `js/main.js` — CONFIG object, DOMContentLoaded init (loads header/footer, fixes paths, fires other modules)
4. `js/cookies.js` — cookie banner and privacy settings panel
5. `js/google-analytics.js` — Google Analytics (loaded conditionally after consent)

Project pages use `../js/` prefix instead of `js/`.

## Project-specific conventions (do not invent)
- **New project pages:** Copy `projects/project-template.html` → `projects/<slug>.html`, update titles and image paths.
- **Index tiles:** Add a new tile in `index.html` linking to `projects/<slug>.html`.
- **Images:** Place under `images/<slug>/`, reference relatively. Thumbnails use `_thumb` suffix.
- **No build step:** No `package.json` or build output directory — edits are source-level.

## Local preview
Serve the repository root (preserves relative paths):

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` to preview.

## Deployment & CI
- **Workflow:** `.github/workflows/deploy.yml` uploads the repository root and deploys to GitHub Pages on pushes to `main`.
- **When to push:** Direct pushes to `main` or PRs into `main` trigger the deploy action.

## Safe edit checklist
- **Paths:** Verify `css/styles.css` and `images/` relative paths in the edited HTML file.
- **CSS variables:** Use existing `:root` variables (`--color-text`, `--color-bg`, etc.) — do not hardcode colors.
- **Script tags:** When creating a new HTML page, include all four script tags in the correct order (see above).
- **Fragments:** Navigation changes go into `header.html` only — not into individual pages.

## What not to do
- Do not add heavy build tooling (Webpack, npm scripts, etc.) unless requested.
- Do not move images into a new folder layout without updating all references.
- Do not add `!important` unless absolutely necessary (e.g. `prefers-reduced-motion` overrides).
- Do not merge the JS modules back into a single file.

## Files to inspect when troubleshooting
- `index.html` — homepage tiles and script tag order
- `projects/project-template.html` — canonical project page structure
- `css/styles.css` — global styles and CSS variables
- `js/main.js` — CONFIG, init logic, header/footer path fixing
- `js/navigation.js` — mobile menu, header scroll, tab navigation
- `js/animations.js` — fade/slide animations, scroll position
- `js/cookies.js` — cookie banner, privacy settings panel
- `.github/workflows/deploy.yml` — deployment behavior
