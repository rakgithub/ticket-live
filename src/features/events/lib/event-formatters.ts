export function formatEventDate(startsAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startsAt))
}

export function formatEventPrice(ticketPriceCents: number, currencyCode: string): string {
  const normalizedCurrencyCode = currencyCode.trim()

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: normalizedCurrencyCode,
    }).format(ticketPriceCents / 100)
  } catch {
    return `${normalizedCurrencyCode} ${(ticketPriceCents / 100).toFixed(2)}`
  }
}
