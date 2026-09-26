# Design system implementation specification

Status: implemented in the working tree. This document remains the implementation contract and contribution guide.

## 1. Goal and current state

Build a reusable React design system for this app with shadcn/ui component source, Tailwind CSS v4, and Storybook. The visual language is **Modern Minimalism**: clean hierarchy and restrained decoration, using **Flat Design 2.0** for subtle depth and clear interaction states, and **Card-Based UI** for grouped information. The consuming app must import system components and use named design tokens for every visual decision.

The starting repository was a small React 19 + TypeScript + Vite 8 starter without Tailwind, shadcn/ui, Storybook, a path alias, or a design system. The system is now installed and composed by `src/App.tsx` through the `@/design-system` public entry point. The former starter `src/App.css` has been removed.

### Implemented files

- Tokens and theme aliases: `src/design-system/tokens.css`, `src/design-system/theme.css`, and `src/design-system/index.css`.
- Public component API: `src/design-system/index.ts` and `src/design-system/components/`.
- Storybook configuration and component/foundation/pattern stories: `.storybook/` and `src/design-system/*.stories.tsx` plus component stories.
- Token rule checker: `scripts/check-design-system.mjs`, run by the app build script.
- shadcn configuration: `components.json` with Tailwind v4 CSS variables and project aliases.

### Deliverables

1. A versioned token source, semantic themes, and Tailwind utility mappings.
2. Documented components: Button (including icon-only), Textbox, Dropdown, HeaderBar with dropdown, Card, and ListCard with a controlled size API.
3. A Storybook catalog with usage guidance, states, responsive examples, accessibility checks, and interaction stories.
4. The consuming app rendered from these components and tokens, with no independent visual constants.
5. Automated checks that prevent visual values and direct primitive imports from leaking into app code.

## 2. Research-backed decisions

| Decision | Basis |
| --- | --- |
| Use Tailwind v4 with the Vite plugin and a `@/*` alias. | [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite) describes this setup for an existing Vite project. |
| Initialize shadcn/ui with CSS variables enabled, and keep generated component source under project ownership. | [shadcn/ui `components.json`](https://ui.shadcn.com/docs/components-json) recommends `cssVariables: true` for semantic theming; [theming](https://ui.shadcn.com/docs/theming) maps semantic variables into Tailwind utilities. |
| Define utility-facing tokens with Tailwind `@theme` / `@theme inline`; keep theme-dependent semantic values in CSS custom properties. | [Tailwind theme variables](https://tailwindcss.com/docs/theme/) distinguish theme variables from ordinary CSS variables. |
| Use the React + Vite Storybook framework and CSF stories with Autodocs and Controls. | [Storybook React/Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite), [Autodocs](https://storybook.js.org/docs/writing-docs), and [Controls](https://storybook.js.org/docs/essentials/controls). |
| Run accessibility checks and interaction tests on meaningful states. | [Storybook accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing) and [interaction testing](https://storybook.js.org/docs/writing-tests/interaction-testing). |
| Set a target-size token above the WCAG 2.2 AA minimum, and verify focus and contrast separately. | [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) requires at least 24×24 CSS pixels or adequate spacing; use a larger system default. |

These are implementation choices for this repository, not claims that shadcn or Tailwind prescribe the exact palette or component API below. Before installing, resolve current compatible package versions from official package guidance; commit the resulting lockfile. Do not copy a version number from this plan into `package.json` without checking compatibility.

## 3. Non-negotiable rules

1. **Single source of truth.** Literal visual values belong only in `src/design-system/tokens.css` (and, if needed, a token metadata file that references those variables). This includes colors, spacing, type sizes, line heights, radius, shadows, borders, dimensions, motion, breakpoints, and z-index. Never redefine token values in a component, story, or app page.
2. **Semantic names.** Components consume `surface`, `text`, `border`, `action`, `focus`, `danger`, and component-specific semantic tokens. Do not bind a component directly to a palette step such as `zinc-200` or `blue-600`.
3. **No arbitrary visual values in app code.** Reject utilities such as `p-[13px]`, `w-[340px]`, `bg-[#fff]`, `text-[1.1rem]`, inline `style={{ width: 320 }}`, and independent CSS declarations with literal visual values. Numerical values are allowed in data, calculations unrelated to appearance, and accessibility attributes.
4. **No hardcoded pixel values outside token definitions.** In CSS, component source, stories, and the consuming app, refer to tokens or token-generated utilities. Token definitions may contain literal `rem`, `px`, `ms`, and color values; this is where design decisions are approved and changed. If a browser-specific one-off value is unavoidable, create and document a named token first.
5. **No bypass imports.** The app imports components from `@/design-system` (or an explicit public export path), not shadcn primitives from `@/components/ui`, Radix/Base UI, or third-party widget packages. Low-level primitives are private implementation details.
6. **Variants are finite APIs.** Expose named `variant`, `size`, and `density` choices. Never offer a public numeric width/height/padding prop for normal layout. Use container-driven layout (`width: 100%`, grid/flex) and tokenized max-width variants.
7. **Accessibility is part of the API.** Every interactive control supports keyboard use, visible focus, disabled states, accessible naming, and appropriate semantics. Icon-only buttons require an accessible label. Textboxes have a connected label and message/description. Dropdowns manage focus and Escape correctly.
8. **Theme parity.** Light and dark themes define the same semantic token names. Storybook and the app load the exact same stylesheet; no Storybook-only palette. Respect reduced motion and user zoom.
9. **No silent shadcn overwrite.** Generated files are owned code. On future `shadcn add` or update, review diffs and reapply system tokens and stories before merging.
10. **A component is not done without Storybook.** Each exported component needs usage documentation, representative states, keyboard behavior, and a11y review. Composite components need interaction stories.

## 4. Architecture and file ownership

```text
src/
  design-system/
    tokens.css                 # only approved literal visual values
    theme.css                  # semantic light/dark aliases, no literal values
    index.css                  # Tailwind import, @theme mappings, base rules
    index.ts                   # public component exports
    components/
      button.tsx
      textbox.tsx
      dropdown.tsx
      header-bar.tsx
      card.tsx
      list-card.tsx
      *.stories.tsx
    docs/
      Foundations.mdx
      UsageRules.mdx
src/
  app/                         # consuming app; only public design-system imports
  index.css                    # imports design-system/index.css only
.storybook/
  main.ts
  preview.tsx
components.json
```

Use `src/design-system/components` as the public component implementation location. Configure shadcn aliases so CLI-generated primitives enter a private `src/components/ui` directory; adapt or wrap them into the public design system. If the CLI can safely target the system directory, keep a separate private/public boundary by file name or subdirectory. The key invariant is that the consuming app never treats generated primitives as its public API.

For this single-app repository, start with in-repo source rather than an npm package or monorepo. Keep public exports and token CSS self-contained so extraction into a package is possible later. Avoid publishing or packaging work until a second consumer exists.

## 5. Token model

### Layers

1. **Reference tokens** (`--ref-*`): raw palette and scale values. Defined once in `tokens.css`.
2. **Semantic tokens** (`--ds-*`): roles used by components and pages; light/dark values point to references. Examples: `--ds-surface-page`, `--ds-surface-card`, `--ds-text-primary`, `--ds-text-muted`, `--ds-border-subtle`, `--ds-action-primary`, `--ds-action-primary-text`, `--ds-focus-ring`.
3. **Component tokens** (`--button-*`, `--textbox-*`, `--card-*`, `--header-*`): aliases to semantic/scale tokens when a component needs an independent tuning point. Do not duplicate raw values here.
4. **Tailwind mappings**: `@theme inline` exposes semantic variables as utilities such as `bg-surface-card`, `text-text-primary`, `border-border-subtle`, `ring-focus-ring`. Define named spacing, radius, type, shadow, breakpoint, and motion utilities via the appropriate Tailwind theme namespaces.

Example shape (illustrative token names; approve actual values during implementation):

```css
/* tokens.css: the only place for literal design values */
:root {
  --ref-neutral-0: oklch(1 0 0);
  --ref-neutral-950: oklch(0.18 0.01 260);
  --ref-space-1: 0.25rem;
  --ref-space-2: 0.5rem;
  --ref-space-3: 0.75rem;
  --ref-control-height-md: 2.75rem;
  --ref-radius-card: 0.75rem;
}

/* theme.css: semantic aliases only */
:root {
  --ds-surface-page: var(--ref-neutral-0);
  --ds-text-primary: var(--ref-neutral-950);
}

/* index.css: utility API */
@import "tailwindcss";
@import "./tokens.css";
@import "./theme.css";

@theme inline {
  --color-surface-page: var(--ds-surface-page);
  --color-text-primary: var(--ds-text-primary);
  --spacing-control-md: var(--ref-control-height-md);
  --radius-card: var(--ref-radius-card);
}
```

Follow the shadcn initializer's required token names (`--background`, `--foreground`, etc.) as compatibility aliases pointing to `--ds-*` tokens. Keep all aliases in the design-system CSS. Use `@custom-variant dark` if class-based theme switching is chosen; the same theme class/data attribute must apply in Storybook and the app. Add a `color-scheme` declaration through theme CSS so native controls match.

### Required token inventory

| Group | Minimum names / behavior |
| --- | --- |
| Color | Page, raised card, inset surface, popover, primary/secondary/muted text, subtle/strong border, primary/secondary/destructive action with foreground, focus ring, success/warning/error states. Define hover and pressed semantic aliases where a state differs. |
| Space | A small consistent scale plus control internal gap, page gutter, section gap, card padding, list row gap, header gap. No page-specific numbers. |
| Type | Font families, display/title/body/label/caption sizes, line heights, weights, tracking. Favor readable body text and restrained headings. |
| Shape | Input/button/card/popover radii and border widths. Rounded cards are moderate, not pill-like by default. |
| Elevation | `none`, `card`, `popover`; low-contrast shadows only on raised surfaces. Borders may carry separation in dark mode. |
| Sizing | Control heights (sm/md/lg), icon sizes, target minimum, header height, card max-width choices, content max-width, popover minimum width. |
| Layout | Named breakpoints, gutters, grid gaps, list/card column rules. Use fluid tracks and container width where possible. |
| Motion | Fast/normal durations and easing; reduced-motion alternative. Use motion primarily for hover/focus/menu transitions, never decorative bounce. |
| Layering | Header, dropdown/popover, overlay z-index roles. |

Record each token's purpose in Storybook Foundations. Token changes must be reviewed in both themes and at mobile and desktop widths. Do not create token aliases for one-off guesses; add a token only when it represents a reusable design decision.

Keep Tailwind utility namespaces distinct when the same suffix would mean different things. Card padding utilities use `p-card-sm/md/lg`; card width caps use `max-w-card-width-sm/md/lg`. Do not define both `--spacing-card-md` and `--container-card-md`, because Tailwind can resolve `max-w-card-md` to the spacing value and collapse the card.

## 6. Visual direction

- Use a neutral page surface with a small number of emphasized actions. Strong color is reserved for action, selection, focus, and status.
- Cards group related content through a subtle border, moderate radius, measured padding, and a restrained elevation token. Avoid stacked heavy shadows and large gradients.
- Buttons and inputs remain visually flat at rest, with clear hover, pressed, focus, disabled, and error states. Depth should clarify affordance, not decorate every element.
- Keep spacing regular and typography hierarchical. Prefer alignment and whitespace to separators. Keep content density controlled through named `compact`, `comfortable`, or size variants.
- HeaderBar has a quiet surface, clear navigation/current context, and dropdown affordance. Its menu surface uses the shared popover tokens.
- Use a consistent icon set (prefer the shadcn initializer's configured icon library). Icons support text and actions; they do not replace labels unless an accessible label is supplied.

## 7. Component contracts

| Component | Public API | Required stories and behavior |
| --- | --- | --- |
| `Button` | Native button props; `variant: primary \| secondary \| outline \| ghost \| destructive`; `size: sm \| md \| lg`; `loading`; optional leading/trailing icon. `IconButton` is a dedicated export or `iconOnly` variant using a square target token and required `aria-label`. | All variants/sizes, icon leading/trailing, icon-only, loading, disabled, hover/focus/pressed. Loading prevents duplicate activation and has an accessible status. Preserve native `type` behavior. |
| `Textbox` | Native input props; `label`, `description`, `error`, `size`, optional leading/trailing icon; controlled and uncontrolled use. | Empty, filled, placeholder, required, disabled, readonly, error, long text, keyboard focus. Connect label and help/error via IDs and `aria-describedby`; set `aria-invalid` when needed. |
| `Dropdown` | Trigger, items (action/link/separator), alignment, optional selected item and disabled state. Use the current shadcn menu/select primitive appropriate to the interaction: action menu for commands, Select for choosing a value. | Closed/open, keyboard navigation, Escape, selection, disabled item, long labels, edge alignment, mobile viewport. Do not use a menu role for a form select. |
| `HeaderBar` | Brand/title slot, navigation slot, action slot, account/menu content, responsive collapse behavior. Compose public Button and Dropdown. | Desktop/mobile, account menu open, long title, keyboard traversal, no actions, dark theme. Header height/gutters derive from tokens; no fixed values in app code. |
| `Card` | `size: sm \| md \| lg \| full` for tokenized width/max-width and padding; `variant: default \| interactive \| outlined`; header/content/footer slots. | Size matrix, content overflow, interactive focus, disabled/noninteractive, dark theme. The entire card is interactive only if it has one clear destination/action and valid semantics. |
| `ListCard` | Typed `items`, item renderer or supported slots, `size: sm \| md \| lg \| full`, optional heading/actions/empty state. Compose Card. | Short/long list, empty/loading/error, custom size choices, long text, mobile stacking, item keyboard behavior. Stable item keys; do not make nested controls inside a clickable parent card. |

Define component props in TypeScript and export them with components. Use `class-variance-authority` or the current shadcn-generated variant approach consistently. Permit `className` for layout integration, but document that consumers may only pass token utilities and cannot override component internals with raw values. Use `data-slot` or stable selectors only where composition needs styling. Avoid a `style` prop as a general customization path; if inherited from HTML props, enforce the app rule against visual inline values.

### Example consumer usage

```tsx
import { Button, HeaderBar, ListCard, Textbox } from '@/design-system'

export function TicketPage() {
  return (
    <div className="min-h-svh bg-surface-page text-text-primary">
      <HeaderBar title="Tickets" />
      <main className="mx-auto max-w-content px-page-gutter py-section-gap">
        <div className="grid gap-section-gap">
          <Textbox label="Search tickets" type="search" />
          <ListCard size="lg" heading="Recent tickets" items={[]} />
          <Button variant="primary">Create ticket</Button>
        </div>
      </main>
    </div>
  )
}
```

The example utility names must be implemented by tokens before use. Real `ListCard` items and handlers come from app data, not the design system.

## 8. Storybook contract

1. Install Storybook using its React/Vite framework in the existing project; use the package manager already represented by `pnpm-lock.yaml`. Add `storybook` and `build-storybook` scripts.
2. Import `src/design-system/index.css` once from `.storybook/preview.tsx`. Provide toolbar controls for light/dark theme and viewport presets. Apply the same theme selector used by the app.
3. Organize navigation as `Foundations/*`, `Components/*`, and `Patterns/*`. Foundations documents token swatches, spacing/type/shape/elevation scales, icon rules, theme use, and accessibility. Patterns includes HeaderBar plus a ticket list page composition.
4. Use CSF stories with typed `Meta`/`StoryObj`, `args`, and useful Controls. Enable Autodocs and add concise guidance: purpose, anatomy, prop table, usage, accessibility, and anti-patterns.
5. Make stories deterministic: fixed fixture data, no network dependency, stable clocks/IDs, and no app state imports. Storybook is a consumer of the public design-system API.
6. Add interaction `play` checks for dropdown open/select/Escape, textbox label/error wiring, icon button accessible name, and card/list actions. Use the Storybook accessibility addon with violations failing component checks; manually inspect keyboard order, contrast, zoom, and reduced motion because automated scans are incomplete.
7. Run Storybook build in CI alongside app build and lint. If visual snapshots are introduced, approve baselines for both themes and representative mobile/desktop widths; do not let snapshots replace behavioral or accessibility checks.

## 9. Implementation sequence

### Phase 1 — foundation

- Install Tailwind v4 and its Vite plugin; replace starter CSS with the design-system entry stylesheet. Add the `@/*` path alias in Vite and TypeScript configuration.
- Run `shadcn init` for this existing Vite project with CSS variables. Review `components.json` for correct `new-york` style, `cssVariables: true`, CSS path, and aliases; Tailwind v4 needs no traditional config path.
- Define reference, semantic, and Tailwind-exposed tokens, light/dark modes, base typography, and focus/motion rules. Verify generated `bg-*`, `text-*`, `p-*`, `rounded-*`, `shadow-*`, and sizing utilities resolve.
- Add Storybook and a Foundations page before component work, so tokens are visible and reviewable.

### Phase 2 — primitives and composites

- Add the required shadcn primitives (button, input, dropdown menu, select if needed, card) one at a time. Review generated code and adapt it to system tokens and public contracts.
- Implement Button/IconButton and Textbox first; then Dropdown; then Card/ListCard; finally HeaderBar. Add stories and interaction/a11y checks with each component, not afterward.
- Ensure size props map to named token utilities and that custom list card sizes remain finite. If a new size is needed, define its token and story before using it in the app.

### Phase 3 — consuming app and enforcement

- Replace the starter app surface with a small ticket screen demonstrating HeaderBar, search Textbox, action Button, Dropdown, and ListCard. Keep domain data and behavior in `src/app`.
- Remove `src/App.css` starter visual rules. `src/App.tsx` should compose app components only; it should not define ad hoc styling.
- Add a lint/static check over `src/app` and public component files that rejects arbitrary Tailwind values, direct hex/rgb/oklch colors, literal CSS dimensions, visual inline styles, and imports from private primitives. Allow literals only in `tokens.css` and narrowly documented tooling fixtures.
- Run build, lint, Storybook build, interaction checks, and manual responsive/theme/keyboard review. Fix failures before declaring the system ready.

## 10. Acceptance criteria

- All six requested component families exist as public exports and have typed props, documented stories, light/dark states, and keyboard/focus behavior.
- Button includes a usable icon-only option with an accessible name; Textbox connects label/help/error; Dropdown behaves correctly with keyboard and Escape; HeaderBar uses the same dropdown; Card/ListCard expose tokenized size choices.
- The app consumes only public design-system components for these UI elements. A search of `src/app` and `src/App.tsx` finds no literal visual values, arbitrary Tailwind values, or private primitive imports.
- Changing a reference or semantic token updates both Storybook and app output. Theme switch does not leave a light-only component.
- A Storybook build and app build pass. Accessibility checks pass on documented stories, and manual review confirms contrast, focus visibility, target sizes, responsive layout, zoom, and reduced motion.
- The ticket screen demonstrates real composition without hardcoded pixels or per-page color/spacing choices.

## 11. Review checklist for every future UI change

1. Is this a reusable design decision? Put its value in the token source and name its semantic role.
2. Does a system component already express the interaction? Reuse it through the public export.
3. Does the change need a new variant? Add a finite prop value, token mapping, docs, and stories.
4. Are all interactive states and both themes represented? Check keyboard, focus, target size, and contrast.
5. Does the consuming app contain any independent visual constant or private component import? Reject the change until removed.
