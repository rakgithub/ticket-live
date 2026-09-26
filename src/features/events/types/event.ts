export interface CreateEventInput {
  name: string
  description: string
  location: string
  startsAt: string
  minPeople: number
  maxPeople: number
  ticketPriceCents: number
  currencyCode: string
  servesAlcohol: boolean
}

export interface EventSummary {
  id: string
  name: string
  description: string
  location: string
  startsAt: string
  minPeople: number
  maxPeople: number
  reservedQuantity: number
  ticketPriceCents: number
  currencyCode: string
  servesAlcohol: boolean
  isCancelled: boolean
}
