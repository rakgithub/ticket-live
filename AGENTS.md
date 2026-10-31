# Ticket Live UI engineering guide

Ticket Live is a React and TypeScript frontend for event discovery, booking, account access, and AI-assisted search. It uses Vite, React Router, Tailwind CSS, Vitest, and Storybook; pnpm is the repository package manager.

## Repository layout

- `src/app/` contains routing, guards, and the application shell.
- `src/features/` contains feature-owned components, APIs, types, hooks, and tests.
- `src/ui/` contains the current shared UI components, tokens, and stories.
- `scripts/` contains repository checks; `docs/guardrails/` contains engineering conventions.

Read the relevant convention files before planning, implementing, testing, or verifying a change:

- [TypeScript conventions](docs/guardrails/typescript-conventions.md)
- [Planning conventions](docs/guardrails/planning-conventions.md)
- [Implementation conventions](docs/guardrails/implementation-conventions.md)
- [Testing conventions](docs/guardrails/testing-conventions.md)
- [Verification conventions](docs/guardrails/verification-conventions.md)

Use the guardrails as the contribution rules for features and fixes. For current paths and workflow, this guide and the guardrails take precedence over older implementation plans. Follow existing conventions where they agree; do not copy an existing violation into new code.

Make routine implementation decisions independently within the requested scope. Preserve unrelated work, avoid incidental refactors, and request input only for missing product decisions or the structural approval defined in planning conventions. Completion requires the applicable verification checks and a concise report of changes, results, and remaining limitations.
