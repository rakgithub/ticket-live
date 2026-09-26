import { createBrowserRouter, Navigate } from 'react-router'
import { CreateEventPage } from '@/features/events'
import { EventsPage } from '@/features/events/components/events-page'
import { redirectAuthenticatedUser, requireAuthentication } from './auth-guards'
import { LoginRoute } from './login-route'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/events" replace /> },
  { path: '/login', loader: redirectAuthenticatedUser, element: <LoginRoute /> },
  { path: '/events', loader: requireAuthentication, element: <EventsPage /> },
  { path: '/events/new', loader: requireAuthentication, element: <CreateEventPage /> },
  { path: '*', element: <Navigate to="/events" replace /> },
])
