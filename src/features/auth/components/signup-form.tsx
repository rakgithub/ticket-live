import type { SubmitEventHandler } from 'react'
import { Button, Textbox } from '@/ui'

interface SignupFormProps {
  onSubmit: SubmitEventHandler<HTMLFormElement>
  loading?: boolean
}

export function SignupForm({ onSubmit, loading = false }: SignupFormProps) {
  return (
    <form className="grid gap-space-5" onSubmit={onSubmit}>
      <div className="grid gap-space-4">
        <Textbox
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </div>
      <Button className="w-full" type="submit" loading={loading}>Create account</Button>
    </form>
  )
}
