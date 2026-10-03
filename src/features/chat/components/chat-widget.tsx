import { ChatBox, type ChatMessage } from '@/ui'
import { EventSearchResults } from './event-search-results'
import { useChatConversation } from '../hooks/use-chat-conversation'
import type { ChatPhase } from '../types/chat'

function getPhaseMessage(phase?: ChatPhase) {
  if (phase === 'interpreting') return 'Hang-in there…'
  if (phase === 'searching') return 'Searching events…'
  return 'Generating response…'
}

export function ChatWidget() {
  const { messages, isStreaming, sendMessage, stop, retry } = useChatConversation()

  const chatMessages: ChatMessage[] = messages.map((message) => ({
    id: message.id,
    author: message.author,
    text: message.text,
    status: message.status,
    statusMessage: message.status === 'streaming'
      ? getPhaseMessage(message.phase)
      : message.status === 'complete'
        ? 'Response complete'
        : message.status === 'cancelled'
          ? 'Generation stopped'
          : undefined,
    errorMessage: message.errorMessage,
    content: message.results.length > 0 || message.resultCount === 0
      ? <EventSearchResults events={message.results} count={message.resultCount ?? message.results.length} />
      : undefined,
    canRetry: message.status === 'error',
  }))

  return (
    <ChatBox
      title="Ask anything to AI"
      messages={chatMessages}
      isStreaming={isStreaming}
      onSend={(message) => { void sendMessage(message) }}
      onStop={stop}
      onRetry={(messageId) => { void retry(messageId) }}
    />
  )
}
