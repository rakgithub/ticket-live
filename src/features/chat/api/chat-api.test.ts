import { describe, expect, it } from 'vitest'
import { readChatStream } from './chat-api'

function createStreamResponse(chunks: readonly string[]) {
  const encoder = new TextEncoder()
  return new Response(new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  }))
}

describe('readChatStream', () => {
  it('accepts the event-search result shape returned by the chat API', async () => {
    const response = createStreamResponse([
      'event: results\n',
      'data: {"requestId":"f761fcee-34c3-434c-8125-90eb33c54613","events":[{"id":"d4b84267-af90-4845-8a53-3c674e10a881","name":"Winter Supper Club","descriptionPreview":"A shared dinner with seasonal food.","location":"Thailand","startsAt":"2026-10-10T16:30:00.000Z","ticketPriceCents":400,"currencyCode":"EUR","minPeople":8,"maxPeople":20,"servesAlcohol":true}],"count":1}\n\n',
    ])

    const events = []
    for await (const event of readChatStream(response)) events.push(event)

    expect(events).toEqual([
      {
        type: 'results',
        requestId: 'f761fcee-34c3-434c-8125-90eb33c54613',
        count: 1,
        events: [
          {
            id: 'd4b84267-af90-4845-8a53-3c674e10a881',
            name: 'Winter Supper Club',
            descriptionPreview: 'A shared dinner with seasonal food.',
            location: 'Thailand',
            startsAt: '2026-10-10T16:30:00.000Z',
            ticketPriceCents: 400,
            currencyCode: 'EUR',
            minPeople: 8,
            maxPeople: 20,
            servesAlcohol: true,
          },
        ],
      },
    ])
  })

  it('rejects a result that does not include the required description preview', async () => {
    const response = createStreamResponse([
      'event: results\ndata: {"requestId":"request-1","events":[{"id":"event-1","name":"Event","location":"London","startsAt":"2026-10-10T16:30:00.000Z","ticketPriceCents":400,"currencyCode":"EUR","minPeople":8,"maxPeople":20,"servesAlcohol":true}],"count":1}\n\n',
    ])

    await expect(async () => {
      for await (const unusedEvent of readChatStream(response)) {
        void unusedEvent
      }
    }).rejects.toThrow('The server sent invalid event search results.')
  })
})
