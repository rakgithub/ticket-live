import { getAccessToken } from '@/features/auth'
import { clearAccessToken } from '@/features/auth/api/auth-session'
import type { ChatEventSearchResult, ChatPhase, ChatRequest, ChatStreamEvent } from '../types/chat'

const baseUrl = import.meta.env.BASE_API_URL

function getEndpoint() {
  if (!baseUrl) throw new Error('The BASE_API_URL environment variable is not configured.')
  return `${baseUrl.replace(/\/$/, '')}/chat/events/stream`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChatEventSearchResult(value: unknown): value is ChatEventSearchResult {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.descriptionPreview === 'string'
    && typeof value.location === 'string'
    && typeof value.startsAt === 'string'
    && !Number.isNaN(new Date(value.startsAt).getTime())
    && typeof value.minPeople === 'number'
    && Number.isSafeInteger(value.minPeople)
    && typeof value.maxPeople === 'number'
    && Number.isSafeInteger(value.maxPeople)
    && typeof value.ticketPriceCents === 'number'
    && Number.isSafeInteger(value.ticketPriceCents)
    && typeof value.currencyCode === 'string'
    && /^[A-Z]{3}$/.test(value.currencyCode)
    && typeof value.servesAlcohol === 'boolean'
}

function readChatEvent(eventName: string, data: string): ChatStreamEvent | null {
  if (eventName !== 'status' && eventName !== 'results' && eventName !== 'delta' && eventName !== 'done') return null

  let value: unknown
  try {
    value = JSON.parse(data)
  } catch {
    throw new Error('The server sent an invalid chat event.')
  }

  if (!isRecord(value) || typeof value.requestId !== 'string' || !value.requestId) {
    throw new Error('The server sent an invalid chat event.')
  }

  if (eventName === 'status') {
    if (value.phase !== 'interpreting' && value.phase !== 'searching') {
      throw new Error('The server sent an unsupported chat status.')
    }
    const phase: ChatPhase = value.phase
    return { type: 'status', requestId: value.requestId, phase }
  }

  if (eventName === 'results') {
    if (!Array.isArray(value.events) || !value.events.every(isChatEventSearchResult)
      || typeof value.count !== 'number' || !Number.isSafeInteger(value.count) || value.count < 0) {
      throw new Error('The server sent invalid event search results.')
    }
    return { type: 'results', requestId: value.requestId, events: value.events, count: value.count }
  }

  if (eventName === 'delta') {
    if (typeof value.text !== 'string') throw new Error('The server sent invalid response text.')
    return { type: 'delta', requestId: value.requestId, text: value.text }
  }

  if (eventName === 'done') {
    if (typeof value.finishReason !== 'string') throw new Error('The server sent an invalid completion event.')
    return { type: 'done', requestId: value.requestId, finishReason: value.finishReason }
  }

  return null
}

async function readErrorMessage(response: Response) {
  const fallback = `Chat request failed with status ${response.status}.`
  try {
    const value: unknown = await response.json()
    if (isRecord(value)) {
      if (typeof value.message === 'string') return value.message
      if (typeof value.error === 'string') return value.error
    }
  } catch {
    return fallback
  }
  return fallback
}

export async function* readChatStream(response: Response): AsyncGenerator<ChatStreamEvent> {
  if (!response.body) throw new Error('The chat response did not include a stream.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = ''
  let dataLines: string[] = []

  function dispatch(): ChatStreamEvent | null {
    if (dataLines.length === 0) {
      eventName = ''
      return null
    }
    const event = readChatEvent(eventName || 'message', dataLines.join('\n'))
    eventName = ''
    dataLines = []
    return event
  }

  function consumeLines(final: boolean): ChatStreamEvent[] {
    const events: ChatStreamEvent[] = []
    let lineEnd = buffer.indexOf('\n')
    while (lineEnd !== -1) {
      const line = buffer.slice(0, lineEnd).replace(/\r$/, '')
      buffer = buffer.slice(lineEnd + 1)
      if (line === '') {
        const event = dispatch()
        if (event) events.push(event)
      } else if (!line.startsWith(':')) {
        const separator = line.indexOf(':')
        const field = separator === -1 ? line : line.slice(0, separator)
        const fieldValue = separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '')
        if (field === 'event') eventName = fieldValue
        if (field === 'data') dataLines.push(fieldValue)
      }
      lineEnd = buffer.indexOf('\n')
    }

    if (final && buffer) {
      const line = buffer.replace(/\r$/, '')
      if (!line.startsWith(':')) {
        const separator = line.indexOf(':')
        const field = separator === -1 ? line : line.slice(0, separator)
        const fieldValue = separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '')
        if (field === 'event') eventName = fieldValue
        if (field === 'data') dataLines.push(fieldValue)
      }
      buffer = ''
    }

    if (final) {
      const event = dispatch()
      if (event) events.push(event)
    }
    return events
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      for (const event of consumeLines(done)) yield event
      if (done) break
    }
  } finally {
    try {
      await reader.cancel()
    } catch {
      // The stream may already be closed or aborted.
    }
    reader.releaseLock()
  }
}

export async function* streamChatEvents(request: ChatRequest, signal: AbortSignal): AsyncGenerator<ChatStreamEvent> {
  const accessToken = getAccessToken()
  if (!accessToken) throw new Error('Sign in before using chat.')

  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    if (response.status === 401) clearAccessToken()
    throw new Error(await readErrorMessage(response))
  }

  yield* readChatStream(response)
}
