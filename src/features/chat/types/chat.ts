export type ChatPhase = 'interpreting' | 'searching'
export type ChatTurnStatus = 'streaming' | 'complete' | 'error' | 'cancelled'

export interface ChatEventSearchResult {
  id: string
  name: string
  descriptionPreview: string
  location: string
  startsAt: string
  ticketPriceCents: number
  currencyCode: string
  minPeople: number
  maxPeople: number
  servesAlcohol: boolean
}

export interface ChatTurn {
  id: string
  author: 'visitor' | 'agent'
  text: string
  status?: ChatTurnStatus
  requestId?: string
  phase?: ChatPhase
  results: ChatEventSearchResult[]
  resultCount?: number
  finishReason?: string
  errorMessage?: string
  retryPrompt?: string
}

export interface ChatRequest {
  message: string
  limit: number
}

export interface ChatStatusEvent {
  type: 'status'
  requestId: string
  phase: ChatPhase
}

export interface ChatResultsEvent {
  type: 'results'
  requestId: string
  events: ChatEventSearchResult[]
  count: number
}

export interface ChatDeltaEvent {
  type: 'delta'
  requestId: string
  text: string
}

export interface ChatDoneEvent {
  type: 'done'
  requestId: string
  finishReason: string
}

export type ChatStreamEvent = ChatStatusEvent | ChatResultsEvent | ChatDeltaEvent | ChatDoneEvent
