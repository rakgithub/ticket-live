import { useState, type SubmitEvent } from 'react'
import { Button } from '@/design-system'
import { AuthShell } from './auth-shell'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'
import { login, register } from '../api/auth-api'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    if (typeof email !== 'string' || typeof password !== 'string') {
      setMessage('Enter an email address and password.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      if (mode === 'login') {
        await login({ email, password })
        setMessage('Signed in successfully.')
      } else {
        const name = formData.get('name')
        if (typeof name !== 'string') {
          setMessage('Enter your name.')
          return
        }
        await register({ name, email, password })
        setMessage('Account created successfully.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to complete your request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setIsSubmitting(false)
  }

  const isLogin = mode === 'login'

  return (
    <AuthShell
      title={isLogin ? 'Welcome back' : 'Create your account'}
      description={isLogin ? 'Sign in to continue.' : ''}
    >
      {isLogin
        ? <LoginForm onSubmit={handleSubmit} loading={isSubmitting} />
        : <SignupForm onSubmit={handleSubmit} loading={isSubmitting} />}

      <p aria-live="polite" className="min-h-control-sm text-center text-body-sm text-text-secondary">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-space-1 border-t border-border-subtle pt-space-4 text-body-sm">
        <span className="text-text-secondary">{isLogin ? 'New to Ticket Live?' : 'Already have an account?'}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSubmitting}
          onClick={() => changeMode(isLogin ? 'signup' : 'login')}
        >
          {isLogin ? 'Create an account' : 'Sign in'}
        </Button>
      </div>
    </AuthShell>
  )
}
