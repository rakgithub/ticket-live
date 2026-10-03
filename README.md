# 🎟️ Ticket Live

> Discover events, plan unforgettable experiences, and get ticket-ready — with an AI event guide built in.

Ticket Live is a modern event and ticketing experience for people looking for their next outing and organizers bringing events to life. Browse live availability, create events, submit ticket checkout requests, and ask the AI chat assistant to search for events in plain language.

<p align="center">
  <a href="#ai-event-chat">AI chat</a> ·
  <a href="#what-you-can-do">Features</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#api-contract">API</a> ·
  <a href="#development">Development</a>
</p>

| App | Interface | Quality |
| --- | --- | --- |
| React 19 · TypeScript · Vite · React Router | Tailwind CSS 4 · token-based UI · Lucide | Vitest · React Testing Library · Oxlint · Storybook |

## AI event chat

### Find the right event by asking naturally

The floating assistant is available throughout authenticated areas of Ticket Live. Instead of filtering through listings manually, ask for what you want — for example, *“Jazz events in London this weekend”* — and the assistant searches the event catalogue while it responds.

| Experience | What happens |
| --- | --- |
| **Live event search** | Your prompt is sent to the authenticated streaming endpoint and matching event cards appear in the conversation. |
| **Streaming answer** | Response text arrives progressively, with clear progress states for understanding, searching, and generating. |
| **In-control interactions** | Stop a response at any time. If a request fails, retry the original question without retyping it. |
| **Honest empty states** | No matches are shown explicitly, alongside any assistant guidance returned by the service. |
| **Focused by design** | The compact chat can be minimized and reopened without losing an in-progress or completed response. |

The feature is intentionally local and cancellable: it does not persist a conversation or reconnect automatically after an interrupted stream.

## What you can do

| Area | Capability |
| --- | --- |
| **Account access** | Sign in, create an account, and use protected routes with a bearer-token session. |
| **Explore events** | Review descriptions, dates, locations, availability, prices, and event details. |
| **Book tickets** | Choose a quantity, check the total, and submit a checkout request. Cancelled or sold-out events cannot be booked. |
| **Publish events** | Create an event with its schedule, location, guest limits, ticket price, currency, and alcohol-service details. |
| **AI event chat** | Search the catalogue conversationally and receive streamed answers plus matching event results. |
| **Consistent UI** | Explore reusable, theme-aware components and accessibility states in Storybook. |

## Pages

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | — | Redirects to `/events`. |
| `/login` | Public | Sign in or create an account. Signed-in users are redirected to events. |
| `/events` | Signed in | Browse events, ask the AI assistant, and start checkout. |
| `/events/new` | Signed in | Create and publish an event. |
| `/orders` | Signed in | Order history placeholder. |

## Quick start

### Prerequisites

- Node.js
- pnpm
- A Ticket Live API service

### 1. Configure the API

Create a `.env` file at the repository root:

```env
BASE_API_URL=http://localhost:4002
```

### 2. Install and run

```bash
pnpm install
pnpm start
```

Vite prints the local URL. The API service must be running for authentication, event operations, checkout, and AI chat.

## API contract

The frontend appends these routes to `BASE_API_URL`:

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/login` | Authenticate with an email and password. |
| `POST` | `/register` | Create an account with a name, email, and password. |
| `POST` | `/logout` | End the authenticated session. |
| `GET` | `/events` | Return an object shaped like `{ "events": [...] }`. |
| `POST` | `/events` | Create an event. |
| `POST` | `/orders/checkout` | Submit `{ "eventId", "quantity" }` for checkout. |
| `POST` | `/chat/events/stream` | Stream AI-assisted event search for `{ "message", "limit" }`. |

Authenticated requests use an access token with the `Bearer` scheme. A successful login or registration response must include `accessToken` and `tokenType: "Bearer"`.

### AI chat stream

`POST /chat/events/stream` accepts `text/event-stream` responses. The client handles these event types:

| Event | Role in the conversation |
| --- | --- |
| `status` | Signals that the request is being interpreted or event search is underway. |
| `results` | Provides matching event summaries and a result count. An empty result set is valid. |
| `delta` | Appends a fragment of the assistant’s text response. |
| `done` | Marks the response complete. |

Every recognised event includes a `requestId`. Invalid stream payloads, HTTP failures, and streams ending before `done` are presented as recoverable chat errors.

## Development

| Command | Purpose |
| --- | --- |
| `pnpm start` | Start the Vite development server. |
| `pnpm test` | Run Vitest; interactive terminals use watch mode. |
| `pnpm test:run` | Run the full test suite once. |
| `pnpm lint` | Run Oxlint. |
| `pnpm check:design-system` | Validate design-token usage in app and UI sources. |
| `pnpm build` | Run the token check, TypeScript build, and Vite production build. |
| `pnpm storybook` | Start Storybook on port `6006`. |
| `pnpm build-storybook` | Build the static component catalogue. |

Run the focused chat checks while working on the assistant:

```bash
pnpm test:run -- src/features/chat src/ui/components/chat-box
pnpm exec tsc -b
pnpm lint
pnpm check:design-system
```

## Project structure

```text
src/
  app/                    # Routes, guards, and authenticated shell
  features/
    auth/                 # Session and account flows
    chat/                 # Streamed AI event search
    events/               # Browsing, creation, and checkout flow
    orders/               # Checkout API and orders page
  ui/                     # Token-based reusable components and stories
```

Feature APIs, types, components, hooks, and tests live together. Shared visual building blocks are exported from `src/ui/index.ts`.
