import { useNavigate } from 'react-router'
import { AuthPage } from '@/features/auth/components/auth-page'

export function LoginRoute() {
  const navigate = useNavigate()

  return <AuthPage onAuthenticated={() => navigate('/events', { replace: true })} />
}
