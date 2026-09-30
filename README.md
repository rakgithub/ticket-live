# 🎟️ Ticket Live

**Plan an event. Find your next one. Get tickets.**

Ticket Live is an event and ticketing web app. Organizers can publish events, while signed-in users can browse availability and submit ticket checkout requests. The app uses a separate API service for account and event data.

| Layer | Tools |
| --- | --- |
| App | React 19, TypeScript, Vite, React Router |
| UI | Tailwind CSS 4, token-based design system, Lucide icons |
| Component catalog | Storybook with accessibility addon |
| Checks | Vitest, React Testing Library, Oxlint, TypeScript |

[Features](#features) · [Pages](#pages) · [Getting started](#getting-started) · [API contract](#api-contract) · [Development](#development)

## Features

| Area | What you can do |
| --- | --- |
| **Accounts** | Sign in or create an account. Authenticated routes are protected, and users can log out from the app header. |
| **Events** | Browse event descriptions, date and time, location, remaining ticket availability, price, and event details. Cancelled and sold-out events cannot be booked. |
| **Create an event** | Submit an event with guest limits, schedule, location, ticket price, currency, and alcohol-service details. The form validates values before sending them to the API. |
| **Ticket checkout** | Select a seat quantity, review the total, and submit a checkout request. The app displays success or error feedback from the request. |
| **Support chat** | Open or minimize the floating chat box on authenticated pages. Sent messages are shown in the local transcript. |
| **Design system** | Reusable controls and patterns use shared design tokens and are documented in Storybook. Stories include light and dark theme previews. |

> **Current scope:** The Orders page is a placeholder while order history is developed. The chat widget does not yet connect to a bot or persist messages.

## Pages

| Path | Access | Description |
| --- | --- | --- |
| `/` | — | Redirects to `/events`. |
| `/login` | Public | Sign in or switch to account creation. Signed-in users are redirected to events. |
| `/events` | Signed in | Browse events and open the booking checkout flow. |
| `/events/new` | Signed in | Create and publish an event. |
| `/orders` | Signed in | Order history placeholder. |

## Getting started

### Requirements

- Node.js
- pnpm
- A Ticket Live API service

### Configure the API

Create a `.env` file in the repository root. For a local API listening on port `4002`, use:

```env
BASE_API_URL=http://localhost:4002
```

### Install and run

```bash
pnpm install
pnpm start
```

Vite prints the local development URL. Authentication, event operations, and checkout require the API service to be running.

## API contract

The frontend appends these routes to `BASE_API_URL`:

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/login` | Authenticate with an email and password. |
| `POST` | `/register` | Create an account with a name, email, and password. |
| `POST` | `/logout` | End the current authenticated session. |
| `GET` | `/events` | Return an object shaped like `{ "events": [...] }`. |
| `POST` | `/events` | Create an event. |
| `POST` | `/orders/checkout` | Submit `{ "eventId", "quantity" }` for checkout. |

Authenticated requests send the access token as a Bearer token. Event records include an ID, name, description, location, start time, guest limits, reserved quantity, ticket price in cents, currency code, alcohol-service flag, and cancellation flag. See [`src/features/events/types/event.ts`](src/features/events/types/event.ts) for the TypeScript contract.

Successful login and registration responses must include an `accessToken` and `tokenType: "Bearer"`. Event creation sends the event fields represented by `CreateEventInput`; checkout sends an event ID and quantity.

## Development

### Commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Start the Vite development server. |
| `pnpm test` | Run Vitest; interactive terminals use watch mode. |
| `pnpm test:run` | Run the full test suite once. |
| `pnpm lint` | Run Oxlint. |
| `pnpm check:design-system` | Check app and UI sources for design-token rule violations. |
| `pnpm build` | Run the design-system check, TypeScript build, and Vite production build. |
| `pnpm storybook` | Start Storybook on port `6006`. |
| `pnpm build-storybook` | Build the static Storybook catalog. |

### Storybook

Use Storybook to explore components, their states, and interaction examples:

```bash
pnpm storybook
```

The catalog includes foundations, reusable components, and composed UI patterns. Theme controls let you inspect both light and dark appearances.

### Project structure

```text
src/
  app/                    # Router, guards, and authenticated page shell
  features/
    auth/                 # Login, registration, and session API
    events/               # Event browsing, creation, and checkout flow
    orders/               # Checkout API and orders page
  ui/                     # Design tokens, reusable components, and stories
```

Feature-specific APIs, types, components, and tests live together. Shared visual components are exported from `src/ui/index.ts`.
