import { createBrowserRouter, Navigate } from 'react-router'
import { CreateEventPage, eventsLoader } from '@/features/events'
import { EventsErrorPage, EventsPage } from '@/features/events/components/events-page'
import { OrdersErrorPage, OrdersPage, ordersLoader } from '@/features/orders'
import { redirectAuthenticatedUser, requireAuthentication } from './auth-guards'
import { AuthenticatedLayout } from './authenticated-layout'
import { LoginRoute } from './login-route'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/events" replace /> },
  { path: '/login', loader: redirectAuthenticatedUser, element: <LoginRoute /> },
  {
    path: '/events',
    loader: requireAuthentication,
    element: <AuthenticatedLayout />,
    children: [
      {
        index: true,
        loader: eventsLoader,
        element: <EventsPage />,
        errorElement: <EventsErrorPage />,
      },
      { path: 'new', element: <CreateEventPage /> },
    ],
  },
  {
    path: '/orders',
    loader: requireAuthentication,
    element: <AuthenticatedLayout />,
    children: [{ index: true, loader: ordersLoader, element: <OrdersPage />, errorElement: <OrdersErrorPage /> }],
  },
  { path: '*', element: <Navigate to="/events" replace /> },
])
