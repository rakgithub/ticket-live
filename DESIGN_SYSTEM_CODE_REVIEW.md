# Design system code review and change plan

Reviewed: 25 September 2026. Scope: `src/design-system`, `.storybook`, `src/App.tsx`, `scripts/check-design-system.mjs`, `components.json`, and the existing implementation plan. The findings below informed the follow-up implementation; remaining items are tracked as follow-up work.

## Overall assessment

The project has a useful foundation: semantic light and dark color tokens, named Tailwind utilities, a public component entry point, typed props, and Storybook examples. The Card width collision reported earlier is resolved by the distinct `card-width-*` token names. The remaining issues are mostly API correctness and verification. In particular, `Button` combines a polymorphic `asChild` API with button-only props and a child structure that can fail at runtime. Several visible app actions do nothing. The current checker and Storybook stories do not prove the strict rules promised in `DESIGN_SYSTEM_IMPLEMENTATION.md`.

Priority means: **P1** = correctness, accessibility, or misleading public API; **P2** = maintainability or missing verification; **P3** = cleanup. No finding below requires a wholesale rewrite.

## P1 — Correctness and public API

### 1. Replace the unsafe `Button asChild` contract

**Evidence:** `src/design-system/components/button.tsx:29-55`. `ButtonProps` extends `ButtonHTMLAttributes<HTMLButtonElement>` and its ref is fixed to `HTMLButtonElement`, yet `asChild` may render an anchor or another element. When `loading`, `leadingIcon`, or `trailingIcon` is present, `Slot` receives multiple children (`LoaderCircle`, icons, and the consumer element). Radix Slot's child-cloning contract expects one slottable element; this combination can throw or put content in the wrong place. `disabled` is also passed to an anchor, where it has no native disabling effect. The public type currently permits all of these combinations.

**Change:** Prefer a small native `Button` whose root is always `<button>`. Add a separate `ButtonLink`/`LinkButton` API for navigation, or retain `asChild` only with a discriminated prop union and a tested single-child composition using `Slot.Slottable`. If retained, define which props work on non-button elements, make disabled links non-activatable through actual link semantics, and type refs according to the rendered element. Do not use `asChild` for loading until that state has a correct DOM and focus contract. Add stories and interaction checks for native button, link, disabled, and loading cases.

### 2. Make icon-only buttons require an accessible name

**Evidence:** `button.tsx:21-35` permits `size="icon"` and `iconOnly` on `ButtonProps` without requiring a label. `IconButtonProps` requires `aria-label`, but callers can bypass it with `Button size="icon"`; this occurs in `src/App.tsx:144` and `src/design-system/components/header-bar.tsx:50-64` (these usages happen to provide labels).

**Change:** Remove the icon-only route from the general `Button` API and use `IconButton` with a required accessible name, or use a discriminated union that requires `aria-label`/`aria-labelledby` whenever the icon size is selected. Document the requirement and test the computed accessible name in Storybook.

### 3. Fix `Textbox` description and error ID composition

**Evidence:** `src/design-system/components/textbox.tsx:21-45` creates description/error IDs, then spreads `...props` after `aria-describedby` and `aria-invalid`. A caller-provided `aria-describedby` replaces the generated IDs; a caller-provided `aria-invalid` can contradict `error`. That makes help/error text invisible to assistive technology even though it is rendered.

**Change:** Destructure caller `aria-describedby` and `aria-invalid` explicitly. Merge the caller's IDs with generated IDs in a stable order and make the rendered error authoritative for `aria-invalid` (or define a clear override rule). Place the final attributes after `...rest` so the computed relationship cannot be accidentally replaced. Add a Storybook interaction assertion that the input points to all expected IDs.

### 4. Give visible app controls real behavior or remove their affordance

**Evidence:** `src/App.tsx:62-66,76,118,139-155,168` renders account commands, Create ticket, a filter menu, More filters, row links, View all tickets, and Open support guide with no handlers or real destinations. Links such as `#customers`, `#reports`, `#all-tickets`, and `#tk-2481` have no matching targets in this page. `src/design-system/components/header-bar.tsx:32-35,59-61` also invents default account actions and a Notifications button with no action.

**Change:** Connect actions to actual routes/state/handlers when those features exist. For this demo, remove dead controls or present them as clearly non-interactive content. Implement filter state before labeling the menu “Filter”; if it chooses one value, use a selection control rather than an action menu. Give navigation real destinations or remove the links. Make HeaderBar accept real account/notification slots instead of inserting clickable defaults. A design system should not silently supply product actions that cannot run.

### 5. Align the dropdown primitive with its job

**Evidence:** `src/design-system/components/dropdown.tsx:7-58` defines only optional `onSelect` commands, while `src/App.tsx:139-143` uses it as a ticket filter with no selection state or response. The implementation also duplicates menu styling between the high-level `Dropdown` and composable `DropdownMenu*` exports (`dropdown.tsx:33-53,67-143`), so fixes can diverge.

**Change:** Keep `DropdownMenu` for commands and links. For a value such as ticket status, add a controlled Select or RadioGroup with `value` and `onValueChange`. Render the high-level command menu using the exported styled primitives, or remove the high-level wrapper if composition is clearer. Use one styling implementation. The [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) describes a command menu; selection needs an explicit selected-value contract.

### 6. Make interactive Card and ListCard row semantics honest

**Evidence:** `src/design-system/components/card.tsx:22,35` exposes `variant="interactive"` on a `<div>`. Hover styling works, but the focus style does not make it keyboard reachable or actionable. `src/design-system/components/list-card.tsx:54-81` offers only a string `href` or a static `<div>`; it cannot pass normal anchor props or a router link component through the typed API. This likely encourages placeholder hash links, as seen in the app and stories.

**Change:** Keep Card as a presentational surface; remove or rename the interactive variant unless it renders or wraps a real semantic control. Provide a separately typed link-card/action-card pattern if needed. Let ListCardRow accept ordinary anchor attributes for real URLs, and provide a composition slot for router links if the app uses a router. Do not add `tabIndex` and click handlers to a div as a substitute for semantic controls. Add keyboard and destination checks.

## P2 — React 19, tokens, and verification

### 7. Migrate local `forwardRef` wrappers to React 19 ref props

**Evidence:** `button.tsx:39,65`; `textbox.tsx:14`; `card.tsx:26,46,51,56,61,66`; `dropdown.tsx:67,82,94,112,120,128,138`. The app uses React 19 (`package.json:23-24`). For React 19 function components, `ref` is an ordinary prop; [React documents](https://react.dev/reference/react/forwardRef) that `forwardRef` is no longer necessary and will be deprecated in a future release. The current [shadcn Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) also removed forwardRef from its components.

**Change:** After fixing the polymorphic Button contract, write local wrappers as normal functions with `ref` in the prop type (for example, `React.ComponentPropsWithRef<'button'>`). Preserve ref forwarding to the actual DOM/Radix element and verify refs in a focused interaction test. Use `ComponentPropsWithRef<typeof Primitive.Item>` for Radix wrappers where accepted. Treat this as a modernization and simplification, not as an emergency runtime bug: `forwardRef` still works today. Avoid a blind search/replace, especially for `Slot` and nested portals.

### 8. Make Storybook Controls and interaction checks real

**Evidence:** `src/design-system/components/list-card.stories.tsx:19-48` declares component `args`, but each custom `render` ignores them, so Controls cannot change the displayed list. A search of stories found no `play` functions. `.storybook/preview.tsx:30` requests a11y errors, but the implementation plan claims interaction checks that are not present (`DESIGN_SYSTEM_IMPLEMENTATION.md:200,231`).

**Change:** For playground stories, pass `args` into the rendered component. Keep fixed showcase stories separate and disable irrelevant controls there. Add small, meaningful interaction tests for dropdown open/select/Escape, textbox label/help/error IDs, icon-button name, and list/card navigation. Run the tests in CI as well as the static Storybook build. Storybook [Args](https://storybook.js.org/docs/writing-stories/args) and [interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing) cover these patterns.

### 9. Enforce token rules across the actual source surface

**Evidence:** `scripts/check-design-system.mjs:5,18-35` scans only `src/App.tsx` and `src/app`; it ignores design-system components, stories, and `.storybook`. `walk()` silently returns an empty array for any read error, so a missing directory appears successful. `.storybook/preview.tsx:33-34` contains literal viewport dimensions even though matching tokens exist at `tokens.css:83-85`. The original plan says literals outside token definitions are prohibited (`DESIGN_SYSTEM_IMPLEMENTATION.md:42-45`).

**Change:** Define an explicit scan scope covering app, design-system TSX/CSS, and Storybook configuration, with narrow documented exceptions for tooling values that must be numeric strings. Fail on unexpected read errors; only an intentionally absent optional directory may be skipped. Use a parser or targeted ESLint/Stylelint rules for reliable class/JSX/CSS checks instead of relying solely on whole-file regex. Add fixture tests that prove one forbidden value fails and valid token use passes. Reference the viewport tokens through a small shared metadata/export if Storybook requires concrete dimensions, or document and validate the necessary duplication.

### 10. Resolve theme ownership for portaled menus

**Evidence:** `src/App.tsx:55` puts `data-theme` on an app `<div>`, while dropdown content is portaled to `document.body` (`dropdown.tsx:33,71`). CSS semantic tokens are inherited from `[data-theme="dark"]` (`theme.css:30-56`), so the portaled menu can inherit root light tokens while the app is dark. Storybook masks this by setting `document.documentElement.dataset.theme` in its decorator (`.storybook/preview.tsx:4-7`). That decorator also mutates the document during render.

**Change:** Give the app one theme owner at the document root, synchronized in an effect or a dedicated theme provider. Storybook should set and clean up the same root attribute in an effect/decorator, including story changes. Then verify an opened dropdown in both themes. This is a likely cause of cross-theme portal styling discrepancies and should be checked visually after the change.

### 11. Make the shadcn source path and public API consistent

**Evidence:** `components.json:14-19` points the shadcn `ui` alias to `@/components/ui`, while the actual public components live in `src/design-system/components` and are exported from `src/design-system/index.ts`. Future `shadcn add` commands may create a second component tree and bypass the tokenized API. `dropdown.tsx:60-65` directly re-exports some Radix primitives, while the implementation plan says underlying primitives should stay private (`DESIGN_SYSTEM_IMPLEMENTATION.md:47-51`).

**Change:** Choose one owned source path. Point the CLI alias at the maintained location if it is compatible with generation, or document a deliberate generation-and-adaptation workflow that never exposes raw generated files to the app. Decide which Radix primitives are intentional public composition points; wrap them consistently or keep them internal. Record how component updates are reviewed so future generation cannot silently replace token styling.

### 12. Respect reduced motion for the loading spinner

**Evidence:** `button.tsx:51` uses Tailwind's `animate-spin`; `tokens.css:114-119` reduces transition tokens but does not affect that animation. The stated rule is to respect reduced motion (`DESIGN_SYSTEM_IMPLEMENTATION.md:49`).

**Change:** Add a tokenized spinner animation rule with a reduced-motion alternative, or stop the decorative rotation under `prefers-reduced-motion`. Preserve a visible loading indication and `aria-busy`; verify the control remains understandable without animation.

## P3 — Cleanup and documentation

### 13. Remove unused dependencies and duplicate token aliases

**Evidence:** `package.json:17` includes `@radix-ui/react-select`, but no Select component or import exists in the reviewed source. `tokens.css:78,81` defines the same `24rem` card width twice as `--ref-card-sm` and `--ref-card-width-sm`; `index.css:90,106` maps both to utilities. This creates two names for one decision.

**Change:** Remove the unused dependency unless the controlled Select from finding 5 is implemented immediately. Consolidate the card width reference so size and layout utilities point to one token. Retain distinct semantic aliases only when they express genuinely separate decisions.

### 14. Update documentation to distinguish shipped behavior from target behavior

**Evidence:** `DESIGN_SYSTEM_IMPLEMENTATION.md:23,200,231` describes interaction stories, complete accessibility checks, and an enforced token policy, while the current stories and checker do not deliver all of those claims.

**Change:** Mark the document as an implementation target and link this review. When changes land, replace aspirational completion statements with commands and evidence: build, lint, Storybook build, interaction test, and manual light/dark/mobile/keyboard checks. Keep stories as examples of supported behavior, not placeholders with dead links.

## Suggested implementation order

1. Correct theme ownership and the Button API; these can affect runtime behavior and all consumers.
2. Fix Textbox relationships, Card/ListCard semantics, and the dropdown command-versus-selection API.
3. Make the app's controls real or remove dead affordances, then update stories to use valid destinations and handlers.
4. Migrate local refs to React 19 prop-based refs once component boundaries are stable.
5. Expand the token checker and add focused Storybook interaction checks; make those checks part of CI.
6. Align `components.json`, remove unused dependencies, and update the implementation documentation.

## Acceptance criteria for the follow-up change set

- No public Button prop combination can create invalid Slot children or an anchor that only *appears* disabled.
- Every icon-only action has a required accessible name; every visible action either works or is absent.
- Textbox help and error text remain referenced after caller-provided ARIA IDs are added.
- Dark and light themes apply identically to inline components and portaled dropdown content.
- Storybook Controls change playground output, and interaction tests cover keyboard behavior and critical ARIA relationships.
- The token gate scans all intended source directories, fails on read errors, and rejects a known forbidden fixture.
- App and Storybook builds, lint, interaction checks, and manual mobile/dark/reduced-motion checks pass.

## Sources used for current practice

- [React 19 `forwardRef` reference](https://react.dev/reference/react/forwardRef)
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [Storybook Args](https://storybook.js.org/docs/writing-stories/args) and [interaction testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [WAI-ARIA Authoring Practices: Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
