# Repository Guidelines

## Project Structure & Module Organization
- `manifest.json` defines MV3 metadata, host permissions, and content script order.
- `content/` holds modular content script code:
  - `namespace.js` shared config and namespace initialization.
  - `adapter.js` site adapters and role detection.
  - `ui.js` floating panel UI and rendering.
  - `core.js` observers, routing, and message parsing.
  - `utils.js` shared helpers.
- `content.js` is the entry point that boots the extension.
- No tests or build pipeline are present yet.

## Build, Test, and Development Commands
- Load locally in Chrome: `chrome://extensions` → Enable Developer Mode → “Load unpacked” → select this repo.
- Reload after edits: use the “Reload” button on the extension card and refresh target tabs.
- There are currently no build or test commands (no npm scripts or bundler).

## Coding Style & Naming Conventions
- Use 2-space indentation in JavaScript and JSON.
- Keep modules small and single-purpose; prefer adding new files under `content/` rather than expanding `content.js`.
- Naming: `createX`, `getX`, and `handleX` for functions; `UPPER_SNAKE` for constants.
- UI styles live inside `content/ui.js` in the shadow DOM stylesheet.

## Testing Guidelines
- No automated tests exist yet.
- Manual smoke checks: verify prompt list rendering, navigation scrolling, and SPA route changes on supported sites.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits with a  Chinese summary, e.g. `feat: 搭建聊天导航扩展基础` or `fix: 修正导航标题两行截断`.
- Include 3–5 bullet points in the body describing key changes.
- PRs (or change summaries) should include:
  - A short scope description and affected files.
  - Screenshots or GIFs for UI changes.
  - Manual test steps and target sites (e.g. `chatgpt.com`).

## Security & Configuration Notes
- Keep permissions minimal; only add hosts needed for supported chat sites.
- Avoid external network calls in content scripts unless explicitly required.
