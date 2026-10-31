# Planning conventions

- Inspect the closest feature, UI public API, affected contracts, and existing tests before deciding scope. For bugs, establish the failing behavior and likely cause before changing code.
- Define observable acceptance criteria, affected states, API assumptions, and risks such as retries, interrupted requests, and session changes. Scale the plan to the change; a focused fix needs only a short plan.
- Reuse existing components and tokens. Identify accessibility, responsive layout, theme, security, and compatibility impacts where relevant. Avoid adding dependencies or abstractions without a demonstrated need.
- Identify the necessary tests and verification commands before implementation. Check available tooling rather than assuming a documented capability is configured.
- Major structural changes include moving feature ownership, changing public UI or API contracts, replacing routing or state architecture, and broad refactors. Present affected files, migration approach, behavior impact, test plan, and rollback path; wait for explicit approval before applying or committing them. Routine feature edits and focused fixes need no extra checkpoint.
