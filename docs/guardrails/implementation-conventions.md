# Implementation conventions

- Apply these conventions to features and bug fixes. Follow nearby code and the design-system contract; make the smallest change that addresses the requested behavior.
- Keep application logic in `src/features/<domain>/`, with related components, hooks, APIs, types, and tests together. Keep routes and app entry files thin; avoid unrelated refactors during fixes.
- Import shared UI through `@/ui` and other features through their public exports. Keep reusable UI independent of feature logic; use `src/shared/` only for genuinely shared code.
- Put raw visual values only in `src/ui/tokens.css`. Use semantic aliases and token-backed utilities; avoid hardcoded visual values, arbitrary Tailwind values, and inline visual styles. Data, IDs, and nonvisual calculations may use numbers. Ensure the design-system checker scans new source directories.
- Compose small components with typed props and one responsibility. Follow [TypeScript conventions](typescript-conventions.md) for public boundaries and domain types.
- Keep state at its narrowest owner and derive values instead of duplicating them. Use TanStack Query only when server data, invalidation, or mutations need it; keep query keys and operations in the owning feature.
- Keep rendering pure and call hooks at the top level. Use effects to synchronize with external systems, declare reactive dependencies, and clean up subscriptions and in-flight work.
- Cancel requests where appropriate, prevent stale responses from replacing current state, and prevent duplicate submissions. Handle loading, empty, error, disabled, and invalid states with recoverable feedback where applicable.
- Use semantic HTML, accessible names and labels, keyboard operation, and visible focus. Preserve responsive behavior, theme parity, and reduced motion; document reusable components and meaningful states in Storybook.
- Treat client environment variables as public. Never log credentials, tokens, or sensitive user data. Sanitize untrusted HTML when HTML rendering is necessary.
- Keep API calls and response validation at feature boundaries. Handle HTTP and malformed-response failures explicitly; preserve API contracts, money units, currencies, and date/time-zone semantics. Reuse existing authentication and session handling; client route guards do not establish server authorization.
- Use native form semantics, connected field errors, and explicit button types. Preserve input on recoverable failures and manage focus when dialogs open or close. Use stable entity IDs for list keys.
- Prefer supported React APIs and existing dependencies. Preserve established public component behavior; add memoization only for a demonstrated need and avoid speculative abstractions.
- Follow [planning conventions](planning-conventions.md) for structural approval, [testing conventions](testing-conventions.md) for behavior coverage, and [verification conventions](verification-conventions.md) before reporting completion.
