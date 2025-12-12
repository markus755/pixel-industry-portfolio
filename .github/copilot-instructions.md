```md
## Purpose

Short, practical guidance for AI coding agents working on the `pixel-industry-portfolio` static site.
Keep advice focused on discoverable patterns and the exact files you should edit.

## Big picture
- **Type:** Small static portfolio (plain HTML, CSS, images). No JS framework or build pipeline.
- **Primary entry points:** `index.html`, `contact.html`, `projects/`, `css/styles.css`.
- **Shared fragments:** `header.html` and `footer.html` exist as shared page fragments used across pages.

## How the site is organized (quick)
- **Pages:** Root-level HTML files (e.g., `index.html`, `contact.html`) and detailed project pages under `projects/`.
- **Assets:** Per-project images under `images/<project_name>/` (thumbnails kept next to full images).
- **Styles:** Global styles in `css/styles.css`. Small, local overrides are preferred over big rewrites.
- **Behavior:** `js/main.js` contains any small interactive logic — keep it minimal and unobtrusive.

## Project-specific conventions (do not invent)
- **New project pages:** Copy `projects/project-template.html` → `projects/<slug>.html`, update titles and image paths.
- **Index tiles:** `index.html` contains the project tiles/links; add a new tile linking to your new `projects/<slug>.html`.
- **Images:** Place images in `images/<slug>/` and reference relatively (e.g., `images/my_project/01.jpg`). Thumbnails use `_thumb` suffix (e.g., `01_thumb.jpg`).
- **No build step:** There is no `package.json` or build output directory — edits are source-level and deployed as-is.

## Local preview & quick commands
- Serve the repository root (preserves relative paths):

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` to preview.

## Deployment & CI
- **Workflow:** CI is defined at `.github/workflows/deploy.yml`. It uploads the repository root and deploys to GitHub Pages on pushes to `main`.
- **When to push:** Direct pushes to `main` or PRs into `main` will trigger the deploy action; keep changes small and review before pushing.

## Safe edit checklist (use every time)
- **Paths:** Verify `css/styles.css` and `images/` relative paths in the edited HTML file.
- **Fragments:** If you update navigation, update both `header.html` and any hard-coded copies in pages.
- **Thumbnails:** Keep `_thumb` naming convention when adding small images used in galleries or overview tiles.

## What not to do
- Do not add heavy build tooling (Webpack, npm scripts, etc.) unless requested — the site is intentionally simple.
- Do not move images into a new global folder layout without updating all references.

## Example quick tasks (concrete)
- Add a new project page:
  1. Copy `projects/project-template.html` to `projects/my_project.html`.
  2. Add images under `images/my_project/` (include thumb variants as needed).
  3. Add a project tile/link in `index.html` that points to `projects/my_project.html`.
- Tweak spacing or typography: edit `css/styles.css` and test locally with `python3 -m http.server`.

## Files to inspect when troubleshooting
- `index.html` — homepage tiles and links
- `projects/project-template.html` — canonical project page structure
- `css/styles.css` — global styles
- `js/main.js` — small interactive scripts
- `.github/workflows/deploy.yml` — deployment behavior

---
If anything here looks wrong, tell me which area you want expanded (deploy details, fragment usage, or tile markup examples) and I'll iterate.

```
## Purpose

This file guides AI coding agents (Copilot-style) working on the `pixel-industry-portfolio` static site.
Keep guidance short and actionable — focus on the project's current structure and discoverable workflows.

## Big picture
- **Type:** Static portfolio website (plain HTML/CSS, images). No frontend framework or build tool present.
- **Primary files:** `index.html`, `contact.html`, `css/styles.css` and project pages in `projects/`.
- **Assets:** Images grouped under `images/<project_name>/` (e.g. `images/sccm_agent/`). Project pages reference those folders.

## Key project patterns & examples
- **Home and content edits:** Change `index.html` to update the homepage content or navigation. Example: update the hero or project tiles directly in `index.html`.
- **Project pages:** Use `projects/project-template.html` as the template for new project pages. Create a new HTML file in `projects/` and link it from `index.html`.
- **Styling:** All site styles live in `css/styles.css`. Prefer adding small, scoped rules near existing patterns rather than large rewrites.
- **Images:** Add new project imagery under `images/<project>/` and reference with relative paths (e.g. `images/my_project/01.jpg`). Keep thumbnails alongside full images (thumb naming seen in repo).

## Developer workflows (discovered)
- **Local preview:** Serve the root folder over HTTP instead of opening `file://` to preserve relative asset loading. Example quick command:

  `python3 -m http.server 8000`

- **Deployment:** The repo uses a GitHub Actions workflow at `.github/workflows/deploy.yml`. On push to `main` the workflow uploads the repository root (`path: './'`) and deploys to GitHub Pages.

  - If you change files, push to `main` (or open a PR targeted at `main`) to trigger deploy.

## Conventions & constraints
- No `package.json`, build scripts, or test framework detected — assume edits are source-level (HTML/CSS/images).
- Keep code minimal and semantic; this repo prefers direct, explicit edits to static files rather than introducing build tooling.
- Naming pattern: thumbnails often use `_thumb` suffix (e.g. `concrete_thumb.jpg`). Preserve this when adding thumbnails.

## Integration points
- **GitHub Actions deploy:** `.github/workflows/deploy.yml` uses `actions/upload-pages-artifact` and `actions/deploy-pages` to publish the repo root. Do not assume a `public/` build folder.

## When you edit or create files
- Add or update HTML under the project root or `projects/`. Ensure relative paths to `css/styles.css` and `images/` are correct.
- If adding a new project page, copy `projects/project-template.html` as a starting point and update the content and image references.

## What not to do
- Do not introduce heavy build tooling (Webpack, npm, etc.) without explicit request — the site is intentionally simple.
- Avoid moving image files into a different layout unless you update all references.

## Example quick tasks an AI agent can perform
- Add a new project page: copy `projects/project-template.html` → `projects/my_new_project.html`, update title and image references in `images/my_new_project/`, then add a link from `index.html`.
- Fix visual spacing: add or tweak rules in `css/styles.css` scoped to the selector used on the target page.

---
If any of this is incorrect or incomplete, tell me what areas you want expanded (deploy details, naming rules, or example diffs) and I will update this file.
