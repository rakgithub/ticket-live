# AI Event Chat: Two-Phase UI Implementation Plan

## Purpose

Connect the authenticated chat widget to the backend's streamed event-search
endpoint while keeping transport, feature state, and reusable UI components
separate. The client sends a user query to `POST /chat/events/stream` and
renders server-sent `status`, `results`, `delta`, and `done` events as one
assistant response.

This plan assumes the endpoint requires the existing bearer token and returns
`Content-Type: text/event-stream`.

## Agreed API contract

### Request

```http
POST {BASE_API_URL}/chat/events/stream
Authorization: Bearer <access token>
Content-Type: application/json
Accept: text/event-stream
```

```json
{
  "message": "Jazz events in London",
  "limit": 5
}
```

`limit` is a feature-owned default in the first release; it is not exposed as
a control in the compact chat widget.

### Stream events

Every stream event belongs to one request through `requestId`.

| Event | Required payload | Client action |
| --- | --- | --- |
| `status` | `requestId`, `phase` | Show a non-persistent progress status. Supported initial phases are `interpreting` and `searching`. |
| `results` | `requestId`, `events`, `count` | Store matching event summaries and show cards in the assistant response. An empty list is a valid result. |
| `delta` | `requestId`, `text` | Append text to the in-progress assistant response, in arrival order. |
| `done` | `requestId`, `finishReason` | Complete the response and remove the progress status. |

The parser must work on complete SSE event blocks (`event:` plus `data:`), not
individual network chunks. Network chunks may split JSON, individual lines, or
complete events.

## Target design

```text
AuthenticatedLayout
  └─ ChatWidget                         feature container
       ├─ useChatConversation            local reducer and request lifecycle
       ├─ chat-api                       authenticated POST and SSE parser
       ├─ ChatBox                        reusable, backend-agnostic UI
       └─ EventSearchResults             feature display of returned events
```

`ChatBox` remains a UI component. It must not know the API URL, bearer token,
SSE syntax, or response parsing rules. Chat state belongs to the narrowest
owner: `useChatConversation`. TanStack Query is not needed for the live stream;
this is local, cancellable interaction state rather than cached server data.

## Phase 1 — Streamed search MVP

### Goal

Deliver an authenticated, cancellable chat request that shows streaming text,
search progress, returned event cards, empty results, and recoverable errors.
No conversation persistence or automatic reconnection is included in this
phase.

### Files and responsibilities

| File | Responsibility |
| --- | --- |
| `src/features/chat/types/chat.ts` | Named domain types for messages, turns, phases, stream events, and parsed API results. |
| `src/features/chat/api/chat-api.ts` | Build the authenticated endpoint request; validate event payloads; parse SSE blocks from `ReadableStream`; expose an async event iterator. |
| `src/features/chat/api/chat-api.test.ts` | Validate headers/body, malformed payload handling, split chunks, multi-event chunks, and unknown event handling. |
| `src/features/chat/hooks/use-chat-conversation.ts` | Own the reducer, optimistic user message, active `AbortController`, stream consumption, cancellation, error state, and retry input. |
| `src/features/chat/hooks/use-chat-conversation.test.tsx` | Test lifecycle transitions using a deterministic mocked stream. |
| `src/features/chat/components/chat-widget.tsx` | Map feature state/actions to `ChatBox`; provide the current `limit` default. |
| `src/features/chat/components/event-search-results.tsx` | Render event result cards or the explicit empty-result state from the response. |
| `src/features/chat/index.ts` | Public feature exports only. |
| `src/ui/components/chat-box/chat-box.tsx` | Extend its typed presentational contract for streaming status, cancel, retry, and assistant content slots/data. Do not add API logic. |
| `src/ui/components/chat-box/chat-box.test.tsx` | Cover visible UI states and interactions introduced by the new contract. |
| `src/app/authenticated-layout.tsx` | Replace demo-local chat messages with `<ChatWidget />`; keep this route layout thin. |

All visual additions must use existing semantic design tokens and token-backed
utilities. If a needed semantic visual value does not exist, add it only to the
token source before use. The chat feature must be scanned by
`scripts/check-design-system.mjs`; the current script already includes
`src/features`.

### UI behavior

1. On send, append the visitor message immediately and create an empty
   assistant response with `status: "streaming"`.
2. Disable another submission while that request is active and show **Stop
   generating**.
3. Convert `interpreting` to “Understanding your request…” and `searching` to
   “Searching events…”. These are state/status announcements, not assistant
   message text.
4. Append each `delta.text` exactly once to the assistant response associated
   with its `requestId`.
5. Render `results.events` above the generated assistant explanation. Render
   an explicit no-matches state when the server returns `count: 0`.
6. On `done`, mark the turn complete and remove the activity indicator. Preserve
   `finishReason` for debugging and future analytics.
7. On transport, HTTP, parsing, or server failure, preserve received text and
   results, mark the turn as failed, and show **Retry**. Retry submits the
   original user prompt as a new request.
8. On Stop, call `AbortController.abort()`, retain received content, and mark
   the turn cancelled. This is not shown as a server failure.

### SSE and error rules

- Reject a non-OK HTTP response before parsing its body and surface the server
  error message when safely available.
- Require a valid `requestId` on every recognized event and ignore events for
  an inactive request.
- Treat invalid JSON or invalid required event fields as a visible request
  error, not a silent success.
- Treat an EOF before `done` as a visible interrupted-stream error.
- Ignore unknown, validly framed event names for forward compatibility; record
  no user-facing error for them.
- Clear the active abort controller in every terminal path.

### Accessibility and interaction requirements

- Announce high-level changes such as “Searching events”, “Response complete”,
  and “Response failed”; do not announce every delta token.
- Keep focus in the message input after submission unless the user activates a
  different control.
- Auto-scroll only while the user is already at or near the latest message.
  Do not pull a reader away from earlier content.
- The minimized widget continues receiving a stream and exposes the finished
  result when reopened.

### Acceptance criteria

- A signed-in user can submit a prompt and see phases, returned event cards,
  streamed assistant text, and completion.
- An empty `results` response plus explanatory deltas renders correctly.
- Stop, retry, HTTP failure, malformed stream data, and unexpected EOF have
  deterministic, user-visible behavior.
- Existing chat open/minimize behavior remains intact.
- Focused Vitest tests, typecheck, lint, design-system check, and production
  build all pass.

## Phase 2 — Reliability and conversation experience

### Goal

Make the MVP resilient across navigation and refresh, improve the experience
for long responses, and add observability once the backend can support these
capabilities.

### Backend decisions required before starting

1. Does the backend persist conversations and expose a conversation ID and
   history endpoint?
2. Can a request resume from a last delivered event ID or is retry the only
   supported recovery mechanism?
3. What are the complete `finishReason` values and which are user-retryable?
4. What event summary schema and event-detail route should result cards use?
5. Are server-generated citations, rich text, tool calls, or structured
   follow-up prompts planned? Their schemas must be explicitly versioned.

Do not invent persistence or reconnection semantics in the client without
answers to these questions.

### Planned work

| Area | Implementation |
| --- | --- |
| Conversation continuity | Store the backend conversation ID with each chat session; restore history through a backend history endpoint when the widget mounts. |
| Navigation and refresh | Preserve the active conversation across authenticated routes. Restore completed turns after refresh; use backend-defined behavior for an active stream. |
| Reconnection | Implement only the backend-supported recovery strategy—event ID resume if available, otherwise an explicit interrupted state and Retry. Never replay a prompt automatically. |
| Result interaction | Link event cards to the existing event details/booking flow after the target route and required summary data are confirmed. |
| Long-response UX | Refine scroll-follow behavior, add a “Jump to latest” affordance when appropriate, and ensure assistant cards/text remain legible at small widget sizes. |
| Observability | Emit privacy-safe client telemetry for request start, first delta, completion, cancellation, retries, and failures. Do not record raw user prompts or generated text without product approval. |
| Rich content | Add a deliberately sanitized renderer only if the backend introduces a documented rich-content format. Plain text remains the default. |

### Phase 2 acceptance criteria

- Completed conversations reliably restore according to the agreed backend
  contract.
- Interrupted streams have predictable recovery behavior with no duplicate
  assistant messages or duplicate searches.
- Result-card navigation works with stable event IDs.
- Telemetry makes latency and failure patterns observable without leaking chat
  content.
- New persistence/recovery behavior has deterministic tests for restored,
  unavailable, failed, and boundary states.

## Verification checklist for each phase

Run the focused feature tests first, then the repository checks:

```sh
pnpm test:run -- src/features/chat src/ui/components/chat-box
pnpm exec tsc -b
pnpm lint
pnpm check:design-system
pnpm build
```

Manual verification should include an authenticated request, a zero-result
response, multiple deltas, a minimized widget during streaming, Stop, Retry,
an expired token, and a connection that ends before `done`.

## Rollback

Phase 1 can be rolled back by replacing `ChatWidget` in the authenticated
layout with the prior local-only `ChatBox` integration. The new feature is
isolated under `src/features/chat`, so no events, orders, or authentication
flows need to be reverted. Phase 2 changes should be feature-flagged or kept
behind backend capability detection until the associated endpoint contracts
are stable.
