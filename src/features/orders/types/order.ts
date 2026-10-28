export interface OrderEvent {
  name: string
  location: string
  startsAt: string
}

export interface Order {
  id: string
  eventId: string
  event: OrderEvent
  quantity: number
  status: string
  ticketPriceCents: number
  currencyCode: string
  totalAmountCents: number
  expiresAt: string | null
  paymentStatus: string
  createdAt: string
}
