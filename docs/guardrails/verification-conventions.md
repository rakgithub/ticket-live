# Verification conventions

- Review the final diff for scope, accidental changes, debug output, sensitive data, broken exports, and stale documentation. Update affected public contracts and stories with the implementation.
- For feature and behavior changes, run affected Vitest tests, TypeScript checking, lint, the token check, and the production build. Use `pnpm test:run -- <path>`, `pnpm exec tsc -b`, `pnpm lint`, `pnpm check:design-system`, and `pnpm build`. The build also performs the token check and TypeScript build.
- Run the full `pnpm test:run` suite when shared UI, routing, authentication, configuration, or cross-feature behavior changes. Run `pnpm build-storybook` when shared UI, stories, tokens, or Storybook configuration changes.
- For UI changes, inspect applicable responsive layouts, themes, keyboard and focus behavior, zoom, reduced motion, and accessibility states in a browser. Automate checks when tooling supports them; record unperformed checks and their impact.
- A Storybook build verifies compilation; it does not execute interaction or accessibility tests by itself. Run separately configured checks when available. No dedicated Storybook test command is currently declared in `package.json`.
- Fix failures caused by the change and rerun affected checks. Investigate and report pre-existing failures with evidence; never disable checks or weaken rules to obtain a passing result. A failed or unavailable required check is a completion limitation.
- For documentation-only edits, check diff whitespace, local link targets, referenced paths, and consistency with scripts and configuration. Application tests and builds are unnecessary unless runtime inputs changed.
- Report the changed behavior, commands and results, and unresolved limitations concisely. Do not claim checks passed when they were not executed.
- Written rules require automated enforcement to reduce human review. Strict TypeScript mode is currently disabled, no `.github` workflow directory is present, and Storybook test execution has no dedicated script. Changes to compiler settings, lint enforcement, or CI need their own scoped implementation and verification.
