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

## Collaboration & Reasoning Principles
- Apply first-principles thinking before proposing solutions or making changes. Start from the original problem, constraints, and desired outcome instead of copying common patterns or following prior paths by inertia.
- Reject pure empiricism and path dependence. Past implementations, habits, or "usual ways" are not sufficient justification unless they still serve the current goal under current constraints.
- Do not assume the user fully understands or has fully specified the true goal. Stay cautious about hidden assumptions, missing success criteria, and possible XY-problem situations.
- If the goal is ambiguous, incomplete, or internally inconsistent, stop and discuss it with the user before proceeding with irreversible or high-effort work.
- If the goal is clear but the requested path is not optimal, explicitly recommend a shorter, lower-cost, or lower-risk approach instead of silently following the longer route.
- When challenging a path, focus on improving outcome quality, speed, and cost, not on abstract disagreement.

## 方案规范
- When proposing modification or refactor plans, do not provide compatibility-first or patch-style options by default. Prefer converging directly to the target state.
- Do not over-engineer. Choose the shortest implementation path that fully satisfies the requirement.
- Do not introduce fallback, downgrade, bypass, or side-route solutions that were not explicitly required. Avoid drifting business logic away from the original goal.
- Every plan must pass end-to-end logical validation so that inputs, processing flow, outputs, and impact scope remain internally consistent.

## Response Format
- Every response must contain exactly two sections in this order:
- `直接执行`：follow the user's current request and logic, and provide the direct task result.
- `深度交互`：prudently challenge the underlying request from first principles. This should include, when relevant, checking for XY problems, questioning whether the stated path matches the actual goal, identifying drawbacks of the current approach, and proposing a more elegant alternative.
