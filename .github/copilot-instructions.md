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
