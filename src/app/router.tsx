import { createBrowserRouter, Navigate } from 'react-router'
import { CreateEventPage, eventsLoader } from '@/features/events'
import { EventsErrorPage, EventsPage } from '@/features/events/components/events-page'
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
  { path: '*', element: <Navigate to="/events" replace /> },
])
