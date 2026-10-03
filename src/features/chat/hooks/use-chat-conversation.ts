import { useEffect, useReducer, useRef } from 'react'
import { streamChatEvents } from '../api/chat-api'
import type { ChatStreamEvent, ChatTurn } from '../types/chat'

const eventLimit = 5

type ConversationAction =
  | { type: 'start'; userMessage: ChatTurn; assistantMessage: ChatTurn }
  | { type: 'event'; assistantId: string; event: ChatStreamEvent }
  | { type: 'finish'; assistantId: string }
  | { type: 'error'; assistantId: string; message: string }
  | { type: 'cancel'; assistantId: string }

function conversationReducer(messages: ChatTurn[], action: ConversationAction): ChatTurn[] {
  if (action.type === 'start') return [...messages, action.userMessage, action.assistantMessage]
  return messages.map((message) => {
    if (message.id !== action.assistantId) return message

    if (action.type === 'finish') {
      return { ...message, status: 'complete', phase: undefined }
    }
    if (action.type === 'error') {
      return { ...message, status: 'error', phase: undefined, errorMessage: action.message }
    }
    if (action.type === 'cancel') {
      return { ...message, status: 'cancelled', phase: undefined }
    }

    if (message.requestId && message.requestId !== action.event.requestId) return message
    const requestId = message.requestId ?? action.event.requestId
    if (action.event.type === 'status') {
      return { ...message, requestId, phase: action.event.phase }
    }
    if (action.event.type === 'results') {
      return { ...message, requestId, results: action.event.events, resultCount: action.event.count }
    }
    if (action.event.type === 'delta') {
      return { ...message, requestId, text: message.text + action.event.text }
    }
    return { ...message, requestId, finishReason: action.event.finishReason, status: 'complete', phase: undefined }
  })
}

function createId() {
  return window.crypto.randomUUID()
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The chat response could not be completed.'
}

export interface UseChatConversationResult {
  messages: ChatTurn[]
  isStreaming: boolean
  sendMessage: (message: string) => Promise<void>
  stop: () => void
  retry: (assistantId: string) => Promise<void>
}

export function useChatConversation(): UseChatConversationResult {
  const [messages, dispatch] = useReducer(conversationReducer, [])
  const activeRequest = useRef<{ controller: AbortController; assistantId: string } | null>(null)

  useEffect(() => () => {
    activeRequest.current?.controller.abort()
  }, [])

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || activeRequest.current) return

    const userMessage: ChatTurn = {
      id: createId(), author: 'visitor', text: trimmedMessage, results: [],
    }
    const assistantId = createId()
    const assistantMessage: ChatTurn = {
      id: assistantId,
      author: 'agent',
      text: '',
      status: 'streaming',
      results: [],
      retryPrompt: trimmedMessage,
    }
    const controller = new AbortController()
    activeRequest.current = { controller, assistantId }
    dispatch({ type: 'start', userMessage, assistantMessage })

    let receivedDone = false
    try {
      for await (const event of streamChatEvents({ message: trimmedMessage, limit: eventLimit }, controller.signal)) {
        if (event.type === 'done') receivedDone = true
        dispatch({ type: 'event', assistantId, event })
        if (receivedDone) break
      }
      if (controller.signal.aborted) {
        dispatch({ type: 'cancel', assistantId })
      } else if (!receivedDone) {
        throw new Error('The connection ended before the response was complete. Please retry.')
      }
    } catch (error) {
      if (controller.signal.aborted) {
        dispatch({ type: 'cancel', assistantId })
      } else {
        dispatch({ type: 'error', assistantId, message: getErrorMessage(error) })
      }
    } finally {
      if (activeRequest.current?.assistantId === assistantId) activeRequest.current = null
    }
  }

  function stop() {
    const active = activeRequest.current
    if (!active) return
    activeRequest.current = null
    dispatch({ type: 'cancel', assistantId: active.assistantId })
    active.controller.abort()
  }

  async function retry(assistantId: string) {
    const failedMessage = messages.find((message) => message.id === assistantId)
    if (failedMessage?.retryPrompt && failedMessage.status === 'error') {
      await sendMessage(failedMessage.retryPrompt)
    }
  }

  return {
    messages,
    isStreaming: messages.some((message) => message.author === 'agent' && message.status === 'streaming'),
    sendMessage,
    stop,
    retry,
  }
}
