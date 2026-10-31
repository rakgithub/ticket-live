# Testing conventions

- For each feature or behavior change, cover meaningful success, loading, empty, failure, invalid, boundary, disabled, interaction, and state-transition scenarios as applicable.
- Use Vitest and React Testing Library with user-event for user interactions. Assert observable behavior and accessibility semantics rather than internal implementation details.
- Use deterministic fixtures and mock external boundaries. Colocate tests with the feature or component they cover.
- Add representative stories for reusable UI states and interactions; accessibility automation complements keyboard, focus, and visual review.
- Add a regression test that exercises a bug’s original failure when feasible; explain any omitted regression coverage. Isolate and restore mocks, timers, and storage; cover cancellation, retries, and stale responses when relevant.
- Use browser checks for behavior jsdom cannot establish, such as actual layout, focus behavior, and responsive rendering.
- Test API validation and error mapping at the network boundary, including malformed responses and session failures where relevant. Use synthetic data and avoid real credentials or live services.
- Await user interactions and asynchronous assertions. Prefer semantic role/name queries; avoid arbitrary sleeps, implementation-only assertions, and snapshots as the sole evidence of behavior.
- Exercise critical flows across component and feature boundaries when affected, such as sign-in, checkout submission, and recovery from failure. Cover focus return, field errors, and keyboard actions for changed interactions.
- Keep tests independent of order and wall-clock time. Do not skip tests, loosen assertions, or update baselines solely to hide regressions; do not claim exhaustive coverage of unbounded inputs.
