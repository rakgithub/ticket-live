import { Card, CardDescription, CardHeader } from '@/ui'

export function OrdersPage() {
  return (
    <main id="main" className="mx-auto grid min-h-svh w-full max-w-content content-start gap-space-6 px-page-gutter py-section-gap text-text-primary">
      <header className="grid gap-space-2">
        <h1 className="text-title font-semibold leading-tight">Orders</h1>
        <p className="text-body-sm text-text-secondary">Review and manage ticket orders.</p>
      </header>
      <Card size="full" padding="lg">
        <CardHeader>
          <h2 className="text-title-sm font-semibold text-text-primary">Order history is not available yet</h2>
          <CardDescription>Orders will appear here when order history is enabled.</CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
