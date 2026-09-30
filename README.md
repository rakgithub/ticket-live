# Ticket Live

Ticket Live is a web app for discovering and creating events, booking tickets, and managing the account used to access those features. It is built with React, TypeScript, Vite, React Router, and a token-based UI component library.

## Features

- **Account access:** Sign in, create an account, and log out. Protected event and order pages require an authenticated session.
- **Events:** Browse events with their date, location, availability, ticket price, and other event details. Cancelled events and sold-out events cannot be booked.
- **Event creation:** Publish an event with its schedule, location, guest limits, ticket price, currency, and alcohol-service details. The form validates the values before sending them to the API.
- **Ticket checkout:** Choose a seat count, review the total, and submit a checkout request. The app displays the success or error result from the request.
- **Orders:** An Orders page is available; order history is not implemented yet.
- **Support chat widget:** A floating chat box appears at the lower-right of authenticated pages. It can be minimized and reopened. Sent messages appear in a local transcript; bot replies and message persistence are not connected yet.
- **Design system:** Reusable, token-styled controls and patterns are documented in Storybook, with light and dark theme previews.

## Requirements

- Node.js and pnpm
- A Ticket Live API service. The frontend reads its base URL from `BASE_API_URL`.

Create a `.env` file in the project root and point it to the API service. For a local API on port 4002:

```env
BASE_API_URL=http://localhost:4002
```

The API is expected to provide `POST /login`, `POST /register`, `POST /logout`, `GET /events`, `POST /events`, and `POST /orders/checkout` routes.

## Getting started

```bash
pnpm install
pnpm start
```

Vite prints the local development URL when the server starts. Authentication and event operations require the API service to be running at `BASE_API_URL`.

## Storybook

Run the component catalog locally:

```bash
pnpm storybook
```

Build a static Storybook site with:

```bash
pnpm build-storybook
```

## Project checks

```bash
pnpm test:run
pnpm lint
pnpm check:design-system
pnpm build
```

`pnpm build` runs the design-system token check, TypeScript build, and Vite production build.
