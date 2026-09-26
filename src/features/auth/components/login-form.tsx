import type { SubmitEventHandler } from 'react'
import { Button, Textbox } from '@/design-system'

interface LoginFormProps {
  onSubmit: SubmitEventHandler<HTMLFormElement>
  loading?: boolean
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  return (
    <form className="grid gap-space-5" onSubmit={onSubmit}>
      <div className="grid gap-space-4">
        <Textbox
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <Textbox
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
      </div>
      <label className="flex w-fit items-center gap-space-2 text-body-sm text-text-secondary">
        <input className="size-icon-sm accent-action-primary" name="remember" type="checkbox" />
        Remember me
      </label>
      <Button className="w-full" type="submit" loading={loading}>Sign in</Button>
    </form>
  )
}
