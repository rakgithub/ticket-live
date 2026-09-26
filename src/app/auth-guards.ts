import { redirect } from 'react-router'
import { getAccessToken } from '@/features/auth'

export function requireAuthentication() {
  if (!getAccessToken()) {
    throw redirect('/login')
  }

  return null
}

export function redirectAuthenticatedUser() {
  if (getAccessToken()) {
    throw redirect('/events')
  }

  return null
}
