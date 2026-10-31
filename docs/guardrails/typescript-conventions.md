# TypeScript conventions

- Follow nearby naming and module conventions. Use PascalCase for components and types, camelCase for values and functions, `use` for hooks, and kebab-case for filenames.
- Give component props, domain models, API inputs and results explicit named types. Use inference for clear local values.
- Treat external data as `unknown` and validate or narrow it at the boundary. Avoid `any`, unchecked casts, non-null assertions, and suppressions that hide errors.
- Use stable domain identifiers as React keys. Model loading, empty, error, disabled, and invalid states where applicable.
- Design for strict type checking: handle null and undefined explicitly, narrow caught errors, and use discriminated unions for mutually exclusive states. The current compiler configuration does not yet enforce strict mode; passing typecheck alone does not establish strict safety. Do not weaken compiler checks to accommodate a change.
- Use type-only imports where appropriate and avoid circular dependencies. Keep domain types independent of presentation concerns; avoid loosely typed objects that permit invalid combinations.
- Preserve immutable props and state. Handle promise failures explicitly; do not leave asynchronous work unhandled or silently discard errors.
