# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains application source (modules, components, routing, styles).
- `test/` contains unit and e2e/component test suites plus test pages.
- `build-tasks/` holds build tooling, karma/wdio configs, and release utilities.
- `bin/` contains local server and utility scripts (e.g., `start-server.js`).
- `mock-data/` and `test/components/mock/` provide API mock data and helpers.
- `configs/` holds environment/configuration JSON.
- Generated output: `dist/` (compiled assets) and `build/` (temp build artifacts).

## Build, Test, and Development Commands
- `yarn install` installs dependencies (requires Artifactory access).
- `yarn build` compiles the app in production/advanced mode.
- `yarn serve` runs the compiled app (default FI). Example: `yarn serve --fi=ovationbank1demo`.
- `yarn serve --debug` runs the dev server (uncompiled). Run `yarn build` once first.
- `yarn lint` runs ESLint and shared checks; `yarn fix:lint` applies fixes.
- `yarn format` applies Prettier formatting to the repo.

## Coding Style & Naming Conventions
- JavaScript (ES modules) with linting via ESLint and formatting via Prettier.
- Prefer existing patterns in `src/` for module naming and component structure.
- Test files use `*-spec.js` naming (see `test/` and `build-tasks/tests/`).

## Testing Guidelines
- Unit tests: Karma + Jasmine (`yarn test:unit`).
- Build-tool unit tests: `yarn test:unit:build-tools`.
- E2E/component tests: WebdriverIO (`yarn test:e2e`, `yarn test:local:components`).
- Example targeted run: `yarn test:unit:primary --dev --spec=activity-controller`.

## Commit & Pull Request Guidelines
- Commit subjects are short and descriptive; common patterns include version bumps like
  “Increment @banno/banno-web to X.Y.Z” and ticket-prefixed summaries (e.g., `WEB-4704:`).
- For PRs, include a clear description, testing notes, and UI screenshots when relevant.
- Ensure the PR is labeled for this project when required by CI workflows.

## Security & Configuration Tips
- Private packages require Artifactory credentials; ensure your token is configured
  before running `yarn install`.
- Use `--mocks` or `--overrides` for local API simulation when debugging.
